import {
  injectWebAccessibleResource,
  onMessage,
  onDocumentMessage,
  injectElement,
} from './shared/extension-helpers';
import { Action, TranslatedPayload } from 'src/shared/actions';
import { NetflixService, INetflixService } from './netflix/netflix.service';
import { ISubtitles, ISettings } from 'src/shared/interfaces';
import { Constants } from 'src/shared/constants';

injectWebAccessibleResource('script', 'runtime.js');
injectWebAccessibleResource('script', 'netflixInterceptor.js');
injectWebAccessibleResource('script', 'polyfills.js');
injectWebAccessibleResource('script', 'styles.js');
injectWebAccessibleResource('script', 'vendor.js');
injectWebAccessibleResource('script', 'main.js');
injectElement(<any>'app-root');

const netflixService: INetflixService = new NetflixService();

// Applies settings onto netflix service.
function applySettings(settings: ISettings) {
  netflixService.setSpeed(settings.speed);
  netflixService.setAutoPause(settings.autopause);
  netflixService.setLanguage(settings.targetLanguage);
  chrome.storage.sync.set({ [Constants.settingsKey]: settings });
}

// Restore settings.
onDocumentMessage(Action.componentCreated, () => {
  chrome.storage.sync.get(Constants.settingsKey, (value) => {
    const settings = value[Constants.settingsKey] as ISettings;
    // Send stored settings to component once it was created.
    document.dispatchEvent(
      new CustomEvent(Action.settingsRestored, {
        detail: settings,
      })
    );
    // Apply stored settings.
    applySettings(settings);
  });
});

// Apply and settings on change.
onDocumentMessage(Action.settingsChanged, (payload) => {
  applySettings(payload as ISettings);
});

// Pass subtitles to the service once the interceptor has parsed new ones.
onDocumentMessage(Action.subtitlesParsed, (subtitles: ISubtitles) => {
  netflixService.setSubtitles(subtitles);
});

// Listens to messages from extension.
onMessage((m) => {
  // Process text translation
  if (m.action === Action.translated) {
    const translated = <TranslatedPayload>(<unknown>m.payload);
    netflixService.translationReceived(
      translated?.value,
      translated?.translation
    );
  }
});
