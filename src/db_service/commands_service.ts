import { db } from "../michi.js";
import { Message } from "discord.js";

export async function getCommandsValue(group: string, commandName: string): Promise<[string, any] | undefined> {
    const comandos_db = await db.child(group).once("value");
    const comandos = Object.entries(comandos_db.val() as Record<string, any>);
    return comandos.find((comando) => comando[1][commandName]);}


export async function getGroupValues(group: string): Promise<[string, any][]> {
    const comandos_db = await db.child(group).once("value");
    return Object.entries(comandos_db.val());
}

export async function updateCount(
    userID1: string,
    userID2: string,
    type: string,
    group: string
): Promise<number> {
    try {
        const [minorID, majorID] = [userID1, userID2].sort();
        const countRef = db.child(`${group}/conteos/${type}/${minorID}/${majorID}`);
        const snapshot = await countRef.once("value");
        const currentCount = snapshot.val() || 0;
        const newCount = currentCount + 1;
        await countRef.set(newCount);
        return newCount;
    } catch (error) {
        console.log(`Error al actualizar el conteo de ${type} en Firebase`, error);
        throw error;
    }
}

export async function setCommandByCategory(categoria: string, key: string, value: string): Promise<void> {
    return await db.child("commands").child(categoria).child(key).set(value);
}

export async function setCommandBySubcategory(
    categoria: string,
    subcategoria: string,
    key: string,
    value: string
): Promise<void> {
    return await db
        .child("commands")
        .child(categoria)
        .child(subcategoria)
        .child(key)
        .set(value);
}

export function replaceArgumentText(
    text: string,
    message: Message,
    commandBody: string,
    commandName: string,
    args: string[]
): string {
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

export function replaceBlockCommandsNames(
    text: string,
    message: Message,
    commandBody: string,
    commandName: string,
    args: string[]
): string | undefined {
    if (!text.includes("command")) return text;

    let command = "";
    switch (commandName) {
        case "bloquearinteracciones":
        case "blockinteractions": {
            command = "all";
            break;
        }
        case "bloquearabrazos":
        case "blockhugs": {
            command = "abrazos";
            break;
        }
    }

    return text.replace("command", command);
}

export async function updateWarnsCount(
    userId: string,
    serverId: string,
    serverName: string,
    reason: string
): Promise<number> {
    try {
        const serverRef = db.child(`servers/${serverId}`);
        const warnsRef = serverRef.child(`warns/${userId}`);

        const snapshot = await warnsRef.once("value");
        let data = snapshot.val();

        if (data) {
            data.count = (data.count || 0) + 1;
            if (data.reasons) {
                data.reasons.push(reason);
            } else {
                data.reasons = [reason];
            }
        } else {
            data = { count: 1, reasons: [reason] };
        }

        const serverSnapshot = await serverRef.child("name").once("value");
        if (!serverSnapshot.exists() || serverSnapshot.val() !== serverName) {
            await serverRef.child("name").set(serverName);
        }

        await warnsRef.set(data);

        return data.count;
    } catch (error) {
        console.log(`Error al actualizar el conteo de advertencias en Firebase`, error);
        throw error;
    }
}

export async function checkWarns(
    userId: string,
    serverId: string
): Promise<{ count: number; reasons: string[] }> {
    try {
        const warnsRef = db.child(`servers/${serverId}/warns/${userId}`);
        const snapshot = await warnsRef.once("value");
        const data = snapshot.val();

        if (!data) {
            return { count: 0, reasons: [] };
        }

        return { count: data.count || 0, reasons: data.reasons || [] };
    } catch (error) {
        console.error(`Error al revisar las advertencias en Firebase`, error);
        throw error;
    }
}

export async function editWarns(
    userId: string,
    serverId: string,
    warnIndexToRemove: number
): Promise<number | undefined> {
    try {
        if (warnIndexToRemove < 0) {
            console.error("El índice de advertencias no puede ser negativo.");
            return;
        }

        const warnsRef = db.child(`servers/${serverId}/warns/${userId}`);
        const snapshot = await warnsRef.once("value");
        const data = snapshot.val();

        if (!data || !data.reasons || data.reasons.length <= warnIndexToRemove) {
            console.error("Advertencia no encontrada o índice fuera de rango.");
            return;
        }

        data.reasons.splice(warnIndexToRemove, 1);
        data.count = data.reasons.length;

        await warnsRef.set(data);

        return data.count;
    } catch (error) {
        console.error(`Error al editar las advertencias en Firebase`, error);
        throw error;
    }
}

export async function moveCommands(serverId: string): Promise<void> {
    const globalClanCommandsRef = db.child(`commands`);
    const serverCommandsRef = db.child(`servers/${serverId}/commands`);

    try {
        const snapshot = await globalClanCommandsRef.once("value");
        const commands = snapshot.val();
        if (commands) {
            await serverCommandsRef.set(commands);
            console.log("Todos los comandos han sido movidos exitosamente.");
        } else {
            console.log("No se encontraron comandos globales para mover.");
        }
    } catch (error) {
        console.error("Error al mover todos los comandos:", error);
        throw error;
    }
}

export async function updatePlayTimeMusic(serverId: string, playTime: number): Promise<void> {
    const playTimeRef = db.child(`servers/${serverId}/music/playTime`);

    try {
        await playTimeRef.set(playTime);
    } catch (error) {
        console.error("Error al actualizar el tiempo de reproducción de la música:", error);
    }
}
