export class Translator {
  translate(value: string) {
    (document.querySelector('#source') as HTMLInputElement).value = value;
  }
}

export const translator = new Translator();
translator.translate('hallo zusammen');

chrome.runtime.sendMessage('ahmjpicliemgjbahcpknlcagkhblppbj', {
  greeting: 'hello',
});
