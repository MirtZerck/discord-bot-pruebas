import { GuildMember } from "discord.js";

export const formatUserRoles = (member: GuildMember): string => {
    const roles = member.roles.cache
        .filter((r) => r.id !== member.guild.id) // Excluye el rol @everyone
        .map((r) => `<@&${r.id}>`) // Formatea cada rol como una mención
        .join(", "); // Une todos los roles con coma

    return roles.length > 0 ? roles : "Ningún rol adicional";
};
