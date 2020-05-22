import { Action } from 'src/shared/actions';
import { IMessage } from 'src/shared/interfaces';

export const injectWebAccessibleResource = <
  T extends keyof HTMLElementTagNameMap
>(
  tag: T,
  path: string
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(tag);
  element['src'] = chrome.runtime.getURL(path);
  document.body.appendChild(element);
  return element;
};

export const createPayload = <T>(payload: T): T => payload;

export const sendMessage = <T>(action: Action, payload: T) => {
  chrome.runtime.sendMessage({ action: action, payload: payload } as IMessage<
    T
  >);
};

export const onMessage = <T>(
  callback: (message: IMessage<T>) => void
): void => {
  chrome.runtime.onMessage.addListener(callback);
};

export const getOrCreateTab = (url: string): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: `${url}/*`, currentWindow: true }, (tabs) => {
      if (tabs?.length) {
        resolve(tabs[0]);
      } else {
        chrome.tabs.create({ url: url, active: false }, (tab) => resolve(tab));
      }
    });
  });
};
