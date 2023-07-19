import { obtenerMichiHablador } from "../utils/api_michi_hablando.js";
import { MessageEmbed } from "discord.js";

export const sendBossBait = {
  name: "bo",
  alias: ["b"],

  async execute(message, args, commandBody) {
    if (
      message.author.id !== "526597356091604994" &&
      message.author.id !== "591050519242342431" &&
      message.author.id !== "228709857249722369" &&
      message.author.id !== "651994704560521226" &&
      message.author.id !== "936864558960767019"
         )
      return;
    const bar = "▮";
    let lifebar = bar;
    const maxhealth = 1000 ;
    let c = (1000 * 100) / maxhealth;

    while (c >= 20) {
      lifebar += bar;
      c = c - 5;
    }

    const bossMsg = new MessageEmbed()
      .setAuthor(
        "Ha spawneado un enemigo cuidado protejan a la princesa!",
        "https://xpellit.com/images/thumb.png"
      )
      .setTitle("michi - Tier 5")
      .setDescription(`${lifebar} - 100.00%`)
      .setThumbnail("https://placekitten.com/250/250")
      .setImage(
        "https://cdn.discordapp.com/attachments/889616724217978951/1058464796921573396/Untitled_design_6.gif"
      )
      .setColor("#f2d6ff")
      .setFooter("Tiempo restante 0h 1m 0s");

    /* message.delete(); */
    return message.channel.send(bossMsg);
  },
};
