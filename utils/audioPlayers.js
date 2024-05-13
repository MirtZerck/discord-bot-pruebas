const audioPlayers = new Map();

function getAudioPlayer(guildId) {
  return audioPlayers.get(guildId);
}

function setAudioPlayer(guildId, audioPlayer) {
  audioPlayers.set(guildId, audioPlayer);
}

export { audioPlayers, getAudioPlayer, setAudioPlayer };
