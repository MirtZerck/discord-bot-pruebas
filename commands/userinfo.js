// Importamos las herramientas necesarias desde discord.js y nuestros archivos locales
import { EmbedBuilder } from "discord.js";
import { convertDateToString } from "../utils/format-date.js";
import { getMemberByFilter } from "../constants/get-user.js";

// Definimos el comando userInfoCommand con su nombre y alias
export const userInfoCommand = {
  name: "userinfo",
  alias: ["ui", "useri"],

  // La función execute se ejecuta cuando el comando es llamado
  execute: async (message, args) => {
    // Extraemos propiedades útiles del objeto message
    const { author, member: messageMember, channel } = message;

    // Intentamos obtener el miembro mencionado en el mensaje, si lo hay
    const userMention = message.mentions.members.first();
    let filtro;

    // Establecemos el filtro basado en si se mencionó un usuario, se proporcionó un ID/username, o se usa el autor del mensaje
    if (userMention) {
      filtro = userMention.user.id;
    } else if (args[0]) {
      filtro = args[0];
    } else {
      filtro = author.id;
    }
    // Verificamos que el filtro tenga al menos 3 caracteres
    if (typeof filtro.length < 3)
      return message.reply(
        "El usuario a mencionar debe tener al menos 3 carácteres."
      );

    // Obtenemos el miembro del servidor basado en el filtro usando nuestra función personalizada
    const member = getMemberByFilter(message, filtro);
    if (!member) return message.reply("El usuario no existe"); // Si no se encuentra el miembro, se envía un mensaje

    // Extraemos el objeto user del miembro y sus propiedades relevantes
    const { user } = member;
    const { username, id } = user;
    const avatarURL = user.displayAvatarURL({ dynamic: true }); // Obtenemos la URL del avatar

    // Convertimos las fechas de creación de la cuenta y de unión al servidor a un formato legible
    const fechaRegistro = convertDateToString(member.user.createdAt); // Fecha de creación de la cuenta de Discord
    const fechaIngreso = convertDateToString(member.joinedAt); // Fecha de ingreso del miembro al servidor

    // Creamos el embed con la información del usuario
    const messageEmbed = new EmbedBuilder()
      .setAuthor({
        name: messageMember.displayName, // Nombre de visualización del miembro que ejecutó el comando
        iconURL: message.author.displayAvatarURL({ dynamic: true }), // Avatar del autor del mensaje
      })
      .setTitle(`Información de ${member.displayName}`) // Título del embed con el nombre de usuario del miembro
      .setThumbnail(avatarURL) // Thumbnail del embed con el avatar del miembro
      .setDescription(`Información del usuario en el servidor`) // Descripción del embed
      .addFields(
        { name: "Registro", value: fechaRegistro, inline: true }, // Campo con la fecha de registro del usuario
        { name: "Ingreso", value: fechaIngreso, inline: true } // Campo con la fecha de ingreso del usuario al servidor
      )
      .setColor(0x81d4fa) // Color del embed
      .setFooter({ text: `ID ${id}` }) // Pie de página del embed con el ID del usuario
      .setTimestamp(); // Timestamp del embed

    // Enviamos el embed al canal donde se ejecutó el comando
    channel.send({ embeds: [messageEmbed] });
  },
};
