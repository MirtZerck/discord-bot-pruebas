// Importación de módulos y constantes desde otros archivos
import { client, db } from "../michi.js"; // Importa la base de datos
import { EmbedBuilder } from "discord.js"; // Importa una clase para construir mensajes embebidos
import { rolEventsManagersXpellit } from "../constants/rolesID.js"; // Importa un rol específico
import { recompensasChatXpellit } from "../constants/canalesID.js";

// Definición de un objeto que contiene métodos relacionados con las monedas virtuales
export const systemCoins = {
  name: "xpellcoins",
  alias: ["coins"],

  // Método para ejecutar comandos relacionados con las monedas
  async execute(message, args) {
    // Función para obtener información de las monedas desde la base de datos
    async function getCoinsDB() {
      const coins = await db.child("xpellCoins").once("value");
      if (coins.exists()) {
        return coins.val();
      } else {
        return undefined;
      }
    }

    // Función para establecer las monedas de un usuario en la base de datos
    async function setUserCoins(id, values) {
      return await db.child("xpellCoins").child(id).set(values);
    }

    // Función para eliminar las monedas de un usuario de la base de datos
    async function deleteUserCoins(id) {
      return await db.child("xpellCoins").child(id).remove();
    }

    // Llamada a la función para obtener la información de las monedas desde la base de datos
    const xpellCoins = await getCoinsDB();

    // Si no hay información de monedas, se devuelve un mensaje
    if (!xpellCoins) return message.reply("No existe todavía.");

    // Convierte la información de monedas en un array de usuarios y un array de claves
    const users = Object.entries(xpellCoins);
    const keys = Object.keys(xpellCoins);

    // Obtención de argumentos desde el mensaje
    const arg = args[0];
    const filtro = args[1];
    const newMoney = args[2];

    // Manejo de casos basado en el argumento proporcionado
    if (!arg) {
      // Ordenar usuarios por cantidad de monedas en orden descendente
      users.sort((a, b) => {
        return b[1].coins - a[1].coins;
      });

      // Crear una cadena de texto para mostrar los puestos y monedas de los usuarios
      let puestos = "";
      users.forEach((val, i) => {
        puestos += `**${i + 1}.** ${val[1].nickname}: ${val[1].coins}\n`;
      });

      // Construir un mensaje embed para mostrar la información de las monedas
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.member.nickname ?? message.author.globalName,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`**Xpell Coins**`)
        .setDescription(`${puestos}`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor("Random")
        .setFooter({ text: "Estas son las Xpell Coins de los usuarios." })
        .setTimestamp();

      // Enviar el mensaje embed al canal
      return message.channel.send({ embeds: [embed] });
    } else if (arg === "-edit") {
      // Verificar si el autor del mensaje tiene el rol de Event Manager de Xpellit
      if (!message.member.roles.cache.get(rolEventsManagersXpellit))
        return message.reply("Consulta con un Event Manager.");

      // Verificar si se proporcionó el ID del usuario a editar
      if (!filtro) return message.reply("Ingresa el ID del usuario.");

      // Verificar si se proporcionó el nuevo valor de monedas a sumar o restar
      if (!newMoney)
        return message.reply(
          "Ingresa el valor a sumar o a restar de las monedas."
        );
      const monedas = parseInt(newMoney);

      // Verificar si el valor de monedas es un número entero
      if (isNaN(monedas))
        return message.reply("La cantidad de coins debe ser en enteros.");

      // Verificar si el ID proporcionado existe en las claves de usuarios
      if (keys.includes(filtro)) {
        // Obtener la información del usuario de la base de datos
        const user = xpellCoins[filtro];
        // Actualizar la cantidad de monedas del usuario
        user.coins = user.coins + monedas;

        // Actualizar la información del usuario en la base de datos y manejar la respuesta
        setUserCoins(filtro, user).then((res) => {
          // Preparamos el Mensaje para los logs
          let logMessage = "";

          // Verificamos si las monedas añadidas son mayores a 0
          if (monedas > 0) {
            logMessage = `${message.author.username} ha añadido ${monedas} coins a ${user.nickname}.`;
            message.channel.send(
              `Se han añadido ${monedas} coins a **${user.nickname}**.`
            );
          } else {
            logMessage = `${message.author.username} ha restado ${Math.abs(
              monedas
            )} coins a ${user.nickname}.`;
            message.channel.send(
              `Se han removido **${Math.abs(monedas)}** coins a **${
                user.nickname
              }**`
            );
          }
          //Enviar log al canal de logs
          const logsChannel = client.channels.cache.get(recompensasChatXpellit);
          if (logsChannel) {
            logsChannel.send(logMessage);
          }
        });
      } else {
        // Enviar mensaje si el usuario no existe
        return message.reply(`El usuario de ID **${filtro}** no existe.`);
      }
    } else if (arg === "-set") {
      // Verificar si el autor del mensaje tiene el rol de Event Manager de Xpellit
      if (!message.member.roles.cache.get(rolEventsManagersXpellit))
        return message.reply("Consulta con un Event Manager.");

      // Verificar si se proporcionó el ID del usuario a establecer
      if (!filtro) return message.reply("Ingresa el ID del usuario.");

      // Verificar si se proporcionó la cantidad de monedas a establecer
      if (!newMoney) return message.reply("Ingresa las monedas.");
      const coins = parseInt(newMoney);

      // Verificar si la cantidad de monedas es un número entero
      if (isNaN(coins))
        return message.reply("La cantidad debe ser en enteros.");

      // Función para obtener un miembro (usuario) del servidor basado en un filtro
      const getMemberByFilter = (message, filter) => {
        const filtro = filter.toLowerCase().trim();
        return message.guild.members.cache.find((member) => {
          return (
            member.user.username.toLowerCase().includes(filtro) ||
            (member.nickname &&
              member.nickname.toLowerCase().includes(filtro)) ||
            member.user.id === filter
          );
        });
      };

      // Obtener el miembro (usuario) correspondiente al filtro proporcionado
      const member = getMemberByFilter(message, filtro);

      // Verificar si se encontró un miembro válido
      if (!member) return message.reply(`El ID ${filtro} no es válido.`);

      // Crear un objeto con información del usuario y las monedas a establecer
      const user = {
        nickname: member.nickname ?? member.user.username,
        coins: coins,
      };

      // Actualizar la información del usuario en la base de datos y manejar la respuesta
      setUserCoins(filtro, user).then((res) => {
        const logMessage = `${message.author.username} ha modificado las coins de ${user.nickname} a un total de ${coins}.`;
        message.channel.send(
          `Se ha ingresado el usuario **${user.nickname}** con **${coins}** coins.`
        );

        // Enviar log al canal de logs
        const logsChannel = client.channels.cache.get(recompensasChatXpellit);
        if (logsChannel) {
          logsChannel.send(logMessage);
        }
      });
    } else if (arg === "-delete") {
      // Verificar si el autor del mensaje tiene el rol de Event Manager de Xpellit
      if (!message.member.roles.cache.get(rolEventsManagersXpellit))
        return message.reply("Consulta con un Event Manager.");

      // Verificar si el usuario a eliminar está registrado en las claves
      if (keys.includes(filtro)) {
        // Eliminar todas las monedas del usuario de la base de datos y manejar la respuesta
        deleteUserCoins(filtro).then((res) => {
          const logMessage = `${message.author.username} ha eliminado las coins de ${filtro}.`;
          message.reply(`Se han eliminado todas las coins de ${filtro}.`);

          // Enviar log al canal de logs
          const logsChannel = client.channels.cache.get(recompensasChatXpellit);
          if (logsChannel) {
            logsChannel.send(logMessage);
          }
        });
      } else {
        return message.reply(`El usuario **${filtro}** no está registrado.`);
      }
    } else {
      // En caso de argumento inválido, proporcionar una guía de los argumentos disponibles
      return message.reply(
        "Argumento no válido. \n\n**Disponibles:** -edit (para sumar o restar), -set (para definir una cantidad), -delete (para borrar todas las coins de un usuario)"
      );
    }
  },
};
