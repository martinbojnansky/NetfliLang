export class Store<TState extends object> {
    protected _state: TState;

    public get state(): TState {
        return this._state;
    }

    constructor(initialState?: Partial<TState>) {
        this._state = <TState>(initialState ? initialState : {});
    }

    public patch(patch: Partial<TState>): void {
        this._state = Object.assign(this._state, patch);
    }
}