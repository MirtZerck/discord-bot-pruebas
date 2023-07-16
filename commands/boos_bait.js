import { obtenerMichiHablador } from "../utils/api_michi_hablando.js";
import { MessageEmbed } from "discord.js";

export const sendBossBait = {
  name: "bo",
  alias: ["b"],

  async execute(message, args, commandBody) { 
    if (message.author.id !== "526597356091604994" && message.author.id !== "591050519242342431") return;
    const bar = "▮";
    let lifebar = bar;
    const maxhealth = 7000;
    let c = (7000 * 100) / maxhealth;

    while (c >= 20) {
      lifebar += bar;
      c = c - 5;
    }

    const bossMsg = new MessageEmbed()
      .setAuthor(
        "Ha spawneado un Boss!",
        "https://xpellit.com/images/thumb.png"
      )
      .setTitle("Ogre - Tier 5")
      .setDescription(`${lifebar} - 100.00%`)
      .setThumbnail("https://placekitten.com/250/250")
      .setImage(
        "https://cdn.discordapp.com/attachments/889616724217978951/1058464796921573396/Untitled_design_6.gif"
      )
      .setColor("#51B317")
      .setFooter("Tiempo restante 0h 10m 0s");

    message.delete(); 
    return message.channel.send(bossMsg);
  },
};
