import { PermissionsBitField } from "discord.js";

/* Esto lo creo para el momento en el que se vayan a registrar las 100 reglas para la insignia de automod */

export const leaveAllServersCommand = {
  name: "leaveallservers",
  alias: ["leaveservers", "leaves", "leaveall"],
  description: "Hace que el bot salga de todos los servidores donde está.",

  execute: async (message, args) => {
    if (
      message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      try {
        message.client.guilds.cache.forEach(async (guild) => {
          await guild.leave();
        });
        message.channel.send(
          "El bot ha sido eliminado de todos los servidores."
        );
      } catch (error) {
        console.error(error);
        message.channel.send(
          "Hubo un error al intentar eliminar el bot de los servidores."
        );
      }
    } else {
      message.channel.send("No tienes permiso para ejecutar este comando.");
    }
  },
};
