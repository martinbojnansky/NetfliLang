import { MutationObserverService } from "./mutation-observer.service";
import NetfliLang from "../models/netfli-lang";
import { trySafe } from "../helpers/try-safe";

export abstract class TranslatorService extends MutationObserverService {
    public abstract translate(value: string): void;
}

export class GTranslatorService extends TranslatorService {
    protected get source(): HTMLTextAreaElement {
        return trySafe(() => document.querySelector('#source'))
    }

    protected get sourceText(): string {
        return trySafe(() => this.source.value);
    }

    protected get resultText(): string {
        return trySafe(() => {
            let result = '';
            document.querySelectorAll('.tlid-result .tlid-translation').forEach((r: HTMLSpanElement) => result += r.textContent);
            return result;
        });
    }

    constructor() {
        super();
    }

    protected onNodeAdded = (node: Node, key: number, parent: NodeList) => {
        if ((node as HTMLDivElement).classList.contains('tlid-result')) {
            const action = { value: this.sourceText, translation: this.resultText };
            NetfliLang.sendNotification('translated', JSON.stringify(action));
        }
    }

    public translate(value: string) {
        this.source.value = value;
    }
}
