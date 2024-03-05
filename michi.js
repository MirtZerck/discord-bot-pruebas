import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  PresenceUpdateStatus,
  EmbedBuilder,
  Colors,
  messageLink,
} from "discord.js";
import dotenv from "dotenv";
/* import { onMessageCreate } from "./commands/respuestas.js"; */
import { openAiChat } from "./commands/openAiChat.js";
import { arrayCommands } from "./commands/index.js";
import { enviarGatoALas } from "./utils/api_michi_diario.js";
import {
  gatosGatunosXpellit,
  generalMirtZerck,
  generalPruebasBot,
  generalXpellit,
} from "./constants/canalesID.js";
import firebase from "firebase-admin";
import { createRequire } from "module";
import { prefijo } from "./constants/prefix.js";
import { onInteractionCreate } from "./slashCommands/slashRespuestas.js";
import { rankXpellitControl } from "./commands/rankXpellitControl.js";
import { handleSpecialCommands } from "./commands/specialCommand.js";
import { mirtZerckID } from "./constants/users_ID.js";
import { onMessageCreate } from "./commands/respuestas.js";

const require = createRequire(import.meta.url);

const serviceAccount = require("./gatos-gatunos-firebase-adminsdk-23njm-da6890c263.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://gatos-gatunos-default-rtdb.firebaseio.com",
});

firebase.auth();

export const db = firebase.database().ref("/");

dotenv.config();

export const token = process.env.TOKENPRUEBAS;
export const APPLICATION_ID = process.env.APPLICATION_ID_PRUEBAS;

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildIntegrations,
  ],
});

// Logear el bot
client.login(token);

client.once(Events.ClientReady, async () => {
  console.log("El bot se ha iniciado como", client.user.username);

  client.user.setPresence({
    activities: [
      {
        name: "Minecraft",
        type: ActivityType.Competing,
      },
    ],
    status: PresenceUpdateStatus.DoNotDisturb,
  });

  const canal_general_uno = client.channels.cache.get("");

  const canal_general_dos = client.channels.cache.get("");

  const embedEcendido = new EmbedBuilder()
    .setAuthor({
      name: "Gatos Gatunos Bot",
      iconURL:
        "https://w0.peakpx.com/wallpaper/961/897/HD-wallpaper-bunny-cute-rabbit-animal.jpg",
    })
    .setTitle(`Hola, he sido actualizado y ya desperté`)
    .setImage("https://media.tenor.com/n1d_M_lXA1kAAAAd/molestar-gatos.gif")
    .setDescription("Soy un michito grr :3")
    // .setColor(Color.)
    .setColor(0x81d4fa)
    .setFooter({
      text: `Tengo hambre`,
    })
    .setTimestamp();

  if (canal_general_uno) {
    canal_general_uno.send({ embeds: [embedEcendido] });
  }

  if (canal_general_dos) {
    canal_general_dos.send({ embeds: [embedEcendido] });
  }

  const canal_gatos_gatunos = client.channels.cache.get(gatosGatunosXpellit);

  if (canal_gatos_gatunos) {
    enviarGatoALas(7, canal_gatos_gatunos);
  }
  if (canal_general_dos) {
    enviarGatoALas(7, canal_general_uno);
  }
});

await openAiChat(client);
await onInteractionCreate(client);
await rankXpellitControl(client);
await handleSpecialCommands(client, mirtZerckID);
await onMessageCreate(client);
