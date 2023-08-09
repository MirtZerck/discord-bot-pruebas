import { db } from "../michi.js";

export async function getRankXpellitDiscord() {
  const rankingDiscord = await db.child("xpellitGlobal").child("rankingDiscord").once("value");
  if (rankingDiscord.exists()) {
    return rankingDiscord.val();
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

export async function setUserRankXpellitDiscord(id, values) {
  return await db.child("xpellitGlobal").child("rankingDiscord").child(id).set(values);
}

export async function setUserRankTabla2(id, values) {
  return await db.child("clan").child("tabla2").child(id).set(values);
}

export async function removeUserRankTabla2(id) {
  return await db.child("clan").child("tabla2").child(id).remove();
}
