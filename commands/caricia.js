import { MessageEmbed } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";
import { db } from "../michi.js";
import { getInteraccionesValue } from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";

export const patUserCommand = {
  name: "caricia",
  alias: ["pat"],

  async execute(message, args) {
    const userMention = message.mentions.members.first();
    let user_id;

    if (userMention) {
      user_id = userMention.user.id;
    } else if (args[0]) {
      user_id = args[0];
    } else {
      message.reply("Debes mencionar a alguien");
      return;
    }

    const user = getMemberByID(message, user_id);

    if (!user) return message.reply("El usuario no existe");

    if (message.author.id === user.user.id)
      return message.reply("No puedes darte caricias a tí mismo, a menos qué...");

    const callArray = await getInteraccionesValue();

    const patArray = callArray.find(([key, value]) => key === "caricia");

    if (patArray) {
      const imgPats = patArray[1];
      const index = getRandomNumber(1, imgPats.length - 1);
      const messageDb = imgPats[index];

      const messageEmbed = new MessageEmbed()
        .setAuthor(
          "Gatos Gatunos",
          "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
        )
        .setTitle(
          `${message.member.nickname ?? message.author.username} acarició a ${
            user.nickname ?? user.user.username
          }`
        )
        .setImage(messageDb)
        .setColor("#81d4fa")
        .setFooter(`Caricia :3`)
        .setTimestamp();

      message.channel.send(messageEmbed);
    }
  },
};
