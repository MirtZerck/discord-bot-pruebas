import { MessageEmbed } from "discord.js";
import {obtenerMeme} from "../utils/api_meme.js"

export const sendMemeCommand = {
  name: "meme",
  alias: ["me", 'chistaco'],

  async execute(message, args)  { 

    const momazo = await obtenerMeme();
    
    const embedMeme = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Ríanse por favor :C`)
      .setDescription(momazo)
      .setColor("#81d4fa")
      .setTimestamp();

   
      message.channel.send(embedMeme);
    
  },
};
