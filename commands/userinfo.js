import { EmbedBuilder } from "discord.js";
import { convertDateToString } from "../utils/format-date.js";
import { getMemberByFilter } from "../constants/get-user.js";
import { getDynamicColor } from "../utils/getDynamicColor.js";
import { formatUserRoles } from "../constants/formatUserRoles.js";

export const userInfoCommand = {
  name: "userinfo",
  alias: ["ui", "useri"],

  execute: async (message, args) => {
    const { author, member: messageMember, channel } = message;

    const userMention = message.mentions.members.first();
    let filtro;

    if (userMention) {
      filtro = userMention.user.id;
    } else if (args[0]) {
      filtro = args[0];
    } else {
      filtro = author.id;
    }
    if (typeof filtro.length < 3)
      return message.reply(
        "El usuario a mencionar debe tener al menos 3 carácteres."
      );

    const member = getMemberByFilter(message, filtro);
    if (!member) return message.reply("El usuario no existe");

    const { user } = member;
    const { username, id } = user;
    const avatarURL = user.displayAvatarURL({ dynamic: true });
    const fechaRegistro = convertDateToString(member.user.createdAt);
    const fechaIngreso = convertDateToString(member.joinedAt);

    const dynamicColor = getDynamicColor(message.member);

    const rolesDescription = formatUserRoles(member);

    const messageEmbed = new EmbedBuilder()
      .setAuthor({
        name: messageMember.displayName,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(`Información de ${member.displayName}`)
      .setThumbnail(avatarURL)
      .setDescription(`Información del usuario en el servidor`)
      .addFields(
        { name: "Registro", value: fechaRegistro, inline: true },
        { name: "Ingreso", value: fechaIngreso, inline: true },
        { name: "Roles", value: rolesDescription }
      )
      .setColor(dynamicColor)
      .setFooter({ text: `ID ${id}` })
      .setTimestamp();
    channel.send({ embeds: [messageEmbed] });
  },
};
