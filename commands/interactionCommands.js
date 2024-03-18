import { getMemberByFilter } from "../constants/get-user.js";
import {
  handleDirectInteraction,
  sendInteractionRequest,
} from "../utils/embedInteractions.js";
import {
  interactionRequests,
  removeInteractionRequest,
} from "../utils/interactionRequests.js";

const interactionCommands = {
  abrazos: {
    name: "abrazo",
    requiresUser: true,
    requiresCount: true,
    descriptionCount: (count) => `\nSe han dado **${count}** abrazos. 🤗`,
    type: "abrazos",
    action: "abrazar",
    description: (requester, receiver) =>
      `**${requester.displayName}** le ha dado un abrazo cariñoso a **${receiver.displayName}.** ^^`,
    footer: "¡Un gesto amable hace el día mejor!",
    requiresRequest: true,
    requestMessage: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} está deseando compartir un abrazo contigo. ¿Qué dices, lo aceptas?`,
    rejectResponse: "Solicitud de abrazo rechazada.",
    noResponse: `Solicitud de abrazo no respondida.`,
  },
  caricias: {
    name: "caricia",
    requiresUser: true,
    requiresCount: true,
    descriptionCount: (count) => `\nSe han dado **${count}** caricias. 🐱`,
    type: "caricias",
    action: "acariciar",
    description: (requester, receiver) =>
      `**${requester.displayName}** le ha dado una tierna caricia a **${receiver.displayName}.** :3`,
    footer: "Una caricia suave puede iluminar el corazón.",
    requiresRequest: true,
    requestMessage: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} te quiere dar caricias. ¿Lo aceptarás? owo`,
    rejectResponse: "Solicitud de caricia rechazada.",
    noResponse: "Solicitud de caricia no respondida.",
  },
  besos: {
    name: "beso",
    requiresUser: true,
    requiresCount: true,
    descriptionCount: (count) => `\nSe han besado **${count}** veces. 💋`,
    type: "besos",
    action: "besar",
    description: (requester, receiver) =>
      `**${requester.displayName}** ha besado a **${receiver.displayName}.** o:`,
    footer: "Un beso tierno, un momento eterno.",
    requiresRequest: true,
    requestMessage: (requester, receiver) =>
      `¡Hola ${receiver}! ${requester} te quiere besar. ¿Vas a recibirlo? OwO`,
    rejectResponse: "Solicitud de beso rechazada.",
    noResponse: "Solicitud de beso no respondida.",
  },
  bailes: {
    name: "baile",
    requiresUser: false,
    requiresCount: true,
    descriptionCount: (count) => `\nHan bailado juntos **${count}** veces. 💃`,
    type: "bailar",
    action: "bailar",
    description: (requester, receiver) =>
      `**${requester.displayName}** está bailando con **${receiver.displayName}.**`,
    soloDescription: (requester) =>
      `**${requester.displayName}** se puso a bailar.`,
    footer: "Bailar alegra el corazón.",
    requiresRequest: true,
    requestMessage: (requester, receiver) =>
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
    description: (requester, receiver) =>
      `**${requester.displayName}** le dió una galleta **${receiver.displayName}.** 🍪`,
    soloDescription: (requester) =>
      `**${requester.displayName}** está comiendo una galleta. 🍪`,
    footer: "Las galletas son muy ricas. uwu",
    requiresRequest: true,
    requestMessage: (requester, receiver) =>
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
    description: (requester, receiver) =>
      `**${requester.displayName}** se calentó con **${receiver.displayName}.** 🔥`,
    soloDescription: (requester) =>
      `**${requester.displayName}** se puso horny. 🔥`,
    footer: "Hace mucho calor por aquí.",
    requiresRequest: false,
  },
  molestar: {
    name: "molestia",
    requiresUser: true,
    requiresCount: false,
    type: "poke",
    action: "molestar",
    description: (requester, receiver) =>
      `**${requester.displayName}** está fastidiando a **${receiver.displayName}.**`,
    footer: "Molestar",
    requiresRequest: false,
  },
};

async function executeinteractionCommands(message, args, config) {
  console.log(
    `Iniciando comando: ${config.action} con args: ${args.join(" ")}`
  );
  let userMention = message.mentions.members.first();

  let user;

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

  if (user.user.bot || (!config.requiresUser && !userMention && !args[0])) {
    await handleDirectInteraction(message, user, config);
  } else {
    const shouldSendRequest =
      config.requiresRequest &&
      user &&
      message.author.id !== user.user.id &&
      !user.user.bot;

    if (shouldSendRequest) {
      if (interactionRequests.has(user.user.id)) {
        return message.reply(
          "Ya existe una solicitud de interacción pendiente para este usuario."
        );
      }
      await sendInteractionRequest(message, user, config);
    } else {
      await handleDirectInteraction(message, user, config);
    }
  }
}

const hugUserCommand = {
  name: "abrazo",
  alias: ["hug", "abrazar"],
  async execute(message, args) {
    await executeinteractionCommands(
      message,
      args,
      interactionCommands.abrazos
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
