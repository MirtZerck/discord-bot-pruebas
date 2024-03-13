// Función para obtener un miembro del servidor por su ID
export const getMemberByID = (message, id) => {
  // Accede al caché de miembros del servidor y retorna el miembro con el ID especificado
  return message.guild.members.cache.get(id);
};

// Función para buscar un miembro en el servidor basándose en un filtro
export const getMemberByFilter = (message, filter) => {
  const filtro = filter.toLowerCase().trim();

  // Verifica primero si el filtro es un ID numérico válido
  if (!isNaN(filtro) && filtro.length > 16) {
    // Los ID de Discord tienen 17 o 18 dígitos
    return message.guild.members.cache.get(filtro);
  }

  // Si no es un ID, busca por nombre de usuario o apodo
  return message.guild.members.cache.find((member) => {
    const displayName = member.displayName.toLowerCase();
    const username = member.user.username.toLowerCase();
    return displayName.includes(filtro) || username.includes(filtro);
  });
};
