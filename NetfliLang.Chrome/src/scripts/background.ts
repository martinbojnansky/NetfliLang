chrome.runtime.onInstalled.addListener(function () {
  // chrome.runtime.onMessageExternal.addListener(function (
  //   request,
  //   sender,
  //   sendResponse
  // ) {
  //   console.log(
  //     sender.tab
  //       ? 'external from a content script:' + sender.tab.url
  //       : 'from the extension'
  //   );
  //   if (request.greeting == 'hello')
  //     sendResponse({ farewell: 'goodbye external' });
  // });
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log('recevived something');
    if (request.greeting == 'hello')
      sendResponse({ farewell: 'goodbye internal' });
  });
  console.log('receiving');
  // chrome.runtime.sendMessage({ greeting: 'hello' }, function (response) {
  //   console.log(response.farewell);
  // });
});
