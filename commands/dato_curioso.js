import { obtenerDatoCurioso } from "../utils/api_dato_curioso.js";
import { EmbedBuilder } from "discord.js";
import { obtenerDataApi } from "../utils/apiserver.js";
import { Api_Michi_URL } from "../constants/apis_url.js";

export const curiosFactCommand = {
  name: "datocurioso",
  alias: ["dato", "dc"],

  async execute(message, args) {
    try {
      const dato_curioso = await obtenerDatoCurioso();
      const response = await obtenerDataApi(Api_Michi_URL);
      const imgUrl = response[0].url;

      const embedDato = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Dato Gatuno`)
        .setImage(imgUrl)
        .setDescription(dato_curioso)
        .setColor(0x81d4fa)
        .setTimestamp();

      message.channel.send({ embeds: [embedDato] }).catch((error) => {
        console.error("Error al enviar el mensaje embed:", error);
        message.reply(
          "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
        );
      });
    } catch (error) {
      console.error("Error al ejecutar el comando curiosFactCommand:", error);
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
