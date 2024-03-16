import { EmbedBuilder } from "discord.js";
import { getDynamicColor } from "./getDynamicColor.js";
import {
  getInteraccionesValue,
  updateInteractionsCount,
} from "../db_service/commands_service.js";
import { getRandomNumber } from "./utilsFunctions.js";
import {
  addInteractionRequest,
  removeInteractionRequest,
} from "./interactionRequests.js";

export const createInteractionEmbed = (
  authorMember,
  targetMember,
  interactionType,
  count,
  imageUrl,
  footer
) => {
  const dynamicColor = getDynamicColor(authorMember);

  let interactionDescription;

  if (authorMember.id === targetMember.id) {
    interactionDescription = `¡**${authorMember.displayName}** se puso a ${interactionType}!`;
  } else {
    interactionDescription = `¡**${authorMember.displayName}** ha dado un ${interactionType} a **${targetMember.displayName}**!`;

    if (count != null) {
      interactionDescription += `\nSe han dado **${count}** ${interactionType} 🤗`;
    }
  }

  return new EmbedBuilder()
    .setDescription(interactionDescription)
    .setImage(imageUrl)
    .setColor(dynamicColor)
    .setFooter({ text: footer })
    .setTimestamp();
};

export async function handleDirectInteraction(interaction, user, config) {
  let newCount = null;

  if (config.requiresCount) {
    newCount = await updateInteractionsCount(
      interaction.user.id,
      user.user.id,
      config.type
    );
  }

  const callArray = await getInteraccionesValue();
  const interactionArray = callArray.find(([key]) => key === config.type);

  if (interactionArray) {
    const imgArray = interactionArray[1];
    const index = getRandomNumber(0, imgArray.length - 1);
    const imgDb = imgArray[index];

    const messageEmbed = createInteractionEmbed(
      interaction.member,
      user,
      config.type,
      newCount,
      imgDb,
      config.footer
    );

    await interaction.followUp({ embeds: [messageEmbed] });
  }
}

export async function sendInteractionRequest(interaction, user, config) {
  const dynamicColor = getDynamicColor(interaction.member);
  const embedRequest = new EmbedBuilder()
    .setAuthor({
      name: interaction.member.displayName,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`Solicitud de ${config.name}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setDescription(config.successResponce(interaction.member, user))
    .setColor(dynamicColor)
    .setFooter({ text: "Reacciona para responder." })
    .setTimestamp();

  const request = await interaction.followUp({ embeds: [embedRequest] });
  await request.react("✅");
  await request.react("❌");

  addInteractionRequest(user.user.id, {
    requestMessage: request,
    requester: interaction.user.id,
    type: config.name,
  });

  const filter = (reaction, userReact) =>
    ["✅", "❌"].includes(reaction.emoji.name) && userReact.id === user.user.id;

  request
    .awaitReactions({ filter, max: 1, time: 180000, errors: ["time"] })
    .then(async (collected) => {
      const reaction = collected.first();

      if (reaction.emoji.name === "✅") {
        console.log("Solicitud aceptada.");

        removeInteractionRequest(user.user.id);

        await handleDirectInteraction(interaction, user, config);

        await request.delete().catch(console.error);
      } else if (reaction.emoji.name === "❌") {
        console.log("Solicitud rechazada.");

        removeInteractionRequest(user.user.id);
        request.edit({
          embeds: [embedRequest.setDescription(config.rejectResponse)],
        });
      }
    })
    .catch((error) => {
      console.error("Error al esperar reacciones: ", error);
      removeInteractionRequest(user.user.id);
      request.edit({
        embeds: [embedRequest.setDescription(config.noResponse)],
      });
    });
}
