import { db } from "../michi.js";
import { getRankTabla1 } from "../constants/clanService.js";
import { MessageEmbed } from "discord.js";
import { rolGatosGatunosXpellit } from "../constants/rolesID.js";

export const clanRankingServidor = {
  name: "rankingservidor",
  alias: ["rankserver", "rs"],

  async execute(message, args) {
    if (!message.member.roles.cache.get(rolGatosGatunosXpellit)) return;

    const rankt1 = await getRankTabla1();
    if (!rankt1) return message.reply("No existe todavía");
    const rank = Object.entries(rankt1);
    let puestos = "";
    //ordenar rank de mayor a menor
    rank.sort((a, b) => {
      return b[1].puntos - a[1].puntos;
    });

    rank.forEach((val, i) => {
      //val[0]: key (ID)
      //val[1]: value({nickname, puntos})
      puestos += `**${i + 1}.** ${val[1].nickname}: ${val[1].puntos}\n`;
      //1. Si: 3\n2. MirtZerck: 1
    });

    const embed = new MessageEmbed()
      .setAuthor(
        "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
      )
      .setTitle(`Ranking de la Tabla 1`)
      .setDescription(`${puestos}`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor("#81d4fa")
      .setFooter("Este es el ranking de actividad en discord")
      .setTimestamp();

    message.channel.send(embed);
  },
};
