import {
  injectWebAccessibleResource,
  onMessage,
} from './shared/extension-helpers';
import {
  ITranslatorService,
  GTranslatorService,
} from './translator/translator.service';
import { Action, TranslatePayload } from 'src/shared/actions';

const translatorService: ITranslatorService = new GTranslatorService();

injectWebAccessibleResource('script', 'runtime.js');

onMessage((m) => {
  if (m.action === Action.translate) {
    const translatePayload = m.payload as TranslatePayload;
    translatorService.translate(translatePayload.value);
  }
});
