import { helpSlashCommands } from "./slashHelp.js";
import { reloadCommand } from "./refreshCommands.js";
import { slashInteractCommand } from "./slashInteractionCommands.js";
/* import { slashAutomodCommand } from "../commands/moderation/automod.js"; */

export const arraySlashCommands = [
  helpSlashCommands,
  slashInteractCommand,
  /* slashAutomodCommand, */
  /* reloadCommand */
];
