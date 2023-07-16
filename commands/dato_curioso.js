import { obtenerDatoCurioso } from "../utils/api_dato_curioso.js";
import { MessageEmbed } from "discord.js";
import { obtenerDataApi } from "../utils/apiserver.js";
import { Api_Michi_URL } from "../constants/apis_url.js";

export const curiosFactCommand = {
  name: "datocurioso",
  alias: ["dato", "dc"],

  async execute(message, args) {

    const dato_curioso = await obtenerDatoCurioso();
    const response = await obtenerDataApi(Api_Michi_URL);
    const imgUrl = response[0].url;

    const embedDato = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Dato Gatuno`)
      .setImage(imgUrl)
      .setDescription(dato_curioso)
      .setColor("#81d4fa")
      .setTimestamp();

    message.channel.send(embedDato);
  },
};
