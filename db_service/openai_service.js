import { db } from "../michi.js";

export async function getConversationOpenAI() {
  const conversation = await db.child("openaiChat").once("value");

  const arrayConversation = conversation.val();

  const message = arrayConversation.map((msg) => {
    return {
      role: Object.keys(msg)[0],
      content: Object.values(msg)[0],
    };
  });

  return message;
}

export async function setConversationOpenAI(
  contentUser,
  contentAssistant,
  index
) {
  await db
    .child("openaiChat")
    .child(index.toString())
    .set({ user: contentUser });
  await db
    .child("openaiChat")
    .child((index + 1).toString())
    .set({ assistant: contentAssistant });
}
