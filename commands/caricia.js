import { EmbedBuilder } from "discord.js";
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
      return message.reply(
        "No puedes darte caricias a tí mismo, a menos qué..."
      );

    const callArray = await getInteraccionesValue();

    const patArray = callArray.find(([key, value]) => key === "caricia");

    if (patArray) {
      const imgPats = patArray[1];
      const index = getRandomNumber(1, imgPats.length - 1);
      const messageDb = imgPats[index];

      const messageEmbed = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(
          `${message.member.nickname ?? message.author.username} acarició a ${
            user.nickname ?? user.user.username
          }`
        )
        .setImage(messageDb)
        .setColor("Random")
        .setFooter({ text: `Caricia :3` })
        .setTimestamp();

      message.channel.send({ embeds: [messageEmbed] });
    }
  },
};
