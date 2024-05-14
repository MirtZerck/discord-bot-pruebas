import { obtenerMichiHablador } from "../utils/api_michi_hablando.js";
import { EmbedBuilder } from "discord.js";

export const sendMichiTextCommand = {
  name: "michihablando",
  alias: ["mh"],

  async execute(message, args, commandBody) {
    try {
      if (!commandBody) return message.reply("Envía lo que quieres que diga");

      /* const usuarioMention = message.mentions.members.username; */
      const michiHablador = await obtenerMichiHablador(commandBody);

      const embedMichiHablador = new EmbedBuilder()
        .setAuthor({
          name: "Gatos Gatunos",
          iconURL:
            "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply",
        })
        .setImage(michiHablador)
        .setColor(0x81d4fa)
        .setTimestamp();

      message.channel.send({ embeds: [embedMichiHablador] }).catch((error) => {
        console.error("Error al enviar el mensaje embed:", error);
        message.reply(
          "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
        );
      });
    } catch (error) {
      console.error(
        "Error al ejecutar el comando sendMichiTextCommand:",
        error
      );
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
