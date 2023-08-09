import { userInfoCommand } from "./userinfo.js";
import { userAvatarCommand } from "./avatar.js";
import { curiosFactCommand } from "./dato_curioso.js";
/* import { sendMemeCommand } from "./meme.js"; */
import { sendMichiTextCommand } from "./michi_say.js";
import { helpCommand } from "./help.js";
import { sendBossBait } from "./boos_bait.js";
import { horaServer } from "./hora.js";
import { mostrarPing } from "./ping.js";
import { hugUserCommand } from "./abrazo.js";
import { xpellitRankingServidor } from "./xpellit-actividad-discord.js";
import { clanRankingClan } from "./clan-puntos-merito.js";
import { patUserCommand } from "./caricia.js";
import { cookieUserCommand } from "./cookie.js";
import { hornyUserCommand } from "./horny.js";
import { pokeUserCommand } from "./poke.js";
import { danceUserCommand } from "./dance.js";
import {
  blockInteractionsCommands,
  blockHugCommand,
} from "./bloquear-interacciones.js";
/* import { SendTraduccion } from "./traducir.js"; */

export const arrayCommands = [
  userInfoCommand,
  userAvatarCommand,
  curiosFactCommand,
  /*  sendMemeCommand, */
  sendMichiTextCommand,
  helpCommand,
  sendBossBait,
  horaServer,
  mostrarPing,
  hugUserCommand,
  xpellitRankingServidor,
  clanRankingClan,
  patUserCommand,
  cookieUserCommand,
  hornyUserCommand,
  pokeUserCommand,
  danceUserCommand,
  /* blockInteractionsCommands,
  blockHugCommand, */
  /* SendTraduccion, */
];
