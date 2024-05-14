import { Events } from "discord.js";
import { specialPrefix } from "../constants/prefix.js";
import {
  setCommandByCategory,
  setCommandBySubcategory,
} from "../db_service/commands_service.js";

export const handleSpecialCommands = async (client, mirtZerckID) => {
  // Maneja el evento de creación de mensajes
  client.on(Events.MessageCreate, async (message) => {
    try {
      // Ignora mensajes de bots
      if (message.author.bot) return;

      if (message.content.startsWith(specialPrefix)) {
        if (message.author.id !== mirtZerckID) return;

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

        setTimeout(async () => {
          try {
            await message.delete();
          } catch (error) {
            console.error("Error al borrar el mensaje:", error);
          }
        }, 5 * 1000);
      }
    } catch (error) {
      console.error("Error al procesar el evento MessageCreate:", error);
      message.reply(
        "Ocurrió un error al procesar el mensaje. Por favor, intenta nuevamente más tarde."
      );
    }
  });
};
