// Importamos la dependencia necesaria
import { GuildMember } from "discord.js";

/**
 * Obtiene el color dinámico basado en los roles de un usuario en Discord.
 * @param {GuildMember} member - El miembro del cual obtener el color del rol.
 * @returns {number} El color hexadecimal del rol más alto con color, o un color aleatorio.
 */
export const getDynamicColor = (member) => {
  // Ordenamos los roles del miembro por su posición de manera descendente
  const roles = member.roles.cache.sorted((a, b) => b.position - a.position);

  // Buscamos el primer rol con color
  const coloredRole = roles.find((role) => role.color !== 0);

  // Si encontramos un rol con color, lo retornamos
  if (coloredRole) return coloredRole.color;

  // Si no hay roles con color, generamos un color aleatorio
  return Math.floor(Math.random() * 16777215);
};
