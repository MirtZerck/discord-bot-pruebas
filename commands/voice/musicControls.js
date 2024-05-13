import { AudioPlayerStatus } from "@discordjs/voice";
import { musicQueue } from "../../utils/musicQueue.js";
import { getAudioPlayer } from "../../utils/audioPlayers.js";
import {playSong} from "./playMusic.js"

function pause(guildId, textChannel) {
  const audioPlayer = getAudioPlayer(guildId);
  if (audioPlayer && audioPlayer.state.status === AudioPlayerStatus.Playing) {
    audioPlayer.pause();
    textChannel.send("Reproducción pausada.");
  } else {
    textChannel.send("No hay una canción en reproducción para pausar.");
  }
}

function resume(guildId, textChannel) {
  const audioPlayer = getAudioPlayer(guildId);
  if (audioPlayer && audioPlayer.state.status === AudioPlayerStatus.Paused) {
    audioPlayer.unpause();
    textChannel.send("Reproducción reanudada.");
  } else {
    textChannel.send("No hay una canción pausada para reanudar.");
  }
}

async function skip(guildId, textChannel) {
  const audioPlayer = getAudioPlayer(guildId);
  if (audioPlayer && audioPlayer.state.status === AudioPlayerStatus.Playing) {
    if (musicQueue.hasSongs(guildId)) {
      const nextSong = musicQueue.getNextSong(guildId);
      await playSong(nextSong, audioPlayer, textChannel, guildId);
      textChannel.send("Canción saltada.");
    } else {
      audioPlayer.stop();
      textChannel.send("No hay más canciones en la cola para saltar.");
    }
  } else {
    textChannel.send("No hay una canción en reproducción para saltar.");
  }
}

function stop(guildId, textChannel) {
  const audioPlayer = getAudioPlayer(guildId);
  if (audioPlayer) {
    musicQueue.clearQueue(guildId);
    audioPlayer.stop();
    textChannel.send("Reproducción detenida y cola limpiada.");
  } else {
    textChannel.send("No hay una canción en reproducción para detener.");
  }
}

const pauseCommand = {
  name: "pause",
  alias: ["pausar"],

  async execute(message, args) {
    const guildId = message.guild.id;
    const textChannel = message.channel;
    pause(guildId, textChannel);
  },
};

const resumeCommand = {
  name: "resume",
  alias: ["resumir"],

  async execute(message, args) {
    const guildId = message.guild.id;
    const textChannel = message.channel;
    resume(guildId, textChannel);
  },
};

const skipCommand = {
  name: "skip",
  alias: ["saltar"],

  async execute(message, args) {
    const guildId = message.guild.id;
    const textChannel = message.channel;
    await skip(guildId, textChannel);
  },
};

const stopCommand = {
  name: "stop",
  alias: ["detener"],

  async execute(message, args) {
    const guildId = message.guild.id;
    const textChannel = message.channel;
    stop(guildId, textChannel);
  },
};

export const arrayMusicControls = [
  pauseCommand,
  resumeCommand,
  skipCommand,
  stopCommand,
];
