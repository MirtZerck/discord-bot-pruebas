import { getMemberByFilter } from "../../constants/get-user.js";
import { PermissionsBitField, Message } from "discord.js";
import { Command } from "../../types/command.js";

const banUser: Command = {
    name: "ban",
    alias: ["banear"],

    async execute(message: Message, args: string[]) {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("No tienes permisos para banear miembros.");
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
            return message.reply("No puedes banearte a ti mismo.");
        }

        const reason = args.slice(1).join(" ") || "Sin razón proporcionada.";

        try {
            await member.ban({ reason });
            message.channel.send(`**${member.displayName}** ha sido baneado. Razón: ${reason}.`);
        } catch (error) {
            console.error(error);
            message.channel.send("Error al intentar banear al usuario. Por favor, verifica mis permisos y la jerarquía de roles.");
        }
    },
};

const unbanUser: Command = {
    name: "unban",
    alias: ["desbanear", "desban"],

    async execute(message: Message, args: string[]) {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("No tienes permisos para desbanear miembros.");
        }

        const userId = args[0];

        if (!userId || userId.length < 3) {
            return message.reply("Proporciona una ID de usuario válida.");
        }

        try {
            await message.guild?.members.unban(userId);
            message.channel.send(`El usuario con ID ${userId} ha sido desbaneado.`);
        } catch (error) {
            console.error(error);
            message.channel.send("Error al intentar desbanear al usuario. Asegúrate de que la ID sea correcta y de que tengo los permisos necesarios.");
        }
    },
};

export const arrayBanCommands = [banUser, unbanUser]