import { db } from "../michi.js";

export async function getCommandsValue(commandName) {
  const comandos_db = await db.child("commands").once("value");
  const comandos = Object.entries(comandos_db.val());

  // comandos[0] son categorías y comandos[1] los valores
  const comando = comandos.find((comando) => comando[1][commandName]);
  return comando;
}

export async function getInteraccionesValue() {
  const comandos_db = await db.child("interacciones").once("value");
  const comandos = Object.entries(comandos_db.val());

  return comandos;
}

export async function updateInteractionsCount(
  userID1,
  userID2,
  interactionType
) {
  try {
    const [minorID, majorID] = [userID1, userID2].sort();

    const countRef = db.child(
      `interacciones/conteos/${interactionType}/${minorID}/${majorID}`
    );

    const snapshot = await countRef.once("value");
    const currentCount = snapshot.val() || 0;

    const newCount = currentCount + 1;

    await countRef.set(newCount);

    return newCount;
  } catch (error) {
    console.log(
      `Error al actualizar el conteo de ${interactionType} en Firebase`,
      error
    );
    throw error;
  }
}

export async function setCommandByCategory(categoria, key, value) {
  return await db.child("commands").child(categoria).child(key).set(value);
}

export async function setCommandBySubcategory(
  categoria,
  subcategoria,
  key,
  value
) {
  return await db
    .child("commands")
    .child(categoria)
    .child(subcategoria)
    .child(key)
    .set(value);
}

export function replaceArgumentText(
  text,
  message,
  commandBody,
  commandName,
  args
) {
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
  text,
  message,
  commandBody,
  commandName,
  args
) {
  if (!text.includes("command")) return text;

  let command = "";
  switch (commandName) {
    case "bloquearinteracciones" || "blockinteractions": {
      command = "all";
      break;
    }
    case "bloquearabrazos" || "blockhugs": {
      command = "abrazos";
      break;
    }
  }
}

export async function updateWarnsCount(userId, serverId, serverName, reason) {
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
    console.log(
      `Error al actualizar el conteo de advertencias en Firebase`,
      error
    );
    throw error;
  }
}

export async function checkWarns(userId, serverId) {
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

export async function editWarns(userId, serverId, warnIndexToRemove) {
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

export async function moveCommands(serverId) {
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
