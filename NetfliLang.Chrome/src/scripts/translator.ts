import {
  injectWebAccessibleResource,
  onMessage,
} from './shared/extension-helpers';
import {
  ITranslatorService,
  GTranslatorService,
} from './translator/translator.service';
import { Action, TranslatePayload } from 'src/shared/actions';
import { Constants } from 'src/shared/constants';
import { ISettings } from 'src/shared/interfaces';

injectWebAccessibleResource('script', 'runtime.js');

const translatorService: ITranslatorService = new GTranslatorService();

// Applies settings onto translator service.
function applySettings(settings: ISettings) {
  translatorService.setLanguage(settings.targetLanguage.id);
}

// Applies stored settings on first run of this script.
chrome.storage.sync.get(Constants.settingsKey, (value) => {
  applySettings(value[Constants.settingsKey] as ISettings);
});

// Applies settings on change.
chrome.storage.onChanged.addListener((value) =>
  applySettings(value[Constants.settingsKey]?.newValue as ISettings)
);

// Listens to messages from extension.
onMessage((m) => {
  // Translate text
  if (m.action === Action.translate) {
    const translatePayload = m.payload as TranslatePayload;
    translatorService.translate(translatePayload.value);
  }
});
