import {
  injectWebAccessibleResource,
  onMessage,
  onDocumentMessage,
} from './shared/extension-helpers';
import { Action, TranslatedPayload } from 'src/shared/actions';
import { NetflixService } from './netflix/netflix.service';
import { ISubtitles } from 'src/shared/interfaces';

const netflixService = new NetflixService();

injectWebAccessibleResource('script', 'runtime.js');
injectWebAccessibleResource('script', 'netflixInterceptor.js');

const iframe = injectWebAccessibleResource('iframe', 'index.html');
iframe.setAttribute(
  'style',
  'position: absolute; top: 1rem; left: 50vw; transform: translate(-50%, 0); z-index: 999; border: 0;'
);

onDocumentMessage(Action.subtitlesParsed, (subtitles: ISubtitles) => {
  netflixService.setSubtitles(subtitles);
});

onMessage((m) => {
  if (m.action === Action.translated) {
    const translated = <TranslatedPayload>(<unknown>m.payload);
    netflixService.translationReceived(
      translated?.value,
      translated?.translation
    );
  }
});
