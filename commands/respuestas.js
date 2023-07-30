import { arrayCommands } from "./index.js";
import { prefijo, specialPrefix } from "../constants/prefix.js";
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
import { MessageEmbed } from "discord.js";
import {
  rolGatosGatunosXpellit,
  rolIDClanPRuebas,
} from "../constants/rolesID.js";
import { getRankTabla1, setUserRankTabla1 } from "../constants/clanService.js";

export const onMessageCreate = async (client) => {
  const prefix = prefijo;

  client.on("message", async (message) => {
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
    if (message.member.roles.cache.get(rolGatosGatunosXpellit)) {
      const timestamp = new Date().getTime();
      const rankt1 = await getRankTabla1();
      const keys = Object.keys(rankt1);

      //Revisar si ya existe
      if (keys.includes(message.author.id)) {
        const user = rankt1[message.author.id];
        // Si ha pasado 1 minuto
        if (timestamp - user.last >= 60 * 1000) {
          user.puntos = user.puntos + 1;
          user.last = timestamp;
          setUserRankTabla1(message.author.id, user);
        }
      } else {
        //Si no existe, se registra con puntos: 1
        const user = {
          last: timestamp,
          nickname: message.member.nickname ?? message.author.username,
          puntos: 1,
        };
        setUserRankTabla1(message.author.id, user);
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
        /*  message.delete(); */
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
          /* message.delete(); */
          break;
        }
        case "random_replys": {
          const values = Object.values(reply);
          const index = getRandomNumber(0, values.length - 1);
          const messageDb = values[index];
          const linkindex = "https";

          if (messageDb.startsWith(linkindex)) {
            const randomEmbed = new MessageEmbed()
              .setAuthor(
                "Gatos Gatunos",
                "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
              )
              .setTitle(`${commandName}`)
              .setImage(messageDb)
              .setColor("#81d4fa")
              .setTimestamp();

            message.channel.send(randomEmbed);
            break;
          } else {
            message.channel.send(values[index]);
            break;
          }
        }

        case "linksImages": {
          const imageEmbed = new MessageEmbed()
            .setAuthor(
              "Gatos Gatunos",
              "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
            )
            .setTitle(`${commandName}`)
            .setImage(reply)
            .setColor("#81d4fa")
            .setTimestamp();

          message.channel.send(imageEmbed);
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

          const imageEmbed = new MessageEmbed()
            .setAuthor(
              message.member.nickname ?? message.author.username,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setTitle(`Invitación al Clan`)
            .setDescription(respuestaFormateado)
            .setThumbnail()
            .setImage(img)
            .setColor("#81d4fa")
            .setTimestamp();

          message.channel.send(imageEmbed);

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
        command.execute(message, args, commandBody);
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
