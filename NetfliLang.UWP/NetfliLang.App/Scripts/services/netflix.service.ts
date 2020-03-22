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
    },
    speed: number
}

export class NetflixService extends MutationObserverService {
    // #region properties-definition
    
    // Gets object that contains single source of thruth (state).
    protected readonly store = new Store<INetflixServiceState>({
        autoPause: {
            next: null,
            last: null
        }
    });

    // Gets or sets <style> element used to modify current visual styles.
    protected style: HTMLStyleElement;

    // Gets <video> element.
    protected get video(): HTMLVideoElement {
        return document.querySelector('video');
    }

    // Gets <button> element used to pause video playback.
    protected get pauseButton(): HTMLButtonElement {
        return document.querySelector('.button-nfplayerPause');
    }

    // #endregion

    // #region general

    protected init(): void {
        super.init();
        this.interceptHttpCalls();
    }

    // Intercepts all HTTP calls in order to find subtitles (TTML document) requested at any time.
    // Loaded TTML document is parsed and saved to the state.
    protected interceptHttpCalls(): void {
        const _this = this;
        // @ts-ignore
        const xhrOpen = window.XMLHttpRequest.prototype.open;
        // @ts-ignore
        window.XMLHttpRequest.prototype.open = function (method: string, url: string, async: boolean, username?: string | null, password?: string | null): void {
            this.addEventListener('load', () => {
                try {
                    if (window.location.href.indexOf('netflix.com/watch') === -1) return;
                    const parser = new DOMParser();
                    const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
                    _this.store.patch({ subtitles: new SubtitlesParserService().parseSubtitles(ttmlDoc) });
                    _this.createSubtitlesStyleElement();
                } catch { }
            });

            return xhrOpen.apply(this, arguments);
        };
    }

    // Called when any element is added to the page.
    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        try {
            const div = node as HTMLDivElement;
            // Listens to add of subtitle element. 
            if (div.classList.contains('player-timedtext-text-container')) {
                this.onSubtitleDisplayed(node.textContent);
            } 
            // Listens to add of <video> element.
            else if (div.classList.contains('nfp') && div.classList.contains('AkiraPlayer') && this.video) {
                this.video.ontimeupdate = () => this.onTimeUpdated();
                this.applySpeed();
            }
        } catch { }
    }

    // Called on <video> element time change.
    protected onTimeUpdated(): void {
        this.handleAutoPause();
    }

    // #endregion

    // #region processing

    // Either renders translation of subtitle matched by provided key and translates upcoming one,
    // or translates current if a translation is missing (can happen on seek).
    protected onSubtitleDisplayed(key: string): void {
        try {
            const subtitle = this.store.state.subtitles[key];
            this.showSubtitleTranslation(subtitle);

            if (subtitle.translations) {
                this.translateNextSubtitle(subtitle);
            } else {
                this.translateSubtitle(subtitle);
            }
        } catch { }
    }

    // Shows subtitle translation by updating CSS style.
    protected showSubtitleTranslation(subtitle: ISubtitle): void {
        this.updateSubtitlesStyle(subtitle);

        if (this.store.state.autoPause) {
            this.store.patch({
                autoPause: {
                    ...this.store.state.autoPause,
                    next: subtitle.occurences[0].end
                }
            });
        }
    }

    // #endregion

    // #region rendering

    // Creates <style> element that modifies CSS styles of
    // displayed subtitles.
    protected createSubtitlesStyleElement(): void {
        if (!this.style) {
            this.style = document.createElement('style');
            this.style.type = 'text/css';
            document.head.insertAdjacentElement('beforeend', this.style);
        }
    }

    // Updates content of <style> element that modifies CSS styles
    // of displayed subtitles. 
    protected updateSubtitlesStyle(subtitle: ISubtitle): void {
        const translations = subtitle.translations;
        const expectedLength = subtitle.lines.length;

        // Displays translations line by line (as pseudo-elements) and differentiate them in size and color.
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

        // Display translation line by line.
        if (translations && translations.length === expectedLength) {
            translations.forEach((translation, index) => {
                css += this.getSubtitleTranslationStyle(index + 1, translation);
            });
        } 
        // Translation is displayed as the single and last line if translator 
        // was not able to translate all lines individually.
        else if (translations && translations.length < expectedLength) {
            css += this.getSubtitleTranslationStyle(expectedLength, translations.join(' '));
        }

        this.style.innerHTML = css;
    }

    // Gets CSS style for single subtitle translation.
    protected getSubtitleTranslationStyle(index: number, content: string): string {
        return `.player-timedtext span:nth-child(${index})::after {
                content: '${content.replace('\'', '\\\'')}';
            }`
    }

    //#endregion

    // #region translating

    // Starts translating subtitle.
    protected translateSubtitle(subtitle: ISubtitle): void {
        if (!subtitle.translations) {
            // Lines are joined with special characters to keep semantics and line breaks.
            sendNotification('translate', JSON.stringify({ value: subtitle.lines.join(' ||| ') }));
        }
    }

    // Starts translating upcoming subtitle.
    protected translateNextSubtitle(subtitle: ISubtitle): void {
        const nextKey = subtitle.occurences[0].next;
        const next = this.store.state.subtitles[nextKey];
        this.translateSubtitle(next);
    }

    // Saves or renders a received translation.
    protected translationReceived(value: string, translation: string): void {
        // Special characters used  to keep semantics and line breaks has to be removed.
        const key = value.replace(/\s\|\|\|\s/g, '');
        const translations = translation.split(/\s*\|\|\|\s*/g);

        let subtitle = this.store.state.subtitles[key];
        subtitle = {
            ...subtitle,
            translations: translations
        };

        this.store.patch({
            subtitles: {
                ...this.store.state.subtitles,
                [subtitle.key]: subtitle
            }
        });

        // If translation of the currently displayed subtitles were received, render them and translate upcoming.
        const currentSubtitleElement = document.querySelector('.player-timedtext-text-container');
        if (currentSubtitleElement && currentSubtitleElement.textContent === key) {
            this.updateSubtitlesStyle(subtitle);
            this.translateNextSubtitle(subtitle);
        }
    }

    // #endregion
    
    // #region settings

    // #region language

    // Since subtitle object is translated only once, all translations 
    // has to be cleared on language change.
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

    // #endregion

    // #region auto-pause

    // Enables or disables autopause.
    public setAutoPause(value: boolean): void {
        this.store.patch({ autoPause: Boolean(value) ? { next: 0, last: 0 } : false });
    }

    // If turned on, pauses <video> element playback at the end of subtitle occurence.
    protected handleAutoPause(): void {
        if (!this.store.state.autoPause || !this.video || !this.store.state.autoPause.next) return;

        const time = this.video.currentTime;
        // Since the time updates won't be same as ends of subtitles, detect upcoming ends in advance.
        const isEndingSoon = time >= this.store.state.autoPause.next - 0.25 && time <= this.store.state.autoPause.next;
        // Prevents pausing video after it has been already paused before.
        const wasNotPausedAlready = this.store.state.autoPause.next !== this.store.state.autoPause.last;
        if (time && isEndingSoon && wasNotPausedAlready) {
            this.store.patch({
                autoPause: {
                    ...this.store.state.autoPause,
                    last: this.store.state.autoPause.next
                }
            });
            // Schedule pause so it ends as close as possible to the time of its disappearance.
            const pauseIn =
                /* difference between end of occurence and current time */
                (this.store.state.autoPause.next - time)
                *
                /* speed */
                1 / (this.store.state.speed ? this.store.state.speed : 1.0)
                *
                /* convert to milliseconds */
                1000
                -
                /* correlation */
                100;
            setTimeout(() => {
                this.pauseButton.dispatchEvent(new Event('click'));
            }, pauseIn);
        }
    }

    // #endregion

    // #region speed

    // Sets video speed and then applies it to <video> element.
    public setSpeed(value: number): void {
        this.store.patch({ speed: value });
        this.applySpeed();
    }

    // Applies video speed to <video> element.
    protected applySpeed(): void {
        const speed = this.store.state.speed;
        if(this.video) {
            this.video.playbackRate = speed ? speed : 1.0; 
        }
    }

    // #endregion

    // #endregion
}
