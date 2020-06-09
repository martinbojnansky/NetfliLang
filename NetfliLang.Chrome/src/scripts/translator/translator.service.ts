import { MutationObserverService } from '../shared/mutation-observer.service';
import { Store } from '../shared/store';
import { sendMessage } from '../shared/extension-helpers';
import { Action, TranslatedPayload } from 'src/shared/actions';

export abstract class ITranslatorService extends MutationObserverService {
  public abstract translate(value: string): void;
  public abstract setLanguage(id?: string): void;
}

export interface IGTranslatorServiceState {
  targetLanguage: string;
}

export class GTranslatorService extends ITranslatorService {
  // #region properties-definition

  // Gets object that contains single source of thruth (state).
  protected store = new Store<IGTranslatorServiceState>({
    targetLanguage: 'en',
  });

  // Gets element that is used to enter source text for translation.
  protected get source(): HTMLTextAreaElement {
    return document.querySelector('#source');
  }

  // Gets source text used for translation.
  protected get sourceText(): string {
    return this.source.value;
  }

  // Gets translated result text.
  protected get resultText(): string {
    let result = '';
    document
      .querySelectorAll('.tlid-result .tlid-translation')
      .forEach((r: HTMLSpanElement) => (result += r.textContent));
    return result;
  }

  // Gets whether correct source and target languages are selected.
  protected get areCorrectLanguagesSelected(): boolean {
    return window.location.href.includes(
      `&sl=auto&tl=${this.store.state.targetLanguage}&`
    );
  }

  // #endregion

  // #region general

  // Called when any element is added to the page.
  protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
    try {
      // Listens to add of translation element.
      if ((node as HTMLDivElement).classList.contains('tlid-result')) {
        sendMessage<TranslatedPayload>(Action.translated, {
          value: this.sourceText,
          translation: this.resultText,
        });
      }
    } catch {}
  };

  // #endregion

  // #region translating

  // Starts translation of the text only if it is different.
  public translate(value: string): void {
    // Do not cancel same translation
    if (this.source.value === value) return;
    // Select source and target languages in case that user has changed them
    if (!this.areCorrectLanguagesSelected) {
      this.setLanguage(this.store.state.targetLanguage);
    }
    // Set input field value to initiate translation
    this.source.value = value;
  }

  // #endregion

  // #region settings

  // Selects target language for the translation.
  public setLanguage(id?: string): void {
    if (!id) return;
    // Keep language in service state
    this.store.patch({ targetLanguage: id });
    // Always auto-detect source language
    (document.querySelector(
      '.tlid-open-source-language-list'
    ) as HTMLDivElement).click();
    (document.querySelector(
      `.language_list_sl_list .language_list_item_wrapper.language_list_item_wrapper-auto`
    ) as HTMLDivElement).click();
    // Set target language
    (document.querySelector(
      '.tlid-open-target-language-list'
    ) as HTMLDivElement).click();
    (document.querySelector(
      `.language_list_tl_list .language_list_item_wrapper.language_list_item_wrapper-${id}`
    ) as HTMLDivElement).click();
  }

  /* Following code can be used to print languages to the console.
     * 
    var langDictionary = {};
    document.querySelectorAll('.language_list_tl_list .language_list_item_wrapper').forEach(n => {
        var countryCode = n.classList[1].replace('language_list_item_wrapper-', '');
        var countryName = n.innerText;
        langDictionary[countryName.replace('\t', '')] = countryCode;
    });
    var langList = [];
    Object.keys(langDictionary).sort().forEach(k => langList.push({ countryCode: langDictionary[k], countryName: k }));
    console.log(JSON.stringify(langList))
    *
    */

  // #endregion
}
