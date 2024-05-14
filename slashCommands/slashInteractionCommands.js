import {
  handleDirectInteraction,
  sendInteractionRequest,
} from "../utils/slashEmbedInteractions.js";
import { interactionRequests } from "../utils/interactionRequests.js";
import { SlashCommandBuilder } from "discord.js";

const interactionCommands = {
  abrazos: {
    name: "abrazo",
    requiresUser: true,
    requiresCount: true,
    descriptionCount: (count) => `\nSe han dado **${count}** abrazos. 🤗`,
    type: "abrazos", //Nombre en base de datos.
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
    action: "dar una galleta",
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
    description: (requester, receiver) =>
      `**${requester.displayName}** se calentó con **${receiver.displayName}.** 🔥`,
    soloDescription: (requester) =>
      `**${requester.displayName}** se puso horny. 🔥`,
    footer: "Hace mucho calor por aquí.",
    requiresRequest: false,
  },
  molestar: {
    name: "molestia",
    requiresUser: false,
    requiresCount: false,
    type: "poke",
    action: "molestar",
    description: (requester, receiver) =>
      `**${requester.displayName}** está fastidiando a **${receiver.displayName}.**`,
    footer: "Molestar",
    requiresRequest: false,
  },
  sonrojar: {
    name: "sonrojo",
    requiresUser: false,
    requiresCount: false,
    type: "sonrojar",
    description: (requester, receiver) =>
      `**${requester.displayName}** se ha sonrojado debido a **${receiver.displayName}.**`,
    soloDescription: (requester) =>
      `**${requester.displayName}** se sonrojó. owo`,
    footer: "Sintiendo mucha penita.",
    requiresRequest: false,
  },
};

async function executeinteractionCommands(interaction, config) {
  try {
    let userMention = interaction.options.getMember("target");

    let user;

    if (!config.requiresUser && !userMention) {
      user = interaction.member;
    } else {
      user = userMention;
    }

    if (!user && config.requiresUser) {
      return interaction.reply(
        `Debes mencionar a alguien o proporcionar un nombre válido para ${config.action}.`
      );
    }

    if (!user) {
      return interaction.reply("El usuario no existe o no se pudo encontrar.");
    }

    if (config.requiresUser && interaction.user.id === user.user.id) {
      return interaction.reply(`No te puedes ${config.action} a ti mismo.`);
    }

    if (user.user.bot || (!config.requiresUser && !userMention)) {
      await handleDirectInteraction(interaction, user, config);
    } else {
      const shouldSendRequest =
        config.requiresRequest &&
        user &&
        interaction.user.id !== user.user.id &&
        !user.user.bot;

      if (shouldSendRequest) {
        if (interactionRequests.has(user.user.id)) {
          return interaction.editReply(
            "Ya existe una solicitud de interacción pendiente para este usuario."
          );
        }
        await sendInteractionRequest(interaction, user, config);
      } else {
        await handleDirectInteraction(interaction, user, config);
      }
    }
  } catch (error) {
    console.error("Error ejecutando el comando de interacción:", error);
    await interaction.reply({
      content:
        "Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo más tarde.",
      ephemeral: true,
    });
  }
}

/////////////////////////////////////////////////////////////////////////////////

const interactCommand = new SlashCommandBuilder()
  .setName("interact")
  .setDescription("Interactúa con un usuario.");

const subcommands = [
  {
    name: "hug",
    description: "Abraza a alguien. (つ≧▽≦)つ",
    commandHandler: interactionCommands.abrazos,
    isTargetRequired: true,
  },
  {
    name: "pat",
    description: "Acaricia a alguien.",
    commandHandler: interactionCommands.caricias,
    isTargetRequired: true,
  },
  {
    name: "kiss",
    description: "Besa a alguien.",
    commandHandler: interactionCommands.besos,
    isTargetRequired: true,
  },
  {
    name: "dance",
    description: "Baila solo o con alguien.",
    commandHandler: interactionCommands.bailes,
    isTargetRequired: false,
  },
  {
    name: "cookie",
    description: "Come una galleta o dale una a alguien.",
    commandHandler: interactionCommands.galletas,
    isTargetRequired: false,
  },
  {
    name: "horny",
    description: "OwO",
    commandHandler: interactionCommands.caliente,
    isTargetRequired: false,
  },
  {
    name: "poke",
    description: "Molesta a alguien.",
    commandHandler: interactionCommands.molestar,
    isTargetRequired: true,
  },
  {
    name: "blush",
    description: "¿Algo te ha hecho sonrojar?",
    commandHandler: interactionCommands.sonrojar,
    isTargetRequired: false,
  },
];

subcommands.forEach((sub) => {
  interactCommand.addSubcommand((subcommand) =>
    subcommand
      .setName(sub.name)
      .setDescription(sub.description)
      .addUserOption((option) =>
        option
          .setName("target")
          .setDescription(`El usuario al que quieres ${sub.name}.`)
          .setRequired(sub.isTargetRequired)
      )
  );
});

const executeSubcommand = async (interaction, commandHandler) => {
  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    await executeinteractionCommands(interaction, commandHandler);
  } catch (error) {
    console.error("Error ejecutando el subcomando:", error);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({
        content:
          "Ocurrió un error al ejecutar el subcomando. Por favor, inténtalo de nuevo más tarde.",
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        content:
          "Ocurrió un error al ejecutar el subcomando. Por favor, inténtalo de nuevo más tarde.",
        ephemeral: true,
      });
    }
  }
};

export const slashInteractCommand = {
  data: interactCommand,
  async execute(interaction) {
    try {
      const subcommandName = interaction.options.getSubcommand();
      const subcommand = subcommands.find((sub) => sub.name === subcommandName);
      if (subcommand) {
        await executeSubcommand(interaction, subcommand.commandHandler);
      } else {
        await interaction.reply({
          content: "Subcomando no encontrado.",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error ejecutando el comando principal:", error);
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({
          content:
            "Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo más tarde.",
          ephemeral: true,
        });
      } else {
        await interaction.followUp({
          content:
            "Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo más tarde.",
          ephemeral: true,
        });
      }
    }
  },
};
