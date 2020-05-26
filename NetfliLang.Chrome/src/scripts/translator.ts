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
injectWebAccessibleResource('script', 'polyfills.js');
injectWebAccessibleResource('script', 'styles.js');
injectWebAccessibleResource('script', 'vendor.js');
injectWebAccessibleResource('script', 'main.js');
const element = document.createElement('app-root');
element.setAttribute(
  'style',
  'position: absolute; top: 0; left: 40vw; z-index: 999;'
);
document.body.appendChild(element);

onMessage((m) => {
  if (m.action === Action.translate) {
    const translatePayload = m.payload as TranslatePayload;
    translatorService.translate(translatePayload.value);
  }
});
