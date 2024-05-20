import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    entersState,
    VoiceConnectionStatus,
    AudioPlayerStatus,
    AudioPlayer,
    VoiceConnection,
} from "@discordjs/voice";
import play from "play-dl";
import {
    GuildMember,
    Message,
    VoiceChannel,
    PermissionsBitField,
} from "discord.js";
import { checkAndDisconnectIfAloneOrInactive } from "../../utils/voiceStateHandler.js";
import { musicQueue } from "../../utils/musicQueue.js";
import { getAudioPlayer, setAudioPlayer } from "../../utils/audioPlayers.js";
import { Command } from "../../types/command.js";

async function searchAndGetURL(query: string): Promise<{ url: string, title: string } | null> {
    try {
        let result = query.match(
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|soundcloud\.com)\/.+$/i
        )
            ? { url: query, title: "" }
            : null;

        if (result && !result.title) {
            const info = await play.video_info(result.url);
            result.title = info.video_details.title || result.url;
        }

        if (!result) {
            console.log("Buscando tu canción...");
            const searchResults = await play.search(query, { limit: 1 });
            if (searchResults.length > 0) {
                result = { url: searchResults[0].url, title: searchResults[0].title || searchResults[0].url };
            }
        }

        if (!result || !(await play.validate(result.url))) {
            return null;
        }

        return result;
    } catch (error) {
        console.error("Error al buscar y obtener la URL:", error);
        return null;
    }
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

export async function playSong(
    songUrl: string,
    audioPlayer: AudioPlayer,
    textChannel: any,
    guildId: string
) {
    try {
        const stream = await play.stream(songUrl);
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });
        audioPlayer.play(resource);
        const songTitle = musicQueue.getQueue(guildId).find(song => song.url === songUrl)?.title || songUrl;
        textChannel.send(`Reproduciendo: ${songTitle}`);
    } catch (error) {
        console.error(`Error al intentar reproducir la canción ${songUrl}:`, error);
        textChannel.send("La canción no está disponible o no se puede reproducir.");
    }
}

function setupAudioPlayerEvents(
    audioPlayer: AudioPlayer,
    textChannel: any,
    connection: VoiceConnection,
    voiceChannel: VoiceChannel,
    guildId: string
) {
    try {
        audioPlayer.on("stateChange", async (oldState, newState) => {
            console.log(`Estado cambiado de ${oldState.status} a ${newState.status}`);

            if (
                newState.status === AudioPlayerStatus.Idle &&
                oldState.status === AudioPlayerStatus.Playing
            ) {
                console.log("El reproductor de audio está inactivo.");
                if (musicQueue.hasSongs(guildId)) {
                    const nextSong = musicQueue.getNextSong(guildId);
                    if (nextSong) {
                        await playSong(nextSong.url, audioPlayer, textChannel, guildId);
                        textChannel.send(`Ahora reproduciendo: ${nextSong.title}`);
                    } else {
                        textChannel.send("No hay más canciones en la cola.");
                        checkAndDisconnectIfAloneOrInactive(connection, voiceChannel, guildId);
                    }
                } else {
                    textChannel.send("La reproducción ha terminado.");
                    checkAndDisconnectIfAloneOrInactive(connection, voiceChannel, guildId);
                }
            }
        });

        audioPlayer.on("error", (error) => {
            console.error("Error en el reproductor de audio:", error);
            textChannel.send(
                "Error en la reproducción de audio. Por favor, intenta nuevamente."
            );
        });
    } catch (error) {
        console.error(
            "Error al configurar eventos del reproductor de audio:",
            error
        );
    }
}

export const playMusicCommand: Command = {
    name: "play",
    alias: ["p", "reproducir"],

    async execute(message: Message, args: string[]) {
        try {
            const member = message.member as GuildMember;
            const voiceChannel = member.voice.channel as VoiceChannel | null;
            if (!voiceChannel) {
                message.channel.send("Debes estar en un canal de voz para usar este comando.");
                return;
            }

            const query = args.join(" ");
            console.log("Entrada de texto inicial:", query);
            if (!query) {
                message.channel.send("No se proporcionó una consulta.");
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
                return;
            }

            const guildId = member.guild.id;

            if (connection.state.status !== VoiceConnectionStatus.Ready) {
                message.channel.send(
                    "No se pudo conectar al canal de voz. Por favor, intenta nuevamente."
                );
                return;
            }

            const result = await searchAndGetURL(query);

            if (!result) {
                message.channel.send(
                    "Por favor, proporciona un enlace válido de YouTube o SoundCloud, o asegúrate de que el nombre de la canción sea correcto."
                );
                return;
            }

            if (connection) {
                let audioPlayer = getAudioPlayer(guildId);
                if (!audioPlayer) {
                    audioPlayer = createAudioPlayer();
                    setAudioPlayer(guildId, audioPlayer);
                    setupAudioPlayerEvents(
                        audioPlayer,
                        message.channel,
                        connection,
                        voiceChannel,
                        guildId
                    );
                }
                connection.subscribe(audioPlayer);

                const isPlaying = audioPlayer.state.status === AudioPlayerStatus.Playing;

                musicQueue.addSong(guildId, result);

                if (!isPlaying) {
                    const nextSong = musicQueue.getNextSong(guildId);
                    if (nextSong) {
                        await playSong(nextSong.url, audioPlayer, message.channel, guildId);
                    } else {
                        message.channel.send("No hay más canciones en la cola.");
                    }
                } else {
                    message.channel.send(`Canción añadida a la cola: ${result.title}`);
                }
            }
        } catch (error) {
            console.error("Ocurrió un error inesperado:", error);
            message.channel.send(
                "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde."
            );
        }
    },
};
