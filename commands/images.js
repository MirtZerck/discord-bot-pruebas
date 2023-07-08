import { prefijo } from "../utils/prefix.js";
import { linksImages } from "../utils/links_images.js";
import { MessageEmbed } from "discord.js";

export const onImageCreate = async (client) => {
  const prefix = prefijo;

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();

    const arraylinksImages = Object.keys(linksImages);

    const imageEmbed = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`${args}`)
      .setImage(linksImages[commandName])
      .setColor("#81d4fa")
      .setTimestamp();

    if (arraylinksImages.includes(commandName)) {
      message.channel.send(imageEmbed);
      
    }
  });
};
