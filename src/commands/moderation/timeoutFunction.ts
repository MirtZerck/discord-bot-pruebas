import { getMemberByFilter } from "../../constants/get-user.js";
import { PermissionsBitField, Message } from "discord.js";
import { Command } from "../../types/command.js";

export const timeoutUser: Command = {
    name: "timeout",
    alias: ["mute", "mutear", "silenciar", "aislar"],

    async execute(message: Message, args: string[]) {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("No tienes permisos para aislar miembros.");
        }

        const userMention = message.mentions.members?.first();
        let filtro: string | undefined;

        if (userMention) {
            filtro = userMention.user.id;
        } else if (args[0]) {
            filtro = args[0];
        }

        if (!filtro || filtro.length < 3) {
            return message.reply("El usuario a mencionar debe tener al menos 3 caracteres.");
        }

        const member = getMemberByFilter(message, filtro);

        if (!member) return message.reply("Menciona a un usuario válido.");

        if (message.author.id === member.user.id) {
            return message.reply(`No puedes aislarte a ti mismo.`);
        }

        const timeInMinutes = parseInt(args[1]);
        const reason = args.slice(2).join(" ") || "Sin razón proporcionada.";

        if (!timeInMinutes || isNaN(timeInMinutes)) {
            return message.channel.send("Formato incorrecto. Asegúrate de mencionar al usuario y especificar un tiempo válido.");
        }

        if (timeInMinutes > 40320) {
            return message.reply("El tiempo de timeout no puede exceder los 28 días.");
        }

        try {
            await member.timeout(timeInMinutes * 60 * 1000, reason);
            message.channel.send(`Time Out aplicado a **${member.displayName}** por ${timeInMinutes} minutos. Razón: ${reason}.`);
        } catch (error) {
            console.error(error);
            message.channel.send("Error al aplicar el Time Out. Verifica mi rol y permisos, y asegúrate de que el usuario no tenga un rol más alto que yo.");
        }
    },
};

export const removeTimeoutUser: Command = {
    name: "removeTimeout",
    alias: ["unmute", "desmutear", "dessilenciar", "desaislar"],

    async execute(message: Message, args: string[]) {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply("No tienes permisos para remover el aislamiento de miembros.");
        }

        const userMention = message.mentions.members?.first();
        let filtro: string | undefined;

        if (userMention) {
            filtro = userMention.user.id;
        } else if (args[0]) {
            filtro = args[0];
        }

        if (!filtro || filtro.length < 3) {
            return message.reply("El usuario a mencionar debe tener al menos 3 caracteres.");
        }

        const member = getMemberByFilter(message, filtro);

        if (!member) return message.reply("No se pudo encontrar al usuario especificado.");

        if (message.author.id === member.user.id) {
            return message.reply(`No puedes remover tu propio aislamiento.`);
        }

        if (!member.isCommunicationDisabled()) {
            return message.channel.send("Este usuario no está en timeout actualmente.");
        }

        try {
            await member.timeout(null);
            message.channel.send(`Se ha eliminado el timeout de **${member.displayName}**.`);
        } catch (error) {
            console.error(error);
            message.channel.send("Error al intentar remover el timeout. Por favor, verifica mis permisos y la jerarquía de roles.");
        }
    },
};
