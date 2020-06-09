import { Action } from 'src/shared/actions';
import { SubtitlesParserService } from './netflix/subtitles-parser.service';
import { sendDocumentMessage } from './shared/extension-helpers';
import { Constants } from 'src/shared/constants';

// Intercepts all HTTP calls in order to find subtitles (TTML document) requested at any time.
// Loaded TTML document is parsed and saved to the state.
const interceptHttpCalls = (): void => {
  const xhrOpen = window.XMLHttpRequest.prototype.open;
  // @ts-ignore
  window.XMLHttpRequest.prototype.open = function (
    method: string,
    url: string,
    async: boolean,
    username?: string | null,
    password?: string | null
  ): void {
    this.addEventListener('load', () => {
      try {
        if (!window.location.href.includes(Constants.netflixUrl)) return;
        const parser = new DOMParser();
        const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
        const subtitles = new SubtitlesParserService().parseSubtitles(ttmlDoc);
        sendDocumentMessage(Action.subtitlesParsed, subtitles);
      } catch {}
    });

    return xhrOpen.apply(this, arguments);
  };
};

interceptHttpCalls();
