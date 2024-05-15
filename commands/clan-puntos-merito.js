import { db } from "../michi.js";
import {
  getRankTabla2,
  removeUserRankTabla2,
  setUserRankTabla2,
} from "../constants/clanService.js";
import { EmbedBuilder } from "discord.js";
import {
  rolGatosGatunosXpellit,
  rolIDClanPRuebas,
} from "../constants/rolesID.js";
import { getMemberByID } from "../constants/get-user.js";
import { mirtZerckID } from "../constants/users_ID.js";

export const clanRankingClan = {
  name: "rankingclan",
  alias: ["rankclan", "rc"],

  async execute(message, args) {
    try {
      if (!message.member.roles.cache.get(rolGatosGatunosXpellit)) return;

      const rankt2 = await getRankTabla2();
      if (!rankt2) return message.reply("No existe todavía");
      const rank = Object.entries(rankt2);
      const keys = Object.keys(rankt2);

      const arg = args[0];
      const userID = args[1];
      const nuevosPuntos = args[2];

      if (!arg) {
        let puestos = "";
        //ordenar rank de mayor a menor
        rank.sort((a, b) => {
          return b[1].puntos - a[1].puntos;
        });

        rank.forEach((val, i) => {
          //val[0]: key (ID)
          //val[1]: value({nickname, puntos})
          puestos += `**${i + 1}.** ${val[1].nickname}: ${val[1].puntos}\n`;
          //1. Si: 3\n2. MirtZerck: 1
        });

        const embed = new EmbedBuilder()
          .setAuthor({
            name: message.member.nickname ?? message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`**Ranking por méritos**`)
          .setDescription(`${puestos}`)
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setColor(0x81d4fa)
          .setFooter({ text: "Ranking del Clan del Evento" })
          .setTimestamp();

        return message.channel.send({ embeds: [embed] }).catch((error) => {
          console.error("Error al enviar el mensaje embed:", error);
          message.reply(
            "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
          );
        });
      } else if (arg === "-add") {
        if (message.author.id !== mirtZerckID)
          return message.reply("No tienes permiso.");

        if (!userID) return message.reply("Ingresa el ID del usuario");

        if (!nuevosPuntos) return message.reply("Ingresa los puntos");
        const puntos = parseInt(nuevosPuntos);

        if (isNaN(puntos))
          return message.reply("Los puntos a ingresar deben ser enteros");

        if (keys.includes(userID)) {
          const user = rankt2[userID];
          user.puntos = user.puntos + puntos;

          await setUserRankTabla2(userID, user)
            .then((res) => {
              if (puntos > 0) {
                message.channel.send(
                  `Se han añadido ${puntos} a **${user.nickname}**.`
                );
              } else {
                message.channel.send(
                  `Se han removido **${Math.abs(puntos)}** puntos a **${
                    user.nickname
                  }**`
                );
              }
            })
            .catch((error) => {
              console.error(
                "Error al actualizar los puntos del usuario:",
                error
              );
              message.reply(
                "Ocurrió un error al actualizar los puntos del usuario. Por favor, intenta nuevamente más tarde."
              );
            });
        } else {
          return message.reply(
            `El usuario de ID **${userID}** no existe en el ranking.`
          );
        }
      } else if (arg === "-set") {
        if (message.author.id !== mirtZerckID)
          return message.reply("No tienes permiso.");

        if (!userID) return message.reply("Ingresa el ID del usuario");

        if (!nuevosPuntos) return message.reply("Ingresa los puntos");

        const puntos = parseInt(nuevosPuntos);

        if (isNaN(puntos))
          return message.reply("Los puntos a ingresar deben ser enteros");

        const member = getMemberByID(message, userID);

        if (!member) return message.reply(`El ID ${userID} no es válido.`);

        const user = {
          nickname: member.nickname ?? member.user.username,
          puntos: puntos,
        };

        await setUserRankTabla2(userID, user)
          .then((res) => {
            message.channel.send(
              `Se ha ingresado el usuario **${user.nickname}** con **${puntos}** puntos.`
            );
          })
          .catch((error) => {
            console.error("Error al establecer los puntos del usuario:", error);
            message.reply(
              "Ocurrió un error al establecer los puntos del usuario. Por favor, intenta nuevamente más tarde."
            );
          });
      } else if (arg === "-remove") {
        if (message.author.id !== "526597356091604994")
          return message.reply("No tienes permiso.");

        if (keys.includes(userID)) {
          await removeUserRankTabla2(userID)
            .then((res) => {
              message.reply(
                `Se ha eliminado al usuario con ID ${userID} del ranking`
              );
            })
            .catch((error) => {
              console.error("Error al eliminar al usuario del ranking:", error);
              message.reply(
                "Ocurrió un error al eliminar al usuario del ranking. Por favor, intenta nuevamente más tarde."
              );
            });
        } else {
          return message.reply(
            `El usuario de ID **${userID}** no existe en el ranking.`
          );
        }
      } else {
        return message.reply(
          "Argumento no válido. \n\n**Disponibles:** -add, -set, -remove"
        );
      }
    } catch (error) {
      console.error("Error al ejecutar el comando clanRankingClan:", error);
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
