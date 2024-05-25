import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  PresenceUpdateStatus,
  EmbedBuilder,
} from "discord.js";
import dotenv from "dotenv";
import firebase from "firebase-admin";
import { prefijo } from "./constants/prefix.js";
import { onMessageCreate } from "./commands/answers.js";
import { openAiChat } from "./commands/openaiChat.js";
import { onInteractionCreate } from "./slashCommands/interactionCreate.js";

dotenv.config();

export const token = process.env.TOKEN!;
export const APPLICATION_ID = process.env.APPLICATION_ID!;

const firebaseConfig = JSON.parse(process.env.FIREBASE_ADMIN_SDK!);

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
  databaseURL: "https://gatos-gatunos-default-rtdb.firebaseio.com",
});

firebase.auth();

export const db = firebase.database().ref("/");

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
});

async function startBot() {
  // Logear el bot
  await client.login(token);

  client.once(Events.ClientReady, async () => {
    console.log("El bot se ha iniciado como", client.user?.username);

    client.user?.setPresence({
      activities: [
        {
          name: `Mi prefijo es ${prefijo} `,
          type: ActivityType.Custom,
        },
      ],
      status: PresenceUpdateStatus.DoNotDisturb,
    });

    /* const canal_general_uno = client.channels.cache.get("");

    const canal_general_dos = client.channels.cache.get("");

    const embedEcendido = new EmbedBuilder()
      .setAuthor({
        name: "Hikari Koizumi",
        iconURL:
          "https://w0.peakpx.com/wallpaper/961/897/HD-wallpaper-bunny-cute-rabbit-animal.jpg",
      })
      .setTitle(`Hola, he sido actualizado y ya desperté`)
      .setImage("https://media.tenor.com/n1d_M_lXA1kAAAAd/molestar-gatos.gif")
      .setDescription("Soy un michito grr :3")
      .setColor(0x81d4fa)
      .setFooter({
        text: `Tengo hambre`,
      })
      .setTimestamp();

    if (canal_general_uno) {
      (canal_general_uno as TextChannel).send({ embeds: [embedEcendido] });
    }

    if (canal_general_dos) {
      (canal_general_dos as TextChannel).send({ embeds: [embedEcendido] });
    }

    const canal_gatos_gatunos = client.channels.cache.get(gatosGatunosXpellit);

    if (canal_gatos_gatunos) {
      enviarGatoALas(7, canal_gatos_gatunos as TextChannel);
    }
    if (canal_general_dos) {
      enviarGatoALas(7, canal_general_uno as TextChannel);
    } */
  });

  await openAiChat(client);
  await onInteractionCreate(client);
  /*await rankXpellitControl(client);
  await handleSpecialCommands(client, mirtZerckID); */
  await onMessageCreate(client);
}

startBot();
