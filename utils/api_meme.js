import {getRandomNumber} from './utilsFunctions.js'

export async function obtenerMeme() {
  const url = "https://api.imgflip.com/get_memes";
  const respuesta = await fetch(url);
  const data = await respuesta.json();
  const memes = data.data.memes;
  const index = getRandomNumber(0, memes.length - 1);
  return memes[index];
}
