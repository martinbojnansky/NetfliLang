import { getOrCreateTab, onMessage, getTab } from './shared/extension-helpers';
import { Action } from 'src/shared/actions';
import { Constants } from 'src/shared/constants';

// Background.js file is used to provide communication between
// content_scripts of tabs.
chrome.runtime.onInstalled.addListener(() => {
  onMessage((m) => {
    // Component messages
    if (Action.componentCreated === m.action) {
      // Pre-load translator
      getOrCreateTab(Constants.translatorUrl);
    }
    // Translator messages
    if ([Action.translate].includes(m.action)) {
      // Pass messages to translator tab
      getOrCreateTab(Constants.translatorUrl).then((tab) => {
        chrome.tabs.sendMessage(tab.id, m);
      });
    }
    // Netflix messages
    else if ([Action.translated].includes(m.action)) {
      // Pass messages to active netflix tab
      getTab(Constants.netflixUrl, { active: true })
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
