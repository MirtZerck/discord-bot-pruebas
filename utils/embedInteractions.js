import { EmbedBuilder } from "discord.js";
import { getDynamicColor } from "./getDynamicColor.js"; 

export const createInteractionEmbed = (
  authorMember,
  targetMember,
  interactionType,
  count,
  imageUrl
) => {
  const dynamicColor = getDynamicColor(authorMember);
  const interactionDescription = `Se han dado ${count} ${interactionType} 🤗`;

  return new EmbedBuilder()
    .setAuthor({
      name: `¡${authorMember.displayName} ha dado un ${interactionType} a ${targetMember.displayName}!`,
    })
    .setDescription(interactionDescription)
    .setImage(imageUrl)
    .setColor(dynamicColor)
    .setFooter({ text: "¡Un gesto amable hace el día mejor!" })
    .setTimestamp();
};
