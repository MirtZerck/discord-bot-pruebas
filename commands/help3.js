import { MessageEmbed } from "discord.js";

export const help3Command = {
  name: "help 3",
  alias: ["h3"],

  async execute(message, args) {
    const embedHelp3 = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Comandos de Imágen`)
      .setDescription(
        `**>> Estos son los comandos de Imágen actuales** \n > - Grr \n > - Puñito \n > - Triste \n > - Laffey \n > - Mujer \n > - Lucas \n > - Empty \n > - Duro \n > - Pijas \n > - Arvin \n > - Some \n > - Carlos`
      )
      .setColor("#81d4fa")
      .setTimestamp();

    message.channel.send(embedHelp3);
  },
};
