import { EmbedBuilder } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";
import { db } from "../michi.js";
import { getInteraccionesValue } from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";

export const danceUserCommand = {
  name: "bailar",
  alias: ["dance"],

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

    const danceArray = callArray.find(([key, value]) => key === "bailar");

    if (danceArray) {
      const imgDance = danceArray[1];
      const index = getRandomNumber(1, imgDance.length - 1);
      const messageDb = imgDance[index];

      if (!user || message.author.id === user.user.id) {
        const messageEmbed = new EmbedBuilder()
          .setAuthor({
            name: message.member.nickname ?? message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(
            `${
              message.member.nickname ?? message.author.username
            } se puso a bailar.`
          )
          .setImage(messageDb)
          .setColor("Random")
          .setFooter({ text: "Baila Baila" })
          .setTimestamp();

        return message.channel.send({ embeds: [messageEmbed] });
      } else {
        const messageEmbed = new EmbedBuilder()
          .setAuthor({
            name: message.member.nickname ?? message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(
            `${
              message.member.nickname ?? message.author.username
            } se pone a bailar con ${user.nickname ?? user.user.username}`
          )
          .setImage(messageDb)
          .setColor("Random")
          .setFooter({ text: `Baila Baila` })
          .setTimestamp();

        message.channel.send({ embeds: [messageEmbed] });
      }
    }
  },
};
