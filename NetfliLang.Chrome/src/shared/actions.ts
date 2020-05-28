export enum Action {
  componentCreated = 'componentCreated',
  settingsRestored = 'settingsRestored',
  settingsChanged = 'settingsChanged',
  subtitlesParsed = 'subtitlesParsed',
  translate = 'translate',
  translated = 'translated',
}

export interface TranslatePayload {
  value: string;
}

export interface TranslatedPayload extends TranslatePayload {
  translation: string;
}
