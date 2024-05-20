import { getVoiceConnection, AudioPlayerStatus, VoiceConnection } from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import { getAudioPlayer } from "./audioPlayers.js";

// Extendemos VoiceConnection para incluir la propiedad inactivityTimeout
interface ExtendedVoiceConnection extends VoiceConnection {
    inactivityTimeout?: NodeJS.Timeout;
}

export async function checkAndDisconnectIfAloneOrInactive(
    connection: ExtendedVoiceConnection,
    channel: VoiceChannel,
    guildId: string
) {
    if (connection.inactivityTimeout) clearTimeout(connection.inactivityTimeout);
    connection.inactivityTimeout = setTimeout(async () => {
        const currentConnection = getVoiceConnection(guildId) as ExtendedVoiceConnection;
        if (currentConnection !== connection) {
            console.log("La conexión ha cambiado o ya no es relevante.");
            return;
        }

        const freshChannel = await channel.guild.channels.fetch(channel.id) as VoiceChannel;
        if (!freshChannel) {
            console.log("El canal ya no existe.");
            connection.destroy();
            return;
        }

        const memberCount = freshChannel.members.filter(
            (member) => !member.user.bot
        ).size;

        // Verificar si no hay usuarios humanos en el canal
        if (memberCount === 0) {
            console.log("Desconectado porque no hay más usuarios en el canal...");
            connection.destroy();
            return;
        }

        // Obtener el reproductor de audio para el servidor
        const player = getAudioPlayer(guildId);

        // Verificar si el reproductor no está reproduciendo nada
        if (player && player.state.status !== AudioPlayerStatus.Playing) {
            console.log("Desconectado porque no se está reproduciendo nada...");
            connection.destroy();
            return;
        }

        console.log(
            "Aún hay usuarios en el canal y el bot está reproduciendo algo."
        );
    }, 180000); // 180000 ms = 3 minutos
}
