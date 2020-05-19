chrome.runtime.onInstalled.addListener(function () {
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action == 'translate') {
      chrome.tabs.query(
        { currentWindow: true, url: 'https://translate.google.com/*' },
        (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, request);
        }
      );
    }
  });
});
