import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import { SlashCommandBuilder } from "@discordjs/builders";
import ytdl from "ytdl-core";
import { GuildMember } from "discord.js";
import { updatePlayTimeMusic } from "../../db_service/commands_service.js";

export const playMusicCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce una canción de YouTube.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("El enlace de YouTube de la canción a reproducir")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const url = interaction.options.getString("url");
      if (!ytdl.validateURL(url)) {
        await interaction.reply(
          "Por favor, proporciona un enlace de YouTube válido."
        );
        return;
      }

      const member = interaction.member;
      if (!(member instanceof GuildMember) || !member.voice.channel) {
        await interaction.reply(
          "Debes estar en un canal de voz para usar este comando."
        );
        return;
      }

      const channel = member.voice.channel;
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play, // Continúa reproduciendo incluso si todos se desconectan
        },
      });

      const serverId = interaction.guild.id;

      let playTime = 0;
      const playTimeInterval = setInterval(() => {
        playTime += 1000;
        updatePlayTimeMusic(serverId, playTime);
      }, 1000);

      player.on("stateChange", (oldState, newState) => {
        if (newState.status === "idle" && oldState.status === "playing") {
          clearInterval(playTimeInterval);
          updatePlayTimeMusic(serverId, playTime);
        }
      });

      player.on("error", (error) => {
        console.error(`Error en el reproductor de audio: ${error.message}`);
        console.log("Intentando reconectar y reproducir nuevamente...");
        clearInterval(playTimeInterval);
        attemptReconnectAndRestart(connection, interaction);
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        attemptReconnectAndRestart(connection, interaction); // Intentar reconectar cuando la conexión se pierda
      });

      const stream = ytdl(url, { filter: "audioonly" });
      const resource = createAudioResource(stream);
      player.play(resource);
      connection.subscribe(player);

      await interaction.reply(`Reproduciendo ahora: ${url}`);
    } catch (error) {
      console.error("Ocurrió un error inesperado:", error);
      try {
        await interaction.reply(
          "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde."
        );
      } catch (replyError) {
        console.error(
          "Error al intentar enviar un mensaje de error al usuario:",
          replyError
        );
      }
    }
  },
};

async function attemptReconnectAndRestart(
  connection,
  interaction,
  attempts = 0
) {
  if (attempts >= 5) {
    await interaction.followUp(
      "Ha ocurrido un error, por favor intenta más tarde."
    );
    connection.destroy();
    return;
  }

  try {
    await Promise.race([
      entersState(connection, VoiceConnectionStatus.Ready, 5_000),
    ]);
    /*  await interaction.followUp(
        `Reconexión exitosa al canal de voz. Continuando reproducción.`
      ); */

    const url = interaction.option.getString("url");
    const stream = ytdl(url, { filter: "audioonly" });
    const resource = createAudioResource(stream);
    player.play(resource);
  } catch (error) {
    console.log(`Reintentando reconexión (${attempts + 1}/5)`);
    await new Promise((resolve) => setTimeout(resolve, (attempts + 1) * 1000));
    attemptReconnectAndRestart(connection, interaction, attempts + 1);
  }
}
