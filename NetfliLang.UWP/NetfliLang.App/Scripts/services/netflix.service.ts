import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";
import { ISubtitles, ISubtitle } from "../models/subtitles";
import { SubtitlesParserService } from "./subtitles-parser.service";
import { Store } from "../models/store";

export interface INetflixServiceState {
    subtitles: ISubtitles,
    autoPause: false | {
        next: number,
        last: number
    }
}

export class NetflixService extends MutationObserverService {
    protected store = new Store<INetflixServiceState>({
        autoPause: {
            next: null,
            last: null
        }
    });

    protected style: HTMLStyleElement;

    protected get currentSubtitlesText(): string {
        const element = document.querySelector('.player-timedtext');
        return element ? element.textContent : '';
    }

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
                    const subtitles = new SubtitlesParserService().tryParseSubtitles(this.responseText);
                    if (subtitles) {
                        _this.store.patch({ subtitles: subtitles });
                        _this.createSubtitlesStyleElement();
                    }
                } catch { }
            });

            return xhrOpen.apply(this, arguments);
        };
    }

    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        try {
            const div = node as HTMLDivElement;
            if (div.classList.contains('player-timedtext-text-container')) {
                this.onSubtitleDisplayed(this.currentSubtitlesText);
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

            .player-timedtext .player-timedtext-text-container:only-child span:not(:last-child)::after,
            .player-timedtext .player-timedtext-text-container:not(:only-child):not(:last-child) span:last-child::after {
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
        return `.player-timedtext .player-timedtext-text-container:only-child span:nth-child(${index})::after, 
                .player-timedtext .player-timedtext-text-container:not(:only-child):nth-child(${index}) span:last-child::after {
                content: '${content}';
            }`
    }

    protected onSubtitleDisplayed(key: string): void {
        try {
            const subtitle = this.store.state.subtitles[key];
            this.showSubtitleTranslation(subtitle);

            if (subtitle.translations) {
                this.translateNextSubtitle(subtitle);
            } else {
                this.translateSubtitle(subtitle);
            }
        } catch (e) { console.log(e); }
    }

    protected showSubtitleTranslation(subtitle: ISubtitle): void {
        this.updateSubtitlesStyle(subtitle.translations, subtitle.lines.length);

        if (this.store.state.autoPause) {
            this.store.patch({
                autoPause: {
                    ...this.store.state.autoPause,
                    next: subtitle.occurences[0].end
                }
            });
        }
    }

    protected translateNextSubtitle(subtitle: ISubtitle): void {
        const nextKey = subtitle.occurences[0].next;
        const next = this.store.state.subtitles[nextKey];
        this.translateSubtitle(next);
    }

    protected translateSubtitle(subtitle: ISubtitle): void {
        if (!subtitle.translations) {
            sendNotification('translate', JSON.stringify({ value: subtitle.lines.join(' ||| ') }));
        }
    }

    protected translationReceived(value: string, translation: string): void {
        const key = value.replace(/\s\|\|\|\s/g, '');
        const translations = translation.split(/\s*\|\|\|\s*/g);

        const subtitle = this.store.state.subtitles[key];
        this.store.patch({
            subtitles: {
                ...this.store.state.subtitles,
                [subtitle.key]: {
                    ...subtitle,
                    translations: translations
                }
            }
        });

        if (this.currentSubtitlesText === key) {
            this.updateSubtitlesStyle(translations, subtitle.lines.length);
            this.translateNextSubtitle(subtitle);
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

    public clearTranslations(): void {
        if (!this.store.state.subtitles) return;

        let subtitles: ISubtitles = { ...this.store.state.subtitles };
        Object.keys(subtitles).forEach(key => {
            subtitles[key].translations = null;
        });

        this.store.patch({
            subtitles: subtitles
        });
    }
}