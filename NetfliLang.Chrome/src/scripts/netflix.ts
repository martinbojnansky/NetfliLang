import {
  injectWebAccessibleResource,
  onMessage,
} from './shared/extension-helpers';
import { Action, TranslatedPayload } from 'src/shared/actions';
import { NetflixService } from './netflix/netflix.service';
import { ISubtitles } from 'src/shared/interfaces';

const netflixService = new NetflixService();

injectWebAccessibleResource('script', 'runtime.js');
injectWebAccessibleResource('script', 'netflixInterceptor.js');
injectWebAccessibleResource('iframe', 'index.html');

document.addEventListener(
  Action.subtitlesParsed,
  (e: CustomEventInit<Document>) => {
    netflixService.setSubtitles(<ISubtitles>(<unknown>e?.detail));
  }
);

onMessage((m) => {
  if (m.action === Action.translated) {
    const translated = <TranslatedPayload>(<unknown>m.payload);
    netflixService.translationReceived(
      translated?.value,
      translated?.translation
    );
  }
});
