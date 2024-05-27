import { GuildMember } from "discord.js";

export interface socialConfig {
    name: string;
    requiresUser: boolean;
    requiresCount: boolean;
    descriptionCount?: (count: number) => string;
    type: string;
    group: string;
    action?: string;
    description: (requester: GuildMember, receiver: GuildMember) => string;
    soloDescription?: (requester: GuildMember) => string;
    footer: string;
    requiresRequest: boolean;
    requestMessage?: (requester: GuildMember, receiver: GuildMember) => string;
    rejectResponse?: string;
    noResponse?: string;
}
