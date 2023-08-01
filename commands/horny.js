import { MessageEmbed } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";
import { db } from "../michi.js";
import { getInteraccionesValue } from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";

export const hornyUserCommand = {
  name: "caliente",
  alias: ["horny"],

  async execute(message, args) {
    const userMention = message.mentions.members.first();
    let user_id;

    if (userMention) {
      user_id = userMention.user.id;
    } else if (args[0]) {
      user_id = args[0];
    } else {
      user_id = "";
    }

    const user = getMemberByID(message, user_id);

    const callArray = await getInteraccionesValue();

    const hornyArray = callArray.find(([key, value]) => key === "horny");

    if (hornyArray) {
      const imgHorny = hornyArray[1];
      const index = getRandomNumber(1, imgHorny.length - 1);
      const messageDb = imgHorny[index];

      if (!user || message.author.id === user.user.id) {
        const messageEmbed = new MessageEmbed()
          .setAuthor(
            "Gatos Gatunos",
            "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
          )
          .setTitle(
            `${message.member.nickname ?? message.author.username} está horny.`
          )
          .setImage(messageDb)
          .setColor("#81d4fa")
          .setFooter(`Horny`)
          .setTimestamp();

        return message.channel.send(messageEmbed);
      } else {
        const messageEmbed = new MessageEmbed()
          .setAuthor(
            "Gatos Gatunos",
            "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
          )
          .setTitle(
            `${
              message.member.nickname ?? message.author.username
            } se ha calentado con ${user.nickname ?? user.user.username}.`
          )
          .setImage(messageDb)
          .setColor("#81d4fa")
          .setFooter(`Horny`)
          .setTimestamp();

        message.channel.send(messageEmbed);
      }
    }
  },
};
