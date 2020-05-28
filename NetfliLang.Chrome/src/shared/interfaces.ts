import { Action } from './actions';

export interface IMessage<T> {
  action: Action;
  payload: T;
}

export interface ISubtitleOccurence {
  start: number;
  end: number;
  next: string;
}

export interface ISubtitle {
  key: string;
  occurences: ISubtitleOccurence[];
  lines: string[];
  translations: string[];
}

export interface ISubtitles {
  [key: string]: ISubtitle;
}

export interface ILanguage {
  id: string;
  name: string;
}

export interface ISettings {
  isEnabled: boolean;
  targetLanguage: ILanguage;
  speed: number;
  autopause: boolean;
}
