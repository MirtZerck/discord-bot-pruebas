export const getUserByID = (message, id) => {
    return message.guild.members.cache.get(id);
}