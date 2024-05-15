import { Events } from "discord.js";
import { rolXpellGames } from "../constants/rolesID.js";
import {
  getRankXpellitDiscord,
  setUserRankXpellitDiscord,
} from "../constants/clanService.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";

export const rankXpellitControl = async (client) => {
  client.on(Events.MessageCreate, async (message) => {
    try {
      if (message.author.bot) return;

      if (message.member.roles.cache.get(rolXpellGames)) {
        const timestamp = new Date().getTime();
        const rankDiscord = await getRankXpellitDiscord();
        const keys = Object.keys(rankDiscord);

        // Revisar si ya existe
        if (keys.includes(message.author.id)) {
          const user = rankDiscord[message.author.id];
          // Si ha pasado 1 minuto
          if (timestamp - user.last >= 60 * 1000) {
            const puntosGanados = getRandomNumber(3, 6 - 1);
            user.puntos = user.puntos + puntosGanados;
            user.last = timestamp;
            await setUserRankXpellitDiscord(message.author.id, user);
          }
        } else {
          // Si no existe, se registra con puntos: 1
          const user = {
            last: timestamp,
            nickname: message.member.nickname ?? message.author.username,
            puntos: 1,
          };
          await setUserRankXpellitDiscord(message.author.id, user);
        }
      }
    } catch (error) {
      console.error("Error al ejecutar el comando rankXpellitControl:", error);
    }
  });
};
