import { obtenerDatoCurioso } from "../utils/api_dato_curioso.js";
import { MessageEmbed } from "discord.js";
import { arrayCommands } from "./index.js"; 



/* console.log(dato_curioso); */

export const curiousFact = async (client) => {
  const prefix = ".";

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();

    const curiosoDato = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Dato Gatuno`)
      .setDescription(dato_curioso)
      .setColor("#81d4fa")
      .setTimestamp();

    if (commandName === "dato") {

      message.channel.send(curiosoDato);

    }

     });
};

const dato_curioso = await obtenerDatoCurioso();