import { MessageEmbed } from "discord.js";
import { getUserByID } from "../constants/get-user.js";

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

    const user = getUserByID(message, user_id);

    if (!user) return message.reply("El usuario no existe");

    const messageEmbed = new MessageEmbed()
      .setAuthor(message.member.nickname === null ? message.author.username: message.member.nickname, message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(`Fotito de ${user.user.username} :D`)
      .setImage(user.user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor("#f2d6ff")
      .setFooter(`Que bonita fotito c:`)
      .setTimestamp();

    message.channel.send(messageEmbed);
  },
};
