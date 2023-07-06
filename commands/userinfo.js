import { MessageEmbed } from "discord.js";
import { convertDateToString } from "../utils/format-date.js";
import { getUserByID } from "../utils/get-user.js";

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

    const user = getUserByID(message, user_id);

    if (!user) return message.reply("El usuario no existe");

    const fechaRegistro = convertDateToString(user.createdAt);
    const fechaIngreso = convertDateToString(message.member.joinedAt);
    const messageEmbed = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
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
      .setColor("#81d4fa")
      .setFooter(`ID ${user_id}`)
      .setTimestamp();
    
    message.channel.send(messageEmbed);
  },
};
