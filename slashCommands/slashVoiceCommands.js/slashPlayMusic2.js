/* import {
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
import { spotifyApi } from "../../michi.js";

export const playMusicCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce una canción.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription(
          "El nombre de la canción o un enlace de Spotify para reproducir"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const query = interaction.options.getString("query");
      const data = await spotifyApi.searchTracks(query);
      const track = data.body.tracks.items[0];
      if (!track) {
        await interaction.reply(
          "No se encontraron canciones que coincidan con tu búsqueda en Spotify."
        );
        return;
      }
      const trackUrl = track.external_urls.spotify; // Obtiene el enlace externo de Spotify
      await interaction.reply(
        `Escucha ahora: [${track.name}](${trackUrl}) en Spotify. 🎧`
      );
    } catch (error) {
      console.error("Ocurrió un error al procesar tu solicitud:", error);

      const member = interaction.member;
      if (!(member instanceof GuildMember) || !member.voice.channel) {
        await interaction.reply(
          "Debes estar en un canal de voz para usar este comando."
        );
        return;
      }

      if (error.statusCode === 401) {
        await interaction.reply(
          "Hubo un problema de autenticación con Spotify. Por favor, intenta nuevamente más tarde."
        );
      } else if (error.statusCode === 429) {
        await interaction.reply(
          "Se ha alcanzado el límite de solicitudes a Spotify. Por favor, intenta nuevamente más tarde."
        );
      } else {
        await interaction.reply(
          "Ocurrió un error al buscar la canción en Spotify. Por favor, intenta nuevamente más tarde."
        );
      }
    }
  },
};
 */