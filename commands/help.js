import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { getReplys } from "../constants/answers.js";
import { getReplysDelete } from "../constants/answers_delete.js";
import { linksImages } from "../constants/links_images.js";
import { getArrayCommandsObject } from "../constants/lista_comandosxd.js";
import { prefijo } from "../constants/prefix.js";

export const helpCommand = {
  name: "help",
  alias: ["h"],

  async execute(message, args) {
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

    const response = await message.reply({
      embeds: [initialEmbed],
      components: [menuComponents, buttonComponents],
      ephemeral: true,
    });

    const collector = await response.createMessageComponentCollector({
      time: 5 * 60 * 1000,
    });
    collector.on("collect", async (componentmessage) => {
      if (componentmessage.user.id !== message.author.id) {
        await componentmessage.reply({
          content: "No puedes interactuar con este menú.",
          ephemeral: true,
        });
        return;
      }
      if (componentmessage.isStringSelectMenu()) {
        const category = componentmessage.values[0];

        const embedCategory = getEmbedByCategory(category, componentmessage);
        menuOptions.options.forEach((option) => {
          option.setDefault(option.data.label === category);
        });
        menuComponents.setComponents(menuOptions);

        return await componentmessage.update({
          embeds: [embedCategory],
          components: [menuComponents, buttonComponents],
        });
      }
      if (componentmessage.isButton()) {
        if (componentmessage.customId === "cancelar") {
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

function getEmbedByCategory(category, message) {
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
      name: message.member.nickname ?? message.user.globalName,
      iconURL: message.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(titulo)
    .setThumbnail(message.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`**>> Estos son los comandos actuales** ${description}`)
    .setColor(0x81d4fa)
    .setFooter({ text: `${prefijo}help 1-4` })
    .setTimestamp();

  return embedHelp;
}
