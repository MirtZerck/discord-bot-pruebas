import { MessageEmbed } from "discord.js";
import { getReplys } from "../constants/answers.js";
import { getReplysDelete } from "../constants/answers_delete.js";
import { linksImages } from "../constants/links_images.js";
import { getArrayCommandsObject } from "../constants/lista_comandosxd.js";
import { prefijo } from "../constants/prefix.js";

export const helpCommand = {
  name: "help",
  alias: ["h"],

  async execute(message, args) {
    const option = args[0] ?? "1";
    const author = message.author;

    let description = "";
    let titulo = "";
    let objectReplys = {};

    if (option === "1") {
      objectReplys = getReplys(message, "", "", args);
      titulo = "Comandos de Respuesta";
    } else if (option === "2") {
      objectReplys = getReplysDelete(message, "", "", args);
      titulo = "Comandos de Respuesta Anónima";
    } else if (option === "3") {
      objectReplys = linksImages;
      titulo = "Comandos de Imágen";
    } else if (option === "4") {
      objectReplys = getArrayCommandsObject();
      titulo = "Comandos de Utilidad";
    } else {
      return message.reply("Ya no hay más xd");
    }
    const replysKeys = Object.keys(objectReplys);

    if (option === "4") {
      replysKeys.forEach((keys) => {
        description += `\n > - ${keys}, [${objectReplys[keys]}] `;
      });
    } else {
    replysKeys.forEach((keys) => {
      description += `\n > - ${keys} `;
    });
  }

    const embedHelp = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(titulo)
      .setThumbnail(author.displayAvatarURL({ dynamic: true }))
      .setDescription(`**>> Estos son los comandos actuales** ${description}`)
      .setColor("#81d4fa")
      .setFooter(`${prefijo}help 1-4`)
      .setTimestamp();

    message.channel.send(embedHelp);
  },
};
