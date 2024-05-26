import { slashInteractCommand } from "./slashInteractionCommands.js";
import { slashMusicCommand } from "./voice/slashPlayMusic.js";
import { musicCommand } from "./voice/slashMusicControls.js";
import { arraySlashMusicListControls } from "./voice/slashMusicList.js";
/*import { helpSlashCommands } from "./slashHelp";*/

export const arraySlashCommands = [
  slashInteractCommand,
  slashMusicCommand,
  musicCommand,
  ...arraySlashMusicListControls,
  /* helpSlashCommands, */
];
