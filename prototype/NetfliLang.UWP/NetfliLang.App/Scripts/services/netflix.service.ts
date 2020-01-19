//import { MutationObserverService } from "./mutation-observer.service";
//import NetfliLang from "../models/netfli-lang";
//import { trySafe } from "../helpers/try-safe";

//export class NetflixService extends MutationObserverService {
//    protected createInterceptor(): void {
//        var xhrOpen = window.XMLHttpRequest.prototype.open;
//        window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
//            this.addEventListener('load', function () {
//                try {
//                    if (!window.location.href.includes('netflix.com/watch')) return;

//                    const parser = new DOMParser();
//                    const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
//                    nlSubtitles = parseSubtitles(ttmlDoc);
//                    createSubtitlesStyle();
//                }
//                catch (e) {
//                    // Most likely this is not ttml document.
//                }
//            });

//            return xhrOpen.apply(this, arguments);
//        };
//    }

//    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
//        try {
//            if ((node as HTMLDivElement).classList.contains('player-timedtext-text-container')) {
//                updateSubtitles(node.textContent);
//            }
//        } catch { }
//    }

//    protected getVideo(): HTMLVideoElement {
//        return document.querySelector('video');
//    }

//    protected setSpeed(speed): void {
//        if (speed) {
//            nlSpeed = speed;
//        }

//        trySafe(() => getVideo().playbackRate = nlSpeed);
//    }

//    protected updateSubtitles(key) {
//        try {
//            // Show current
//            const currentTitles = nlSubtitles[key];
//            updateSubtitlesStyle(currentTitles.translations); // TODO: Use translations instead
//            // Translate next
//            const nextKey = currentTitles.occurences[0].next;
//            const nextTitles = nlSubtitles[nextKey];
//            NetfliLang.sendNotification('translate', JSON.stringify({ key: nextKey, lines: nextTitles.lines }));
//        } catch (e) {
//            //
//        }
//    }

//    protected translationReceived(key, translations) {
//        try {
//            nlSubtitles[key].translations = translations;
//            console.log(nlSubtitles[key]);
//        } catch (e) {
//            //
//        }
//    }

//    protected createSubtitlesStyle() {
//        if (!nlStyle) {
//            nlStyle = document.createElement('style');
//            nlStyle.type = 'text/css';
//            document.head.insertAdjacentElement('beforeend', nlStyle);
//        }

//        updateSubtitles([]);
//    }

//    protected updateSubtitlesStyle(translations): void {
//        let style = `
//            .player-timedtext span {
//                display: block;
//                color: yellow !important;
//            }

//            .player-timedtext span > br {
//                display: none;
//            }

//            .player-timedtext span::after {
//                content: '';                
//                display: block;
//                color: white;
//                font-size: 2.5rem;
//                line-height: normal;
//                font-weight: normal;
//                color: #ffffff;
//                text-shadow: #000000 0px 0px 7px;
//                font-family: Netflix Sans, Helvetica Nueue, Helvetica, Arial, sans-serif;
//                font-weight: bold;
//            }

//            .player-timedtext span:not(:last-child)::after {
//                margin-bottom: 4px;
//            }
//        `;
//        if (translations) {
//            translations.forEach((translation, index) => {
//                style += `.player-timedtext span:nth-child(` + (index + 1) + `)::after {
//            content: '` + translation + `';
//        }`;
//            });
//        }

//        nlStyle.innerHTML = style;
//    }

//    protected parseSubtitles(ttmlDoc) {
//        const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
//        const subtitles = {};
//        ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
//            const key = element.textContent;
//            const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
//            const occurence = this.parseOccurence(element, tickRate, nextKey);
//            if (!subtitles[key]) {
//                const lines = element.innerHTML.split(/<br[^>]*>/).map(s => s.replace(new RegExp(/<[^>]*>/, 'g'), ''));
//                subtitles[key] = {
//                    occurences: [occurence],
//                    lines: lines,
//                    translations: []
//                };
//            } else {
//                subtitles[key].occurences.push(occurence);
//            }
//        });
//        return subtitles;
//    }

//    protected parseOccurence(element, tickRate, nextKey) {
//        return {
//            start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
//            end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
//            next: nextKey
//        };
//    }
//}
