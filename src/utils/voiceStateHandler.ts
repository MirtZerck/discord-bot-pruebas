import { VoiceConnection, VoiceConnectionStatus, entersState } from "@discordjs/voice";
import { VoiceChannel, Client } from "discord.js";
import { getAudioPlayer, deleteAudioPlayer } from "./audioPlayers.js";

export const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 * 60 * 1000 (5 minutos en ms)
const CHECK_INTERVAL = 2 * 60 * 1000; // 2 * 60 * 1000 (2 minutos en ms)

function checkAndDisconnectIfAloneOrInactive(
    connection: VoiceConnection,
    voiceChannel: VoiceChannel,
    guildId: string,
    client: Client
) {
    let inactivityTimer: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const clearInactivityTimer = () => {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
    };

    const startInactivityTimer = () => {
        if (!inactivityTimer) {
            inactivityTimer = setTimeout(() => {
                const audioPlayer = getAudioPlayer(guildId);
                const stillAlone = voiceChannel.members.filter(member => !member.user.bot).size === 0;
                const stillInactive = audioPlayer?.state.status !== "playing" && audioPlayer?.state.status !== "buffering";
                if (stillAlone || stillInactive) {
                    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        connection.disconnect();
                        deleteAudioPlayer(guildId);
                    }
                }
            }, INACTIVITY_TIMEOUT);
        }
    };


    const checkConditions = () => {
        const audioPlayer = getAudioPlayer(guildId);
        const isAlone = voiceChannel.members.filter(member => !member.user.bot).size === 0;
        const isInactive = audioPlayer?.state.status !== "playing" && audioPlayer?.state.status !== "buffering";

        if (isAlone || isInactive) {
            startInactivityTimer();
        } else {
            clearInactivityTimer();
        }
    };

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        clearInactivityTimer();
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch (error) {
            if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                connection.destroy();                
            } else {
                
            }
        }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
        clearInactivityTimer();
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }        
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
        if (!intervalId) {
            intervalId = setInterval(() => {
                if (connection.state.status === VoiceConnectionStatus.Destroyed) {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                    console.log("Conexión destruida, deteniendo verificaciones periódicas.");
                } else {
                    checkConditions();
                }
            }, CHECK_INTERVAL);
        }
    });

    client.on("voiceStateUpdate", (oldState, newState) => {
        if (oldState.channelId !== newState.channelId) {
            checkConditions();
        }
    });
}

export { checkAndDisconnectIfAloneOrInactive };
