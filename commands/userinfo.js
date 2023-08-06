import { EmbedBuilder } from "discord.js";
import { convertDateToString } from "../utils/format-date.js";
import { getMemberByID } from "../constants/get-user.js";

export const userInfoCommand = {
  name: "userinfo",
  alias: ["ui", "useri"],

  execute(message, args) {
    // message.reply('Comando userinfo');

    const userMention = message.mentions.members.first();
    let user_id;

    if (userMention) {
      user_id = userMention.user.id;
    } else if (args[0]) {
      user_id = args[0];
    } else {
      user_id = message.author.id;
    }

    const user = getMemberByID(message, user_id);

    if (!user) return message.reply("El usuario no existe");

    const fechaRegistro = convertDateToString(user.user.createdAt);
    const fechaIngreso = convertDateToString(message.member.joinedAt);
    const messageEmbed = new EmbedBuilder()
      .setAuthor({
        name: message.member.nickname ?? message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(`Información de ${user.user.username}`)
      .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
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
      .setFooter(`ID ${user_id}`)
      .setTimestamp();

    message.channel.send({ embeds: [messageEmbed] });
  },
};
