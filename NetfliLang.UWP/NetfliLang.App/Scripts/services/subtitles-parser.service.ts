import { ISubtitles, ISubtitleOccurence } from "../models/subtitles";

export class SubtitlesParserService {
    // Parses elements of TTML document into key/value dictionary.
    public parseSubtitles(ttmlDoc: Document): ISubtitles {
        // Parsing tickrate is important to match start/end of the subtitles with video playback.
        const tickRate = Number(ttmlDoc.querySelector('tt').getAttribute('ttp:tickRate'));
        const subtitles = {} as ISubtitles;

        // Each TTML element is parsed key/value object, where key is text content.
        ttmlDoc.querySelectorAll('p').forEach((element, index, elements) => {
            const key = element.textContent;
            const nextKey = index < elements.length - 1 ? elements[index + 1].textContent : null;
            const occurence = this.parseOccurence(element, tickRate, nextKey);

            if (!subtitles[key]) {
                // Gets lines split by <br> element and removes all HTML from lines.
                const lines = element.innerHTML.split(/<br[^>]*>/).map(s => s.replace(/<[^>]*>/g, ''));
                subtitles[key] = {
                    key: key,
                    occurences: [occurence],
                    lines: lines,
                    translations: null
                };
            }
            // Same subtitle could exist twice, therefore add occurence if key already exist.
            else {
                subtitles[key].occurences.push(occurence);
            }
        });

        return subtitles;
    }

    // Parses occurence of TTML subtitle.
    protected parseOccurence(element: HTMLParagraphElement, tickRate: number, nextKey: string): ISubtitleOccurence {
        return {
            start: Number(element.getAttribute('begin').replace('t', '')) / tickRate,
            end: Number(element.getAttribute('end').replace('t', '')) / tickRate,
            next: nextKey
        };
    }
}
