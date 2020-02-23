import { ISubtitles, ISubtitleOccurence } from "../models/subtitles";

export class SubtitlesParserService {
    public tryParseSubtitles(responseText: string): ISubtitles | false {
        if (responseText.indexOf('<tt xmlns:tt') === -1) return false;
        const mergedSubtitles = this.mergeSubtitles(responseText);
        const parser = new DOMParser();
        const ttmlDoc = parser.parseFromString(mergedSubtitles, 'text/xml');
        return this.parseSubtitles(ttmlDoc);
    }

    protected parseSubtitles(ttmlDoc: Document): ISubtitles {
        const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
        const subtitles = {} as ISubtitles;

        ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
            const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
            const occurence = this.parseOccurence(element, tickRate, nextKey);
            const key = element.textContent;

            if (!subtitles[key]) {
                const lines = element.innerHTML.split(/<br[^>]*>/).map(s => s.replace(/<[^>]*>/g, ''));
                subtitles[key] = {
                    key: key,
                    occurences: [occurence],
                    lines: lines,
                    translations: null
                };
            } else {
                subtitles[key].occurences.push(occurence);
            }
        });

        return subtitles;
    }

    protected parseOccurence(element: HTMLParagraphElement, tickRate: number, nextKey: string): ISubtitleOccurence {
        return {
            start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
            end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
            next: nextKey
        };
    }

    protected mergeSubtitles(ttmlText: string): string {
        let mergedSubtitles = ttmlText;
        mergedSubtitles.match(/(<p begin="\d*t" end="\d*t" )([^<]*)(<\/p>)((\n*?\s*?)(\1)([^<]*)(<\/p>)){1,}/g).forEach(value => {
            mergedSubtitles = mergedSubtitles.replace(value, value.replace(/<\/p[^>]*>(\n*?\s*?)<p[^>]*>/g, '<br/>'));
        });
        return mergedSubtitles;
    }
}
