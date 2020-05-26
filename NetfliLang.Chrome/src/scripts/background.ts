import { getOrCreateTab, onMessage, getTab } from './shared/extension-helpers';
import { Action } from 'src/shared/actions';
import { Constants } from 'src/shared/constants';

chrome.runtime.onInstalled.addListener(function () {
  onMessage((m) => {
    // Translator messages
    if ([Action.translate].includes(m.action)) {
      getOrCreateTab(Constants.translatorUrl).then((tab) => {
        chrome.tabs.sendMessage(tab.id, m);
      });
    }
    // Netflix messages
    else if ([Action.translated].includes(m.action)) {
      getTab(Constants.netflixUrl)
        .then((tab) => {
          chrome.tabs.sendMessage(tab.id, m);
        })
        .catch();
    }
    // Default
    else {
      throw Error(`Unknown message: ${JSON.stringify(m)}`);
    }
  });
});
