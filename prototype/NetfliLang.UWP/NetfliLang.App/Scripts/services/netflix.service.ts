import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";
import { ISubtitles, ISubtitle } from "../models/subtitles";
import { SubtitlesParserService } from "./subtitles-parser.service";

export class NetflixService extends MutationObserverService {
    protected subtitles: ISubtitles;

    protected get video(): HTMLVideoElement {
        return document.querySelector('video');
    }

    protected style: HTMLStyleElement;

    protected autoPause: boolean = true;
    protected autoPauseOn: number;
    protected lastAutoPauseOn: number;

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
            const div = node as HTMLDivElement;
            if (div.classList.contains('player-timedtext-text-container')) {
                this.onSubtitleDisplayed(node.textContent);
            } else if (div.classList.contains('nfp') && div.classList.contains('AkiraPlayer') && this.video) {
                this.video.ontimeupdate = () => this.onTimeUpdated();
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
            this.translateNextSubtitle(key);
        } catch (e) { console.log(e); }
    }

    protected showSubtitleTranslation(key: string): void {
        const subtitle = this.subtitles[key];

        //if (!subtitle.translations.length) {
        //    this.translateSubtitle(subtitle);
        //}

        this.updateSubtitlesStyle(subtitle.translations);

        if (this.autoPause) {
            this.autoPauseOn = subtitle.occurences[0].end; // TODO: Find next occurence based on time
        }
    }

    protected translateNextSubtitle(key: string): void {
        const nextKey = this.subtitles[key].occurences[0].next; // TODO: Find next occurence based on time
        const next = this.subtitles[nextKey];
        this.translateSubtitle(next);
    }

    protected translateSubtitle(subtitle: ISubtitle): void {
        if (!subtitle.translations.length) {
            sendNotification('translate', JSON.stringify({ value: `<p>${subtitle.lines.join('</p><p>')}</p>` }));
        }
    }

    protected translationReceived(value: string, translation: string): void {
        const key = value.replace(/\|\|\|/g, '');
        const translations = translation.split(/\s*\|\|\|\s*/g);

        if (this.subtitles.hasOwnProperty(key)) {
            this.subtitles[key].translations = translations;

            //const currentSubtitleElement = document.querySelector('.player-timedtext-text-container');
            //if (currentSubtitleElement && currentSubtitleElement.textContent === key) {
            //    this.updateSubtitlesStyle([translations]);
            //}
        }
    }

    protected onTimeUpdated(): void {
        if (!this.autoPause || !this.video || !this.autoPauseOn) return;

        const time = this.video.currentTime;
        const isEndingSoon = time >= this.autoPauseOn - 0.25 && time <= this.autoPauseOn;
        const wasNotPausedAlready = this.autoPauseOn !== this.lastAutoPauseOn;
        if (time && isEndingSoon && wasNotPausedAlready) {
            this.lastAutoPauseOn = this.autoPauseOn;
            const pauseIn = (this.autoPauseOn - time) * 1000 - 100;
            setTimeout(() => {
                document.querySelector('.button-nfplayerPause').dispatchEvent(new Event('click'));
            }, pauseIn);
        }
    }
}
