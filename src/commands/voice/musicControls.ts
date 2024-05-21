import { Command } from "../../types/command.js";
import { Message, TextChannel, GuildMember, VoiceChannel } from "discord.js";
import { pause, resume, skip, stop, verifyUserInSameVoiceChannel, handleVoiceConnection } from "../../utils/sharedMusicFunctions.js";
import { getVoiceConnection } from "@discordjs/voice";

const pauseCommand: Command = {
    name: "pause",
    alias: ["pausar"],
    async execute(message: Message) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            const result = pause(guildId);
            textChannel.send(result);
        }
    },
};

const resumeCommand: Command = {
    name: "resume",
    alias: ["resumir"],
    async execute(message: Message) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            const result = resume(guildId);
            textChannel.send(result);
        }
    },
};

const skipCommand: Command = {
    name: "skip",
    alias: ["saltar"],
    async execute(message: Message) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            const result = await skip(guildId, textChannel);
            textChannel.send(result);
        }
    },
};

const stopCommand: Command = {
    name: "stop",
    alias: ["detener"],
    async execute(message: Message) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            const result = stop(guildId);
            textChannel.send(result);
        }
    },
};

const disconnectCommand: Command = {
    name: "disconnect",
    alias: ["dc", "desconectar"],
    async execute(message: Message) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const connection = getVoiceConnection(guildId);
            if (connection) {
                connection.destroy();
                message.channel.send("Desconectado del canal de voz.");
            } else {
                message.channel.send("El bot no está conectado a ningún canal de voz.");
            }
        }
    },
};

const joinCommand: Command = {
    name: "join",
    alias: ["unirse"],
    async execute(message: Message) {
        const member = message.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel | null;
        if (!voiceChannel) {
            message.channel.send("Debes estar en un canal de voz para usar este comando.");
            return;
        }

        const { status, connection, message: connectionMessage } = await handleVoiceConnection(member, message);
        if (status === "error") {
            message.channel.send(connectionMessage || "Error de conexión desconocido.");
        } else if (!connection) {
            message.channel.send("No se pudo establecer una conexión de voz.");
        } else {
            message.channel.send(`Conectado al canal de voz: ${voiceChannel.name}`);
        }
    },
};

export const arrayMusicControls: Command[] = [
    pauseCommand,
    resumeCommand,
    skipCommand,
    stopCommand,
    disconnectCommand,
    joinCommand,
];
