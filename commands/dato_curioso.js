import { obtenerDatoCurioso } from "../utils/api_dato_curioso.js";
import { MessageEmbed } from "discord.js";

export const curiosFactCommand = {
  name: "datocurioso",
  alias: ["dato", "dc"],

  async execute(message, args) {
    const dato_curioso = await obtenerDatoCurioso();

    const embedDato = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Dato Gatuno`)
      .setDescription(dato_curioso)
      .setColor("#81d4fa")
      .setTimestamp();

    message.channel.send(embedDato);
  },
};
