import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { ProposalService } from "../db_service/proposalsService.js";
import { mirtZerckID } from "../constants/users_ID.js";
import { isImage } from "../utils/utilsFunctions.js";
import { getDynamicColor } from "../utils/getDynamicColor.js";
import { getUser } from "../db_service/user_service.js";
import { getMemberByID } from "../constants/get-user.js";

export const proposalCommand = {
  name: "proposals",
  alias: ["prop", "props", "propuesta"],

  async execute(message, args) {
    const proposalsDB = new ProposalService(message.guild.id);

    const loxID = "591050519242342431";
    const modsID = [mirtZerckID, loxID];

    if (modsID.includes(message.author.id)) {
      /* Para mods */
      const proposals = await proposalsDB.getProposals();
      if (!proposals) {
        const embedEmptyProposals = new EmbedBuilder()
          .setTitle("Propuestas")
          .setDescription("No hay propuestas!")
          .setColor(Colors.DarkRed)
          .setTimestamp();
        return message.reply({ embeds: [embedEmptyProposals] });
      }

      const propsPerPage = 5;
      const propsLength = proposals.length;
      const pages = Math.ceil(propsLength / propsPerPage);
      let currentPage = 1;

      const closeButton = new ButtonBuilder()
        .setCustomId("cerrar")
        .setLabel("Cerrar")
        .setStyle(ButtonStyle.Danger);

      const previousButton = new ButtonBuilder()
        .setCustomId("anterior")
        .setLabel("Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

      const nextButton = new ButtonBuilder()
        .setCustomId("siguiente")
        .setLabel("Siguiente")
        .setStyle(ButtonStyle.Success)
        .setDisabled(propsLength <= propsPerPage);

      const buttonComponents = new ActionRowBuilder().addComponents(
        closeButton,
        previousButton,
        nextButton
      );

      const setTextAndMenuOptionsProps = (proposals) => {
        const menuOptions = new StringSelectMenuBuilder()
          .setCustomId("select")
          .setPlaceholder("Selecciona una propuesta");

        let propText = "";
        const props = proposals.slice(
          (currentPage - 1) * propsPerPage,
          currentPage * propsPerPage
        );
        props.forEach((p, index) => {
          const prop = p[1];
          const id = p[0];
          const i = propsPerPage * (currentPage - 1) + index + 1;
          const user =
            getMemberByID(message, prop.user)?.displayName ?? "Unknown";
          propText += `**${i}.** ${prop.category} - Propuesto por: ${user}\n`;

          const option = new StringSelectMenuOptionBuilder()
            .setLabel(`${i}. ${prop.category} - Por: ${user}`)
            .setValue(id.toString())
            .setDescription(prop.date);
          menuOptions.addOptions(option);
        });
        return [propText, menuOptions];
      };

      const [propText, menuOptions] = setTextAndMenuOptionsProps(proposals);
      const embedProps = new EmbedBuilder()
        .setAuthor({
          name: "Gatos Gatunos Bot",
          iconURL:
            "https://w0.peakpx.com/wallpaper/961/897/HD-wallpaper-bunny-cute-rabbit-animal.jpg",
        })
        .setTitle("Propuestas de comandos")
        .setDescription(propText)
        .setColor("Random")
        .setTimestamp();

      const menuComponents = new ActionRowBuilder().addComponents(menuOptions);

      const response = await message.reply({
        embeds: [embedProps],
        components: [buttonComponents, menuComponents],
        content: "Selecciona una propuesta para ver sus detalles.",
      });

      const collector = await response.createMessageComponentCollector({
        time: 5 * 60 * 1000,
      });

      collector.on("collect", async (componentmessage) => {
        if (componentmessage.user.id !== message.author.id) {
          await componentmessage.reply({
            content: "No puedes interactuar con esta propuesta",
            ephemeral: true,
          });
          return;
        }
        if (componentmessage.customId === "cerrar")
          return collector.stop("cerrado");
        if (componentmessage.customId === "anterior") {
          currentPage--;
          if (currentPage === 1) previousButton.setDisabled(true);
          nextButton.setDisabled(false);
          buttonComponents.setComponents([
            closeButton,
            previousButton,
            nextButton,
          ]);
          const [newProps, menuOptions] = setTextAndMenuOptionsProps(proposals);
          const menuComponents = new ActionRowBuilder().addComponents(
            menuOptions
          );
          embedProps.setDescription(newProps);
          await response.edit({
            embeds: [embedProps],
            components: [buttonComponents, menuComponents],
          });
          return;
        }
        if (componentmessage.customId === "siguiente") {
          currentPage++;
          const [newProps, menuOptions] = setTextAndMenuOptionsProps(proposals);
          const menuComponents = new ActionRowBuilder().addComponents(
            menuOptions
          );
          embedProps.setDescription(newProps);
          if (currentPage === pages) nextButton.setDisabled(true);
          previousButton.setDisabled(false);
          buttonComponents.setComponents([
            closeButton,
            previousButton,
            nextButton,
          ]);
          await response.edit({
            embeds: [embedProps],
            components: [buttonComponents, menuComponents],
          });
          return;
        }
        if (componentmessage.isStringSelectMenu()) {
          const index = Number(componentmessage.values[0]);
          const prop = proposals[index][1];
          const member = getMemberByID(message, prop.user);
          const embedProp = new EmbedBuilder()
            .setAuthor({
              name: `Propuesta de ${member?.displayName ?? "Unknown"}`,
              iconURL: member?.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Propuesta")
            .setImage(prop.image)
            .setDescription(
              `**Categoría:** ${prop.category}\n**Imagen:** ${prop.image}`
            )
            .setColor("Random")
            .setTimestamp();

          const backButton = new ButtonBuilder()
            .setCustomId("volver")
            .setLabel("Volver")
            .setStyle(ButtonStyle.Secondary);

          const checkButton = new ButtonBuilder()
            .setCustomId("aceptar")
            .setLabel("Aceptar")
            .setStyle(ButtonStyle.Success);

          const rejectButton = new ButtonBuilder()
            .setCustomId("rechazar")
            .setLabel("Rechazar")
            .setStyle(ButtonStyle.Danger);

          const buttonComponents = new ActionRowBuilder().addComponents(
            backButton,
            rejectButton,
            checkButton
          );

          await response.edit({
            embeds: [embedProp],
            components: [buttonComponents],
            content: "¿Qué deseas hacer con esta propuesta?",
          });

          const collector2 = await response.createMessageComponentCollector({
            time: 3 * 60 * 1000,
          });

          collector2.on("collect", async (componentmessage2) => {
            if (componentmessage2.user.id !== message.author.id) {
              await componentmessage2.reply({
                content: "No puedes interactuar con esta propuesta",
                ephemeral: true,
              });
              return;
            }
            if (componentmessage2.customId === "volver") {
              /* REVISAR BOTONES */
              await response.edit({
                embeds: [embedProps],
                components: [buttonComponents, menuComponents],
                content: "Selecciona una propuesta para ver sus detalles.",
              });
              return collector2.stop("volver");
            }
            if (componentmessage2.customId === "aceptar") {
              await proposalsDB.deleteProposal(index);
              await componentmessage2.reply({
                content: "La propuesta ha sido aceptada.",
                ephemeral: true,
              });
              return collector2.stop("aceptada");
            }
            if (componentmessage2.customId === "rechazar") {
              await proposalsDB.deleteProposal(index);
              await componentmessage2.reply({
                content: "La propuesta ha sido rechazada.",
                ephemeral: true,
              });
              return collector2.stop("rechazada");
            }
          });

          collector2.on("end", async (collected, reason) => {
            if (reason === "volver") return;
            if (reason === "aceptada" || reason === "rechazada") {
              await response.edit({ components: [], content: "" });
              return collector.stop("cerrado");
            }
            const description = "Propuesta cancelada por falta de tiempo.";
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
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "cerrado") {
          const embedOver = new EmbedBuilder()
            .setAuthor({
              name: message.member.displayName,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription("Menú de propuestas cerrado.")
            .setColor(Colors.DarkRed)
            .setTimestamp();

          return await response.edit({
            embeds: [embedOver],
            components: [],
            content: "",
          });
        }
      });
    } else {
      /* Para usuarios */
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
    }
  },
};
