import { API_MICHI_HABLANDO_URL } from "../constants/apis_url.js";
import { obtenerDataApi } from "./apiserver.js";

export async function obtenerMichiHablador(commandBody) {
  let commandBodyCodificado = encodeURIComponent(commandBody);
  const requestURL = `${commandBodyCodificado}?json=true`;
  const respuesta = await obtenerDataApi(API_MICHI_HABLANDO_URL+requestURL)
  
  return `https://cataas.com${respuesta.url}`; 
}

