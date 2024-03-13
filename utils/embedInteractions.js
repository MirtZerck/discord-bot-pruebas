import { EmbedBuilder } from "discord.js"; // Importa la clase EmbedBuilder de la biblioteca discord.js para construir mensajes embed.
import { getDynamicColor } from "./getDynamicColor.js"; // Importa la función getDynamicColor desde un archivo externo para obtener un color dinámico para el embed.
import {
  getInteraccionesValue,
  updateInteractionsCount,
} from "../db_service/commands_service.js";
import { getRandomNumber } from "./utilsFunctions.js";
import {
  addInteractionRequest,
  removeInteractionRequest,
} from "./interactionRequests.js";

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

  let interactionDescription;

  // Verifica si la interacción es auto-dirigida
  if (authorMember.id === targetMember.id) {
    // Descripción para acciones auto-dirigidas
    interactionDescription = `¡**${authorMember.displayName}** se puso a ${interactionType}!`;
  } else {
    // Construye la descripción de la interacción que incluye la cantidad y el tipo de interacción.
    interactionDescription = `¡**${authorMember.displayName}** ha dado un ${interactionType} a **${targetMember.displayName}**!`;

    if (count != null) {
      interactionDescription += `\nSe han dado **${count}** ${interactionType} 🤗`;
    }
  }
  // Crea y devuelve un nuevo objeto EmbedBuilder para construir el mensaje embed.
  return new EmbedBuilder()
    .setDescription(interactionDescription) // Configura la descripción del mensaje embed como la descripción de la interacción.
    .setImage(imageUrl) // Establece la imagen del mensaje embed como la imagen asociada a la interacción.
    .setColor(dynamicColor) // Establece el color del mensaje embed como el color dinámico obtenido.
    .setFooter({ text: footer }) // Configura el pie de página del mensaje embed.
    .setTimestamp(); // Establece la marca de tiempo del mensaje embed.
};

export async function handleDirectInteraction(message, user, config) {
  let newCount = null;

  if (config.requiresCount) {
    newCount = await updateInteractionsCount(
      message.author.id,
      user.user.id,
      config.type
    );
  }

  const callArray = await getInteraccionesValue();
  const interactionArray = callArray.find(([key]) => key === config.type);

  if (interactionArray) {
    const imgArray = interactionArray[1];
    const index = getRandomNumber(0, imgArray.length - 1);
    const imgDb = imgArray[index];

    const messageEmbed = createInteractionEmbed(
      message.member,
      user,
      config.type,
      newCount,
      imgDb,
      config.footer
    );

    await message.channel.send({ embeds: [messageEmbed] });
  }
}

// Función para manejar la solicitud de interacción
export async function sendInteractionRequest(message, user, config) {
  const dynamicColor = getDynamicColor(message.member);
  const embedRequest = new EmbedBuilder()
    .setAuthor({
      name: message.member.displayName,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`Solicitud de ${config.name}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setDescription(config.successResponce(message.member, user))
    .setColor(dynamicColor)
    .setFooter({ text: "Reacciona para responder." })
    .setTimestamp();

  const request = await message.channel.send({ embeds: [embedRequest] });
  await request.react("✅");
  await request.react("❌");

  addInteractionRequest(user.user.id, {
    requestMessage: request,
    requester: message.author.id,
    type: config.name,
  });

  const filter = (reaction, userReact) =>
    ["✅", "❌"].includes(reaction.emoji.name) && userReact.id === user.user.id;

  request
    .awaitReactions({ filter, max: 1, time: 180000, errors: ["time"] })
    .then(async (collected) => {
      const reaction = collected.first();

      if (reaction.emoji.name === "✅") {
        // Lógica para manejar la aceptación de la solicitud
        // Por ejemplo, llamar a handleDirectInteraction aquí
        console.log("Solicitud aceptada.");
        // Asegúrate de eliminar la solicitud del mapa
        removeInteractionRequest(user.user.id);
        request.delete();

        await handleDirectInteraction(message, user, config);
      } else if (reaction.emoji.name === "❌") {
        // Lógica para manejar el rechazo de la solicitud
        console.log("Solicitud rechazada.");
        // Asegúrate de eliminar la solicitud del mapa
        removeInteractionRequest(user.user.id);
        request.edit({
          embeds: [embedRequest.setDescription(config.rejectResponse)],
        });
        // Opcionalmente, podrías eliminar el mensaje de solicitud después de un tiempo
      }
    })
    .catch((error) => {
      console.error("Error al esperar reacciones: ", error);
      // Asegúrate de eliminar la solicitud del mapa si ocurre un error o timeout
      removeInteractionRequest(user.user.id);
      request.edit({
        embeds: [embedRequest.setDescription(config.noResponse)],
      });
      // Opcionalmente, podrías eliminar el mensaje de solicitud después de un tiempo
    });
}
