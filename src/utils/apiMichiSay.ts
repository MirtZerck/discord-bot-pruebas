import { API_MICHI_HABLANDO_URL } from "../constants/apisUrl.js";
import { obtenerDataApi } from "./apiServer.js";

interface MichiHabladorResponse {
    url: string;
}

export async function obtenerMichiHablador(commandBody: string): Promise<string> {
    const commandBodyCodificado = encodeURIComponent(commandBody);
    const requestURL = `${API_MICHI_HABLANDO_URL}${commandBodyCodificado}?json=true`;
    const respuesta = await obtenerDataApi<MichiHabladorResponse>(requestURL);

    if (typeof respuesta === "string") {
        throw new Error(respuesta);
    }

    return `https://cataas.com${respuesta.url}`;
}
