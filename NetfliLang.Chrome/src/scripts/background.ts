chrome.runtime.onInstalled.addListener(function () {
  chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log('blaaa');
    if (request.greeting == 'hello')
      sendResponse({ farewell: 'goodbye external' });
  });
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
});
