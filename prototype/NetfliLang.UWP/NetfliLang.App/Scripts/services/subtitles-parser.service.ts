import { ISubtitles, ISubtitleOccurence } from "../models/subtitles";

export class SubtitlesParserService {
    public parseSubtitles(ttmlDoc: Document): ISubtitles {
        const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
        const subtitles = {} as ISubtitles;

        ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
            const key = element.textContent;
            const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
            const occurence = this.parseOccurence(element, tickRate, nextKey);

            if (!subtitles[key]) {
                const lines = element.innerHTML.split(/<br[^>]*>/).map(s => s.replace(new RegExp("/<[^>]*>/", 'g'), ''));
                subtitles[key] = {
                    key: key,
                    occurences: [occurence],
                    lines: lines,
                    translations: []
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
}
