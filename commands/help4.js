import { MessageEmbed } from "discord.js";

export const help4Command = {
  name: "help 4",
  alias: ["h4"],

  async execute(message, args) {
    const embedHelp4 = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Comandos de APIs`)
      .setDescription(
        `**>> Estos son los comandos de APIs actuales** \n > - DatoCurioso(dato, dc) \n > - Meme(me, chistaco) \n > - MichiHablando(mh)`
      )
      .setColor("#81d4fa")
      .setFooter('Usa +help para regresar al inicio')
      .setTimestamp();

    message.channel.send(embedHelp4);
  },
};
