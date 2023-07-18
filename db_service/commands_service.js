import { db } from "../puky.js";

export async function getCommandsValue(commandName) {
  const comandos_db = await db.child("commands").once("value");
  const comandos = Object.entries(comandos_db.val());

  // comandos[0] son categorías y comandos[1] los valores
  const comando = comandos.find((comando) => comando[1][commandName]);

  return comando;
}


export async function setCommandByCategory(categoria, key, value){
    return await db.child('commands').child(categoria).child(key).set(value);
} 

export async function setCommandBySubcategory(categoria, subcategoria, key, value){
  return await db.child('commands').child(categoria).child(subcategoria).child(key).set(value);
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
  return text.replace("respuesta", respuesta);
}
