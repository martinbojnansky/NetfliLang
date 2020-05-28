import {
  injectWebAccessibleResource,
  onMessage,
  onDocumentMessage,
  injectElement,
} from './shared/extension-helpers';
import {
  ITranslatorService,
  GTranslatorService,
} from './translator/translator.service';
import { Action, TranslatePayload } from 'src/shared/actions';
import { Constants } from 'src/shared/constants';

const translatorService: ITranslatorService = new GTranslatorService();

injectWebAccessibleResource('script', 'runtime.js');
injectWebAccessibleResource('script', 'polyfills.js');
injectWebAccessibleResource('script', 'styles.js');
injectWebAccessibleResource('script', 'vendor.js');
injectWebAccessibleResource('script', 'main.js');

// Start of Netlfix
injectElement(<any>'app-root');

onDocumentMessage(Action.componentCreated, () => {
  chrome.storage.sync.get(Constants.settingsKey, (value) => {
    document.dispatchEvent(
      new CustomEvent(Action.settingsRestored, {
        detail: value[Constants.settingsKey],
      })
    );
  });
});

onDocumentMessage(Action.settingsChanged, (payload) => {
  chrome.storage.sync.set({ [Constants.settingsKey]: payload });
});
// End of Netflix

onMessage((m) => {
  if (m.action === Action.translate) {
    const translatePayload = m.payload as TranslatePayload;
    translatorService.translate(translatePayload.value);
  }
});
