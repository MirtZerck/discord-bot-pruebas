import dayjs from "dayjs";
import "dayjs/locale/es.js"; // Importa la localización en español para usar formatos de fecha específicos de este idioma

dayjs.locale("es");

export const convertDateToString = (fecha: Date): string => {
    return dayjs(fecha).format("DD [de] MMMM [del] YYYY");
};
