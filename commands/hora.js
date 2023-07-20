import { MessageEmbed } from "discord.js";
import moment from "moment-timezone";

export const horaServer = {
  name: "horaserver",
  alias: ["hs", "hora"],

  async execute(message, args) {
    const horaServer = "America/Bogota";

    function obtenerHoraServer() {
      return moment().tz(horaServer).format("HH:mm:ss");
    }
    const embedHora = new MessageEmbed()
    .setAuthor(
      "Gatos Gatunos",
        "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
    )
    .setTitle(`Hora del servidor`)
    .setDescription(obtenerHoraServer())
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .setColor("#81d4fa")
    .setFooter(`(GMT-5)`)
    


    message.channel.send(embedHora)
   
  },
};
