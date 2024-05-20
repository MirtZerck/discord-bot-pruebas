import { Message, GuildMember } from "discord.js";
import { getMemberByFilter } from "../constants/get-user.js";
import {
    handleDirectInteraction,
    sendInteractionRequest,
} from "../utils/embedInteractions.js";
import { hasInteractionRequest } from "../utils/interactionRequest.js";
import { InteractionConfig } from "../types/interaction.js";
import { Command } from "../types/command.js";

const interactionCommands: Record<string, InteractionConfig> = {
    abrazos: {
        name: "abrazo",
        requiresUser: true,
        requiresCount: true,
        descriptionCount: (count) => `\nSe han dado **${count}** abrazos. 🤗`,
        type: "abrazos",
        action: "abrazar",
        description: (requester, receiver) =>
            `**${requester.displayName}** le ha dado un abrazo cariñoso a **${receiver.displayName}**. ^^`,
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
            `**${requester.displayName}** le ha dado una tierna caricia a **${receiver.displayName}**. :3`,
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
            `**${requester.displayName}** ha besado a **${receiver.displayName}**. o:`,
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
            `**${requester.displayName}** está bailando con **${receiver.displayName}**.`,
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
            `**${requester.displayName}** le dió una galleta a **${receiver.displayName}**. 🍪`,
        soloDescription: (requester) =>
            `**${requester.displayName}** está comiendo una galleta. 🍪`,
        footer: "Las galletas son muy ricas. uwu",
        requiresRequest: true,
        requestMessage: (requester, receiver) =>
            `¡Oye ${receiver}!, ¿Te gustaría recibir una galleta de ${requester}?`,
        rejectResponse: `Han rechazado tu galleta. x-x`,
        noResponse: "Solicitud de galleta no respondida.",
    },
    caliente: {
        name: "horny",
        requiresUser: false,
        requiresCount: false,
        type: "horny",
        action: "ponerse caliente",
        description: (requester, receiver) =>
            `**${requester.displayName}** se calentó con **${receiver.displayName}**. 🔥`,
        soloDescription: (requester) =>
            `**${requester.displayName}** se puso horny. 🔥`,
        footer: "Hace mucho calor por aquí.",
        requiresRequest: false,
        requestMessage: () => "",
        rejectResponse: "",
        noResponse: "",
    },
    molestar: {
        name: "molestia",
        requiresUser: true,
        requiresCount: false,
        type: "poke",
        action: "molestar",
        description: (requester, receiver) =>
            `**${requester.displayName}** está fastidiando a **${receiver.displayName}**.`,
        footer: "Molestar",
        requiresRequest: false,
        requestMessage: () => "",
        rejectResponse: "",
        noResponse: "",
    },
    sonrojar: {
        name: "sonrojo",
        requiresUser: false,
        requiresCount: false,
        type: "sonrojar",
        action: "sonrojar",
        description: (requester, receiver) =>
            `**${requester.displayName}** se ha sonrojado debido a **${receiver.displayName}**.`,
        soloDescription: (requester) =>
            `**${requester.displayName}** se sonrojó. owo`,
        footer: "Sintiendo mucha penita.",
        requiresRequest: false,
        requestMessage: () => "",
        rejectResponse: "",
        noResponse: "",
    },
};

async function executeinteractionCommands(
    message: Message,
    args: string[],
    config: InteractionConfig
) {
    try {
        let userMention = message.mentions.members?.first() || null;
        let user: GuildMember | null = null;

        if (!userMention && args[0]) {
            user = getMemberByFilter(message, args[0]);
        } else if (!config.requiresUser && !args[0]) {
            user = message.member;
        } else {
            user = userMention;
        }

        if (!user && config.requiresUser) {
            return message.reply(
                `Debes mencionar a alguien o proporcionar un nombre válido para ${config.action}.`
            );
        }

        if (!user) {
            return message.reply("El usuario no existe o no se pudo encontrar.");
        }

        if (config.requiresUser && message.author.id === user.user.id) {
            return message.reply(`No te puedes ${config.action} a ti mismo.`);
        }

        if (user && (user.user.bot || (!config.requiresUser && !userMention && !args[0]))) {
            await handleDirectInteraction(message, user, config);
        } else {
            const shouldSendRequest =
                config.requiresRequest &&
                user &&
                message.author.id !== user.user.id &&
                !user.user.bot;

            if (shouldSendRequest) {
                if (hasInteractionRequest(user.user.id, message.author.id)) {
                    return message.reply(
                        "Ya existe una solicitud de interacción pendiente para este usuario."
                    );
                }
                await sendInteractionRequest(message, user, config);
            } else {
                await handleDirectInteraction(message, user, config);
            }
        }
    } catch (error) {
        console.error("Error ejecutando el comando:", error);
        message.reply(
            "Ocurrió un error al ejecutar el comando. Por favor, intenta de nuevo."
        );
    }
}

const hugUserCommand: Command = {
    name: "abrazo",
    alias: ["hug", "abrazar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.abrazos
            );
        } catch (error) {
            console.error("Error en el comando abrazo:", error);
            message.reply("Ocurrió un error al ejecutar el comando de abrazo.");
        }
    },
};

const patUserCommand: Command = {
    name: "caricia",
    alias: ["pat", "acariciar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.caricias
            );
        } catch (error) {
            console.error("Error en el comando caricia:", error);
            message.reply("Ocurrió un error al ejecutar el comando de caricia.");
        }
    },
};

const kissUserCommand: Command = {
    name: "beso",
    alias: ["kiss", "besar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.besos
            );
        } catch (error) {
            console.error("Error en el comando beso:", error);
            message.reply("Ocurrió un error al ejecutar el comando de beso.");
        }
    },
};

const danceUserCommand: Command = {
    name: "baile",
    alias: ["dance", "bailar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.bailes
            );
        } catch (error) {
            console.error("Error en el comando baile:", error);
            message.reply("Ocurrió un error al ejecutar el comando de baile.");
        }
    },
};

const cookieUserCommand: Command = {
    name: "galleta",
    alias: ["cookie"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.galletas
            );
        } catch (error) {
            console.error("Error en el comando galleta:", error);
            message.reply("Ocurrió un error al ejecutar el comando de galleta.");
        }
    },
};

const hornyUserCommand: Command = {
    name: "caliente",
    alias: ["horny", "excitar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.caliente
            );
        } catch (error) {
            console.error("Error en el comando caliente:", error);
            message.reply("Ocurrió un error al ejecutar el comando de caliente.");
        }
    },
};

const pokeUserCommand: Command = {
    name: "molestia",
    alias: ["poke", "molestar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.molestar
            );
        } catch (error) {
            console.error("Error en el comando molestia:", error);
            message.reply("Ocurrió un error al ejecutar el comando de molestia.");
        }
    },
};

const blushUserCommand: Command = {
    name: "sonrojo",
    alias: ["blush", "sonrojar"],
    async execute(message: Message, args: string[]) {
        try {
            await executeinteractionCommands(
                message,
                args,
                interactionCommands.sonrojar
            );
        } catch (error) {
            console.error("Error en el comando sonrojo:", error);
            message.reply("Ocurrió un error al ejecutar el comando de sonrojo.");
        }
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
    blushUserCommand,
];