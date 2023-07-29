import { MessageEmbed } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";

export const userAvatarCommand = {
  name: "avatar",
  alias: ["av", "avt"],

  execute(message, args) {
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

    // Si sale null, se iguala a ??
    const messageEmbed = new MessageEmbed()
      .setAuthor(
        message.member.nickname ?? message.author.username,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setTitle(`Avatar de ${user.user.username}`)
      .setImage(user.user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor("#81d4fa")
      .setFooter(`ID ${user_id}`)
      .setTimestamp();

    message.channel.send(messageEmbed);
    },
};
