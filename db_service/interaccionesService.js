import { db } from "../michi.js";
import { replaceBlockCommandsNames } from "./commands_service.js";

export async function getBlockHugsCommandsUser() {
  const abrazos = await db
    .child("bloquearComandos")
    .child("abrazos")
    .once("value");
  if (abrazos.exists()) {
    return abrazos.val();
  } else {
    return undefined;
  }
}

export async function getBlockAllCommandsValue() {
  const command = replaceBlockCommandsNames()
  const categorias_db = await db
    .child("bloquearComandos")
    .child(comando)
    .once("value");
  const categoria = Object.entries(categorias_db.val());

  return categoria;
}

export async function setUserBlockHugs(id, values) {
  return await db
    .child("bloquearComandos")
    .child("abrazos")
    .child(id)
    .set(values);
}
