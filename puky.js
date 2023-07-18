import { Client } from "discord.js";
import dotenv from "dotenv";
import { onMessageCreate } from "./commands/respuestas.js";
import { arrayCommands } from "./commands/index.js";
import {
  enviarGatoALas,
  obtenerEmbedMichiDiario,
} from "./utils/api_michi_diario.js";
import {
  gatosGatunosXpellit,
  generalMirtZerck,
  generalNekoPalace,
  generalPruebasBot,
  generalXpellit,
  simularGatosBot,
} from "./constants/canalesID.js";
import firebase from "firebase-admin";
import { createRequire } from "module";
import { obtenerTraduccion } from "./utils/api_traductor.js";
import { MessageEmbed } from "discord.js";

const require = createRequire(import.meta.url);

const serviceAccount = require('./gatos-gatunos-firebase-adminsdk-23njm-da6890c263.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://gatos-gatunos-default-rtdb.firebaseio.com",
});

firebase.auth();

export const db = firebase.database().ref('/');

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

  /*   await db.child('users').set('Mirt').then(res => {
      console.log('Se ha guardado el dato');
    }) */

  const canal_general_neko = client.channels.cache.get(generalNekoPalace);

  const canal_general_mirtzerck = client.channels.cache.get(generalMirtZerck);

  if (canal_general_neko) {
    const embedXpellitEcendido = new MessageEmbed()
      .setAuthor(
        "Puky Bot",
        "https://i.pinimg.com/564x/21/63/44/2163449951b8332afffb5d0bc17a86ef.jpg"
      )
      .setTitle(`Holis, estoy lista para cuidar un día mas al reino`)
      .setImage(
        "https://i.pinimg.com/originals/55/db/d2/55dbd2694ae8b30c4720724b77d5274f.gif"
      )
      .setDescription("Soy Puky ñam :3")
      .setColor("#f2d6ff")
      .setFooter(`Tengo fiyito`)
      .setTimestamp();

    canal_general_neko.send(embedXpellitEcendido);
  }
  if (canal_general_mirtzerck) {
    canal_general_mirtzerck.send("Hola, vengo a espiarlos a todos c:");
  }

  const canal_gatos_gatunos = client.channels.cache.get(gatosGatunosXpellit);

  if (canal_gatos_gatunos) {
    enviarGatoALas(7, canal_gatos_gatunos);
  }
  if (canal_general_mirtzerck) {
    enviarGatoALas(8, canal_general_mirtzerck);
  }
});

await onMessageCreate(client);
