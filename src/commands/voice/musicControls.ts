import { AudioPlayerStatus, getVoiceConnection, VoiceConnectionStatus, joinVoiceChannel, entersState, VoiceConnection } from "@discordjs/voice";
import { musicQueue } from "../../utils/musicQueue.js";
import { getAudioPlayer } from "../../utils/audioPlayers.js";
import { playSong } from "./playMusic.js";
import { Command } from "../../types/command.js";
import { Message, TextChannel, VoiceChannel, GuildMember, PermissionsBitField } from "discord.js";
import { checkAndDisconnectIfAloneOrInactive } from "../../utils/voiceStateHandler.js";

function pause(guildId: string, textChannel: TextChannel): void {
    const audioPlayer = getAudioPlayer(guildId);
    if (audioPlayer && audioPlayer.state.status === AudioPlayerStatus.Playing) {
        audioPlayer.pause();
        textChannel.send("Reproducción pausada.");
    } else {
        textChannel.send("No hay una canción en reproducción para pausar.");
    }
}

function resume(guildId: string, textChannel: TextChannel): void {
    const audioPlayer = getAudioPlayer(guildId);
    if (audioPlayer && audioPlayer.state.status === AudioPlayerStatus.Paused) {
        audioPlayer.unpause();
        textChannel.send("Reproducción reanudada.");
    } else {
        textChannel.send("No hay una canción pausada para reanudar.");
    }
}

async function skip(guildId: string, textChannel: TextChannel): Promise<void> {
    const audioPlayer = getAudioPlayer(guildId);
    if (audioPlayer && audioPlayer.state.status === AudioPlayerStatus.Playing) {
        if (musicQueue.hasSongs(guildId)) {
            const nextSong = musicQueue.getNextSong(guildId);
            if (nextSong) {
                await playSong(nextSong.url, audioPlayer, textChannel, guildId);
                textChannel.send(`Canción saltada. Ahora reproduciendo: ${nextSong.title}`);
            }
        } else {
            audioPlayer.stop();
            textChannel.send("No hay más canciones en la cola para saltar.");
        }
    } else {
        textChannel.send("No hay una canción en reproducción para saltar.");
    }
}

function stop(guildId: string, textChannel: TextChannel): void {
    const audioPlayer = getAudioPlayer(guildId);
    if (audioPlayer) {
        musicQueue.clearQueue(guildId);
        audioPlayer.stop();
        textChannel.send("Reproducción detenida y cola limpiada.");
    } else {
        textChannel.send("No hay una canción en reproducción para detener.");
    }
}

async function verifyUserInSameVoiceChannel(message: Message): Promise<boolean> {
    const member = message.member as GuildMember;
    const botUser = message.client.user;
    if (!botUser) {
        message.channel.send("No se pudo obtener la información del bot.");
        return false;
    }

    const voiceChannel = member.voice.channel as VoiceChannel | null;
    if (!voiceChannel) {
        message.channel.send("Debes estar en un canal de voz para usar este comando.");
        return false;
    }

    const connection = getVoiceConnection(message.guild!.id);
    if (!connection) {
        message.channel.send("El bot no está conectado a ningún canal de voz.");
        return false;
    }

    if (connection.joinConfig.channelId !== voiceChannel.id) {
        message.channel.send("Debes estar en el mismo canal de voz que el bot para usar este comando.");
        return false;
    }

    return true;
}

async function handleVoiceConnection(member: GuildMember, message: Message): Promise<{ status: string, connection?: VoiceConnection, message?: string }> {
    const guildId = member.guild.id;
    let connection = getVoiceConnection(guildId);

    const voiceChannel = member.voice.channel as VoiceChannel | null;
    if (!voiceChannel) {
        return {
            status: "error",
            message: "Debes estar en un canal de voz para usar este comando.",
        };
    }

    const botUser = message.client.user;
    if (!botUser) {
        return {
            status: "error",
            message: "No se pudo obtener la información del bot.",
        };
    }

    const permissions = voiceChannel.permissionsFor(botUser);
    if (!permissions?.has(PermissionsBitField.Flags.Connect)) {
        return {
            status: "error",
            message: "No tengo permiso para unirme a este canal de voz.",
        };
    }

    if (connection && connection.joinConfig.channelId !== voiceChannel.id) {
        const existingChannel = member.guild.channels.cache.get(
            connection.joinConfig.channelId!
        ) as VoiceChannel;

        const otherMembers = existingChannel.members.filter((m) => !m.user.bot);

        if (otherMembers.size > 0) {
            return {
                status: "error",
                message: `El bot ya está siendo utilizado en otro canal. Por favor, espera a que termine.`,
            };
        } else {
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 5000);
                connection.rejoin({
                    channelId: voiceChannel.id,
                    selfDeaf: false,
                    selfMute: false,
                });
            } catch (error) {
                console.error("Error al mover el bot al nuevo canal de voz:", error);
                return {
                    status: "error",
                    message: "Hubo un error al mover el bot al nuevo canal de voz.",
                };
            }
        }
    }

    if (!connection) {
        try {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: member.guild.voiceAdapterCreator,
            });

            checkAndDisconnectIfAloneOrInactive(connection, voiceChannel, guildId);

            await entersState(connection, VoiceConnectionStatus.Ready, 10000);
        } catch (error) {
            console.error("Error al intentar unirse al canal de voz:", error);
            return {
                status: "error",
                message:
                    "Hubo un error al intentar unirse al canal de voz. Por favor, intenta nuevamente.",
            };
        }
    }

    return {
        status: "success",
        connection,
    };
}

const pauseCommand: Command = {
    name: "pause",
    alias: ["pausar"],

    async execute(message: Message, args: string[]) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            pause(guildId, textChannel);
        }
    },
};

const resumeCommand: Command = {
    name: "resume",
    alias: ["resumir"],

    async execute(message: Message, args: string[]) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            resume(guildId, textChannel);
        }
    },
};

const skipCommand: Command = {
    name: "skip",
    alias: ["saltar"],

    async execute(message: Message, args: string[]) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            await skip(guildId, textChannel);
        }
    },
};

const stopCommand: Command = {
    name: "stop",
    alias: ["detener"],

    async execute(message: Message, args: string[]) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            stop(guildId, textChannel);
        }
    },
};

const disconnectCommand: Command = {
    name: "disconnect",
    alias: ["dc", "desconectar"],

    async execute(message: Message, args: string[]) {
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

    async execute(message: Message, args: string[]) {
        const member = message.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel | null;
        if (!voiceChannel) {
            message.channel.send("Debes estar en un canal de voz para usar este comando.");
            return;
        }

        const {
            status,
            connection,
            message: connectionMessage,
        } = await handleVoiceConnection(member, message);
        if (status === "error") {
            message.channel.send(connectionMessage || "Error de conexión desconocido.");
            return;
        }

        if (!connection) {
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
