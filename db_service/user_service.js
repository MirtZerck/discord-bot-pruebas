import { db } from "../puky.js";

export async function setUser(message) {
  const user = {
    nickname: message.author.username,
    avatarURL: message.author.displayAvatarURL({ dynamic: true, size: 1024 }),
  };

  return await db.child("users").child(message.author.id).set(user);
}

export async function getUser(id) {
  const user = await db
    .child("users")
    .child(id)
    .once("value");
    if (user.exists()) {
        return user.val();
    } else {
        return undefined
    }
}
