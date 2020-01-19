import { MutationObserverService } from "./mutation-observer.service";
import { sendNotification } from "../helpers/notifications";

export abstract class TranslatorService extends MutationObserverService {
    public abstract translate(value: string): void;
}

export class GTranslatorService extends TranslatorService {
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
        } catch { }
    }

    public translate(value: string) {
        this.source.value = value;
    }
}
