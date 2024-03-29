import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";
import { Store } from "../models/store";

export abstract class TranslatorService extends MutationObserverService {
    public abstract translate(value: string): void;
    public abstract selectTargetLanguage(id?: string): void;
}

export interface IGTranslatorServiceState {
    targetLanguage: string;
}

export class GTranslatorService extends TranslatorService {
    // #region properties-definition

    // Gets object that contains single source of thruth (state).
    protected store = new Store<IGTranslatorServiceState>({
        targetLanguage: 'en'
    });

    // Gets element that is used to enter source text for translation.
    protected get source(): HTMLTextAreaElement {
        return document.querySelector('#source')
    }

    // Gets source text used for translation.
    protected get sourceText(): string {
        return this.source.value;
    }

    // Gets translated result text.
    protected get resultText(): string {
        let result = '';
        document.querySelectorAll('.tlid-result .tlid-translation').forEach((r: HTMLSpanElement) => result += r.textContent);
        return result;
    }

    // #endregion

    // #region general

    // Called when any element is added to the page.
    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        try {
            // Listens to add of translation element.
            if ((node as HTMLDivElement).classList.contains('tlid-result')) {
                const action = { value: this.sourceText, translation: this.resultText };
                sendNotification('translated', JSON.stringify(action));
            }
        } catch { }
    }

    // #endregion

    // #region translating

    // Starts translation of the text.
    public translate(value: string): void {
        this.source.value = value;
    }

    // #endregion

    // #region settings 

    // Selects target language for the translation.
    public selectTargetLanguage(id?: string): void {
        if (id) {
            this.store.patch({ targetLanguage: id });
        }

        (document.querySelector('.tlid-open-target-language-list') as HTMLDivElement).click();
        (document.querySelector(`.language_list_tl_list .language_list_item_wrapper.language_list_item_wrapper-${id}`) as HTMLDivElement).click();
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
