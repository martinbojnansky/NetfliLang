export enum Action {
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
