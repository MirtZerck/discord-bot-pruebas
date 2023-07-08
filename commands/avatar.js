import { MessageEmbed } from "discord.js";
import { getUserByID } from "../constants/get-user.js";

export const userAvatarCommand = {
  name: "avatar",
  alias: ["av", 'avt'],

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
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Avatar de ${user.user.username}`)
      .setImage(user.user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor("#81d4fa")
      .setFooter(`ID ${user_id}`)
      .setTimestamp();

    message.channel.send(messageEmbed);

    
  }, 
   
};