var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('runtime.js');
document.documentElement.appendChild(s2);
var s = document.createElement('script');
s.src = chrome.runtime.getURL('translator.js');
document.documentElement.appendChild(s);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request?.action);
});
