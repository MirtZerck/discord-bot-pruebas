import { obtenerTraduccionEnEs } from "../utils/api_traductor.js";
import { obtenerDataApi } from "../utils/apiserver.js";
import { EmbedBuilder } from "discord.js";

export const SendTraduccion = {
  name: "traducir",
  alias: ["tr"],

  async execute(message, args, commandBody) {
    try {
      if (!commandBody)
        return message.reply("Envía lo que quieres que traduzca");

      const text = commandBody;

      const traducir = await obtenerTraduccionEnEs(text);

      const embedTraducir = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(traducir)
        .setColor(0x81d4fa);

      message.channel.send({ embeds: [embedTraducir] }).catch((error) => {
        console.error("Error al enviar el mensaje embed:", error);
        message.reply(
          "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
        );
      });
    } catch (error) {
      console.error("Error al ejecutar el comando SendTraduccion:", error);
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
