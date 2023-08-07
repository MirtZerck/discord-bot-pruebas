import { API_MEME_URL } from "../constants/apis_url.js";
import { obtenerDataApi } from "./apiserver.js";
import { getRandomNumber } from "./utilsFunctions.js";
import axios from "axios";

export async function obtenerMeme(textBottom, textTop) {
  /*  const respuesta = await obtenerDataApi(API_MEME_URL);
  const memes = respuesta.data.memes;
  const index = getRandomNumber(0, memes.length - 1);
  return memes[index]; */

  const options = {
    method: "GET",
    url: "https://ronreiter-meme-generator.p.rapidapi.com/meme",
    params: {
      top: textTop,
      bottom: textBottom,
      meme: "Condescending-Wonka",
    },
    headers: {
      "X-RapidAPI-Key": "cc3e8e6eecmsh4dbabbab214b3acp12d82bjsn92bd687901de",
      "X-RapidAPI-Host": "ronreiter-meme-generator.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
