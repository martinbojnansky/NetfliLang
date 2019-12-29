var nlSubtitles;
var nlStyle;
var nlSpeed = 1;

var xhrOpen = window.XMLHttpRequest.prototype.open;
window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this.addEventListener('load', function () {
        try {
            if (!window.location.href.includes('netflix.com/watch')) return;

            const parser = new DOMParser();
            const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
            nlSubtitles = parseSubtitles(ttmlDoc);
            createSubtitlesStyle();
        }
        catch (e) {
            // Most likely this is not ttml document.
        }
    });

    return xhrOpen.apply(this, arguments);
};

var observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
            try {
                if (addedNode.classList.contains('player-timedtext-text-container')) {
                    updateSubtitles(addedNode.textContent);
                } else {
                    setSpeed();
                }
            } catch (e) {
                //
            }
        }
        );
    });
});

observer.observe(document, {
    childList: true,
    subtree: true
});

function getVideo() {
    return document.querySelector('video');
}

function setSpeed(speed) {
    if (speed) {
        nlSpeed = speed;
    }

    trySafe(() => getVideo().playbackRate = nlSpeed);
}

function updateSubtitles(key) {
    try {
        // Show current
        const currentTitles = nlSubtitles[key];
        updateSubtitlesStyle(currentTitles.translations); // TODO: Use translations instead
        // Translate next
        const nextKey = currentTitles.occurences[0].next;
        const nextTitles = nlSubtitles[nextKey];
        NetfliLang.sendNotification('translate', JSON.stringify({ key: nextKey, lines: nextTitles.lines }));
    } catch (e) {
        //
    }
}

function translationReceived(key, translations) {
    try {
        nlSubtitles[key].translations = translations;
        console.log(nlSubtitles[key]);
    } catch (e) {
        //
    }
}

function createSubtitlesStyle() {
    if (!nlStyle) {
        nlStyle = document.createElement('style');
        nlStyle.type = 'text/css';
        document.head.insertAdjacentElement('beforeend', nlStyle);
    }

    updateSubtitles([]);
}

function updateSubtitlesStyle(translations) {
    var style = `
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

    nlStyle.innerHTML = style;

}

function parseSubtitles(ttmlDoc) {
    const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
    const subtitles = {};
    ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
        const key = element.textContent;
        const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
        const occurence = parseOccurence(element, tickRate, nextKey);
        if (!subtitles[key]) {
            const lines = element.innerHTML.split(/<br[^>]*>/).map(s => s.replace(new RegExp(/<[^>]*>/, 'g'), ''));
            subtitles[key] = {
                occurences: [occurence],
                lines: lines,
                translations: []
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