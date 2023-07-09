import { MessageEmbed } from "discord.js";

export const helpCommand = {
  name: "help",
  alias: ["h"],

  async execute(message, args) {
    const embedHelp = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Comandos de Respuesta`)
      .setDescription(
        `**>> Estos son los comandos de respuesta actuales** \n > - Ona \n > - Inu \n > - Loxess \n > - Nya \n > - Michi \n > - Sexo \n > - Game \n > - Pinkdreams(pd) \n > - Lnds \n > - Ahrigato \n > - Yui \n > - Ban \n > - Vanir \n > - Kuon \n > - Kairi \n > - Aubrey (Au)`
      )
      .setColor("#81d4fa")
      .setFooter('Usa +help2 para ver siguiente página')
      .setTimestamp();

    message.channel.send(embedHelp);
  },
};
