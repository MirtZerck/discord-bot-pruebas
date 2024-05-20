import { slashInteractCommand } from "./slashInteractionCommands.js";
/*import { helpSlashCommands } from "./slashHelp";*/
import { slashMusicCommand } from "./voice/slashPlayMusic.js";
import { slashMusicControls } from "./voice/slashMusicControls.js";

export const arraySlashCommands = [
  slashInteractCommand,
  slashMusicCommand,
  ...slashMusicControls,
  /* helpSlashCommands, */
];
