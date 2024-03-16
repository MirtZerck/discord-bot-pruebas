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
  // Configuración del comando slash, estableciendo su nombre y descripción
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Revisa los comandos existentes"),

  // Función que se ejecutará cuando se invoque el comando '/help'
  async execute(interaction) {
    // Definición de categorías para clasificar los comandos disponibles
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

    // Creación de un botón de cancelación para cerrar el menú de ayuda
    const cancelButton = new ButtonBuilder()
      .setCustomId("cancelar")
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger);

    // Agrupación del botón en una fila de componentes para su inclusión en mensajes
    const buttonComponents = new ActionRowBuilder().addComponents(cancelButton);

    // Creación de un menú desplegable para la selección de categorías de comandos
    const menuOptions = new StringSelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("Selecciona una categoría");

    // Variable para acumular los nombres de las categorías para el mensaje inicial
    let stringCategories = "";

    // Agregación de opciones al menú desplegable basado en las categorías definidas
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

    // Creación de un mensaje incrustado inicial para el usuario
    const initialEmbed = new EmbedBuilder()
      .setAuthor({ name: "Gatos Gatunos" })
      .setDescription(
        `Selecciona una categoría\n\n**Categorías Disponibles:**\n${stringCategories}`
      )
      .setColor(0x81d4fa)
      .setTimestamp();

    // Agrupación del menú desplegable en una fila de componentes
    const menuComponents = new ActionRowBuilder().addComponents(menuOptions);

    // Envío del mensaje incrustado inicial con los componentes (menú y botón)
    const response = await interaction.reply({
      embeds: [initialEmbed],
      components: [menuComponents, buttonComponents],
      ephemeral: true,
    });

    // Creación de un recolector de interacciones con los componentes enviados
    const collector = await response.createMessageComponentCollector({
      time: 5 * 60 * 1000,
    });

    // Manejo de interacciones con componentes recolectados
    collector.on("collect", async (componentInteraction) => {
      // Verificación de que la interacción proviene del usuario que invocó el comando
      if (componentInteraction.user.id !== interaction.user.id) {
        await componentInteraction.reply({
          content: "No puedes interactuar con este menú.",
          ephemeral: true,
        });
        return;
      }

      // Manejo específico para interacciones con menús desplegables
      if (componentInteraction.isStringSelectMenu()) {
        const category = componentInteraction.values[0]; // Categoría seleccionada por el usuario

        // Obtención del mensaje incrustado específico para la categoría seleccionada
        const embedCategory = getEmbedByCategory(
          category,
          componentInteraction
        );

        // Marcar la opción seleccionada como predeterminada en el menú
        menuOptions.options.forEach((option) => {
          option.setDefault(option.data.label === category);
        });
        menuComponents.setComponents(menuOptions);

        // Actualización del mensaje con la nueva información de la categoría seleccionada
        return await componentInteraction.update({
          embeds: [embedCategory],
          components: [menuComponents, buttonComponents],
        });
      }

      // Manejo específico para interacciones con botones
      if (componentInteraction.isButton()) {
        if (componentInteraction.customId === "cancelar") {
          // Creación de un mensaje incrustado para indicar la cancelación
          const embedCancelado = new EmbedBuilder()
            .setTitle("Ayuda")
            .setDescription("Menú Cerrado")
            .setColor(Colors.DarkRed)
            .setTimestamp();

          // Edición del mensaje para mostrar el mensaje de cancelación y remover componentes
          await response.edit({ embeds: [embedCancelado], components: [] });

          // Detención del recolector de interacciones
          return collector.stop("cancelado");
        }
      }
    });

    // Manejo del evento de finalización del recolector
    collector.on("end", async (collected, reason) => {
      // Eliminación del mensaje después de un breve tiempo
      setTimeout(() => {
        response.delete();
      }, 5 * 1000);

      // Si la razón de finalización es la cancelación, no se hace nada más
      if (reason === "cancelado") return;

      // Creación de un mensaje incrustado para indicar la finalización por tiempo
      const embedTimeOut = new EmbedBuilder()
        .setTitle("Ayuda")
        .setDescription("Se ha terminado el tiempo")
        .setColor(Colors.DarkRed)
        .setTimestamp();

      // Edición del mensaje para mostrar el mensaje de tiempo agotado y remover componentes
      return await response.edit({ embeds: [embedTimeOut], components: [] });
    });
  },
};

// Función para obtener el mensaje incrustado específico de una categoría
function getEmbedByCategory(category, interaction) {
  let description = ""; // Descripción de comandos en la categoría
  let titulo = ""; // Título del mensaje incrustado
  let objectReplys = {}; // Objeto para almacenar respuestas o comandos de la categoría

  // Selección del objeto de respuestas y título basado en la categoría
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

  // Construcción de la descripción del mensaje incrustado con los comandos de la categoría
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

  // Creación y retorno del mensaje incrustado para la categoría
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
