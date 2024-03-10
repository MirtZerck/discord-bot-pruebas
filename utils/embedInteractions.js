import { EmbedBuilder } from "discord.js"; // Importa la clase EmbedBuilder de la biblioteca discord.js para construir mensajes embed.
import { getDynamicColor } from "./getDynamicColor.js"; // Importa la función getDynamicColor desde un archivo externo para obtener un color dinámico para el embed.

// Define la función createInteractionEmbed que toma varios parámetros para construir un mensaje embed representando una interacción.
export const createInteractionEmbed = (
  authorMember, // Miembro que inicia la interacción.
  targetMember, // Miembro objetivo de la interacción.
  interactionType, // Tipo de interacción (por ejemplo, "abraza" o "saluda").
  count, // Cantidad de interacciones realizadas.
  imageUrl, // URL de la imagen asociada a la interacción.
  footer // Descripción al pie de página.
) => {
  // Obtiene un color dinámico basado en el autor de la interacción.
  const dynamicColor = getDynamicColor(authorMember);

  // Construye la descripción de la interacción que incluye la cantidad y el tipo de interacción.
  const interactionDescription = `Se han dado **${count}** ${interactionType} 🤗`;

  // Crea y devuelve un nuevo objeto EmbedBuilder para construir el mensaje embed.
  return new EmbedBuilder()
    .setDescription(
      `¡**${authorMember.displayName}** ha dado un ${interactionType} a **${targetMember.displayName}**!\n${interactionDescription}`
    ) // Configura la descripción del mensaje embed como la descripción de la interacción.
    .setImage(imageUrl) // Establece la imagen del mensaje embed como la imagen asociada a la interacción.
    .setColor(dynamicColor) // Establece el color del mensaje embed como el color dinámico obtenido.
    .setFooter({ text: footer }) // Configura el pie de página del mensaje embed.
    .setTimestamp(); // Establece la marca de tiempo del mensaje embed.
};
