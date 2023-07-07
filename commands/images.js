import { arrayCommands } from "./index.js";
import { MessageEmbed } from "discord.js";
import { linksImages } from "../utils/links_images.js";

export const onImageCreate = async (client) => {
  const prefix = "-";

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();

    
    const imageEmbed = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Grr`)
      .setImage('https://i.pinimg.com/736x/22/93/e1/2293e181f4c5a865d8f1b86a0cf54be3.jpg')
      .setColor("#81d4fa")
      .setTimestamp();
      
    if (commandName === "grr") {

      message.channel.send(imageEmbed);

    } else {
        if (commandName === 'puñitos') {
            message.channel.send()
        }
    }

    arrayCommands.forEach((command) => {
      if (command.name === commandName || command.alias.includes(commandName)) {
        command.execute(message, args);
      }
    });
  });
};
