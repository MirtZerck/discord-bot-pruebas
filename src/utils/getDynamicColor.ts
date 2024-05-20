import { GuildMember } from "discord.js";

/**
 * @param {GuildMember} member
 * @returns {number}
 */
export const getDynamicColor = (member: GuildMember): number => {
    const roles = member.roles.cache.sorted((a, b) => b.position - a.position);
    const coloredRole = roles.find((role) => role.color !== 0);

    if (coloredRole) return coloredRole.color;

    return Math.floor(Math.random() * 16777215);
};
