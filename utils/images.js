import { MessageEmbed } from "discord.js";

export const imageEmbed = (commandName, linksImages) => {
  return new MessageEmbed()
    .setAuthor(
      "Gatos Gatunos",
      "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
    )
    .setTitle(`${commandName}`)
    .setImage(linksImages[commandName])
    .setColor("#81d4fa")
    .setTimestamp();
};
