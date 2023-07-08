import { Client } from "discord.js";
import dotenv from "dotenv";
import { onMessageCreate } from "./commands/answers.js"; 
import { onImageCreate } from "./commands/images.js";
import { curiousFact } from "./commands/dato_curioso.js";
import { arrayCommands } from "./commands/index.js";

dotenv.config();

const token = process.env.TOKEN;

const client = new Client();

// Logear el bot
client.login(token);

client.on("ready", () => {
  console.log("El bot se ha iniciado como", client.user.username);
  client.user.setPresence({
    status: "dnd",
    activity: {
      name: "XPELLIT ALPHA",
      type: "PLAYING",
    },
  });
});

await onMessageCreate(client);
await curiousFact(client); 
await onImageCreate(client); 