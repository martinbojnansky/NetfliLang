var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('runtime.js');
document.documentElement.appendChild(s2);
var s = document.createElement('script');
s.src = chrome.runtime.getURL('netflix.js');
document.documentElement.appendChild(s);
