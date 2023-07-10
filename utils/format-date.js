import { months } from "../constants/months.js";

export const convertDateToString = (fecha) => {
  const date = new Date(fecha);
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  if (isNaN(day)) return "NaN";
  return `${day} de ${month} del ${year}`;
};
