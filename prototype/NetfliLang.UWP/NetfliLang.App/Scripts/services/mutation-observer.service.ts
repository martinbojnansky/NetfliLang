export abstract class MutationObserverService {
    protected observer: MutationObserver;

    constructor() {
        this.init();
    }

    protected init(): void {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (this.onNodeAdded) {
                    mutation.addedNodes.forEach(this.onNodeAdded)
                }
            });
        });

        this.observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    protected onNodeAdded: (node: Node, key: number, parent: NodeList) => void;
}