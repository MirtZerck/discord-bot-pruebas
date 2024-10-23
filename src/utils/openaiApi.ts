/* import OpenAI from "openai";
import dotenv from "dotenv";
import { getConversationOpenAI, setConversationOpenAI } from "../db_service/openaiService.js";
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface OpenAIMessage {
    role: "user" | "assistant";
    content: string;
}

export async function getPromptGTP(prompt: string): Promise<string> {
    const messages: OpenAIMessage[] = await getConversationOpenAI();

    const promptUser: OpenAIMessage = {
        role: "user",
        content: prompt,
    };
    messages.push(promptUser);

    let newMessages: OpenAIMessage[] = [];
    const initialMessagesCount = 7; // Número de mensajes iniciales a conservar
    const maxMessagesLength = 19; // Máximo total de mensajes a conservar
    if (messages.length > maxMessagesLength) {
        // Incluye los primeros mensajes iniciales
        newMessages = messages.slice(0, initialMessagesCount);
        // Añade los mensajes más recientes para completar el máximo permitido
        newMessages = newMessages.concat(
            messages.slice(-(maxMessagesLength - initialMessagesCount))
        );
    } else {
        newMessages = messages;
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: newMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        max_tokens: 150, // Ajusta según tus necesidades
        temperature: 0.4, // Ajusta para controlar la creatividad de las respuestas
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["\n", " user:", " assistant:"], // Ajusta los delimitadores de parada según tu flujo de conversación
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";

    await setConversationOpenAI(promptUser.content, response, messages.length - 1);
    return response;
}
 */