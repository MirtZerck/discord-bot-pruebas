import { Command } from "../types/command.js";
import { userInfoCommand } from "./userInfo.js";
import { userAvatarCommand } from "./avatar.js";
import { curiosFactCommand } from "./datoCurioso.js";
import { sendMichiTextCommand } from "./michiSay.js";
/*import { helpCommand } from "./help";*/
import { arrayCommandsHour } from "./hora.js";
import { botPing } from "./ping.js";
import { arrayInteractions } from "./social/interactionCommands.js";
import { proposalCommand } from "./proposals.js";
import {
    timeoutUser,
    removeTimeoutUser,
} from "./moderation/timeoutFunction.js";
import { kickUser } from "./moderation/kickUserFunction.js";
import { arrayBanCommands } from "./moderation/banUserFunction.js";
import { arrayWarnCommands } from "./moderation/warnUserFunction.js";
import { playMusicCommand } from "./voice/playMusic.js";
import { arrayMusicControls } from "./voice/musicControls.js";
import { acceptProposalCommand } from "./acceptProposals.js";
import { arrayMusicListControls } from "./voice/musicList.js";
import { customCommandsList } from "./showCommands.js";
import { arrayActions } from "./social/actionsCommands.js";
import { arrayReactions } from "./social/reactionCommands.js";

export const arrayCommands: Command[] = [
    userInfoCommand,
    userAvatarCommand,
    curiosFactCommand,
    sendMichiTextCommand,
    /*helpCommand,*/
    ...arrayCommandsHour,
    botPing,
    ...arrayInteractions,
    proposalCommand,
    timeoutUser,
    removeTimeoutUser,
    kickUser,
    ...arrayBanCommands,
    ...arrayWarnCommands,
    acceptProposalCommand,
    customCommandsList,
    playMusicCommand,
    ...arrayMusicControls,
    ...arrayMusicListControls,
    ...arrayActions,
    ...arrayReactions
];
