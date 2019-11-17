let xhrOpen = window.XMLHttpRequest.prototype.open;

window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this.addEventListener('load', function () {
        const subtitles = tryParseSubtitles(this.responseText);
        if (subtitles) {
            NefliLang.sendNotificatio(subtitles);
        }
    });

    return xhrOpen.apply(this, arguments);
}

function tryParseSubtitles(response) {
    try {
        const parser = new DOMParser();
        const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
        const subtitles = Array.from(ttmlDoc.querySelectorAll('p')).map(p => p.textContent).join('|');
        return subtitles;
    } catch {
        return null;
    }
}