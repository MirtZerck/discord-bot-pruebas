export const getMemberByID = (message, id) => {
  return message.guild.members.cache.get(id);
};

export const getMemberByFilter = (message, filter) => {
  const filtro = filter.toLowerCase().trim();
  return message.guild.members.cache.find((member) => {
    return (
      member.user.username.toLowerCase().includes(filtro) ||
      (member.nickname && 
        member.nickname.toLowerCase().includes(filtro)) ||
      member.user.id === filter
    );
  });
};
