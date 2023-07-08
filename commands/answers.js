import { arrayCommands } from "./index.js";
import { prefijo } from "../constants/prefix.js";

export const onMessageCreate = async (client) => {
  const prefix = prefijo;

  client.on("message", async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(" ");
    const commandName = args.shift();
    const commandBody = content.slice(commandName.length);

    const replys = {
      ona: "Onaaaa",
      inu: `"OH mi querido **${
        commandBody === "" ? "Michi" : commandBody
      }** que inteligente eres, y observador, tienes razon, no hay staff, pero te tenemos a ti, quieres ser staff? mandame privado te dare 1 año de nitro adicional"`,
      loxess: "Todas unas p||rinces||as",
      nya: "Nya ~<3",
      michi: "Yo quiero uno de esos",
      sexo: "¿Sexo? Te vendo 1 kilo",
      game: "¿Eres minita o por qué quieres jugar conmigo?",
      pinkdreams: `¡Hola! ${commandBody} ¿te gustaría ser rosita? Si es así, ¡Pink dreams es para tí! Servimos galletas y pastelitos todos los días y somos como una gran familia, ¡Únete a Pink dreams! No te arrepentirás, si quieres pasar un buen rato, aquí te esperamos`,
      pd: `¡Hola! ${commandBody} ¿te gustaría ser rosita? Si es así, ¡Pink dreams es para tí! Servimos galletas y pastelitos todos los días y somos como una gran familia, ¡Únete a Pink dreams! No te arrepentirás, si quieres pasar un buen rato, aquí te esperamos`,
      lnds: "¡Hola! ¿te gustaría ser una linda nena destroza sables? Si es así, ¡LNDS es para tí! Destrazamos sables todos los días y somos como una gran familia, ¡Únete a LNDS! No te arrepentirás, si quieres pasar un buen rato y ser una linda nena, aquí te esperamos",
      ahrigato: "Amo, adoro y respeto al @staff",
      br: "pink dreams 1 - gatos gatunos 0",
      yui: "BOE 🙄",
      ban: `### Baneen a ${
        commandBody === "" ? message.author.username : commandBody
      }`,
      vanir: "fototeta",
      kuon: "salamadre que t||ostado||tas",
      kairi: "Quiero pene",
    };

    const arrayReplys = Object.keys(replys);

    if (arrayReplys.includes(commandName)) {
      message.channel.send(replys[commandName]);
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
