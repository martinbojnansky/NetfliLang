import { Action } from 'src/shared/actions';
import { IMessage } from 'src/shared/interfaces';
import { environment } from 'src/environments/environment';

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

export const injectElement = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
  beforeRendering: (element: HTMLElementTagNameMap[T]) => void = (e) => {}
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(tag);
  beforeRendering(element);
  document.body.appendChild(element);
  return element;
};

export const sendMessage = <T>(action: Action, payload: T) => {
  const message = { action: action, payload: payload } as IMessage<T>;
  chrome.runtime.sendMessage(message);
  if (!environment.production) {
    console.log(message);
  }
};

export const onMessage = <T>(
  callback: (message: IMessage<T>) => void
): void => {
  chrome.runtime.onMessage.addListener((message) => {
    callback(message);
    if (!environment.production) {
      console.log(message);
    }
  });
};

export const sendDocumentMessage = <T>(action: Action, payload?: T) => {
  document.dispatchEvent(
    new CustomEvent(action, {
      detail: payload,
    })
  );
  if (!environment.production) {
    // TODO: Log
  }
};

export const onDocumentMessage = <T>(
  action: Action,
  callback: (payload: T) => void
): void => {
  document.addEventListener(action, (e: CustomEventInit<Document>) => {
    callback((e?.detail as unknown) as T);
  });
  if (!environment.production) {
    // TODO: Log
  }
};

export const getTab = (url: string): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ url: `${url}/*`, currentWindow: true }, (tabs) => {
      tabs?.length ? resolve(tabs[0]) : reject('Tab not found.');
    });
  });
};

export const getOrCreateTab = (url: string): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    getTab(url)
      .then((tab) => resolve(tab))
      .catch(() => {
        chrome.tabs.create({ url: url, active: false }, (tab) => resolve(tab));
      });
  });
};
