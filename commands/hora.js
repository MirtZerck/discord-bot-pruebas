import { EmbedBuilder } from "discord.js";
import moment from "moment-timezone";

export const horaServer = {
  name: "horaserver",
  alias: ["hs", "hora"],

  async execute(message, args) {
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

    message.channel.send({ embeds: [embedHora] });
  },
};
