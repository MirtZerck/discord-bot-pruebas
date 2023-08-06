import { EmbedBuilder } from "discord.js";
export const mostrarPing = {
  name: "ping",
  alias: ["p", "pi"],

  async execute(message, args) {
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

    message.reply({ embeds: [embedPing] });
  },
};
