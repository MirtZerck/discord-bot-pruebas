import { Client } from "discord.js";
import dotenv from "dotenv";
import { onMessageCreate } from "./commands/respuestas.js";
import { arrayCommands } from "./commands/index.js";
import {
  enviarGatoALas,obtenerEmbedMichiDiario,
} from "./utils/api_michi_diario.js";
import {
  gatosGatunosXpellit,
  generalMirtZerck,
  generalPruebasBot,
  generalXpellit,
  simularGatosBot,
} from "./constants/canalesID.js";

dotenv.config();

const token = process.env.TOKEN;

const client = new Client();

// Logear el bot
client.login(token);

client.on("ready", async () => {
  console.log("El bot se ha iniciado como", client.user.username);
  client.user.setPresence({
    status: "dnd",
    activity: {
      name: "XPELLIT",
      type: "STREAMING",
    },
  });

  const canal_general_xpellit = client.channels.cache.get(generalXpellit);

  const canal_general_mirtzerck = client.channels.cache.get(generalMirtZerck);

  
  if (canal_general_xpellit) {
    canal_general_xpellit.send("Hola, vengo a espiarlos a todos c:");
  }
  if (canal_general_mirtzerck) {
    canal_general_mirtzerck.send("Hola, vengo a espiarlos a todos c:")
  }

  const canal_gatos_gatunos = client.channels.cache.get(gatosGatunosXpellit);

 
  if (canal_gatos_gatunos) {
    enviarGatoALas(7, canal_gatos_gatunos);
  }
  if (canal_general_mirtzerck){
    enviarGatoALas(7, canal_general_mirtzerck);
  }
});

await onMessageCreate(client);
