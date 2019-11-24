let nlSubtitles;
let nlStyle;
let nlSpeed = 0.7;

let xhrOpen = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this.addEventListener('load', function () {
        try {
            if (!window.location.href.includes('netflix.com/watch')) return;

            const parser = new DOMParser();
            const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
            nlSubtitles = parseSubtitles(ttmlDoc);
            console.log(nlSubtitles);
            createSubtitlesStyle();
        }
        catch (e) {
            // Most likely this is not ttml document.
        }
    });

    return xhrOpen.apply(this, arguments);
};

let insertedNodes;
let observer = new WebKitMutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        insertedNodes = [];
        for (var i = 0; i < mutation.addedNodes.length; i++)
            insertedNodes.push(mutation.addedNodes[i]);
    });
    
    // TODO: If video, apply speed "video"
    setSpeed();
    // TODO: If subtitles, show translation and translate next ".player-timedtext"
});
observer.observe(document, {
    childList: true,
    subtree: true
});

// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

function getVideo() {
    return document.querySelector('video');
}

function setSpeed() {
    trySafe(() => getVideo().playbackRate = nlSpeed);
}

function updateTranslation()

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
                content: '...';                
                display: block;
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
    const subtitles = {};
    ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
        const key = element.textContent;
        const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
        const occurence = parseOccurence(element, tickRate, nextKey);
        if (!subtitles[key]) {
            const lines = Array.from(element.querySelectorAll('span')).map(s => s.textContent);
            subtitles[key] = {
                occurences: [occurence],
                lines: lines,
                translations: null
            };
        } else {
            subtitles[key].occurences.push(occurence);
        }
    });
    return subtitles;
}

function parseOccurence(element, tickRate, nextKey) {
    return {
        start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
        end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
        next: nextKey
    };
}

function trySafe(fce) {
    try {
        fce();
    } catch (e) {
        return null;
    }
}