import { MessageEmbed } from "discord.js";

export const help2Command = {
  name: "help 2",
  alias: ["h2"],

  async execute(message, args) {
    const embedHelp2 = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Comandos de Respuesta Anónima`)
      .setDescription(
        `**>> Estos son los comandos de respuesta anónima actuales** \n > - Say \n > - Xpellit`
      )
      .setColor("#81d4fa")
      .setTimestamp();

    message.channel.send(embedHelp2);
  },
};
