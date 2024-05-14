import { EmbedBuilder } from "discord.js";
import moment from "moment-timezone";

export const horaServer = {
  name: "horaserver",
  alias: ["hs", "hora"],

  async execute(message, args) {
    try {
      const horaServer = "America/Bogota";

      function obtenerHoraServer() {
        return moment().tz(horaServer).format("HH:mm:ss");
      }

      const embedHora = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Hora del servidor`)
        .setDescription(obtenerHoraServer())
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor(0x81d4fa)
        .setFooter({ text: `(GMT-5)` });

      await message.channel.send({ embeds: [embedHora] });
    } catch (error) {
      console.error("Error al ejecutar el comando horaServer:", error);
      message.channel.send(
        "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
      );
    }
  },
};
