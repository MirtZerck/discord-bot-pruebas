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

export async function updateInteractionsCount(userID1, userID2, interactionType) {
  try {
    // Ordenar los IDs de usuario para evitar duplicados en la base de datos
    const [minorID, majorID] = [userID1, userID2].sort();

    // Referencia al contador de abrazos en la base de datos
    const countRef = db.child(
      `interacciones/conteos/${interactionType}/${minorID}/${majorID}`
    );

    // Obtener el valor actual del contador
    const snapshot = await countRef.once("value");
    const currentCount = snapshot.val() || 0;

    // Incrementar el contador
    const newCount = currentCount + 1;

    // Actualizar el contador en la base de datos
    await countRef.set(newCount);

    // Devolver el nuevo valor del contador
    return newCount;
  } catch (error) {
    // Manejar errores
    console.log(`Error al actualizar el conteo de ${interactionType} en Firebase`, error);
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
