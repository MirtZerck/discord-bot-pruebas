import { EmbedBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { prefijo } from "../constants/prefix.js";
import { getReplys } from "../constants/answers.js";
import { getReplysDelete } from "../constants/answers_delete.js";
import { getArrayCommandsObject } from "../constants/lista_comandosxd.js";
import { linksImages } from "../constants/links_images.js";

export const helpSlashCommands = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Revisa los comandos existentes"),

  async execute(interaction) {
    const categories = [
      {
        name: "Respuesta",
        description: "Te respondo.",
        emoji: "❤️",
      },
      {
        name: "Respuesta Anónima",
        description: "Nadie sabrá que fuiste tú.",
        emoji: "🕵️",
      },
      {
        name: "Imágenes",
        description: "Te envío Imágenes.",
        emoji: "🖼️",
      },
      {
        name: "Utilidad",
        description: "Comandos Útiles",
        emoji: "🤖",
      },
    ];

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancelar")
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger);

    const buttonComponents = new ActionRowBuilder().addComponents(cancelButton);

    const menuOptions = new StringSelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("Selecciona una categoría");

    let stringCategories = "";

    categories.forEach((category) => {
      menuOptions.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(category.name)
          .setValue(category.name)
          .setDescription(category.description)
          .setEmoji(category.emoji)
      );
      stringCategories += `${category.name}\n`;
    });
    const initialEmbed = new EmbedBuilder()
      .setAuthor({ name: "Gatos Gatunos" })
      .setDescription(
        `Selecciona una categoría\n\n**Categorías Disponibles:**\n${stringCategories}`
      )
      .setColor(0x81d4fa)
      .setTimestamp();

    const menuComponents = new ActionRowBuilder().addComponents(menuOptions);

    const response = await interaction.reply({
      embeds: [initialEmbed],
      components: [menuComponents, buttonComponents],
      ephemeral: true,
    });

    const collector = await response.createMessageComponentCollector({
      time: 5 * 60 * 1000,
    });
    collector.on("collect", async (componentInteraction) => {
      if (componentInteraction.user.id !== interaction.user.id) {
        await componentInteraction.reply({
          content: "No puedes interactuar con este menú.",
          ephemeral: true,
        });
        return;
      }
      if (componentInteraction.isStringSelectMenu()) {
        const category = componentInteraction.values[0];

        const embedCategory = getEmbedByCategory(
          category,
          componentInteraction
        );
        menuOptions.options.forEach((option) => {
          option.setDefault(option.data.label === category);
        });
        menuComponents.setComponents(menuOptions);

        return await componentInteraction.update({
          embeds: [embedCategory],
          components: [menuComponents, buttonComponents],
        });
      }
      if (componentInteraction.isButton()) {
        if (componentInteraction.customId === "cancelar") {
          const embedCancelado = new EmbedBuilder()
            .setTitle("Ayuda")
            .setDescription("Menú Cerrado")
            .setColor(Colors.DarkRed)
            .setTimestamp();
          await response.edit({ embeds: [embedCancelado], components: [] });
          return collector.stop("cancelado");
        }
      }
    });
    collector.on("end", async (collected, reason) => {
      setTimeout(() => {
        response.delete();
      }, 5 * 1000);

      if (reason === "cancelado") return;

      const embedTimeOut = new EmbedBuilder()
        .setTitle("Ayuda")
        .setDescription("Se ha terminado el tiempo")
        .setColor(Colors.DarkRed)
        .setTimestamp();

      return await response.edit({ embeds: [embedTimeOut], components: [] });
    });
  },
};

function getEmbedByCategory(category, interaction) {
  let description = "";
  let titulo = "";
  let objectReplys = {};

  if (category === "Respuesta") {
    objectReplys = getReplys("", "", "", []);
    titulo = "Comandos de Respuesta";
  } else if (category === "Respuesta Anónima") {
    objectReplys = getReplysDelete("", "", "", "");
    titulo = "Comandos de Respuesta Anónima";
  } else if (category === "Imágenes") {
    objectReplys = linksImages;
    titulo = "Comandos de Imágen";
  } else if (category === "Utilidad") {
    objectReplys = getArrayCommandsObject();
    titulo = "Comandos de Utilidad";
  }
  const replysKeys = Object.keys(objectReplys);

  if (category === "Utilidad") {
    replysKeys.forEach((keys) => {
      description += `\n > - ${keys}, [${objectReplys[keys]}] `;
    });
  } else {
    replysKeys.forEach((keys) => {
      description += `\n > - ${keys} `;
    });
  }

  const embedHelp = new EmbedBuilder()
    .setAuthor({
      name: interaction.member.nickname ?? interaction.user.globalName,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(titulo)
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`**>> Estos son los comandos actuales** ${description}`)
    .setColor(0x81d4fa)
    .setFooter({ text: `${prefijo}help 1-4` })
    .setTimestamp();

  return embedHelp;
}
