import {
  injectWebAccessibleResource,
  onMessage,
  onDocumentMessage,
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
const element = document.createElement('app-root');
element.setAttribute(
  'style',
  'position: absolute; top: 0; left: 40vw; z-index: 999;'
);
document.body.appendChild(element);

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
