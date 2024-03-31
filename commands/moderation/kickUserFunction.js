import { getMemberByFilter } from "../../constants/get-user.js";
import { PermissionsBitField } from "discord.js";

export const kickUser = {
  name: "kick",
  alias: ["expulsar"],

  async execute(message, args) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return message.reply("No tienes permisos para expulsar miembros.");
    }

    const userMention = message.mentions.members.first();
    let filtro;

    if (userMention) {
      filtro = userMention.user.id;
    } else if (args[0]) {
      filtro = args[0];
    }

    if (!filtro || filtro.length < 3)
      return message.reply(
        "El usuario a mencionar debe tener al menos 3 caracteres."
      );

    const member = getMemberByFilter(message, filtro);

    if (!member) return message.reply("Menciona a un usuario válido.");

    if (message.author.id === member.user.id) {
      return message.reply("No puedes expulsarte a ti mismo.");
    }

    const reason = args.slice(1).join(" ") || "Sin razón proporcionada.";

    try {
      await member.kick(reason);
      message.channel.send(
        `**${member.displayName}** ha sido expulsado. Razón: ${reason}.`
      );
    } catch (error) {
      console.error(error);
      message.channel.send(
        "Error al intentar expulsar al usuario. Por favor, verifica mis permisos y la jerarquía de roles."
      );
    }
  },
};
