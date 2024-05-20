import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    Message,
} from "discord.js";
import { ProposalService } from "../db_service/proposalsService.js";
import { isImage } from "../utils/utilsFunctions.js";
import { getDynamicColor } from "../utils/getDynamicColor.js";
import { CustomImageURLOptions } from "../types/embeds.js";

export const proposalCommand = {
    name: "proposals",
    alias: ["prop", "props", "propuesta"],

    async execute(message: Message, args: string[]) {
        const guildID = message.guild!.id;
        const guildName = message.guild!.name;
        const proposalsDB = new ProposalService(guildID);
        const dynamicColor = getDynamicColor(message.member!)
        const [category, imgUrl] = args;
        const example = "Ejemplo: `+prop some https://example.com/image.png`";

        if (!category) {
            return message.reply(
                `Debes especificar una **categoría** y una **imagen (url)**.\n${example}`
            );
        }

        const attachment = message.attachments.first();
        const attachImg = attachment?.url;
        const attachExt = attachment?.contentType;

        if (!imgUrl && !attachImg) {
            return message.reply(
                `Debes especificar una **categoría** y una **imagen (url)**.\n${example}`
            );
        }

        const isImageValid = imgUrl ? await isImage(imgUrl) : attachExt?.includes("image");
        if (!isImageValid) {
            return message.reply("La url no es una imagen.");
        }

        const imgProp = attachImg ?? imgUrl;

        const embedPrev = new EmbedBuilder()
            .setAuthor({
                name: message.member!.displayName,
                iconURL: message.author.displayAvatarURL({ dynamic: true } as CustomImageURLOptions),
            })
            .setTitle("Propuesta")
            .setDescription(`**Categoría:** ${category}\n**Imagen:** ${imgProp}`)
            .setImage(imgProp)
            .setColor(dynamicColor)
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

        const buttonComponents = new ActionRowBuilder<ButtonBuilder>().addComponents(
            cancelButton,
            checkButton
        );

        const response = await message.channel.send({
            embeds: [embedPrev],
            components: [buttonComponents],
            content: "Tu propuesta será la siguiente. ¿Deseas enviarla?",
        });

        const collector = response.createMessageComponentCollector({
            time: 3 * 60 * 1000,
        });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({
                    content: "No puedes interactuar con esta propuesta",
                    ephemeral: true,
                });
                return;
            }

            if (interaction.customId === "cancelar") {
                collector.stop("cancelado");
            } else if (interaction.customId === "aceptar") {
                try {
                    await proposalsDB.setProposal({
                        category,
                        image: imgProp,
                        user: message.author.id,
                        date: new Date().toLocaleString(),
                        serverName: guildName,
                    });

                    embedPrev.setFooter({
                        text: "Deberás esperar a que se acepte tu solicitud",
                    }).setColor(Colors.Green);

                    await response.edit({
                        content: "Tu propuesta ha sido enviada con éxito.",
                        embeds: [embedPrev],
                        components: [],
                    });

                    collector.stop("aceptada");
                } catch (error) {
                    collector.stop(error === "La propuesta ya existe!" ? "existente" : "error");
                }
            }
        });

        collector.on("end", async (_, reason) => {
            if (reason === "aceptada") return;

            const responseMessages: { [key: string]: string } = {
                existente: "La propuesta ya existe! Por lo tanto no se ha enviado.",
                cancelado: `Propuesta **${category}** cancelada.`,
                error: "Ha ocurrido un error al enviar tu propuesta. Por favor, intenta de nuevo.",
            };
            const description = responseMessages[reason] ?? `Propuesta **${category}** cancelada por falta de tiempo.`;

            const embedOver = new EmbedBuilder()
                .setAuthor({
                    name: message.member!.displayName,
                    iconURL: message.author.displayAvatarURL({ dynamic: true } as CustomImageURLOptions),
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
    },
};
