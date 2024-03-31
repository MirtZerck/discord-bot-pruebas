// commands/moveClanCommands.js
import { PermissionsBitField } from "discord.js";
import { moveCommands } from "../db_service/commands_service.js";

export const moveCommandsCmd = {
  name: "movecommands",
  alias: ["movercomandos"],

  async execute(message) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("No tienes permisos para mover todos los comandos.");
    }

    const serverId = "1125170521059897354";

    try {
      await moveCommands(serverId);
      message.reply(
        "Todos los comandos han sido movidos exitosamente al servidor en el código."
      );
    } catch (error) {
      console.error(error);
      message.reply("Hubo un error al intentar mover todos los comandos.");
    }
  },
};
