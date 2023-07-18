import { userInfoCommand } from "./userinfo.js";
import { userAvatarCommand } from "./avatar.js";
import { curiosFactCommand } from "./dato_curioso.js";
import { sendMemeCommand } from "./meme.js";
import { sendMichiTextCommand } from "./michi_say.js";
import { helpCommand } from "./help.js";
import { sendBossBait } from "./eventito.js";

export const arrayCommands = [
  userInfoCommand,
  userAvatarCommand,
  curiosFactCommand,
  sendMemeCommand,
  sendMichiTextCommand,
  helpCommand,
  sendBossBait,
];
