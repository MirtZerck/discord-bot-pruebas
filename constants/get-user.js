export const getMemberByID = (message, id) => {
  return message.guild.members.cache.get(id);
};
