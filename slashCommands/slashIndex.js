import { helpSlashCommands } from "./slashHelp.js";
import { reloadCommand } from "./refreshCommands.js";
import { slashInteractCommand } from "./slashInteractionCommands.js";

export const arraySlashCommands = [
  helpSlashCommands,
  slashInteractCommand,
  /* reloadCommand */
];
