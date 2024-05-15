import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus,
} from "@discordjs/voice";
import play from "play-dl";
import { GuildMember } from "discord.js";
import { checkAndDisconnectIfAloneOrInactive } from "../../utils/voiceStateHandler.js";
import { musicQueue } from "../../utils/musicQueue.js";
import { getAudioPlayer, setAudioPlayer } from "../../utils/audioPlayers.js";

async function searchAndGetURL(query) {
  try {
    let url = query.match(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|soundcloud\.com)\/.+$/i
    )
      ? query
      : null;

    if (!url) {
      console.log("Buscando tu canción...");
      const searchResults = await play.search(query, { limit: 1 });
      if (searchResults.length > 0) {
        url = searchResults[0].url;
      }
    }

    if (!url || !(await play.validate(url))) {
      return null;
    }

    return url;
  } catch (error) {
    console.error("Error al buscar y obtener la URL:", error);
    return null;
  }
}

async function handleVoiceConnection(member) {
  const guildId = member.guild.id;
  let connection = getVoiceConnection(guildId);

  if (
    connection &&
    connection.joinConfig.channelId !== member.voice.channel.id
  ) {
    const existingChannel = member.guild.channels.cache.get(
      connection.joinConfig.channelId
    );
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
          channelId: member.voice.channel.id,
          guildId: guildId,
          adapterCreator: member.guild.voiceAdapterCreator,
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
        channelId: member.voice.channel.id,
        guildId: guildId,
        adapterCreator: member.guild.voiceAdapterCreator,
      });

      checkAndDisconnectIfAloneOrInactive(
        connection,
        member.voice.channel,
        guildId
      );
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

export async function playSong(songUrl, audioPlayer, textChannel, guildId) {
  try {
    const stream = await play.stream(songUrl);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });
    audioPlayer.play(resource);
    textChannel.send(`Reproduciendo: ${songUrl}`);
  } catch (error) {
    console.error(`Error al intentar reproducir la canción ${songUrl}:`, error);
    textChannel.send("La canción no está disponible o no se puede reproducir.");
  }
}

function setupAudioPlayerEvents(
  audioPlayer,
  textChannel,
  connection,
  voiceChannel,
  guildId
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
          await playSong(nextSong, audioPlayer, textChannel, guildId);
        } else {
          textChannel.send("La reproducción ha terminado.");
          checkAndDisconnectIfAloneOrInactive(
            connection,
            voiceChannel,
            guildId
          );
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

export const playMusicCommand = {
  name: "play",
  alias: ["p", "reproducir"],

  async execute(message, args) {
    try {
      const query = args.join(" ");
      console.log("Entrada de texto inicial:", query);
      if (!query) {
        message.channel.send("No se proporcionó una consulta.");
        return;
      }

      const url = await searchAndGetURL(query);

      if (!url) {
        message.channel.send(
          "Por favor, proporciona un enlace válido de YouTube o SoundCloud, o asegúrate de que el nombre de la canción sea correcto."
        );
        return;
      }

      const member = message.member;
      if (!(member instanceof GuildMember) || !member.voice.channel) {
        message.channel.send(
          "Debes estar en un canal de voz para usar este comando."
        );
        return;
      }

      const {
        status,
        connection,
        message: connectionMessage,
      } = await handleVoiceConnection(member);
      if (status === "error") {
        message.channel.send(connectionMessage);
        return;
      }

      const guildId = member.guild.id;

      let audioPlayer = getAudioPlayer(guildId);
      if (!audioPlayer) {
        audioPlayer = createAudioPlayer();
        setAudioPlayer(guildId, audioPlayer);
        setupAudioPlayerEvents(
          audioPlayer,
          message.channel,
          connection,
          member.voice.channel,
          guildId
        );
      }
      connection.subscribe(audioPlayer);

      const isPlaying = audioPlayer.state.status === AudioPlayerStatus.Playing;

      musicQueue.addSong(guildId, url);

      if (!isPlaying) {
        const nextSong = musicQueue.getNextSong(guildId);
        await playSong(nextSong, audioPlayer, message.channel, guildId);
      } else {
        message.channel.send(`Canción añadida a la cola: ${url}`);
      }
    } catch (error) {
      console.error("Ocurrió un error inesperado:", error);
      message.channel.send(
        "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
