import { db } from "../michi.js";

export async function getRankTabla1() {
  const tabla1 = await db.child("clan").child("tabla1").once("value");
  if (tabla1.exists()) {
    return tabla1.val();
  } else {
    return undefined;
  }
}

export async function getRankTabla2() {
  const tabla2 = await db.child("clan").child("tabla2").once("value");
  if (tabla2.exists()) {
    return tabla2.val();
  } else {
    return undefined;
  }
}

export async function setUserRankTabla1(id, values) {
  return await db.child("clan").child("tabla1").child(id).set(values);
}

export async function setUserRankTabla2(id, values) {
  return await db.child("clan").child("tabla2").child(id).set(values);
}

export async function removeUserRankTabla2(id) {
  return await db.child("clan").child("tabla2").child(id).remove();
}
