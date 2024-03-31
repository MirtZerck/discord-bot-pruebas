import { userInfoCommand } from "./userinfo.js";
import { userAvatarCommand } from "./avatar.js";
import { curiosFactCommand } from "./dato_curioso.js";
/* import { sendMemeCommand } from "./meme.js"; */
import { sendMichiTextCommand } from "./michi_say.js";
import { helpCommand } from "./help.js";
import { sendBossBait } from "./boos_bait.js";
import { horaServer } from "./hora.js";
import { mostrarPing } from "./ping.js";
import { xpellitRankingServidor } from "./xpellit-actividad-discord.js";
import { clanRankingClan } from "./clan-puntos-merito.js";
/* import {
  blockInteractionsCommands,
  blockHugCommand,
} from "./bloquear-interacciones.js"; */
import { systemCoins } from "./add_coins.js";
/* import { SendTraduccion } from "./traducir.js"; */
import { arrayInteractions } from "./interactionCommands.js";
import { proposalCommand } from "./proposals.js";
import {
  timeoutUser,
  removeTimeoutUser,
} from "./moderation/timeoutFunction.js";
import { kickUser } from "./moderation/kickUserFunction.js";
import { banUser, unbanUser } from "./moderation/banUserFunction.js";
import { leaveAllServersCommand } from "./moderation/leaveServers.js";

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
  xpellitRankingServidor,
  clanRankingClan,
  systemCoins,
  ...arrayInteractions,
  proposalCommand,
  timeoutUser,
  removeTimeoutUser,
  kickUser,
  banUser,
  unbanUser,
  /* leaveAllServersCommand, */
  /* blockInteractionsCommands,
  blockHugCommand, */
  /* SendTraduccion, */
];
