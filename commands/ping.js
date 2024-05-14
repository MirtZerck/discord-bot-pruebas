import { EmbedBuilder } from "discord.js";

export const mostrarPing = {
  name: "ping",
  alias: ["pi"],

  async execute(message, args) {
    try {
      const ping = Date.now() - message.createdTimestamp;

      const embedPing = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Tu ping es:`)
        .setDescription(`${ping}ms`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor(0x81d4fa)
        .setFooter({ text: "Pong" });

      message.reply({ embeds: [embedPing] }).catch((error) => {
        console.error("Error al enviar el mensaje embed:", error);
        message.reply(
          "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
        );
      });
    } catch (error) {
      console.error("Error al ejecutar el comando mostrarPing:", error);
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
