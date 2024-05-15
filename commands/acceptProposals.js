import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { ProposalService } from "../db_service/proposalsService.js";
import { getMemberByID } from "../constants/get-user.js";
import { CommandsService } from "../db_service/commandsService.js";

export const acceptProposalCommand = {
  name: "prop-list",
  alias: ["list-prop", "props-list", "list-props", "prop-l"],

  async execute(message, args) {
    const guildID = message.guild.id;
    const proposalsDB = new ProposalService(guildID);
    const commandsDB = new CommandsService(guildID);

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    )
      return message.reply("No tienes permisos para usar este comando.");
    const propsPerPage = 5;
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
      .setDisabled(true);

    const buttonComponents = new ActionRowBuilder().addComponents(
      closeButton,
      previousButton,
      nextButton
    );

    const renderProposals = async (message, proposals) => {
      if (!proposals || proposals.length === 0) {
        const embedEmptyProposals = new EmbedBuilder()
          .setTitle("Propuestas")
          .setDescription("No hay propuestas!")
          .setColor(Colors.DarkRed)
          .setTimestamp();
        return message.reply({ embeds: [embedEmptyProposals] });
      }

      const pages = Math.ceil(proposals.length / propsPerPage);
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

        switch (componentmessage.customId) {
          case "cerrar":
            collector.stop("cerrado");
            break;
          case "anterior":
            await handleNavigation("previous");
            break;
          case "siguiente":
            await handleNavigation("next");
            break;
          default:
            if (componentmessage.isStringSelectMenu()) {
              handleProposalSelection(componentmessage);
            }
            break;
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

          await response.edit({
            embeds: [embedOver],
            components: [],
            content: "",
          });
        }
        if (reason === "vacio") {
          const embedEmptyProposals = new EmbedBuilder()
            .setTitle("Propuestas")
            .setDescription("Ya no quedan propuestas!")
            .setColor(Colors.DarkRed)
            .setTimestamp();
          await response.edit({
            embeds: [embedEmptyProposals],
            components: [],
            content: "",
          });
          return;
        }
      });

      async function handleNavigation(direction) {
        currentPage += direction === "next" ? 1 : -1;
        const [newProps, newMenuOptions] =
          setTextAndMenuOptionsProps(proposals);
        embedProps.setDescription(newProps);
        nextButton.setDisabled(currentPage >= pages);
        previousButton.setDisabled(currentPage <= 1);
        buttonComponents.setComponents([
          closeButton,
          previousButton,
          nextButton,
        ]);
        await response.edit({
          embeds: [embedProps],
          components: [buttonComponents, newMenuOptions],
        });
      }

      async function handleProposalSelection(componentmessage) {
        const index = componentmessage.values[0];
        const prop = proposals.find((p) => p[0] === index)[1];
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

        const buttonPropComponents = new ActionRowBuilder().addComponents(
          backButton,
          rejectButton,
          checkButton
        );

        await response.edit({
          embeds: [embedProp],
          components: [buttonPropComponents],
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

          switch (componentmessage2.customId) {
            case "volver":
              await response.edit({
                embeds: [embedProps],
                components: [buttonComponents, menuComponents],
                content: "Selecciona una propuesta para ver sus detalles.",
              });
              collector2.stop("volver");
              break;
            case "aceptar":
              await handleProposalAction(
                componentmessage2,
                "aceptada",
                index,
                prop,
                response
              );
              collector2.stop("aceptada");
              break;
            case "rechazar":
              await handleProposalAction(
                componentmessage2,
                "rechazada",
                index,
                prop,
                response
              );
              collector2.stop("rechazada");
              break;
          }
        });

        collector2.on("end", async (collected, reason) => {
          if (reason === "volver") return;
          if (reason === "aceptada" || reason === "rechazada") {
            const updatedProposals = await proposalsDB.getProposals();
            if (!updatedProposals) return collector.stop("vacio");
            const [propText, menuOptions] =
              setTextAndMenuOptionsProps(updatedProposals);
            embedProps.setDescription(propText);
            menuComponents.setComponents(menuOptions);
            await response.edit({
              embeds: [embedProps],
              components: [buttonComponents, menuComponents],
              content: "Selecciona una propuesta para ver sus detalles.",
            });
            return;
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

          await response.edit({
            embeds: [embedOver],
            components: [],
            content: "",
          });
        });
      }
    };

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
          .setValue(id)
          .setDescription(prop.date);
        menuOptions.addOptions(option);
      });
      return [propText, menuOptions];
    };

    const handleProposalAction = async (
      componentmessage,
      action,
      index,
      prop
    ) => {
      await proposalsDB.deleteProposal(index);
      if (action === "aceptada") {
        await commandsDB.setUserReplyCommand(prop.category, prop.image);
      }

      await componentmessage.reply({
        content: `La propuesta ha sido ${action}.`,
        ephemeral: true,
      });
    };

    const proposals = await proposalsDB.getProposals();
    await renderProposals(message, proposals);
  },
};
