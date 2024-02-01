import { db } from "../michi.js";
import { getRankXpellitDiscord } from "../constants/clanService.js";
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { rolDarkWish, rolXpellGames } from "../constants/rolesID.js";

export const xpellitRankingServidor = {
  name: "rankingservidor",
  alias: ["rankserver", "rs"],

  async execute(message, args) {
    if (!message.member.roles.cache.get(rolDarkWish)) return;

    const rankingDiscord = await getRankXpellitDiscord();
    if (!rankingDiscord) return message.reply("No existe todavía");
    const rank = Object.entries(rankingDiscord);

    // Sort rank from highest to lowest points
    rank.sort((a, b) => {
      return b[1].puntos - a[1].puntos;
    });

    const itemsPerPage = 50;
    const totalPages = Math.ceil(rank.length / itemsPerPage);
    let currentPage = 1;

    const displayRank = () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentRank = rank.slice(startIndex, endIndex);

      let puestos = "";
      currentRank.forEach((val, i) => {
        puestos += `**${startIndex + i + 1}.** ${val[1].nickname}: ${val[1].puntos}\n`;
      });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Ranking miembros más activos en Discord - Página ${currentPage}/${totalPages}`)
        .setDescription(`${puestos}`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor(0x81d4fa)
        .setFooter({ text: "Este es el ranking de actividad del servidor" })
        .setTimestamp();

      return embed;
    };

    const buttonComponents = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("prevPage")
          .setLabel("Anterior")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("nextPage")
          .setLabel("Siguiente")
          .setStyle(ButtonStyle.Success)
      );

    const response = await message.channel.send({ embeds: [displayRank()], components: [buttonComponents] });

    const collector = response.createMessageComponentCollector({
      time: 60000, // 60 seconds
    });

    collector.on("collect", async (componentmessage) => {
      if (componentmessage.isButton()) {
        if (componentmessage.customId === "prevPage" && currentPage > 1) {
          currentPage--;
        } else if (componentmessage.customId === "nextPage" && currentPage < totalPages) {
          currentPage++;
        }

        await componentmessage.update({ embeds: [displayRank()], components: [buttonComponents] });
      }
    });

    collector.on("end", async () => {
      await response.edit({ components: [] });
    });
  },
};
