import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, AbstractControlOptions } from '@angular/forms';
import { ILanguage, ISettings } from 'src/shared/interfaces';
import { Action } from 'src/shared/actions';
import { sendDocumentMessage } from 'src/scripts/shared/extension-helpers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isOpened = false;

  readonly formGroup = this.formBuilder.group(<
    { [key in keyof ISettings]: [any, AbstractControlOptions] }
  >{
    isEnabled: [true, {}],
    targetLanguage: [<ILanguage>{ id: 'en', name: 'English' }, {}],
    speed: ['1.0', {}],
    autopause: [false, {}],
  });

  constructor(protected formBuilder: FormBuilder) {}

  ngOnInit() {
    sendDocumentMessage(Action.componentCreated);
    // TODO: Subscribe safe
    this.formGroup.valueChanges.subscribe((value) => {
      sendDocumentMessage(Action.settingsChanged, value);
    });
  }

  @HostListener(`document:${Action.settingsRestored}`, ['$event'])
  public onSettingsRestored(e: CustomEvent) {
    const value = e?.detail;
    if (value) {
      this.formGroup.patchValue(value, { emitEvent: false });
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.isOpened = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.isOpened = false;
  }

  readonly speeds = [0.7, 1];

  readonly languages = JSON.parse(`[
    {
      "id": "af",
      "name": "Afrikaans"
    },
    {
      "id": "sq",
      "name": "Albanian"
    },
    {
      "id": "am",
      "name": "Amharic"
    },
    {
      "id": "ar",
      "name": "Arabic"
    },
    {
      "id": "hy",
      "name": "Armenian"
    },
    {
      "id": "az",
      "name": "Azerbaijani"
    },
    {
      "id": "eu",
      "name": "Basque"
    },
    {
      "id": "be",
      "name": "Belarusian"
    },
    {
      "id": "bn",
      "name": "Bengali"
    },
    {
      "id": "bs",
      "name": "Bosnian"
    },
    {
      "id": "bg",
      "name": "Bulgarian"
    },
    {
      "id": "ca",
      "name": "Catalan"
    },
    {
      "id": "ceb",
      "name": "Cebuano"
    },
    {
      "id": "ny",
      "name": "Chichewa"
    },
    {
      "id": "zh-CN",
      "name": "Chinese (Simplified)"
    },
    {
      "id": "zh-TW",
      "name": "Chinese (Traditional)"
    },
    {
      "id": "co",
      "name": "Corsican"
    },
    {
      "id": "hr",
      "name": "Croatian"
    },
    {
      "id": "cs",
      "name": "Czech"
    },
    {
      "id": "da",
      "name": "Danish"
    },
    {
      "id": "nl",
      "name": "Dutch"
    },
    {
      "id": "en",
      "name": "English"
    },
    {
      "id": "eo",
      "name": "Esperanto"
    },
    {
      "id": "et",
      "name": "Estonian"
    },
    {
      "id": "tl",
      "name": "Filipino"
    },
    {
      "id": "fi",
      "name": "Finnish"
    },
    {
      "id": "fr",
      "name": "French"
    },
    {
      "id": "fy",
      "name": "Frisian"
    },
    {
      "id": "gl",
      "name": "Galician"
    },
    {
      "id": "ka",
      "name": "Georgian"
    },
    {
      "id": "de",
      "name": "German"
    },
    {
      "id": "el",
      "name": "Greek"
    },
    {
      "id": "gu",
      "name": "Gujarati"
    },
    {
      "id": "ht",
      "name": "Haitian Creole"
    },
    {
      "id": "ha",
      "name": "Hausa"
    },
    {
      "id": "haw",
      "name": "Hawaiian"
    },
    {
      "id": "iw",
      "name": "Hebrew"
    },
    {
      "id": "hi",
      "name": "Hindi"
    },
    {
      "id": "hmn",
      "name": "Hmong"
    },
    {
      "id": "hu",
      "name": "Hungarian"
    },
    {
      "id": "is",
      "name": "Icelandic"
    },
    {
      "id": "ig",
      "name": "Igbo"
    },
    {
      "id": "id",
      "name": "Indonesian"
    },
    {
      "id": "ga",
      "name": "Irish"
    },
    {
      "id": "it",
      "name": "Italian"
    },
    {
      "id": "ja",
      "name": "Japanese"
    },
    {
      "id": "jw",
      "name": "Javanese"
    },
    {
      "id": "kn",
      "name": "Kannada"
    },
    {
      "id": "kk",
      "name": "Kazakh"
    },
    {
      "id": "km",
      "name": "Khmer"
    },
    {
      "id": "ko",
      "name": "Korean"
    },
    {
      "id": "ku",
      "name": "Kurdish (Kurmanji)"
    },
    {
      "id": "ky",
      "name": "Kyrgyz"
    },
    {
      "id": "lo",
      "name": "Lao"
    },
    {
      "id": "la",
      "name": "Latin"
    },
    {
      "id": "lv",
      "name": "Latvian"
    },
    {
      "id": "lt",
      "name": "Lithuanian"
    },
    {
      "id": "lb",
      "name": "Luxembourgish"
    },
    {
      "id": "mk",
      "name": "Macedonian"
    },
    {
      "id": "mg",
      "name": "Malagasy"
    },
    {
      "id": "ms",
      "name": "Malay"
    },
    {
      "id": "ml",
      "name": "Malayalam"
    },
    {
      "id": "mt",
      "name": "Maltese"
    },
    {
      "id": "mi",
      "name": "Maori"
    },
    {
      "id": "mr",
      "name": "Marathi"
    },
    {
      "id": "mn",
      "name": "Mongolian"
    },
    {
      "id": "my",
      "name": "Myanmar (Burmese)"
    },
    {
      "id": "ne",
      "name": "Nepali"
    },
    {
      "id": "no",
      "name": "Norwegian"
    },
    {
      "id": "ps",
      "name": "Pashto"
    },
    {
      "id": "fa",
      "name": "Persian"
    },
    {
      "id": "pl",
      "name": "Polish"
    },
    {
      "id": "pt",
      "name": "Portuguese"
    },
    {
      "id": "pa",
      "name": "Punjabi"
    },
    {
      "id": "ro",
      "name": "Romanian"
    },
    {
      "id": "ru",
      "name": "Russian"
    },
    {
      "id": "sm",
      "name": "Samoan"
    },
    {
      "id": "gd",
      "name": "Scots Gaelic"
    },
    {
      "id": "sr",
      "name": "Serbian"
    },
    {
      "id": "st",
      "name": "Sesotho"
    },
    {
      "id": "sn",
      "name": "Shona"
    },
    {
      "id": "sd",
      "name": "Sindhi"
    },
    {
      "id": "si",
      "name": "Sinhala"
    },
    {
      "id": "sk",
      "name": "Slovak"
    },
    {
      "id": "sl",
      "name": "Slovenian"
    },
    {
      "id": "so",
      "name": "Somali"
    },
    {
      "id": "es",
      "name": "Spanish"
    },
    {
      "id": "su",
      "name": "Sundanese"
    },
    {
      "id": "sw",
      "name": "Swahili"
    },
    {
      "id": "sv",
      "name": "Swedish"
    },
    {
      "id": "tg",
      "name": "Tajik"
    },
    {
      "id": "ta",
      "name": "Tamil"
    },
    {
      "id": "te",
      "name": "Telugu"
    },
    {
      "id": "th",
      "name": "Thai"
    },
    {
      "id": "tr",
      "name": "Turkish"
    },
    {
      "id": "uk",
      "name": "Ukrainian"
    },
    {
      "id": "ur",
      "name": "Urdu"
    },
    {
      "id": "uz",
      "name": "Uzbek"
    },
    {
      "id": "vi",
      "name": "Vietnamese"
    },
    {
      "id": "cy",
      "name": "Welsh"
    },
    {
      "id": "xh",
      "name": "Xhosa"
    },
    {
      "id": "yi",
      "name": "Yiddish"
    },
    {
      "id": "yo",
      "name": "Yoruba"
    },
    {
      "id": "zu",
      "name": "Zulu"
    }
  ]`) as ILanguage[];
}
