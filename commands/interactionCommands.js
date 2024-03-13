import { getMemberByFilter } from "../constants/get-user.js";
import { handleDirectInteraction } from "../utils/embedInteractions.js";
import { sendInteractionRequest } from "../utils/embedInteractions.js";
import { removeInteractionRequest } from "../utils/interactionRequests.js";

// Configuración de los comandos de interacción, incluyendo el nombre, tipo y mensajes de respuesta.
const interactionCommands = {
  abrazos: {
    name: "abrazo",
    requiresUser: true,
    requiresCount: true,
    type: "abrazos",
    action: "abrazar",
    footer: "¡Un gesto amable hace el día mejor!",
    requiresRequest: true,
    successResponce: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} está deseando compartir un abrazo contigo. ¿Qué dices, lo aceptas?`,
    rejectResponse: "Solicitud de abrazo rechazada.",
    noResponse: `Solicitud de abrazo no respondida.`,
  },
  caricias: {
    name: "caricia",
    requiresUser: true,
    requiresCount: true,
    type: "caricias",
    action: "acariciar",
    footer: "Una caricia suave puede iluminar el corazón.",
    requiresRequest: true,
    successResponce: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} te quiere dar caricias. ¿Lo aceptarás? owo`,
    rejectResponse: "Solicitud de caricia rechazada.",
    noResponse: "Solicitud de caricia no respondida.",
  },
  besos: {
    name: "beso",
    requiresUser: true,
    requiresCount: true,
    type: "besos",
    action: "besar",
    footer: "Un beso tierno, un momento eterno.",
    requiresRequest: true,
    successResponce: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} te quiere besar. ¿Vas a recibirlo? OwO`,
    rejectResponse: "Solicitud de beso rechazada.",
    noResponse: "Solicitud de beso no respondida.",
  },
  bailes: {
    name: "baile",
    requiresUser: false,
    requiresCount: true,
    type: "bailar",
    action: "bailar",
    footer: "Bailar alegra el corazón.",
    requiresRequest: true,
    successResponce: (requester, receiver) =>
      `¡Hey ${receiver},! ${requester} quiere bailar contigo. ¿Te animas?`,
    rejectResponse: "Solicitud de baile rechazada.",
    noResponse: "Solicitud de baile no respondida.",
  },
  galletas: {
    name: "galleta",
    requiresUser: false,
    requiresCount: false,
    type: "cookie",
    action: "comer una galleta",
    footer: "Las galletas son muy ricas. uwu",
    requiresRequest: true,
    successResponce: (requester, receiver) =>
      `¡Oye ${receiver}!, ¿Te gustaría recibir una galleta de ${requester}?`,
    rejectResponse: (receiver) => `${receiver} no quiso aceptar tu galleta.`,
    noResponse: "Solicitud de galleta no respondida.",
  },
  caliente: {
    name: "horny",
    requiresUser: false,
    requiresCount: false,
    type: "horny",
    action: "se ha puesto horny",
    footer: "Hace mucho calor por aquí.",
    requiresRequest: false,
  },
  molestar: {
    name: "molestia",
    requiresUser: true,
    requiresCount: false,
    type: "poke",
    action: "molestar",
    footer: "Molestar",
    requiresRequest: false,
  },
};

// Función principal para ejecutar comandos de interacción. Gestiona la lógica de selección de usuario, respuestas y actualizaciones de conteo.
async function executeinteractionCommands(message, args, config) {
  console.log(
    `Iniciando comando: ${config.action} con args: ${args.join(" ")}`
  );
  // Obtener el usuario mencionado o usar el argumento proporcionado.
  let userMention = message.mentions.members.first();

  let user; // Se declara una variable para almacenar el filtro de usuario.

  // Seleccionar el filtro basado en la mención o el primer argumento.
  if (!userMention && args[0]) {
    user = getMemberByFilter(message, args[0]);
    console.log(
      "Usuario encontrado por argumento:",
      user ? user.displayName : "No encontrado"
    );
  } else if (!config.requiresUser && !args[0]) {
    user = message.member;
    console.log("Acción solitaria asumida para el usuario:", user.displayName);
  } else {
    user = userMention;
    console.log(
      "Usuario mencionado:",
      user ? user.displayName : "No mencionado"
    );
  }

  console.log(
    `Usuario objetivo determinado: ${user ? user.displayName : "N/A"}`
  );

  if (!user && config.requiresUser) {
    console.log("Usuario requerido pero no proporcionado.");
    return message.reply(
      `Debes mencionar a alguien o proporcionar un nombre válido para ${config.action}.`
    );
  }

  if (!user) {
    console.log("Usuario no existe o no se pudo encontrar.");
    return message.reply("El usuario no existe o no se pudo encontrar.");
  }

  if (config.requiresUser && message.author.id === user.user.id) {
    console.log("Intento de auto-interacción detectado.");
    return message.reply(`No te puedes ${config.action} a ti mismo.`);
  }

  const userReactID = user.user.id;

  removeInteractionRequest(userReactID);

  if (user.user.bot || (!config.requiresUser && !userMention && !args[0])) {
    await handleDirectInteraction(message, user, config);

    removeInteractionRequest(userReactID);

    return; // Finaliza la función tras la interacción directa.
  }

  const shouldSendRequest =
    config.requiresRequest &&
    user &&
    message.author.id !== user.user.id &&
    !user.user.bot;

  if (shouldSendRequest) {
    await sendInteractionRequest(message, user, config);
  } else {
    await handleDirectInteraction(message, user, config);

    removeInteractionRequest(userReactID);
  }
}

// Exportar el comando de abrazo como un objeto con propiedades name, alias y una función execute.
const hugUserCommand = {
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

const patUserCommand = {
  name: "caricia",
  alias: ["pat", "acariciar"],

  async execute(message, args) {
    await executeinteractionCommands(
      message,
      args,
      interactionCommands.caricias
    );
  },
};

const kissUserCommand = {
  name: "beso",
  alias: ["kiss", "besar"],

  async execute(message, args) {
    await executeinteractionCommands(message, args, interactionCommands.besos);
  },
};

const danceUserCommand = {
  name: "baile",
  alias: ["dance", "bailar"],

  async execute(message, args) {
    await executeinteractionCommands(message, args, interactionCommands.bailes);
  },
};

const cookieUserCommand = {
  name: "galleta",
  alias: ["cookie"],

  async execute(message, args) {
    await executeinteractionCommands(
      message,
      args,
      interactionCommands.galletas
    );
  },
};

const hornyUserCommand = {
  name: "caliente",
  alias: ["horny", "excitar"],

  async execute(message, args) {
    await executeinteractionCommands(
      message,
      args,
      interactionCommands.caliente
    );
  },
};

const pokeUserCommand = {
  name: "molestia",
  alias: ["poke", "molestar"],

  async execute(message, args) {
    await executeinteractionCommands(
      message,
      args,
      interactionCommands.molestar
    );
  },
};

export const arrayInteractions = [
  hugUserCommand,
  patUserCommand,
  kissUserCommand,
  danceUserCommand,
  cookieUserCommand,
  hornyUserCommand,
  pokeUserCommand,
];
