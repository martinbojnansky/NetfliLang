export const sendNotification = (action: string, payload: string): void => {
    // @ts-ignore
    NetfliLang.sendNotification(action, payload);
}