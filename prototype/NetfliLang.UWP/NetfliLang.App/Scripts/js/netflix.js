var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("services/mutation-observer.service", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MutationObserverService = /** @class */ (function () {
        function MutationObserverService() {
            this.init();
        }
        MutationObserverService.prototype.init = function () {
            var _this = this;
            this.observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (_this.onNodeAdded) {
                        mutation.addedNodes.forEach(function (value, key, parent) { return _this.onNodeAdded(value, key, parent); });
                    }
                });
            });
            this.observer.observe(document, {
                childList: true,
                subtree: true
            });
        };
        return MutationObserverService;
    }());
    exports.MutationObserverService = MutationObserverService;
});
define("helpers/notifications", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendNotification = function (action, payload) {
        // @ts-ignore
        NetfliLang.sendNotification(action, payload);
    };
});
define("models/subtitles", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("services/subtitles-parser.service", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SubtitlesParserService = /** @class */ (function () {
        function SubtitlesParserService() {
        }
        SubtitlesParserService.prototype.parseSubtitles = function (ttmlDoc) {
            var _this = this;
            var tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
            var subtitles = {};
            ttmlDoc.querySelectorAll('p').forEach(function (element, index, elements) {
                var key = element.textContent;
                var nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
                var occurence = _this.parseOccurence(element, tickRate, nextKey);
                if (!subtitles[key]) {
                    var lines = element.innerHTML.split(/<br[^>]*>/).map(function (s) { return s.replace(/<[^>]*>/g, ''); });
                    subtitles[key] = {
                        key: key,
                        occurences: [occurence],
                        lines: lines,
                        translations: []
                    };
                }
                else {
                    subtitles[key].occurences.push(occurence);
                }
            });
            return subtitles;
        };
        SubtitlesParserService.prototype.parseOccurence = function (element, tickRate, nextKey) {
            return {
                start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
                end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
                next: nextKey
            };
        };
        return SubtitlesParserService;
    }());
    exports.SubtitlesParserService = SubtitlesParserService;
});
define("services/netflix.service", ["require", "exports", "services/mutation-observer.service", "helpers/notifications", "services/subtitles-parser.service"], function (require, exports, mutation_observer_service_1, notifications_1, subtitles_parser_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NetflixService = /** @class */ (function (_super) {
        __extends(NetflixService, _super);
        function NetflixService() {
            var _this_1 = _super !== null && _super.apply(this, arguments) || this;
            _this_1.autoPause = true;
            _this_1.onNodeAdded = function (node, key, parent) {
                try {
                    var div = node;
                    if (div.classList.contains('player-timedtext-text-container')) {
                        _this_1.onSubtitleDisplayed(node.textContent);
                    }
                    else if (div.classList.contains('nfp') && div.classList.contains('AkiraPlayer') && _this_1.video) {
                        _this_1.video.ontimeupdate = function () { return _this_1.onTimeUpdated(); };
                    }
                }
                catch (e) {
                    console.log(e);
                }
            };
            return _this_1;
        }
        Object.defineProperty(NetflixService.prototype, "video", {
            get: function () {
                return document.querySelector('video');
            },
            enumerable: true,
            configurable: true
        });
        NetflixService.prototype.init = function () {
            _super.prototype.init.call(this);
            var _this = this;
            // @ts-ignore
            var xhrOpen = window.XMLHttpRequest.prototype.open;
            // @ts-ignore
            window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
                var _this_1 = this;
                this.addEventListener('load', function () {
                    try {
                        if (window.location.href.indexOf('netflix.com/watch') === -1)
                            return;
                        var parser = new DOMParser();
                        var ttmlDoc = parser.parseFromString(_this_1.responseText, 'text/xml');
                        _this.subtitles = (new subtitles_parser_service_1.SubtitlesParserService()).parseSubtitles(ttmlDoc);
                        _this.createSubtitlesStyleElement();
                    }
                    catch (_a) { }
                });
                return xhrOpen.apply(this, arguments);
            };
        };
        NetflixService.prototype.createSubtitlesStyleElement = function () {
            if (!this.style) {
                this.style = document.createElement('style');
                this.style.type = 'text/css';
                document.head.insertAdjacentElement('beforeend', this.style);
            }
        };
        NetflixService.prototype.updateSubtitlesStyle = function (translations) {
            var style = "\n            .player-timedtext span {\n                display: block;\n                color: yellow !important;\n            }\n\n            .player-timedtext span > br {\n                display: none;\n            }\n\n            .player-timedtext span::after {\n                content: '';                \n                display: block;\n                color: white;\n                font-size: 2.5rem;\n                line-height: normal;\n                font-weight: normal;\n                color: #ffffff;\n                text-shadow: #000000 0px 0px 7px;\n                font-family: Netflix Sans, Helvetica Nueue, Helvetica, Arial, sans-serif;\n                font-weight: bold;\n            }\n\n            .player-timedtext span:not(:last-child)::after {\n                margin-bottom: 4px;\n            }\n        ";
            if (translations) {
                translations.forEach(function (translation, index) {
                    style += ".player-timedtext span:nth-child(" + (index + 1) + ")::after {\n                    content: '" + translation + "';\n                }";
                });
            }
            this.style.innerHTML = style;
        };
        NetflixService.prototype.onSubtitleDisplayed = function (key) {
            try {
                this.showSubtitleTranslation(key);
                this.translateNextSubtitle(key);
            }
            catch (e) {
                console.log(e);
            }
        };
        NetflixService.prototype.showSubtitleTranslation = function (key) {
            var subtitle = this.subtitles[key];
            //if (!subtitle.translations.length) {
            //    this.translateSubtitle(subtitle);
            //}
            this.updateSubtitlesStyle(subtitle.translations);
            if (this.autoPause) {
                this.autoPauseOn = subtitle.occurences[0].end; // TODO: Find next occurence based on time
            }
        };
        NetflixService.prototype.translateNextSubtitle = function (key) {
            var nextKey = this.subtitles[key].occurences[0].next; // TODO: Find next occurence based on time
            var next = this.subtitles[nextKey];
            this.translateSubtitle(next);
        };
        NetflixService.prototype.translateSubtitle = function (subtitle) {
            if (!subtitle.translations.length) {
                notifications_1.sendNotification('translate', JSON.stringify({ key: subtitle.key, lines: subtitle.lines }));
            }
        };
        NetflixService.prototype.translationReceived = function (key, translations) {
            if (this.subtitles.hasOwnProperty(key)) {
                this.subtitles[key].translations = translations;
                //const currentSubtitleElement = document.querySelector('.player-timedtext-text-container');
                //if (currentSubtitleElement && currentSubtitleElement.textContent === key) {
                //    this.updateSubtitlesStyle([translations]);
                //}
            }
        };
        NetflixService.prototype.onTimeUpdated = function () {
            if (!this.autoPause || !this.video || !this.autoPauseOn)
                return;
            var time = this.video.currentTime;
            var isEndingSoon = time >= this.autoPauseOn - 0.25 && time <= this.autoPauseOn;
            var wasNotPausedAlready = this.autoPauseOn !== this.lastAutoPauseOn;
            if (time && isEndingSoon && wasNotPausedAlready) {
                this.lastAutoPauseOn = this.autoPauseOn;
                var pauseIn = (this.autoPauseOn - time) * 1000 - 100;
                setTimeout(function () {
                    document.querySelector('.button-nfplayerPause').dispatchEvent(new Event('click'));
                }, pauseIn);
            }
        };
        return NetflixService;
    }(mutation_observer_service_1.MutationObserverService));
    exports.NetflixService = NetflixService;
});
define("netflix", ["require", "exports", "services/netflix.service"], function (require, exports, netflix_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.netflix = new netflix_service_1.NetflixService();
});
