import { db } from "../michi.js";

interface OpenAIMessage {
    role: "user" | "assistant";
    content: string;
}

export async function getConversationOpenAI(): Promise<OpenAIMessage[]> {
    const conversation = await db.child("openaiChat").once("value");
    const arrayConversation = conversation.val();

    if (!arrayConversation) {
        return [];
    }

    const messages: OpenAIMessage[] = arrayConversation.map((msg: { [key: string]: string }) => {
        return {
            role: Object.keys(msg)[0] as "user" | "assistant",
            content: Object.values(msg)[0],
        };
    });


    const maxMessages = 101;
    const initialMessagesCount = 7;

    if (messages.length > maxMessages) {

        const initialMessages = messages.slice(0, initialMessagesCount);


        await db.child("openaiChat").remove();


        for (let i = 0; i < initialMessages.length; i++) {
            const msg = initialMessages[i];
            await db.child("openaiChat").child(i.toString()).set({ [msg.role]: msg.content });
        }

        return initialMessages;
    }

    return messages;
}

export async function setConversationOpenAI(
    contentUser: string,
    contentAssistant: string,
    index: number
): Promise<void> {
    await db.child("openaiChat").child(index.toString()).set({ user: contentUser });
    await db.child("openaiChat").child((index + 1).toString()).set({ assistant: contentAssistant });
}
