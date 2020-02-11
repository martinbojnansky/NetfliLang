import { GTranslatorService, TranslatorService } from "./services/translator.service";
import { sendNotification } from "./helpers/notifications";

export const translator: TranslatorService = new GTranslatorService();

sendNotification('ready', null);