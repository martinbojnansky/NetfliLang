import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";
import { ISubtitles, ISubtitleOccurence } from "../models/subtitles";

export class NetflixService extends MutationObserverService {
    protected subtitles: ISubtitles;
    protected style: HTMLStyleElement;
    protected speed: number = 1;

    constructor() {
        super();
        this.initInterceptor();
    }

    protected initInterceptor(): void {
        const _this = this;
        // @ts-ignore
        const xhrOpen = window.XMLHttpRequest.prototype.open;
        // @ts-ignore
        window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            this.addEventListener('load', () => {
                try {
                    if (window.location.href.indexOf('netflix.com/watch') === -1) return;

                    const parser = new DOMParser();
                    const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
                    _this.subtitles = _this.parseSubtitles(ttmlDoc);
                    _this.createSubtitlesStyle();
                } catch (e) { console.log(e); }
            });

            return xhrOpen.apply(this, arguments);
        };
    }

    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        try {
            if ((node as HTMLDivElement).classList.contains('player-timedtext-text-container')) {
                this.updateSubtitles(node.textContent);
            }
        } catch (e) { console.log(e); }
    }

    // TODO: On node removed -> auto pause video

    protected getVideo(): HTMLVideoElement {
        return document.querySelector('video');
    }

    protected setSpeed(speed): void {
        if (speed) {
            this.speed = speed;
        }

        try {
            this.getVideo().playbackRate = this.speed;
        } catch (e) { console.log(e); }
    }

    // TODO: Require set speed from app

    // TODO: On seek to previouse

    protected updateSubtitles(key) {
        try {
            // Show current
            const currentTitles = this.subtitles[key];
            this.updateSubtitlesStyle(currentTitles.translations);
            // Translate next
            const nextKey = currentTitles.occurences[0].next;
            const nextTitles = this.subtitles[nextKey];
            sendNotification('translate', JSON.stringify({ key: nextKey, lines: nextTitles.lines }));
        } catch (e) { console.log(e); }
    }

    protected translationReceived(key: string, translations: string[]): void {
        try {
            this.subtitles[key].translations = translations;
        } catch (e) { console.log(e); }
    }

    protected createSubtitlesStyle(): void {
        if (!this.style) {
            this.style = document.createElement('style');
            this.style.type = 'text/css';
            document.head.insertAdjacentElement('beforeend', this.style);
        }

        this.updateSubtitles([]);
    }

    protected updateSubtitlesStyle(translations): void {
        let style = `
            .player-timedtext span {
                display: block;
                color: yellow !important;
            }

            .player-timedtext span > br {
                display: none;
            }

            .player-timedtext span::after {
                content: '';                
                display: block;
                color: white;
                font-size: 2.5rem;
                line-height: normal;
                font-weight: normal;
                color: #ffffff;
                text-shadow: #000000 0px 0px 7px;
                font-family: Netflix Sans, Helvetica Nueue, Helvetica, Arial, sans-serif;
                font-weight: bold;
            }

            .player-timedtext span:not(:last-child)::after {
                margin-bottom: 4px;
            }
        `;
        if (translations) {
            translations.forEach((translation, index) => {
                style += `.player-timedtext span:nth-child(` + (index + 1) + `)::after {
            content: '` + translation + `';
        }`;
            });
        }

        this.style.innerHTML = style;
    }

    protected parseSubtitles(ttmlDoc: Document): ISubtitles {
        const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
        const subtitles = {} as ISubtitles;
        ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
            const key = element.textContent;
            const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
            const occurence = this.parseOccurence(element, tickRate, nextKey);
            if (!subtitles[key]) {
                const lines = element.innerHTML.split(/<br[^>]*>/).map(s => s.replace(new RegExp("/<[^>]*>/", 'g'), ''));
                subtitles[key] = {
                    occurences: [occurence],
                    lines: lines,
                    translations: []
                };
            } else {
                subtitles[key].occurences.push(occurence);
            }
        });
        return subtitles;
    }

    protected parseOccurence(element: HTMLParagraphElement, tickRate: number, nextKey: string): ISubtitleOccurence {
        return {
            start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
            end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
            next: nextKey
        };
    }
}
