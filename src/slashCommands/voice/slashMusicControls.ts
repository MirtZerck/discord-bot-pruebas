import {
    AudioPlayerStatus,
    getVoiceConnection,
    VoiceConnectionStatus,
    joinVoiceChannel,
    entersState,
    VoiceConnection,
} from "@discordjs/voice";
import {
    GuildMember,
    TextChannel,
    VoiceChannel,
    CommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
    CommandInteractionOptionResolver,
} from "discord.js";
import { musicQueue } from "../../utils/musicQueue.js";
import { getAudioPlayer } from "../../utils/audioPlayers.js";
import { playSong } from "./slashPlayMusic.js";
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

async function verifyUserInSameVoiceChannel(interaction: CommandInteraction): Promise<boolean> {
    const member = interaction.member as GuildMember;
    const botUser = interaction.client.user;
    if (!botUser) {
        await interaction.reply("No se pudo obtener la información del bot.");
        return false;
    }

    const voiceChannel = member.voice.channel as VoiceChannel | null;
    if (!voiceChannel) {
        await interaction.reply("Debes estar en un canal de voz para usar este comando.");
        return false;
    }

    const connection = getVoiceConnection(interaction.guild!.id);
    if (!connection) {
        await interaction.reply("El bot no está conectado a ningún canal de voz.");
        return false;
    }

    if (connection.joinConfig.channelId !== voiceChannel.id) {
        await interaction.reply("Debes estar en el mismo canal de voz que el bot para usar este comando.");
        return false;
    }

    return true;
}

async function handleVoiceConnection(member: GuildMember, interaction: CommandInteraction): Promise<{ status: string, connection?: VoiceConnection, message?: string }> {
    const guildId = member.guild.id;
    let connection = getVoiceConnection(guildId);

    const voiceChannel = member.voice.channel as VoiceChannel | null;
    if (!voiceChannel) {
        return {
            status: "error",
            message: "Debes estar en un canal de voz para usar este comando.",
        };
    }

    const botUser = interaction.client.user;
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

const musicCommand = new SlashCommandBuilder()
    .setName("music")
    .setDescription("Comandos de control de música")
    .addSubcommand(subcommand =>
        subcommand
            .setName("pause")
            .setDescription("Pausa la reproducción de música.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("resume")
            .setDescription("Reanuda la reproducción de música.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("skip")
            .setDescription("Salta la canción actual.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("stop")
            .setDescription("Detiene la reproducción de música y limpia la cola.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("disconnect")
            .setDescription("Desconecta el bot del canal de voz.")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("join")
            .setDescription("Une al bot al canal de voz.")
    );

const slashMusicControls = [
    { data: musicCommand, execute: executeSubcommand },
];

async function executeSubcommand(interaction: CommandInteraction) {
    const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();
    switch (subcommand) {
        case "pause":
            await executePauseCommand(interaction);
            break;
        case "resume":
            await executeResumeCommand(interaction);
            break;
        case "skip":
            await executeSkipCommand(interaction);
            break;
        case "stop":
            await executeStopCommand(interaction);
            break;
        case "disconnect":
            await executeDisconnectCommand(interaction);
            break;
        case "join":
            await executeJoinCommand(interaction);
            break;
        default:
            await interaction.reply("Subcomando no reconocido.");
            break;
    }
}

async function executePauseCommand(interaction: CommandInteraction) {
    if (await verifyUserInSameVoiceChannel(interaction)) {
        const guildId = interaction.guild!.id;
        const textChannel = interaction.channel as TextChannel;
        pause(guildId, textChannel);
        await interaction.reply("Reproducción pausada.");
    }
}

async function executeResumeCommand(interaction: CommandInteraction) {
    if (await verifyUserInSameVoiceChannel(interaction)) {
        const guildId = interaction.guild!.id;
        const textChannel = interaction.channel as TextChannel;
        resume(guildId, textChannel);
        await interaction.reply("Reproducción reanudada.");
    }
}

async function executeSkipCommand(interaction: CommandInteraction) {
    if (await verifyUserInSameVoiceChannel(interaction)) {
        const guildId = interaction.guild!.id;
        const textChannel = interaction.channel as TextChannel;
        await skip(guildId, textChannel);
        await interaction.reply("Canción saltada.");
    }
}

async function executeStopCommand(interaction: CommandInteraction) {
    if (await verifyUserInSameVoiceChannel(interaction)) {
        const guildId = interaction.guild!.id;
        const textChannel = interaction.channel as TextChannel;
        stop(guildId, textChannel);
        await interaction.reply("Reproducción detenida y cola limpiada.");
    }
}

async function executeDisconnectCommand(interaction: CommandInteraction) {
    if (await verifyUserInSameVoiceChannel(interaction)) {
        const guildId = interaction.guild!.id;
        const connection = getVoiceConnection(guildId);
        if (connection) {
            connection.destroy();
            await interaction.reply("Desconectado del canal de voz.");
        } else {
            await interaction.reply("El bot no está conectado a ningún canal de voz.");
        }
    }
}

async function executeJoinCommand(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel as VoiceChannel | null;
    if (!voiceChannel) {
        await interaction.reply("Debes estar en un canal de voz para usar este comando.");
        return;
    }

    const { status, connection, message } = await handleVoiceConnection(member, interaction);
    if (status === "error") {
        await interaction.reply(message || "Error de conexión desconocido.");
    } else if (!connection) {
        await interaction.reply("No se pudo establecer una conexión de voz.");
    } else {
        await interaction.reply(`Conectado al canal de voz: ${voiceChannel.name}`);
    }
}

export { slashMusicControls };
