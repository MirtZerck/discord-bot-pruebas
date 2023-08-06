import { obtenerMichiHablador } from "../utils/api_michi_hablando.js";
import { EmbedBuilder } from "discord.js";

export const sendMichiTextCommand = {
  name: "michihablando",
  alias: ["mh"],

  async execute(message, args, commandBody) {
    if (!commandBody) return message.reply("Envía lo que quieres que diga");

    /* const usuarioMention = message.mentions.members.username; */
    const michiHablador = await obtenerMichiHablador(commandBody);

    const embedMichiHablador = new EmbedBuilder()
      .setAuthor({
        name: message.member.nickname ?? message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setImage(michiHablador)
      .setColor(0x81d4fa)
      .setTimestamp();

    message.channel.send({ embeds: [embedMichiHablador] });
  },
};
