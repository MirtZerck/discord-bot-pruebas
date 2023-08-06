import { EmbedBuilder } from "discord.js";
import { obtenerMeme } from "../utils/api_meme.js";

export const sendMemeCommand = {
  name: "meme",
  alias: ["me", "chistaco"],

  async execute(message, args) {
    const momazo = await obtenerMeme();

    const embedMeme = new EmbedBuilder()
      .setAuthor(
        {
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        }
      )
      .setTitle('Ríanse por favor :c')
      .setImage(momazo.url)
      .setDescription(momazo.name)
      .setColor(0x81d4fa)
      .setTimestamp();

    message.channel.send({embeds: [embedMeme]});
  },
};
