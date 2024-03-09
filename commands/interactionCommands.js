import { EmbedBuilder, messageLink } from "discord.js";
import { getMemberByFilter } from "../constants/get-user.js";
import {
  getInteraccionesValue,
  updateInteractionsCount,
} from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";
import { getDynamicColor } from "../utils/getDynamicColor.js";
import { createInteractionEmbed } from "../utils/embedInteractions.js";
import { interactionRequests } from "../utils/interactionRequests.js";

// Configuración de los comandos de interacción, incluyendo el nombre, tipo y mensajes de respuesta.
const interactionCommands = {
  abrazos: {
    name: "abrazo",
    type: "abrazos",
    action: "compartir abrazo",
    successResponce: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} está deseando compartir un abrazo contigo. ¿Qué dices, lo aceptas?`,
    rejectResponse: "Solicitud de abrazo rechazada.",
    noResponse: "Solicitud de abrazo no respondida.",
  },
  //Añadir nuevas configuraciones para comandos.
};

// Función principal para ejecutar comandos de interacción. Gestiona la lógica de selección de usuario, respuestas y actualizaciones de conteo.
async function executeinteractionCommands(message, args, config) {
  // Obtener el usuario mencionado o usar el argumento proporcionado.
  const userMention = message.mentions.members.first();

  let filtro; // Se declara una variable para almacenar el filtro de usuario.

  // Seleccionar el filtro basado en la mención o el primer argumento.
  if (userMention) {
    filtro = userMention.user.id; // Si hay una mención, se guarda el id del usuario mencionado.
  } else if (args[0]) {
    filtro = args[0]; // Si no hay mención pero hay un argumento, se usa el primer argumento como filtro.
  } else {
    message.reply(`Debes mencionar a alguien para ${config.action}.`); // Si no hay mención ni argumento, se responde al usuario indicándole que mencione a alguien.
    return;
  }

  // Obtener el miembro del servidor basado en el filtro aplicado.
  const user = getMemberByFilter(message, filtro);

  // Comprobaciones para asegurar la validez del usuario objetivo.
  if (!user)
    return message.reply("El usuario no existe o no se pudo encontrar.");

  if (message.author.id === user.user.id)
    return message.reply(`No te puedes ${config.action} a ti mismo.`);

  // Procesar interacciones con bots diferentemente, si es necesario.
  if (user.user.bot) {
    // Lógica específica para interacciones con bots, como actualizar el conteo de interacciones.
    const newCount = await updateInteractionsCount(
      message.author.id,
      user.user.id,
      config.type
    );

    // Obtener la lista de imágenes o mensajes predefinidos para la interacción.
    const callArray = await getInteraccionesValue();

    const interactionArray = callArray.find(([key]) => key === config.type);

    if (interactionArray) {
      const imgArray = interactionArray[1];

      const index = getRandomNumber(0, imgArray.length - 1);

      const imgDb = imgArray[index];

      // Crear y enviar el embed con la interacción.
      const messageEmbed = createInteractionEmbed(
        message.member, // El autor del mensaje que inició la interacción.
        user, // El miembro objetivo de la interacción.
        config.name, // El tipo de interacción configurado.
        newCount, // El nuevo recuento de interacciones después de la acción.
        imgDb // La URL de la imagen asociada con la interacción.
      );

      await message.channel.send({ embeds: [messageEmbed] }); // Enviar el mensaje con el embed de la interacción.
    }
    return; // Salir de la función después de procesar la interacción con el bot.
  }

  // Crear el embed de solicitud de interacción para usuarios no-bot.
  const dynamicColor = getDynamicColor(message.member); // Obtiene un color dinámico basado en el autor del mensaje.
  const embedRequest = new EmbedBuilder()
    .setAuthor({
      // Configura el autor del mensaje embed como el autor del mensaje original.
      name: message.member.displayName,
      iconURL: message.author.displayAvatarURL({ dynamic: true }), // Establece el icono del autor como su avatar.
    })
    .setTitle(`Solicitud de ${config.name}`) // Establece el título del mensaje embed como una solicitud de interacción con el tipo específico de interacción.
    .setThumbnail(user.displayAvatarURL({ dynamic: true })) // Establece una miniatura del avatar del usuario objetivo.
    .setDescription(config.successResponce(message.member, user)) // Establece la descripción del mensaje embed utilizando la función successResponce del objeto config, pasando el autor del mensaje y el usuario objetivo.
    .setColor(dynamicColor) // Establece el color del mensaje embed utilizando el color dinámico obtenido previamente.
    .setFooter({ text: "Reacciona para responder." }); // Establece el pie de página del mensaje embed indicando al receptor que reaccione para responder.

  // Enviar el embed y agregar reacciones para la respuesta del usuario objetivo.
  const request = await message.channel.send({ embeds: [embedRequest] }); // Envía el mensaje embed al canal de mensajes.

  await request.react("✅"); // Agrega una reacción de "✅" (checkmark) al mensaje embed de solicitud.
  await request.react("❌"); // Agrega una reacción de "❌" (cross mark) al mensaje embed de solicitud.

  // Establecer el filtro de reacciones y manejar la respuesta del usuario.
  const filter = (reaction, userReact) => {
    // Define el filtro de reacciones. Solo se aceptarán las reacciones de "✅" o "❌" y deben provenir del usuario objetivo.
    return (
      ["✅", "❌"].includes(reaction.emoji.name) && // Verifica si la reacción es "✅" o "❌".
      userReact.id === user.user.id // Verifica si la reacción proviene del usuario objetivo.
    );
  };

  request
    .awaitReactions({ filter, max: 1, time: 180000, errors: ["time"] }) // Espera la reacción del usuario objetivo dentro de un período de tiempo específico.
    .then(async (collected) => {
      const reaction = collected.first(); // Obtiene la primera reacción recogida del usuario objetivo.

      // Lógica para manejar la aceptación o rechazo de la solicitud de interacción.
      if (reaction.emoji.name === "✅") {
        request.delete(); // Elimina el mensaje de solicitud de interacción.

        const userReactId = user.user.id; // Obtiene el ID del usuario que reaccionó a la solicitud.
        const requestDetails = interactionRequests.get(userReactId); // Obtiene los detalles de la solicitud de interacción del mapa de solicitudes.
        if (requestDetails) {
          clearTimeout(requestDetails.timerId); // Cancela el temporizador asociado a la solicitud si existe.
          interactionRequests.delete(userReactId); // Elimina la solicitud de interacción del mapa de solicitudes.
        }

        // Actualiza el contador de interacciones después de que se haya aceptado la solicitud.
        const newCount = await updateInteractionsCount(
          message.author.id,
          user.user.id,
          config.type
        );

        // Obtiene la lista de imágenes o mensajes predefinidos para la interacción.
        const callArray = await getInteraccionesValue();

        // Busca la configuración específica para el tipo de interacción.
        const interactionArray = callArray.find(([key]) => key === config.type);

        if (interactionArray) {
          const imgArray = interactionArray[1]; // Extrae la matriz de imágenes para la interacción.

          // Selecciona una imagen aleatoria de la matriz.
          const index = getRandomNumber(0, imgArray.length - 1);
          const imgDb = imgArray[index];

          // Crea y envía un nuevo mensaje embed con la interacción.
          const messageEmbed = createInteractionEmbed(
            message.member,
            user,
            config.name,
            newCount,
            imgDb
          );

          await message.channel.send({ embeds: [messageEmbed] }); // Envía el mensaje embed al canal de mensajes.
        }
      } else if (reaction.emoji.name === "❌") {
        // Si la reacción del usuario objetivo es "❌", lo que indica que la solicitud de interacción ha sido rechazada.
        request.edit({
          // Edita el mensaje de solicitud de interacción para reflejar la respuesta de rechazo.
          embeds: [embedRequest.setDescription(config.rejectResponse)], // Actualiza la descripción del mensaje embed con la respuesta de rechazo especificada en la configuración.
        });

        const userReactId = user.user.id; // Obtiene el ID del usuario que reaccionó a la solicitud.
        const requestDetails = interactionRequests.get(userReactId); // Obtiene los detalles de la solicitud de interacción del mapa de solicitudes.
        if (requestDetails) {
          clearTimeout(requestDetails.timerId); // Cancela el temporizador asociado a la solicitud si existe.
          interactionRequests.delete(userReactId); // Elimina la solicitud de interacción del mapa de solicitudes.
        }
        /* setTimeout(() => request.delete(), 30000); */
      }
    })
    .catch((error) => {
      // Maneja cualquier error o timeout que ocurra al esperar las reacciones del usuario objetivo.
      console.error("Error o timeout al esperar reacciones:", error); // Registra un mensaje de error en la consola.
      request
        .edit({
          // Edita el mensaje de solicitud de interacción para reflejar la falta de respuesta.
          embeds: [embedRequest.setDescription(config.noResponse)], // Actualiza la descripción del mensaje embed con el mensaje de no respuesta especificado en la configuración.
        })
        .catch(console.error); // Maneja cualquier error que pueda ocurrir durante la edición del mensaje de solicitud.
    });
}

// Exportar el comando de abrazo como un objeto con propiedades name, alias y una función execute.
export const hugUserCommand = {
  name: "abrazo", // Nombre del comando principal para abrazar.
  alias: ["hug", "abrazar"], // Alias adicionales que pueden ser usados para invocar el comando de abrazo.
  // Función execute que será llamada cuando se ejecute el comando.
  async execute(message, args) {
    // Llama a la función executeinteractionCommands pasando el mensaje, los argumentos y la configuración específica para los abrazos.
    await executeinteractionCommands(
      message,
      args,
      interactionCommands.abrazos // Configuración específica para los abrazos, que contiene la lógica y detalles de la interacción.
    );
  },
};
