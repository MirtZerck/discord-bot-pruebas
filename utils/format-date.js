// Importamos Day.js y la localización en español
import dayjs from "dayjs";
import "dayjs/locale/es.js"; // Importa la localización en español para usar formatos de fecha específicos de este idioma

// Establecemos el idioma de Day.js en español, lo que afectará al formato de las fechas
dayjs.locale("es");

// Definimos y exportamos la función convertDateToString
export const convertDateToString = (fecha) => {
  // Utilizamos dayjs para convertir el objeto fecha a un string formateado
  // El formato "DD [de] MMMM [del] YYYY" se traduce en algo como "02 de marzo del 2023"
  return dayjs(fecha).format("DD [de] MMMM [del] YYYY");
};
