import { MessageEmbed } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";
import { db } from "../michi.js";
import { getInteraccionesValue } from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";

export const cookieUserCommand = {
  name: "galleta",
  alias: ["cookie"],

  async execute(message, args) {
    const userMention = message.mentions.members.first();
    let user_id;

    if (userMention) {
      user_id = userMention.user.id;
    } else if (args[0]) {
      user_id = args[0];
    } else {
      user_id = ""
    }

    const user = getMemberByID(message, user_id);

    const callArray = await getInteraccionesValue();

    const cookieArray = callArray.find(([key, value]) => key === "cookie");

    if (cookieArray) {
      const imgCookie = cookieArray[1];
      const index = getRandomNumber(1, imgCookie.length - 1);
      const messageDb = imgCookie[index];

      if (!user || message.author.id === user.user.id) {
        const messageEmbed = new MessageEmbed()
          .setAuthor(
            "Gatos Gatunos",
            "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
          )
          .setTitle(
            `${
              message.member.nickname ?? message.author.username
            } se come una galletita.`
          )
          .setImage(messageDb)
          .setColor("#81d4fa")
          .setFooter(`Galletita ñam`)
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
            } le dió una galleta a ${user.nickname ?? user.user.username}`
          )
          .setImage(messageDb)
          .setColor("#81d4fa")
          .setFooter(`Galletita ñam`)
          .setTimestamp();

        message.channel.send(messageEmbed);
      }
    }
  },
};
