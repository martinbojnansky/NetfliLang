export interface ISubtitleOccurence {
    start: number;
    end: number;
    next: string;
}

export interface ISubtitles {
    [key: string]: {
        occurences: ISubtitleOccurence[];
        lines: string[];
        translations: string[];
    };
}