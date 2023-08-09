import { arrayCommands } from "./index.js";
import {
  prefijo,
  prefixBotPersonalPrefix,
  prefixBotXpellitPrefix,
  specialPrefix,
} from "../constants/prefix.js";
import { linksImages } from "../constants/links_images.js";
import { getReplys } from "../constants/answers.js";
import { getReplysDelete } from "../constants/answers_delete.js";
/* import { imageEmbed } from "../utils/images.js"; */
import { db } from "../michi.js";
import { getUser, setUser } from "../db_service/user_service.js";
import {
  getCommandsValue,
  replaceArgumentText,
  setCommandByCategory,
  setCommandBySubcategory,
} from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";
import { EmbedBuilder, Events } from "discord.js";
import {
  rolGatosGatunosXpellit,
  rolIDClanPRuebas,
  rolXpellGames,
} from "../constants/rolesID.js";
import { getRankXpellitDiscord, setUserRankXpellitDiscord } from "../constants/clanService.js";
import { getPromptGTP } from "../utils/openai-api.js";

export const onMessageCreate = async (client) => {
  const prefix = prefijo;

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    /*     const user = await getUser(message.author.id);
    if (!user){
      setUser(message).then(res => {
        console.log('Se ha ingresado');
      });
    }
    */

    //Sumarle puntos

    // Si son del clan

    if (
      message.content.startsWith(prefixBotPersonalPrefix) ||
      message.content.startsWith(prefixBotXpellitPrefix)
    ) {
      const embedPrefix = new EmbedBuilder()
        .setAuthor({
          name: "Gatos Gatunos",
          iconURL:
            "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply",
        })
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTitle(`Información del Bot`)
        .addFields(
          {
            name: "Prefijo",
            value: `El prefijo es ${prefijo}`,
            inline: true,
          },
          {
            name: "Información",
            value: `Escribe ${prefijo}help`,
            inline: true,
          }
        )
        .setColor(0x81d4fa)
        .setTimestamp();

      if (message.author.id !== "526597356091604994") {
        message.reply({ embeds: [embedPrefix] });
      } else {
        try {
          const prompt = message.content.slice(
            prefixBotXpellitPrefix.length + 1
          );
          if (!prompt) return message.reply({ embeds: [embedPrefix] });
          await message.channel.sendTyping();
          const response = await getPromptGTP(prompt);
          message.reply({ content: response });
        } catch (error) {
          console.log(error);
        }
      }
    }

    if (message.member.roles.cache.get(rolXpellGames)) {
      const timestamp = new Date().getTime();
      const rankDiscord = await getRankXpellitDiscord();
      const keys = Object.keys(rankDiscord);

      //Revisar si ya existe
      if (keys.includes(message.author.id)) {
        const user = rankDiscord[message.author.id];
        // Si ha pasado 1 minuto
        if (timestamp - user.last >= 60 * 1000) {
          const puntosGanados = getRandomNumber(3, 6 - 1);
          user.puntos = user.puntos + puntosGanados;
          user.last = timestamp;
          setUserRankXpellitDiscord(message.author.id, user);
        }
      } else {
        //Si no existe, se registra con puntos: 1
        const user = {
          last: timestamp,
          nickname: message.member.nickname ?? message.author.username,
          puntos: 1,
        };
        setUserRankXpellitDiscord(message.author.id, user);
      }
    }

    if (message.content.startsWith(specialPrefix)) {
      if (message.author.id !== "526597356091604994") return;

      const messageContent = message.content.trim();
      const content = messageContent.slice(specialPrefix.length, -3).trim();
      const categoria = content.split(" ")[1];
      let subcategoria;
      if (categoria.includes("/")) {
        subcategoria = categoria.split("/")[1];
      }
      const key = content.split("{")[1].split(":")[0];
      const value = content.split('"')[1];

      if (!subcategoria) {
        await setCommandByCategory(categoria, key, value)
          .then((res) => {
            message.channel.send("Actualizado.");
          })
          .catch((err) => {
            message.channel.send("Inválido");
          });
      } else {
        await setCommandBySubcategory(categoria, subcategoria, key, value)
          .then((res) => {
            message.channel.send("Actualizado.");
          })
          .catch((err) => {
            message.channel.send("Inválido");
          });
      }

      setTimeout(() => {
        try {
          message.delete();
        } catch (error) {
          console.log(error);
        }
      }, 5 * 1000);
    }

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    const commandBody = content.slice(commandName.length).trim();

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
            console.log(error);
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
      }
    } else {
      const command = arrayCommands.find(
        (cmd) =>
          cmd.name === commandName ||
          (cmd.alias && cmd.alias.includes(commandName))
      );
      if (command) {
        try {
          command.execute(message, args, commandBody);
        } catch (error) {
          console.log(error);
        }
      }
    }

    /*     const replys = getReplys(message, commandBody, commandName, args);
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
    }  */
  });
};
