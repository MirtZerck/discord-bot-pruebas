import axios, { AxiosResponse } from "axios";

export async function obtenerDataApi<T>(url: string): Promise<T | string> {
    const response: AxiosResponse<T> = await axios.get(url);
    return evaluarStatusResponse(response);
}

export async function solicitarPostAPI<T>(url: string, encodeParams: URLSearchParams): Promise<T | string> {
    const options = {
        method: "POST",
        url,
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "Accept-Encoding": "application/gzip",
            "X-RapidAPI-Key": "cc3e8e6eecmsh4dbabbab214b3acp12d82bjsn92bd687901de",
            "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
        },
        data: encodeParams,
    };
    const response: AxiosResponse<T> = await axios.request(options);
    return evaluarStatusResponse(response);
}

function evaluarStatusResponse<T>(response: AxiosResponse<T>): T | string {
    if (response.status === 200) {
        return response.data;
    }

    if (response.status === 400) {
        return "Ha ocurrido un error :c";
    }

    if (response.status === 404) {
        return "No se ha encontrado :p";
    }

    return "Ya ño se puede :c";
}
