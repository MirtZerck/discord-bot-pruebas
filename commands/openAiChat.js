// Importa constantes de prefijos desde la carpeta de constantes
import { prefijo } from "../constants/prefix.js";

// Importa constructores de Discord.js para crear mensajes incrustados y manejar eventos
import { EmbedBuilder, Events } from "discord.js";

// Importa función para obtener respuestas de OpenAI
import { getPromptGTP } from "../utils/openai-api.js";

// Define la función principal que se ejecuta cuando se crea un mensaje
export const openAiChat = async (client) => {
  // Escucha eventos de creación de mensajes
  client.on(Events.MessageCreate, async (message) => {
    // Ignora mensajes de bots
    if (message.author.bot || !message.mentions.members.size) return;

    // Obtiene la primera mención en el mensaje, si la hay
    const mention = message.mentions.members.first();

    // Procesa mensajes que mencionan al bot
    if (mention && mention.user.id === client.user.id) {
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

      if (message.content.trim() === `<@${client.user.id}>`) {
        return message.reply({ embeds: [embedPrefix] });
      } else {
        try {
          const user = message.member.nickname ?? message.author.globalName;
          const prompt = `${user}: ${message.content}`;
          await message.channel.sendTyping();
          const response = await getPromptGTP(prompt);
          message.reply({ content: response });
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
};
