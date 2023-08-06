import { EmbedBuilder } from "discord.js";
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
      user_id = "";
    }

    const user = getMemberByID(message, user_id);

    const callArray = await getInteraccionesValue();

    const cookieArray = callArray.find(([key, value]) => key === "cookie");

    if (cookieArray) {
      const imgCookie = cookieArray[1];
      const index = getRandomNumber(1, imgCookie.length - 1);
      const messageDb = imgCookie[index];

      if (!user || message.author.id === user.user.id) {
        const messageEmbed = new EmbedBuilder()
          .setAuthor({
            name: message.member.nickname ?? message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(
            `${
              message.member.nickname ?? message.author.username
            } se come una galletita.`
          )
          .setImage(messageDb)
          .setColor("Random")
          .setFooter({ text: `Galletita ñam` })
          .setTimestamp();

        return message.channel.send({ embeds: [messageEmbed] });
      } else {
        if (user.user.id === "1125170246291034223") {
          return message.reply(
            "No menciones a este usuario o te llevarás ban."
          );
        }
        const messageEmbed = new EmbedBuilder()
          .setAuthor({
            name: message.member.nickname ?? message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(
            `${
              message.member.nickname ?? message.author.username
            } le dió una galleta a ${user.nickname ?? user.user.username}`
          )
          .setImage(messageDb)
          .setColor("Random")
          .setFooter({ text: `Galletita ñam` })
          .setTimestamp();

        message.channel.send({ embeds: [messageEmbed] });
      }
    }
  },
};
