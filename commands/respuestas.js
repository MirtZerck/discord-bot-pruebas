// Importa comandos desde el archivo principal
import { arrayCommands } from "./index.js";

// Importa constantes de prefijos desde la carpeta de constantes
import { prefijo } from "../constants/prefix.js";

// Importa funciones de servicio de comandos desde el servicio de base de datos
import {
  getCommandsValue,
  replaceArgumentText,
} from "../db_service/commands_service.js";

// Importa funciones de utilidades generales
import { getRandomNumber } from "../utils/utilsFunctions.js";

// Importa constructores de Discord.js para crear mensajes incrustados y manejar eventos
import { EmbedBuilder, Events } from "discord.js";

// Define la función principal que se ejecuta cuando se crea un mensaje
export const onMessageCreate = async (client) => {
  // Define el prefijo del bot
  const prefix = prefijo;

  // Escucha eventos de creación de mensajes
  client.on(Events.MessageCreate, async (message) => {
    // Ignora mensajes de bots
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    const commandBody = content.slice(commandName.length).trim();

    /*
    para la nueva estructura de la db 
    const commandDB = new CommandsService(message.guild.id);

    const commandFound = await commandDB.getCommandsValue(commandName);
     */
    const commandFound = await getCommandsValue(commandName);
    if (commandFound) {
      const categoria = commandFound[0];
      const reply = commandFound[1][commandName];

      switch (categoria) {
        case "replys": {
          const respuesta = replaceArgumentText(
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
          const delete_respuesta = replaceArgumentText(
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
          const respuesta = replaceArgumentText(
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
          const respuesta = replaceArgumentText(
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
