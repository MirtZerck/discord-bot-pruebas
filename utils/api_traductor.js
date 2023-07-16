import { API_TRADUCTOR_URL } from "../constants/apis_url.js";
import { obtenerDataApi, solicitarPostAPI } from "./apiserver.js";

export async function obtenerTraduccion(text, source = "en", target = "es") {
  const argumentos = new URLSearchParams();
  argumentos.set("q", text);
  argumentos.set("source", source);
  argumentos.set("target", target);
  const respuesta = await solicitarPostAPI(API_TRADUCTOR_URL, argumentos);
  if (!respuesta.data) {
    return respuesta;
  } else {
    const traduccion = respuesta.data.translations[0].translatedText;
    return traduccion;
  }
}
