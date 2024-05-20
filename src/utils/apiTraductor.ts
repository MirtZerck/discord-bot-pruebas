import { API_TRADUCTOR_URL } from "../constants/apisUrl.js";
import { solicitarPostAPI } from "./apiServer.js";

interface TraduccionResponse {
    data: {
        translations: Array<{
            translatedText: string;
        }>;
    };
}

export async function obtenerTraduccionEnEs(text: string, source = "en", target = "es"): Promise<string> {
    const argumentos = new URLSearchParams();
    argumentos.set("q", text);
    argumentos.set("source", source);
    argumentos.set("target", target);
    const respuesta = await solicitarPostAPI<TraduccionResponse>(API_TRADUCTOR_URL, argumentos);
    if (typeof respuesta === "string" || !respuesta.data) {
        return respuesta as string;
    } else {
        const traduccion = respuesta.data.translations[0].translatedText;
        return traduccion;
    }
}

export async function obtenerTraduccionEsEn(text: string, source = "es", target = "en"): Promise<string> {
    const argumentos = new URLSearchParams();
    argumentos.set("q", text);
    argumentos.set("source", source);
    argumentos.set("target", target);
    const respuesta = await solicitarPostAPI<TraduccionResponse>(API_TRADUCTOR_URL, argumentos);
    if (typeof respuesta === "string" || !respuesta.data) {
        return respuesta as string;
    } else {
        const traduccion = respuesta.data.translations[0].translatedText;
        return traduccion;
    }
}

export async function obtenerTraduccionFrEs(text: string, source = "fr", target = "es"): Promise<string> {
    const argumentos = new URLSearchParams();
    argumentos.set("q", text);
    argumentos.set("source", source);
    argumentos.set("target", target);
    const respuesta = await solicitarPostAPI<TraduccionResponse>(API_TRADUCTOR_URL, argumentos);
    if (typeof respuesta === "string" || !respuesta.data) {
        return respuesta as string;
    } else {
        const traduccion = respuesta.data.translations[0].translatedText;
        return traduccion;
    }
}

export async function obtenerTraduccionEsFr(text: string, source = "es", target = "fr"): Promise<string> {
    const argumentos = new URLSearchParams();
    argumentos.set("q", text);
    argumentos.set("source", source);
    argumentos.set("target", target);
    const respuesta = await solicitarPostAPI<TraduccionResponse>(API_TRADUCTOR_URL, argumentos);
    if (typeof respuesta === "string" || !respuesta.data) {
        return respuesta as string;
    } else {
        const traduccion = respuesta.data.translations[0].translatedText;
        return traduccion;
    }
}
