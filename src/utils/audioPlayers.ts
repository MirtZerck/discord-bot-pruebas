import { AudioPlayer } from "@discordjs/voice";

const audioPlayers = new Map<string, AudioPlayer>();

function getAudioPlayer(guildId: string): AudioPlayer | undefined {
    return audioPlayers.get(guildId);
}

function setAudioPlayer(guildId: string, audioPlayer: AudioPlayer) {
    audioPlayers.set(guildId, audioPlayer);
}

function deleteAudioPlayer(guildId: string) {
    audioPlayers.delete(guildId);
}

export { audioPlayers, getAudioPlayer, setAudioPlayer, deleteAudioPlayer };
