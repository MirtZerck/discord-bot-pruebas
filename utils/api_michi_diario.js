import { MessageEmbed } from "discord.js";
import { getRandomNumber } from "./utilsFunctions.js";
import { buenosNyas } from "../constants/buenos_nyas.js";

async function obtenerMichiDiario() {
  const url = `https://api.thecatapi.com/v1/images/search`;
  const respuesta = await fetch(url);
  const data = await respuesta.json();
  return data[0].url;
}

export async function obtenerEmbedMichiDiario() {
  const url = await obtenerMichiDiario();
  const index = getRandomNumber(0, buenosNyas.length - 1);
  const mensaje = buenosNyas[index];

  const embedMichiDiario = new MessageEmbed()
    .setAuthor(
      "Gatos Gatunos",
      "https://fotografias.lasexta.com/clipping/cmsimages02/2019/01/25/DB41B993-B4C4-4E95-8B01-C445B8544E8E/98.jpg?crop=4156,2338,x0,y219&width=1900&height=1069&optimize=high&format=webply"
    )
    .setDescription(mensaje)
    .setTimestamp()
    .setImage(url)
    .setColor("RANDOM");
  return embedMichiDiario;
}

export async function enviarGatoALas(hora, canal) {
  const now = new Date();
  const targetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hora,
    0,
    0
  );

  let diferencia = targetTime - now;

  if (diferencia < 0) {
    targetTime.setDate(targetTime.getDate() + 1);
    diferencia = targetTime - now;
  }

  const embed = await obtenerEmbedMichiDiario();

  setTimeout(() => {
    canal.send(embed);

    enviarGatoALas(hora, canal);
  }, diferencia);
}
