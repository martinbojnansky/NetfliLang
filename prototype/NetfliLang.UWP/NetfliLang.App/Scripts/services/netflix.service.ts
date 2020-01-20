import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";
import { ISubtitles, ISubtitle } from "../models/subtitles";
import { SubtitlesParserService } from "./subtitles-parser.service";

export class NetflixService extends MutationObserverService {
    protected subtitles: ISubtitles;
    protected style: HTMLStyleElement;

    protected init(): void {
        super.init();

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
                    _this.subtitles = (new SubtitlesParserService()).parseSubtitles(ttmlDoc);
                    _this.createSubtitlesStyleElement();
                } catch { }
            });

            return xhrOpen.apply(this, arguments);
        };
    }

    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        try {
            if ((node as HTMLDivElement).classList.contains('player-timedtext-text-container')) {
                this.onSubtitleDisplayed(node.textContent);
            }
        } catch (e) { console.log(e); }
    }

    protected createSubtitlesStyleElement(): void {
        if (!this.style) {
            this.style = document.createElement('style');
            this.style.type = 'text/css';
            document.head.insertAdjacentElement('beforeend', this.style);
        }
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

    protected onSubtitleDisplayed(key: string): void {
        try {
            this.showSubtitleTranslation(key);
            document.querySelector('video').pause(); // TODO: Improve auto-pause
            this.translateNextSubtitle(key);
        } catch (e) { console.log(e); }
    }

    protected showSubtitleTranslation(key: string): void {
        const subtitle = this.subtitles[key];
        if (!subtitle.translations.length) {
            this.translateSubtitle(subtitle);
        }
        this.updateSubtitlesStyle(subtitle.translations);
    }

    protected translateNextSubtitle(key: string): void {
        const nextKey = this.subtitles[key].occurences[0].next; // TODO: Find next occurence based on time
        const next = this.subtitles[nextKey];
        this.translateSubtitle(next);
    }

    protected translateSubtitle(subtitle: ISubtitle): void {
        sendNotification('translate', JSON.stringify({ key: subtitle.key, lines: subtitle.lines }));
    }

    protected translationReceived(key: string, translations: string[]): void {
        if (this.subtitles.hasOwnProperty(key)) {
            this.subtitles[key].translations = translations;

            const currentSubtitleElement = document.querySelector('.player-timedtext-text-container');
            if (currentSubtitleElement && currentSubtitleElement.textContent === key) {
                this.updateSubtitlesStyle(key);
            }
        }
    }
}
