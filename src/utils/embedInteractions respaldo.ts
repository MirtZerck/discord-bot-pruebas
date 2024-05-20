import {
    EmbedBuilder,
    GuildMember,
    Message,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    Interaction,
} from "discord.js";
import { getDynamicColor } from "./getDynamicColor.js";
import {
    getInteraccionesValue,
    updateInteractionsCount,
} from "../db_service/commands_service.js";
import { getRandomNumber } from "./utilsFunctions.js";
import {
    addInteractionRequest,
    removeInteractionRequest,
    hasInteractionRequest,
} from "./interactionRequest respald.js";
import { CustomImageURLOptions } from "../types/embeds.js";
import { InteractionConfig } from "../types/interaction.js";

export const createInteractionEmbed = (
    authorMember: GuildMember,
    targetMember: GuildMember,
    description: (authorMember: GuildMember, targetMember: GuildMember) => string,
    soloDescription: ((authorMember: GuildMember) => string | null) | null,
    count: number | null,
    descriptionCount: ((count: number) => string | null) | null,
    imageUrl: string,
    footer: string
) => {
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
    message: Message,
    user: GuildMember,
    config: InteractionConfig
) {
    try {
        let newCount: number | null = null;

        if (config.requiresCount) {
            newCount = await updateInteractionsCount(
                message.author.id,
                user.user.id,
                config.type
            );
        }

        const callArray = await getInteraccionesValue();
        const interactionArray = callArray.find(([key]) => key === config.type);

        if (interactionArray) {
            const imgArray = interactionArray[1] as string[];
            const index = getRandomNumber(0, imgArray.length - 1);
            const imgDb = imgArray[index];

            const messageEmbed = createInteractionEmbed(
                message.member!,
                user,
                config.description,
                config.soloDescription || null,
                newCount,
                config.descriptionCount || null,
                imgDb,
                config.footer
            );

            await message.channel.send({ embeds: [messageEmbed] });
        }
    } catch (error) {
        console.error("Error en handleDirectInteraction:", error);
        message.reply("Ocurrió un error al realizar la interacción directa.");
    }
}

export async function sendInteractionRequest(
    message: Message,
    user: GuildMember,
    config: InteractionConfig
) {
    try {
        if (hasInteractionRequest(user.user.id, message.author.id)) {
            return message.reply("Ya existe una solicitud de interacción pendiente para este usuario.");
        }

        const dynamicColor = getDynamicColor(message.member!);
        const expirationTimestamp = Math.floor(Date.now() / 1000) + 3 * 60;

        const embedRequest = new EmbedBuilder()
            .setAuthor({
                name: message.member!.displayName,
                iconURL: message.author.displayAvatarURL({ dynamic: true } as CustomImageURLOptions),
            })
            .setTitle(`Solicitud de ${config.name}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true } as CustomImageURLOptions))
            .setDescription(
                `${config.requestMessage?.(
                    message.member!,
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

        const request = await message.channel.send({
            embeds: [embedRequest],
            components: [buttons]
        });

        addInteractionRequest(user.user.id, message.author.id, {
            requestMessage: request,
            requester: message.author.id,
            type: config.name,
        });

        const filter = (interaction: Interaction) =>
            interaction.isButton() && ["accept", "deny"].includes(interaction.customId) &&
            interaction.user.id === user.user.id;

        const collector = request.createMessageComponentCollector({
            filter,
            time: 180000,
        });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'accept') {
                removeInteractionRequest(user.user.id, message.author.id);
                await request.delete();
                await handleDirectInteraction(message, user, config);
            } else if (interaction.customId === 'deny') {
                removeInteractionRequest(user.user.id, message.author.id);
                await request.edit({
                    embeds: [embedRequest.setDescription(config.rejectResponse || "Solicitud rechazada.")],
                    components: []
                });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'time') return;

            removeInteractionRequest(user.user.id, message.author.id);
            await request.edit({
                embeds: [embedRequest.setDescription(config.noResponse || "Solicitud no respondida.")],
                components: []
            });
        });
    } catch (error) {
        console.error("Error en sendInteractionRequest:", error);
        message.reply("Ocurrió un error al enviar la solicitud de interacción.");
    }
}
