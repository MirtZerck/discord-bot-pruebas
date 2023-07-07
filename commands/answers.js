import { arrayCommands } from "./index.js";

export const onMessageCreate = async (client) => {
    
const prefix = ".";

client.on("message", async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(prefix)) return;

  const content = message.content.slice(prefix.length);
  const args = content.toLowerCase().split(" ");
  const commandName = args.shift();
  const commandBody = content.slice(commandName.length);

  if (commandName === "ona") {
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
  }

  arrayCommands.forEach((command) => {
    if (command.name === commandName || command.alias.includes(commandName)) {
      command.execute(message, args);
    }
  });
});
}