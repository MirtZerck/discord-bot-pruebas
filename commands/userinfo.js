import { EmbedBuilder } from "discord.js";
import { convertDateToString } from "../utils/format-date.js";
import { getMemberByFilter } from "../constants/get-user.js";

export const userInfoCommand = {
  name: "userinfo",
  alias: ["ui", "useri"],

  execute(message, args) {
    // message.reply('Comando userinfo');

    const userMention = message.mentions.members.first();
    let filtro;

    if (userMention) {
      filtro = userMention.user.id;
    } else if (args[0]) {
      filtro = args[0];
    } else {
      filtro = message.author.id;
    }

    if (filtro.length < 3)
      return message.reply(
        "El usuario a mencionar debe tener al menos 3 carácteres."
      );
    const member = getMemberByFilter(message, filtro);

    if (!member) return message.reply("El usuario no existe");

    const fechaRegistro = convertDateToString(member.user.createdAt);
    const fechaIngreso = convertDateToString(message.member.joinedAt);
    const messageEmbed = new EmbedBuilder()
      .setAuthor({
        name: message.member.nickname ?? message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(`Información de ${member.user.username}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Información del usuario en el servidor`)
      .addFields(
        {
          name: "Registro",
          value: fechaRegistro === "NaN" ? "-" : fechaRegistro,
          inline: true,
        },
        { name: "Ingreso", value: fechaIngreso, inline: true }
      )
      .setColor(0x81d4fa)
      .setFooter({ text: `ID ${member.user.id}` })
      .setTimestamp();

    message.channel.send({ embeds: [messageEmbed] });
  },
};
