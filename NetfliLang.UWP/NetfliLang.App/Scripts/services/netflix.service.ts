import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";
import { ISubtitles, ISubtitle } from "../models/subtitles";
import { SubtitlesParserService } from "./subtitles-parser.service";
import { Store } from "../models/store";

export class NetflixService extends MutationObserverService {
    protected store = new Store<{
        subtitles: ISubtitles,
        autoPause: false | {
            next: number,
            last: number
        }
    }>({
        autoPause: {
            next: null,
            last: null
        }
    });

    protected style: HTMLStyleElement;

    protected get video(): HTMLVideoElement {
        return document.querySelector('video');
    }

    protected get pauseButton(): HTMLButtonElement {
        return document.querySelector('.button-nfplayerPause');
    }

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
                    _this.store.patch({ subtitles: new SubtitlesParserService().parseSubtitles(ttmlDoc)});
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

    protected updateSubtitlesStyle(translations: string[], expectedLength: number): void {
        let css = `
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

        if (translations && translations.length === expectedLength) {
            translations.forEach((translation, index) => {
                css += this.getSubtitleTranslationStyle(index + 1, translation);
            });
        } else if (translations && translations.length < expectedLength) {
            css += this.getSubtitleTranslationStyle(expectedLength, translations.join(' '));
        }

        this.style.innerHTML = css;
    }

    protected getSubtitleTranslationStyle(index: number, content: string): string {
        return `.player-timedtext span:nth-child(${index})::after {
                content: '${content}';
            }`
    }

    protected onSubtitleDisplayed(key: string): void {
        try {
            this.showSubtitleTranslation(key);
            this.translateNextSubtitle(key);
        } catch (e) { console.log(e); }
    }

    protected showSubtitleTranslation(key: string): void {
        const subtitle = this.store.state.subtitles[key];

        //if (!subtitle.translations.length) {
        //    this.translateSubtitle(subtitle);
        //}

        this.updateSubtitlesStyle(subtitle.translations, subtitle.lines.length);

        if (this.store.state.autoPause) {
            this.store.state.autoPause.next = subtitle.occurences[0].end;
        }
    }

    protected translateNextSubtitle(key: string): void {
        const nextKey = this.store.state.subtitles[key].occurences[0].next;
        const next = this.store.state.subtitles[nextKey];
        this.translateSubtitle(next);
    }

    protected translateSubtitle(subtitle: ISubtitle): void {
        if (!subtitle.translations.length) {
            sendNotification('translate', JSON.stringify({ value: subtitle.lines.join(' ||| ') }));
        }
    }

    protected translationReceived(value: string, translation: string): void {
        const key = value.replace(/\s\|\|\|\s/g, '');
        const translations = translation.split(/\s*\|\|\|\s*/g);

        const subtitle = this.store.state.subtitles[key];
        if (subtitle) {
            this.store.patch({
                subtitles: {
                    ...this.store.state.subtitles,
                    [subtitle.key]: {
                        ...subtitle,
                        translations: translations
                    }
                }
            });

            //const currentSubtitleElement = document.querySelector('.player-timedtext-text-container');
            //if (currentSubtitleElement && currentSubtitleElement.textContent === key) {
            //    this.updateSubtitlesStyle(translations, subtitle.lines.length);
            //}
        }
    }

    protected onTimeUpdated(): void {
        if (!this.store.state.autoPause || !this.video || !this.store.state.autoPause.next) return;

        const time = this.video.currentTime;
        const isEndingSoon = time >= this.store.state.autoPause.next - 0.25 && time <= this.store.state.autoPause.next;
        const wasNotPausedAlready = this.store.state.autoPause.next !== this.store.state.autoPause.last;
        if (time && isEndingSoon && wasNotPausedAlready) {
            this.store.patch({
                autoPause: {
                    ...this.store.state.autoPause,
                    last: this.store.state.autoPause.next
                }
            });
            const pauseIn = (this.store.state.autoPause.next - time) * 1000 - 100;
            setTimeout(() => {
                this.pauseButton.dispatchEvent(new Event('click'));
            }, pauseIn);
        }
    }
}
