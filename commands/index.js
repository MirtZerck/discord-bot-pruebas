import { userInfoCommand } from "./userinfo.js";
import { userAvatarCommand } from "./avatar.js";
import { curiosFactCommand } from "./dato_curioso.js";
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
import { warnCommands } from "./moderation/warnUserFunction.js";
import { leaveAllServersCommand } from "./moderation/leaveServers.js";
import { moveCommandsCmd } from "./moveData.js";
import { playMusicCommand } from "./voice/playMusic.js";
import { arrayMusicControls } from "./voice/musicControls.js";
import { acceptProposalCommand } from "./acceptProposals.js";
import { commandListCommand } from "./commands.js";

export const arrayCommands = [
  userInfoCommand,
  userAvatarCommand,
  curiosFactCommand,
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
  ...warnCommands,
  acceptProposalCommand,
  commandListCommand,

  playMusicCommand,
  ...arrayMusicControls,
  /* moveCommandsCmd, */
  /* leaveAllServersCommand, */
  /* blockInteractionsCommands,
  blockHugCommand, */
  /* SendTraduccion, */
];
