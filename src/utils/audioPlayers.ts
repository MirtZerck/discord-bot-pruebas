import { AudioPlayer } from "@discordjs/voice";

const audioPlayers = new Map<string, AudioPlayer>();

function getAudioPlayer(guildId: string): AudioPlayer | undefined {
    return audioPlayers.get(guildId);
}

function setAudioPlayer(guildId: string, audioPlayer: AudioPlayer) {
    audioPlayers.set(guildId, audioPlayer);
}

export { audioPlayers, getAudioPlayer, setAudioPlayer };
