import { EmbedBuilder } from "discord.js";
import { getMemberByFilter } from "../constants/get-user.js";
import {
  getInteraccionesValue,
  updateInteractionsCount,
} from "../db_service/commands_service.js";
import { getRandomNumber } from "../utils/utilsFunctions.js";
import { getDynamicColor } from "../utils/getDynamicColor.js";
import { createInteractionEmbed } from "../utils/embedInteractions.js";
import { interactionRequests } from "../utils/interactionRequests.js";

/* export */ const hugUserCommand = {
  name: "abrazo",
  alias: ["hug"],

  async execute(message, args) {
    const userMention = message.mentions.members.first();
    let filtro;

    if (userMention) {
      filtro = userMention.user.id;
    } else if (args[0]) {
      filtro = args[0];
    } else {
      message.reply("Debes mencionar a alguien para abrazar.");
      return;
    }

    const user = getMemberByFilter(message, filtro);

    if (!user)
      return message.reply("El usuario no existe o no se pudo encontrar.");

    if (message.author.id === user.user.id)
      return message.reply("No te puedes abrazar a ti mismo.");

    if (user.user.bot) {
      const newCount = await updateInteractionsCount(
        message.author.id,
        user.user.id,
        "abrazos"
      );

      const callArray = await getInteraccionesValue();
      const hugsArray = callArray.find(([key]) => key === "abrazos");

      if (hugsArray) {
        const imgHugs = hugsArray[1];
        const index = getRandomNumber(0, imgHugs.length - 1);
        const messageDb = imgHugs[index];

        const messageEmbed = createInteractionEmbed(
          message.member,
          user,
          "abrazo",
          newCount,
          messageDb
        );

        await message.channel.send({ embeds: [messageEmbed] });
      }
      return;
    }

    const dynamicColor = getDynamicColor(message.member);
    const embedRequest = new EmbedBuilder()
      .setAuthor({
        name: message.member.displayName,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("Solicitud de Abrazo")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `¡Hola ${user.displayName}! ${message.member.displayName} está deseando compartir un abrazo contigo. ¿Qué dices, lo aceptas?`
      )
      .setColor(dynamicColor)
      .setFooter({ text: "Reacciona para responder." });

    const request = await message.channel.send({ embeds: [embedRequest] });

    await request.react("✅");
    await request.react("❌");

    const filter = (reaction, userReact) => {
      return (
        ["✅", "❌"].includes(reaction.emoji.name) &&
        userReact.id === user.user.id
      );
    };

    request
      .awaitReactions({ filter, max: 1, time: 180000, errors: ["time"] })
      .then(async (collected) => {
        const reaction = collected.first();

        if (reaction.emoji.name === "✅") {
          request.delete();

          const userReactId = user.user.id;
          const requestDetails = interactionRequests.get(userReactId);
          if (requestDetails) {
            clearTimeout(requestDetails.timerId);
            interactionRequests.delete(userReactId);
          }

          const newCount = await updateInteractionsCount(
            message.author.id,
            user.user.id,
            "abrazos"
          );

          const callArray = await getInteraccionesValue();

          const hugsArray = callArray.find(([key]) => key === "abrazos");
          if (hugsArray) {
            const imgHugs = hugsArray[1];

            const index = getRandomNumber(0, imgHugs.length - 1);

            const messageDb = imgHugs[index];

            const messageEmbed = createInteractionEmbed(
              message.member,
              user,
              "abrazo",
              newCount,
              messageDb
            );

            await message.channel.send({ embeds: [messageEmbed] });
          }
        } else if (reaction.emoji.name === "❌") {
          request.edit({
            embeds: [
              embedRequest.setDescription("Solicitud de abrazo rechazada."),
            ],
          });

          const userReactId = user.user.id;
          const requestDetails = interactionRequests.get(userReactId);
          if (requestDetails) {
            clearTimeout(requestDetails.timerId);
            interactionRequests.delete(userReactId);
          }
          /* setTimeout(() => request.delete(), 30000); */
        }
      })
      .catch((error) => {
        console.error("Error o timeout al esperar reacciones:", error);
        request
          .edit({
            embeds: [
              embedRequest.setDescription("Solicitud de abrazo no respondida."),
            ],
          })
          .catch(console.error);
      });
  },
};
