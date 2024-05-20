import { API_DATO_CURIOSO_URL } from "../constants/apisUrl.js";
import { obtenerTraduccionEnEs } from "./apiTraductor.js";
import { obtenerDataApi } from "./apiServer.js";

interface DatoCuriosoResponse {
    fact: string;
}

export async function obtenerDatoCurioso(): Promise<string> {
    const respuesta = await obtenerDataApi<DatoCuriosoResponse>(API_DATO_CURIOSO_URL);
    if (typeof respuesta === "string") {
        throw new Error(respuesta);
    }
    const fact = respuesta.fact;
    const dato = await obtenerTraduccionEnEs(fact);
    return dato;
}
