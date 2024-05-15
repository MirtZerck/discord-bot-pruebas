import { inuYashaID, mirtZerckID } from "../constants/users_ID.js";
import { EmbedBuilder } from "discord.js";

export const sendBossBait = {
  name: "bo",
  alias: ["b"],

  async execute(message, args, commandBody) {
    try {
      if (
        message.author.id !== mirtZerckID &&
        message.author.id !== "591050519242342431" &&
        message.author.id !== inuYashaID &&
        message.author.id !== "651994704560521226" &&
        message.author.id !== "936864558960767019"
      )
        return;

      const bar = "▮";
      let lifebar = bar;
      const maxhealth = 1000;
      let c = (1000 * 100) / maxhealth;

      while (c >= 20) {
        lifebar += bar;
        c = c - 5;
      }

      const bossMsg = new EmbedBuilder()
        .setAuthor({
          name: "Ha spawneado un Boss!",
          iconURL: "https://xpellit.com/images/thumb.png",
        })
        .setTitle("Ogre - Tier 5")
        .setDescription(`${lifebar} - 100.00%`)
        .setThumbnail("https://placekitten.com/250/250")
        .setImage(
          "https://cdn.discordapp.com/attachments/889616724217978951/1058464796921573396/Untitled_design_6.gif"
        )
        .setColor(0x51b317)
        .setFooter({ text: "Tiempo restante 0h 10m 0s" });

      return message.channel.send({ embeds: [bossMsg] }).catch((error) => {
        console.error("Error al enviar el mensaje embed:", error);
        message.reply(
          "No se pudo enviar el mensaje embed. Por favor, verifica mis permisos."
        );
      });
    } catch (error) {
      console.error("Error al ejecutar el comando sendBossBait:", error);
      message.reply(
        "Ocurrió un error al ejecutar el comando. Por favor, intenta nuevamente más tarde."
      );
    }
  },
};
