import { arrayCommands } from "./index.js";
import { prefijo } from "../utils/prefix.js";

export const onMessageCreate = async (client) => {
  const prefix = prefijo;

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    /* const commandBody = content.slice(commandName.length); */

    const replys = {
      ona: 'Onaaaa',
      inu: `"OH mi querido ${args[0] ?? 'Michi'} que inteligente eres, y observador, tienes razon, no hay staff, pero te tenemos a ti, quieres ser staff? mandame privado te dare 1 año de nitro adicional"`,
      loxess: 'Losex',
      nya: 'Nya ~<3',
      michi: 'Yo quiero uno de esos',
      sexo: '¿Sexo? Te vendo 1 kilo',
      game: '¿Eres minita o por qué quieres jugar conmigo?',
      pinkdreams: '¡Hola! ¿te gustaría ser rosita? Si es así, ¡Pink dreams es para tí! Servimos galletas y pastelitos todos los días y somos como una gran familia, ¡Únete a Pink dreams! No te arrepentirás, si quieres pasar un buen rato, aquí te esperamos',
      pd: '¡Hola! ¿te gustaría ser rosita? Si es así, ¡Pink dreams es para tí! Servimos galletas y pastelitos todos los días y somos como una gran familia, ¡Únete a Pink dreams! No te arrepentirás, si quieres pasar un buen rato, aquí te esperamos',
      lnds: '¡Hola! ¿te gustaría ser una linda nena destroza sables? Si es así, ¡LNDS es para tí! Destrazamos sables todos los días y somos como una gran familia, ¡Únete a LNDS! No te arrepentirás, si quieres pasar un buen rato y ser una linda nena, aquí te esperamos',
      ahrigato: 'Zzz',
      some: 'Se la chupo a Loxess',
      br: 'pink dreams 1 - gatos gatunos 0',
      yui: 'BOE 🙄',
      ban: `### Baneen a ${args[0] ?? message.author.username}`,
      xpellit: `Hola! ${args[0] ?? message.author.username} Xpellit es un juego Indie, de estilo Animé, en el que existe un sistema gacha, en el cual puedes adquirir equipamiento como armaduras, arma y habilidades para crear el rol que más te guste y hacer equipo con otras personas para completar calabozos o bien para enfrentarte contra otros jugadores.`,
      nuke: '¡Borrando 1000 mensajes!'
    };
    
    const arrayReplys = Object.keys(replys)
    
    if (arrayReplys.includes(commandName)) {
      message.channel.send(replys[commandName])
    }


    
    const command = arrayCommands.find(
      (cmd) =>
        cmd.name === commandName ||
        (cmd.alias && cmd.alias.includes(commandName))
    );
    if (command) {
      command.execute(message, args);
    }
  });
};


 /* if (commandName === "ona") {
      return message.reply("Onaaaa");
    } else {
      if (commandName === "loxess") {
        return message.reply("Losex");
      } else {
        if (commandName === "nya") {
          return message.reply("Nya ~<3");
        } else {
          if (commandName === "michi") {
            return message.reply("Yo quiero uno de esos");
          } else {
            if (commandName === "inu") {
              return message.reply(
                '"OH mi querido michi que inteligente eres, y observador, tienes razon, no hay staff, pero te tenemos a ti, quieres ser staff? mandame privado te dare 1 año de nitro adicional"'
              );
            } else {
              if (commandName === "sexo") {
                return message.reply("¿Sexo? Te vendo 1 kilo");
              } else {
                if (commandName === "game") {
                  return message.reply(
                    "¿Eres minita o por qué quieres jugar conmigo?"
                  );
                }
              }
            }
          }
        }
      }
    }  */