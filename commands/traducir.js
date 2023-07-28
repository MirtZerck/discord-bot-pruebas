import { obtenerTraduccionEnEs } from "../utils/api_traductor.js";
import { obtenerDataApi } from "../utils/apiserver.js";
import { MessageEmbed } from "discord.js";

export const SendTraduccion = {
  name: "traducir",
  alias: ["tr"],

  async execute(message, args, commandBody) {
    if (!commandBody) return message.reply("Envía lo que quieres que traduzca");

    const text = commandBody;
    
    const traducir = await obtenerTraduccionEnEs(text);

    const embedTraducir = new MessageEmbed()
      .setAuthor(
        message.member.nickname ?? message.author.username,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setDescription(traducir)
      .setColor("#81d4fa");

     message.channel.send(embedTraducir); 
  },
};

