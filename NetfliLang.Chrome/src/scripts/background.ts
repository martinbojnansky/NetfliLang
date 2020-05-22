import { onMessage, getOrCreateTab } from './shared/extension-helpers';
import { Action } from 'src/shared/actions';
import { Constants } from 'src/shared/constants';

chrome.runtime.onInstalled.addListener(function () {
  onMessage(async (m) => {
    // Translator messages
    if ([Action.translate].includes(m.action)) {
      console.log('creating tab');
      const translatorTab = await getOrCreateTab(Constants.translatorUrl);
      chrome.tabs.sendMessage(translatorTab.id, m);
    }
    // Netflix messages
    else if ([Action.translated].includes(m.action)) {
      const netflixTab = await getOrCreateTab(Constants.netflixUrl);
      chrome.tabs.sendMessage(netflixTab.id, m);
    }
    // Default
    else {
      throw Error(`Unknown message: ${JSON.stringify(m)}`);
    }
  });
});
