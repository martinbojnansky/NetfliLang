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
    protected store = new Store<IGTranslatorServiceState>({
        targetLanguage: 'en'
    });

    protected get source(): HTMLTextAreaElement {
        return document.querySelector('#source')
    }

    protected get sourceText(): string {
        return this.source.value;
    }

    protected get resultText(): string {
        let result = '';
        document.querySelectorAll('.tlid-result .tlid-translation').forEach((r: HTMLSpanElement) => result += r.textContent);
        return result;
    }

    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        try {
            if ((node as HTMLDivElement).classList.contains('tlid-result')) {
                const action = { value: this.sourceText, translation: this.resultText };
                sendNotification('translated', JSON.stringify(action));
            }
        } catch (e) { console.log(e); }
    }

    public translate(value: string): void {
        this.source.value = value;
    }

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
}
