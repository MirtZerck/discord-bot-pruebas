import { EmbedBuilder } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";
import { db } from "../michi.js";
import { getInteraccionesValue } from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";

export const pokeUserCommand = {
  name: "molestar",
  alias: ["tuki", "poke"],

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
      return message.reply("Menciona alguien que no seas tú -_-");

    const callArray = await getInteraccionesValue();

    const pokeArray = callArray.find(([key, value]) => key === "poke");

    if (pokeArray) {
      const imgPoke = pokeArray[1];
      const index = getRandomNumber(1, imgPoke.length - 1);
      const messageDb = imgPoke[index];

      const messageEmbed = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(
          `${
            message.member.nickname ?? message.author.username
          } le hace tuki a ${user.nickname ?? user.user.username}.`
        )
        .setImage(messageDb)
        .setColor("Random")
        .setFooter({ text: `Tuki Tuki` })
        .setTimestamp();

      message.channel.send({ embeds: [messageEmbed] });
    }
  },
};
