import { EmbedBuilder } from "discord.js";
import { getMemberByID } from "../constants/get-user.js";

export const userAvatarCommand = {
  name: "avatar",
  alias: ["av", "avt"],

  execute(message, args) {
    try {
      const userMention = message.mentions.members.first();
      let user_id;

      if (userMention) {
        user_id = userMention.user.id;
      } else if (args[0]) {
        user_id = args[0];
      } else {
        user_id = message.author.id;
      }

      const user = getMemberByID(message, user_id);

      if (!user) return message.reply("El usuario no existe");

      // Si sale null, se iguala a ??
      const messageEmbed = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Avatar de ${user.user.username}`)
        .setImage(user.user.displayAvatarURL({ size: 1024, dynamic: true }))
        .setColor("Random")
        .setFooter({ text: `ID ${user_id}` })
        .setTimestamp();

      message.channel.send({ embeds: [messageEmbed] }).catch((error) => {
        console.error("Error al enviar el mensaje embed:", error);
        message.reply(
          "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
        );
      });
    } catch (error) {
      console.error("Error al ejecutar el comando avatar:", error);
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
