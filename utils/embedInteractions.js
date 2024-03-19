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

/*                                                                            */

export const createInteractionEmbed = (
  authorMember,
  targetMember,
  description,
  soloDescription,
  count,
  descriptionCount,
  imageUrl,
  footer
) => {
  const dynamicColor = getDynamicColor(authorMember);

  let interactionDescription;

  if (authorMember.id === targetMember.id) {
    interactionDescription = soloDescription(authorMember);
  } else {
    interactionDescription = description(authorMember, targetMember);

    if (count != null) {
      interactionDescription += descriptionCount(count);
    }
  }
  return new EmbedBuilder()
    .setDescription(interactionDescription)
    .setImage(imageUrl)
    .setColor(dynamicColor)
    .setFooter({ text: footer })
    .setTimestamp();
};

/*                                                                            */

export async function handleDirectInteraction(message, user, config) {
  let newCount = null;

  if (config.requiresCount) {
    newCount = await updateInteractionsCount(
      message.author.id,
      user.user.id,
      config.type
    );
  }

  if (!config.descriptionCount) {
    config.descriptionCount = null;
  }

  if (!config.soloDescription) {
    config.soloDescription = null;
  }

  const callArray = await getInteraccionesValue();
  const interactionArray = callArray.find(([key]) => key === config.type);

  if (interactionArray) {
    const imgArray = interactionArray[1];
    const index = getRandomNumber(0, imgArray.length - 1);
    const imgDb = imgArray[index];

    const messageEmbed = createInteractionEmbed(
      message.member,
      user,
      config.description,
      config.soloDescription,
      newCount,
      config.descriptionCount,
      imgDb,
      config.footer
    );

    await message.channel.send({ embeds: [messageEmbed] });
  }
}

/*                                                                            */

export async function sendInteractionRequest(message, user, config) {
  const dynamicColor = getDynamicColor(message.member);
  const expirationTimestamp = Math.floor(Date.now() / 1000) + 3 * 60;

  const embedRequest = new EmbedBuilder()
    .setAuthor({
      name: message.member.displayName,
      iconURL: message.author.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`Solicitud de ${config.name}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setDescription(
      `${config.requestMessage(
        message.member,
        user
      )}\n\nEsta solicitud caduca <t:${expirationTimestamp}:R>.`
    )
    .setColor(dynamicColor)
    .setFooter({ text: "Reacciona para responder." })
    .setTimestamp();

  const request = await message.channel.send({ embeds: [embedRequest] });
  await request.react("✅");
  await request.react("❌");

  addInteractionRequest(user.user.id, {
    requestMessage: request,
    requester: message.author.id,
    type: config.name,
  });

  const filter = (reaction, userReact) =>
    ["✅", "❌"].includes(reaction.emoji.name) && userReact.id === user.user.id;

  request
    .awaitReactions({ filter, max: 1, time: 180000, errors: ["time"] })
    .then(async (collected) => {
      const reaction = collected.first();

      if (reaction.emoji.name === "✅") {
        removeInteractionRequest(user.user.id);
        request.delete();

        await handleDirectInteraction(message, user, config);
      } else if (reaction.emoji.name === "❌") {
        removeInteractionRequest(user.user.id);
        request.edit({
          embeds: [embedRequest.setDescription(config.rejectResponse)],
        });
      }
    })
    .catch(async (error) => {
      console.error("Error al esperar reacciones: ", error);
      removeInteractionRequest(user.user.id);
      request.edit({
        embeds: [embedRequest.setDescription(config.noResponse)],
      });

      try {
        await request.reactions.removeAll();
      } catch (removeError) {
        console.error("Error al eliminar reacciones: ", removeError);
      }
    });
}
