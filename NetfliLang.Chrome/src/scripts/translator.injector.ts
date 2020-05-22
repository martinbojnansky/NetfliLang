var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('runtime.js');
document.body.appendChild(s2);
var s = document.createElement('script');
s.src = chrome.runtime.getURL('translator.js');
document.body.appendChild(s);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request?.action);
});

var iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('index.html');
iframe.style.setProperty('width', 'auto');
iframe.style.setProperty('height', 'auto');
iframe.style.setProperty('position', 'absolute');
iframe.style.setProperty('top', '100px');
document.body.appendChild(iframe);
