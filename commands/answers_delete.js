import { arrayCommands } from "./index.js";
import { prefijo } from "../constants/prefix.js";

export const onMessageDeleteCreate = async (client) => {
  const prefix = prefijo;

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    const commandBody = content.slice(commandName.length).trim();

    const replysDelete = {
      say: `${commandBody}`,
      nuke: '¡Borrando 1000 mensajes!',
      xpellit: `Hola! ${args[0] ?? message.author.username} Xpellit es un juego Indie, de estilo Animé, en el que existe un sistema gacha, en el cual puedes adquirir equipamiento como armaduras, arma y habilidades para crear el rol que más te guste y hacer equipo con otras personas para completar calabozos o bien para enfrentarte contra otros jugadores.`,
     
    };

    const arrayReplysDelete = Object.keys(replysDelete);

    if (arrayReplysDelete.includes(commandName)){
      message.channel.send(replysDelete[commandName]);
      message.delete()
    }
  });
};
