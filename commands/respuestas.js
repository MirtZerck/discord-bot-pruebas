import { arrayCommands } from "./index.js";
import { prefijo } from "../constants/prefix.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";
import { EmbedBuilder, Events } from "discord.js";
import { CommandsService } from "../db_service/commandsService.js";

export const onMessageCreate = async (client) => {
  const prefix = prefijo;

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    const commandBody = content.slice(commandName.length).trim();

    const commandDB = new CommandsService(message.guild.id);

    const commandFound = await commandDB.getCommandsValue(commandName);

    if (commandFound) {
      const categoria = commandFound[0];
      const reply = commandFound[1][commandName];

      switch (categoria) {
        case "replys": {
          const respuesta = CommandsService.replaceArgumentText(
            reply,
            message,
            commandBody,
            commandName,
            args
          );
          const respuestaFormateado = respuesta.replace(/\\n/g, "\n");

          message.channel.send(respuestaFormateado);
          break;
        }
        case "delete_replys": {
          const delete_respuesta = CommandsService.replaceArgumentText(
            reply,
            message,
            commandBody,
            commandName,
            args
          );
          const deleteRespuestaFormateado = delete_respuesta.replace(
            /\\n/g,
            "\n"
          );

          message.channel.send(deleteRespuestaFormateado);
          try {
            message.delete();
          } catch (error) {
            console.error(error);
          }
          break;
        }
        case "random_replys": {
          const values = Object.values(reply);
          const index = getRandomNumber(0, values.length - 1);
          const messageDb = values[index];
          const linkindex = "https";

          if (messageDb.startsWith(linkindex)) {
            const randomEmbed = new EmbedBuilder()
              .setAuthor({
                name: "Gatos Gatunos",
                iconURL:
                  "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply",
              })
              .setTitle(`${commandName}`)
              .setImage(messageDb)
              .setColor(0x81d4fa)
              .setTimestamp();

            message.channel.send({ embeds: [randomEmbed] });
            break;
          } else {
            message.channel.send(values[index]);
            break;
          }
        }

        case "linksImages": {
          const imageEmbed = new EmbedBuilder()
            .setAuthor({
              name: "Gatos Gatunos",
              iconURL:
                "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply",
            })
            .setTitle(`${commandName}`)
            .setImage(reply)
            .setColor(0x81d4fa)
            .setTimestamp();

          message.channel.send({ embeds: [imageEmbed] });
          break;
        }

        case "clanes": {
          const values = Object.values(reply);
          const img = values[0];
          const text = values[1];
          const respuesta = CommandsService.replaceArgumentText(
            text,
            message,
            commandBody,
            commandName,
            args
          );
          const respuestaFormateado = respuesta.replace(/\\n/g, "\n");

          const imageEmbed = new EmbedBuilder()
            .setAuthor({
              name: message.member.nickname ?? message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTitle(`Invitación al Clan`)
            .setDescription(respuestaFormateado)
            .setThumbnail()
            .setImage(img)
            .setColor(0x81d4fa)
            .setTimestamp();

          message.channel.send({ embeds: [imageEmbed] });

          break;
        }
        case "info": {
          const values = Object.values(reply);
          const img = values[0];
          const text = values[1];
          const respuesta = CommandsService.replaceArgumentText(
            text,
            message,
            commandBody,
            commandName,
            args
          );
          const respuestaFormateado = respuesta.replace(/\\n/g, "\n");

          const imageEmbed = new EmbedBuilder()
            .setAuthor({
              name: message.member.nickname ?? message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTitle(`Información Importante`)
            .setDescription(respuestaFormateado)
            .setThumbnail()
            .setImage(img)
            .setColor(0x81d4fa)
            .setTimestamp();

          message.channel.send({ embeds: [imageEmbed] });

          break;
        }
      }
    } else {
      const command = arrayCommands.find(
        (cmd) =>
          cmd.name === commandName ||
          (cmd.alias && cmd.alias.includes(commandName))
      );

      if (command) {
        try {
          await command.execute(message, args, commandBody);
        } catch (error) {
          console.error("Error al ejecutar el comando:", error);
        }
      }
    }
  });
};
