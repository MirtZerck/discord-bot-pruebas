import { getMemberByFilter } from "../../constants/get-user.js";
import { PermissionsBitField } from "discord.js";
import {
  checkWarns,
  editWarns,
  updateWarnsCount,
} from "../../db_service/commands_service.js";
import { getDynamicColor } from "../../utils/getDynamicColor.js";
import { EmbedBuilder } from "discord.js";
import { prefijo } from "../../constants/prefix.js";

const warnUser = {
  name: "warn",
  alias: ["advertir"],

  async execute(message, args) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    ) {
      return message.reply("No tienes permisos para advertir miembros.");
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
      return message.reply("No puedes advertirte a ti mismo.");
    }

    const reason = args.slice(1).join(" ") || "Sin razón proporcionada.";

    const serverId = message.guild.id;
    const serverName = message.guild.name;
    const userId = member.user.id;

    try {
      const warns = await updateWarnsCount(
        userId,
        serverId,
        serverName,
        reason
      );

      let actionTaken = `Advertencia a **${member.displayName}**. Este es su aviso número ${warns}. Razón: ${reason}.`;

      if (warns === 3) {
        await member.timeout(
          4 * 60 * 60 * 1000,
          "3 advertencias - 4 horas de timeout"
        );
        actionTaken += " Se aplicó un timeout de 4 horas.";
      } else if (warns === 5) {
        await member.timeout(
          8 * 60 * 60 * 1000,
          "5 advertencias - 8 horas de timeout"
        );
        actionTaken += " Se aplicó un timeout de 8 horas.";
      } else if (warns === 10) {
        await member.ban({
          days: 2,
          reason: "10 advertencias - Baneado por 48 horas",
        });
        actionTaken += " Se aplicó un baneo de 48 horas.";
      }

      message.channel.send(actionTaken);
    } catch (error) {
      console.error(error);
      message.channel.send(
        "Hubo un error al intentar advertir al usuario. Por favor verifica los permisos y la configuración de Firebase."
      );
    }
  },
};

const checkUserWarns = {
  name: "checkwarns",
  alias: ["advertencias", "warns"],

  async execute(message, args) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    ) {
      return message.reply("No tienes permisos para revisar las advertencias.");
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
      return message.reply("No puedes revisar tus advertencias.");
    }

    const serverId = message.guild.id;
    const userId = member.user.id;

    try {
      const { count, reasons } = await checkWarns(userId, serverId);

      const dynamicColor = getDynamicColor(message.member);

      const embed = new EmbedBuilder()
        .setTitle(`Advertencias para ${member.displayName}`)
        .setColor(dynamicColor)
        .addFields({
          name: "Total de Advertencias",
          value: count.toString(),
          inline: true,
        });

      if (count > 0) {
        reasons.forEach((reason, index) => {
          embed.addFields({
            name: `Razón ${index + 1}`,
            value: reason,
            inline: false,
          });
        });
      } else {
        embed.setDescription("Este usuario no tiene advertencias.");
      }

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.channel.send(
        "Hubo un error al intentar revisar las advertencias del usuario."
      );
    }
  },
};

const deleteUserWarns = {
  name: "deletewarn",
  alias: ["eliminaradvertencia", "unwarn"],

  async execute(message, args) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    ) {
      return message.reply("No tienes permisos para editar las advertencias.");
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
      return message.reply("No puedes revisar tus advertencias.");
    }

    const warnIndexToRemove = parseInt(args[1]) - 1;

    if (isNaN(warnIndexToRemove)) {
      return message.reply(
        `Escribe el número de advertencia que deseas eliminar, puedes revisar las advertencias existentes con el comando ${prefijo}warns.`
      );
    }

    const serverId = message.guild.id;
    const userId = member.user.id;

    try {
      const newWarnsCount = await editWarns(
        userId,
        serverId,
        warnIndexToRemove
      );
      message.channel.send(
        `La advertencia ha sido eliminada. Ahora el usuario tiene un total de ${newWarnsCount} advertencia(s).`
      );
    } catch (error) {
      console.error(error);
      message.channel.send(
        "Hubo un error al intentar editar las advertencias del usuario."
      );
    }
  },
};

export const warnCommands = [warnUser, checkUserWarns, deleteUserWarns];
