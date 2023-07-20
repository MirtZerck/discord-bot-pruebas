import { MessageEmbed } from "discord.js";
export const mostrarPing = {
  name: "ping",
  alias: ["p", "pi"],

  async execute(message, args) {
    const ping = Date.now() - message.createdTimestamp;

    const embedPing = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Tu ping es:`)
      .setDescription(`${ping}ms`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor("#81d4fa")
      .setFooter("Pong");

    message.reply(embedPing);
  },
};
