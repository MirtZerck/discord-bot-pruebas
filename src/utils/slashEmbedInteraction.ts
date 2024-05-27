import { EmbedBuilder, CommandInteraction, GuildMember, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from "discord.js";
import { getDynamicColor } from "./getDynamicColor.js";
import { getGroupValues, updateCount } from "../db_service/commands_service.js";
import { getRandomNumber } from "./utilsFunctions.js";
import { addInteractionRequest, removeInteractionRequest, hasInteractionRequest } from "./interactionRequest.js";
import { CustomImageURLOptions } from "../types/embeds.js";
import { socialConfig } from "../types/social.js";

export const createInteractionEmbed = (
    authorMember: GuildMember,
    targetMember: GuildMember,
    description: (authorMember: GuildMember, targetMember: GuildMember) => string,
    soloDescription: ((authorMember: GuildMember) => string | null) | null,
    count: number | null,
    descriptionCount: ((count: number) => string | null) | null,
    imageUrl: string,
    footer: string
): EmbedBuilder => {
    const dynamicColor = getDynamicColor(authorMember);

    let interactionDescription: string;

    if (authorMember.id === targetMember.id) {
        interactionDescription = soloDescription ? soloDescription(authorMember) || "" : "";
    } else {
        interactionDescription = description(authorMember, targetMember);
        if (count != null && descriptionCount) {
            interactionDescription += descriptionCount(count) || "";
        }
    }

    return new EmbedBuilder()
        .setDescription(interactionDescription)
        .setImage(imageUrl)
        .setColor(dynamicColor)
        .setFooter({ text: footer })
        .setTimestamp();
};

export async function handleDirectInteraction(
    interaction: CommandInteraction,
    user: GuildMember,
    config: socialConfig
) {
    try {
        let newCount: number | null = null;

        if (config.requiresCount) {
            newCount = await updateCount(
                interaction.user.id,
                user.user.id,
                config.type,
                config.group
            );
        }

        const callArray = await getGroupValues(config.group);
        const interactionArray = callArray.find(([key]) => key === config.type);

        if (interactionArray) {
            const imgArray = interactionArray[1];
            const index = getRandomNumber(0, imgArray.length - 1);
            const imgDb = imgArray[index];

            const messageEmbed = createInteractionEmbed(
                interaction.member as GuildMember,
                user,
                config.description,
                config.soloDescription || null,
                newCount,
                config.descriptionCount || null,
                imgDb,
                config.footer
            );

            await interaction.followUp({ embeds: [messageEmbed] });
        }
    } catch (error) {
        console.error("Error en handleDirectInteraction:", error);
        try {
            await interaction.followUp({
                content: "Ocurrió un error al manejar la interacción. Por favor, inténtalo de nuevo más tarde.",
                ephemeral: true,
            });
        } catch (followUpError) {
            console.error("Error en followUp en handleDirectInteraction:", followUpError);
        }
    }
}

export async function sendInteractionRequest(
    interaction: CommandInteraction,
    user: GuildMember,
    config: socialConfig
) {
    try {
        if (config.requiresUser && interaction.user.id === user.user.id) {
            return interaction.reply({
                content: `No te puedes ${config.action} a ti mismo.`,
                ephemeral: true,
            });
        }

        if (hasInteractionRequest(user.user.id, interaction.user.id)) {
            return interaction.reply({
                content: "Ya existe una solicitud de interacción pendiente para este usuario.",
                ephemeral: true,
            });
        }

        if (!(interaction.member instanceof GuildMember)) {
            return interaction.reply({
                content: "No se puede obtener el miembro del gremio.",
                ephemeral: true,
            });
        }

        const dynamicColor = getDynamicColor(interaction.member);
        const expirationTimestamp = Math.floor(Date.now() / 1000) + 3 * 60;

        const embedRequest = new EmbedBuilder()
            .setAuthor({
                name: interaction.member.displayName,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true } as CustomImageURLOptions),
            })
            .setTitle(`Solicitud de ${config.name}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true } as CustomImageURLOptions))
            .setDescription(
                `${config.requestMessage?.(
                    interaction.member,
                    user
                ) || ""}\n\nEsta solicitud caduca <t:${expirationTimestamp}:R>.`
            )
            .setColor(dynamicColor)
            .setFooter({ text: "Presiona un botón para responder." })
            .setTimestamp();

        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Aceptar')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('deny')
                    .setLabel('Denegar')
                    .setStyle(ButtonStyle.Danger)
            );

        const request = await interaction.followUp({
            embeds: [embedRequest],
            components: [buttons]
        });

        addInteractionRequest(user.user.id, interaction.user.id, {
            requestMessage: request,
            requester: interaction.user.id,
            type: config.name,
        });

        const filter = (i: Interaction) =>
            i.isButton() && ["accept", "deny"].includes(i.customId);

        const collector = request.createMessageComponentCollector({
            filter,
            time: 180000,
        });

        collector.on('collect', async (i) => {
            if (!i.isButton()) return;

            if (i.user.id !== user.user.id) {
                await i.reply({
                    content: "No puedes interactuar con esta solicitud.",
                    ephemeral: true
                });
                return;
            }

            if (i.customId === 'accept') {
                removeInteractionRequest(user.user.id, interaction.user.id);
                await request.delete();
                await handleDirectInteraction(interaction, user, config);
            } else if (i.customId === 'deny') {
                removeInteractionRequest(user.user.id, interaction.user.id);
                await request.edit({
                    embeds: [embedRequest.setDescription(config.rejectResponse || "Solicitud rechazada.")],
                    components: []
                });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'time') return;

            removeInteractionRequest(user.user.id, interaction.user.id);
            await request.edit({
                embeds: [embedRequest.setDescription(config.noResponse || "Solicitud no respondida.")],
                components: []
            });
        });
    } catch (error) {
        console.error("Error en sendInteractionRequest:", error);
        try {
            await interaction.followUp({
                content: "Ocurrió un error al enviar la solicitud de interacción. Por favor, inténtalo de nuevo más tarde.",
                ephemeral: true,
            });
        } catch (followUpError) {
            console.error("Error en followUp en sendInteractionRequest:", followUpError);
        }
    }
}
