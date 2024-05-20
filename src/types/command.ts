import { Message } from "discord.js";

export interface Command {
    name: string;
    alias?: string[];
    execute: (message: Message, args: string[], commandBody?: string) => void;
}