import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { ProposalService } from "../db_service/proposalsService.js";
import { isImage } from "../utils/utilsFunctions.js";
import { getDynamicColor } from "../utils/getDynamicColor.js";

export const proposalCommand = {
  name: "proposals",
  alias: ["prop", "props", "propuesta"],

  async execute(message, args) {
    const guildID = message.guild.id;
    const proposalsDB = new ProposalService(guildID);

    const [category, imgUrl] = args;
    const example = "Ejemplo: `+prop some https://example.com/image.png`";

    if (!category)
      return message.reply(
        `Debes especificar una **categoría** y una **imagen (url)**.\n${example}`
      );

    const attachImg = message.attachments.first()?.url;
    const attachExt = message.attachments.first()?.contentType;

    if (!imgUrl && !attachImg)
      return message.reply(
        `Debes especificar una **categoría** y una **imagen (url)**.\n${example}`
      );

    if (!(await isImage(imgUrl)) && !attachExt?.includes("image"))
      return message.reply("La url no es una imagen.");

    const imgProp = attachImg ?? imgUrl;

    const embedPrev = new EmbedBuilder()
      .setAuthor({
        name: message.member.displayName,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("Propuesta")
      .setDescription(`**Categoría:** ${category}\n**Imagen:** ${imgProp}`)
      .setImage(imgProp)
      .setColor(getDynamicColor(message.member))
      .setFooter({
        text: "Confirma con los botones si quieres enviar la solicitud",
      });

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancelar")
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger);

    const checkButton = new ButtonBuilder()
      .setCustomId("aceptar")
      .setLabel("Aceptar")
      .setStyle(ButtonStyle.Success);

    const buttonComponents = new ActionRowBuilder().addComponents(
      cancelButton,
      checkButton
    );

    const response = await message.channel.send({
      embeds: [embedPrev],
      components: [buttonComponents],
      content: "Tu propuesta será la siguiente. ¿Deseas enviarla?",
    });

    const collector = await response.createMessageComponentCollector({
      time: 3 * 60 * 1000,
    });
    collector.on("collect", async (componentmessage) => {
      if (componentmessage.user.id !== message.author.id) {
        await componentmessage.reply({
          content: "No puedes interactuar con esta propuesta",
          ephemeral: true,
        });
        return;
      }
      if (componentmessage.customId === "cancelar")
        return collector.stop("cancelado");

      if (componentmessage.customId === "aceptar") {
        proposalsDB
          .setProposal({
            category: category,
            image: imgProp,
            user: message.author.id,
            date: new Date().toLocaleString(),
          })
          .then(() => {
            embedPrev
              .setFooter({
                text: "Deberás esperar a que se acepte tu solicitud",
              })
              .setColor(Colors.Green);
            response.edit({
              content: "Tu propuesta ha sido enviada con éxito.",
              embeds: [embedPrev],
              components: [],
            });
          })
          .catch((error) => {
            return error === "La propuesta ya existe!"
              ? collector.stop("existente")
              : collector.stop("error");
          });
        await response.edit({ components: [], content: "" });
        return collector.stop("aceptada");
      }
    });
    collector.on("end", async (collected, reason) => {
      if (reason === "aceptada") return;

      const responses = {
        existente: "La propuesta ya existe! Por lo tanto no se ha enviado.",
        cancelado: `Propuesta **${category}** cancelada.`,
        error:
          "Ha ocurrido un error al enviar tu propuesta. Por favor, intenta de nuevo.",
      };
      const defaultResponse = `Propuesta **${category}** cancelada por falta de tiempo.`;

      const description = responses[reason] ?? defaultResponse;
      const embedOver = new EmbedBuilder()
        .setAuthor({
          name: message.member.displayName,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(description)
        .setColor(Colors.DarkRed)
        .setTimestamp();

      return await response.edit({
        embeds: [embedOver],
        components: [],
        content: "",
      });
    });
  },
};
