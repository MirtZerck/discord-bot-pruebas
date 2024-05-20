import { db } from "../michi.js";
import { DataSnapshot } from "firebase-admin/database";
import { CommandData } from "../types/commandData.js";

export class CommandsService {
    serverId: string;
    commandsDB: any;
    randomReplysDB: any;

    constructor(serverId: string) {
        this.serverId = serverId;
        this.commandsDB = db.child("servers").child(serverId).child("commands");
        this.randomReplysDB = this.commandsDB.child("personalizados");
    }

    async getCommands(): Promise<{ [key: string]: CommandData }> {
        const commands: DataSnapshot = await this.commandsDB.once("value");

        if (commands.exists()) {
            return commands.val() as { [key: string]: CommandData };
        } else {
            return {};
        }
    }

    async getCommandsValue(commandName: string): Promise<[string, CommandData] | undefined> {
        const commands = await this.getCommands();
        const command = Object.entries(commands).find(([_, data]) => data[commandName]);
        return command;
    }

    async setCommandByCategory(categoria: string, key: string, value: string): Promise<void> {
        await this.commandsDB.child(categoria).child(key).set(value);
    }

    async setCommandBySubcategory(categoria: string, subcategoria: string, key: string, value: string): Promise<void> {
        await this.commandsDB.child(categoria).child(subcategoria).child(key).set(value);
    }

    async setUserReplyCommand(user: string, replyImg: string): Promise<void> {
        const id = (await this.randomReplysDB.once("value")).numChildren() + 1;
        await this.randomReplysDB.child(user.toLowerCase()).child(id).set(replyImg);
    }

    async setServerTimezone(timezone: string): Promise<void> {
        await db.child("servers").child(this.serverId).child("timezone").set(timezone);
    }

    async getServerTimezone(): Promise<string | null> {
        const timezoneSnapshot = await db.child("servers").child(this.serverId).child("timezone").once("value");
        return timezoneSnapshot.exists() ? timezoneSnapshot.val() : null;
    }

    static replaceArgumentText(text: string, message: any, commandBody: string, commandName: string, args: string[]): string {
        if (!text.includes("respuesta")) return text;

        let respuesta = "";
        if (commandName === "inu") {
            respuesta = commandBody === "" ? "Michi" : commandBody;
        }

        if (commandName === "ban") {
            respuesta = commandBody === "" ? message.author.username : commandBody;
        }
        if (commandName === "pd") {
            respuesta = commandBody;
        }
        if (commandName === "say") {
            respuesta = commandBody;
        }
        if (commandBody === "gg") {
            respuesta = commandBody;
        }
        return text.replace("respuesta", respuesta);
    }
}
