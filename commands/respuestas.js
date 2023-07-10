import { arrayCommands } from "./index.js";
import { prefijo } from "../constants/prefix.js";
import { linksImages } from "../constants/links_images.js";
import { getReplys } from "../constants/answers.js";
import { getReplysDelete } from "../constants/answers_delete.js";
import { imageEmbed } from "../utils/images.js";

export const onMessageCreate = async (client) => {
  const prefix = prefijo;

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    const commandBody = content.slice(commandName.length);

    const replys = getReplys(message, commandBody, commandName, args);
    const replysDelete = getReplysDelete(
      message,
      commandBody,
      commandName,
      args
    );
    const arrayReplys = Object.keys(replys);
    const arrayLinksImages = Object.keys(linksImages);
    const arrayDeleteReplys = Object.keys(replysDelete);

    if (arrayReplys.includes(commandName)) {
      message.channel.send(replys[commandName]);
    } else if (arrayLinksImages.includes(commandName)) {
      message.channel.send(imageEmbed(commandName, linksImages));
    } else if (arrayDeleteReplys.includes(commandName)) {
      message.delete();
      message.channel.send(replysDelete[commandName]);
    }

    const command = arrayCommands.find(
      (cmd) =>
        cmd.name === commandName ||
        (cmd.alias && cmd.alias.includes(commandName))
    );
    if (command) {
      command.execute(message, args, commandBody);
    }
  });
};
