export function trySafe<T>(fce: () => T) {
    try {
        fce();
    } catch (e) {
        console.log(e);
        return null;
    }
}