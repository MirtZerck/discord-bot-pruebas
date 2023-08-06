import { db } from "../michi.js";

export async function getBlockCommandsUser() {
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

export async function setUserBlockHugs(id, values) {
  return await db.child("bloquearComandos").child("abrazos").child(id).set(values);
}
