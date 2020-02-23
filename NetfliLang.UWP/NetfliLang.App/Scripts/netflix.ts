import { NetflixService } from "./services/netflix.service";
import { sendNotification } from "./helpers/notifications";

export const netflix = new NetflixService();

sendNotification('ready', null);