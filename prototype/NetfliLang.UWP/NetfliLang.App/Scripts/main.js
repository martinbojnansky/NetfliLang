let nlSubtitles;
let nlTimer;
let nlStyle;
let nlVideo;
let nlSpeed = 0.7;

let nlCurrentIndex;
let nlDisplayedIndex;
let nlTranslatedIndex;

let xhrOpen = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this.addEventListener('load', function () {
        try {
            // if (!window.location.href.includes('netflix.com/watch')) return;

            const parser = new DOMParser();
            const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
            nlSubtitles = parseSubtitles(ttmlDoc);

            if (nlTimer) return;
            createSubtitlesStyle();
            nlTimer = setInterval(onTick, 500);
        }
        catch (e) {
            // Most likely this is not ttml document.
        }
    });

    return xhrOpen.apply(this, arguments);
};

function onTick() {
    setSpeed();
}

function getVideo() {
    return document.querySelector('video');
}

function setSpeed() {
    trySafe(() => getVideo().playbackRate = nlSpeed);
}

function createSubtitlesStyle() {
    if (!nlStyle) {
        nlStyle = document.createElement('style');
        nlStyle.type = 'text/css';
        nlStyle.innerHTML = `
            .player-timedtext span {
                display: block;
                color: yellow !important;
            }

            .player-timedtext span > br {
                display: none;
            }

            .player-timedtext span:before {
                display: block;
                content: '...';
                color: white;
                font-size: 25px;
                line-height: normal;
                font-weight: normal;
                color: #ffffff;
                text-shadow: #000000 0px 0px 7px;
                font-family: Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif;
                font-weight: bold;
            }

            .player-timedtext span:not(:first-child):before {
                margin-top: 4px;
            }
        `;
        document.head.insertAdjacentElement('beforeend', nlStyle);
    }
}

function parseSubtitles(ttmlDoc) {
    const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
    return Array.from(ttmlDoc.querySelectorAll('p')).map(p => {
        return {
            start: Number(p.getAttribute('begin').replace('t', '')) / tickRate,
            end: Number(p.getAttribute('end').replace('t', '')) / tickRate,
            values: Array.from(p.querySelectorAll('span')).map(s => s.textContent),
            translations: null
        };
    });
}

function trySafe(fce) {
    try {
        fce();
    } catch (e) {
        // 
    }
}