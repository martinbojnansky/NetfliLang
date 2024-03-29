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

