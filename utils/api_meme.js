import { API_MEME_URL } from '../constants/apis_url.js';
import { obtenerDataApi } from './apiserver.js';
import {getRandomNumber} from './utilsFunctions.js'

export async function obtenerMeme() {
  const respuesta = await obtenerDataApi(API_MEME_URL)
  const memes = respuesta.data.memes;
  const index = getRandomNumber(0, memes.length - 1);
  return memes[index];
}
