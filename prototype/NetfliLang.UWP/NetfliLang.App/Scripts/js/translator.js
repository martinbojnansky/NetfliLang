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
                        mutation.addedNodes.forEach(_this.onNodeAdded);
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
define("helpers/try-safe", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function trySafe(fce) {
        try {
            fce();
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    exports.trySafe = trySafe;
});
define("services/translator.service", ["require", "exports", "services/mutation-observer.service", "../models/netfli-lang", "helpers/try-safe"], function (require, exports, mutation_observer_service_1, netfli_lang_1, try_safe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TranslatorService = /** @class */ (function (_super) {
        __extends(TranslatorService, _super);
        function TranslatorService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TranslatorService;
    }(mutation_observer_service_1.MutationObserverService));
    exports.TranslatorService = TranslatorService;
    var GTranslatorService = /** @class */ (function (_super) {
        __extends(GTranslatorService, _super);
        function GTranslatorService() {
            var _this = _super.call(this) || this;
            _this.onNodeAdded = function (node, key, parent) {
                try {
                    if (node.classList.contains('tlid-result')) {
                        var action = { value: _this.sourceText, translation: _this.resultText };
                        netfli_lang_1.default.sendNotification('translated', JSON.stringify(action));
                    }
                }
                catch (_a) { }
            };
            return _this;
        }
        Object.defineProperty(GTranslatorService.prototype, "source", {
            get: function () {
                return try_safe_1.trySafe(function () { return document.querySelector('#source'); });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTranslatorService.prototype, "sourceText", {
            get: function () {
                var _this = this;
                return try_safe_1.trySafe(function () { return _this.source.value; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GTranslatorService.prototype, "resultText", {
            get: function () {
                return try_safe_1.trySafe(function () {
                    var result = '';
                    document.querySelectorAll('.tlid-result .tlid-translation').forEach(function (r) { return result += r.textContent; });
                    return result;
                });
            },
            enumerable: true,
            configurable: true
        });
        GTranslatorService.prototype.translate = function (value) {
            this.source.value = value;
        };
        return GTranslatorService;
    }(TranslatorService));
    exports.GTranslatorService = GTranslatorService;
});
define("translator", ["require", "exports", "services/translator.service"], function (require, exports, translator_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var translator = new translator_service_1.GTranslatorService();
});
