import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {
    chrome.runtime.onMessageExternal.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      console.log(
        sender.tab
          ? 'from a content script:' + sender.tab.url
          : 'from the extension'
      );
      // if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' });
    });
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      console.log(
        sender.tab
          ? 'from a content script:' + sender.tab.url
          : 'from the extension'
      );
      // if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' });
    });
  }

  chromeAction() {
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //   chrome.tabs.executeScript(tabs[0].id, {
    //     code: 'console.log(document.body)',
    //   });
    // });
  }
}
