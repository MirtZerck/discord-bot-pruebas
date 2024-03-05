// Función para obtener un miembro del servidor por su ID
export const getMemberByID = (message, id) => {
  // Accede al caché de miembros del servidor y retorna el miembro con el ID especificado
  return message.guild.members.cache.get(id);
};

// Función para buscar un miembro en el servidor basándose en un filtro
export const getMemberByFilter = (message, filter) => {
  // Convierte el filtro a minúsculas y elimina espacios adicionales para una búsqueda consistente
  const filtro = filter.toLowerCase().trim();

  // Busca en el caché de miembros del servidor y retorna el primer miembro que cumpla con las condiciones
  return message.guild.members.cache.find((member) => {
    // Obtiene el nombre para mostrar (displayName) del miembro en minúsculas
    const displayName = member.displayName.toLowerCase();

    // Comprueba si el displayName del miembro incluye el filtro o si el ID del usuario coincide con el filtro
    return displayName.includes(filtro) || member.user.id === filter;
  });
};
