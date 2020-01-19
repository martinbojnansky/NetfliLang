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
define("services/netflix.service", ["require", "exports", "services/mutation-observer.service", "helpers/notifications"], function (require, exports, mutation_observer_service_1, notifications_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NetflixService = /** @class */ (function (_super) {
        __extends(NetflixService, _super);
        function NetflixService() {
            var _this_1 = _super.call(this) || this;
            _this_1.speed = 1;
            _this_1.onNodeAdded = function (node, key, parent) {
                try {
                    if (node.classList.contains('player-timedtext-text-container')) {
                        _this_1.updateSubtitles(node.textContent);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            };
            _this_1.initInterceptor();
            return _this_1;
        }
        NetflixService.prototype.initInterceptor = function () {
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
                        _this.subtitles = _this.parseSubtitles(ttmlDoc);
                        _this.createSubtitlesStyle();
                    }
                    catch (e) {
                        console.log(e);
                    }
                });
                return xhrOpen.apply(this, arguments);
            };
        };
        // TODO: On node removed -> auto pause video
        NetflixService.prototype.getVideo = function () {
            return document.querySelector('video');
        };
        NetflixService.prototype.setSpeed = function (speed) {
            if (speed) {
                this.speed = speed;
            }
            try {
                this.getVideo().playbackRate = this.speed;
            }
            catch (e) {
                console.log(e);
            }
        };
        // TODO: Require set speed from app
        // TODO: On seek to previouse
        NetflixService.prototype.updateSubtitles = function (key) {
            try {
                // Show current
                var currentTitles = this.subtitles[key];
                this.updateSubtitlesStyle(currentTitles.translations);
                // Translate next
                var nextKey = currentTitles.occurences[0].next;
                var nextTitles = this.subtitles[nextKey];
                notifications_1.sendNotification('translate', JSON.stringify({ key: nextKey, lines: nextTitles.lines }));
            }
            catch (e) {
                console.log(e);
            }
        };
        NetflixService.prototype.translationReceived = function (key, translations) {
            try {
                this.subtitles[key].translations = translations;
            }
            catch (e) {
                console.log(e);
            }
        };
        NetflixService.prototype.createSubtitlesStyle = function () {
            if (!this.style) {
                this.style = document.createElement('style');
                this.style.type = 'text/css';
                document.head.insertAdjacentElement('beforeend', this.style);
            }
            this.updateSubtitles([]);
        };
        NetflixService.prototype.updateSubtitlesStyle = function (translations) {
            var style = "\n            .player-timedtext span {\n                display: block;\n                color: yellow !important;\n            }\n\n            .player-timedtext span > br {\n                display: none;\n            }\n\n            .player-timedtext span::after {\n                content: '';                \n                display: block;\n                color: white;\n                font-size: 2.5rem;\n                line-height: normal;\n                font-weight: normal;\n                color: #ffffff;\n                text-shadow: #000000 0px 0px 7px;\n                font-family: Netflix Sans, Helvetica Nueue, Helvetica, Arial, sans-serif;\n                font-weight: bold;\n            }\n\n            .player-timedtext span:not(:last-child)::after {\n                margin-bottom: 4px;\n            }\n        ";
            if (translations) {
                translations.forEach(function (translation, index) {
                    style += ".player-timedtext span:nth-child(" + (index + 1) + ")::after {\n            content: '" + translation + "';\n        }";
                });
            }
            this.style.innerHTML = style;
        };
        NetflixService.prototype.parseSubtitles = function (ttmlDoc) {
            var _this_1 = this;
            var tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
            var subtitles = {};
            ttmlDoc.querySelectorAll('p').forEach(function (element, index, elements) {
                var key = element.textContent;
                var nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
                var occurence = _this_1.parseOccurence(element, tickRate, nextKey);
                if (!subtitles[key]) {
                    var lines = element.innerHTML.split(/<br[^>]*>/).map(function (s) { return s.replace(new RegExp("/<[^>]*>/", 'g'), ''); });
                    subtitles[key] = {
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
        NetflixService.prototype.parseOccurence = function (element, tickRate, nextKey) {
            return {
                start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
                end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
                next: nextKey
            };
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
