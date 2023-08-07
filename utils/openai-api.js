import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import {
  getConversationOpenAI,
  setConversationOpenAI,
} from "../db_service/openai_service.js";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function getPromptGTP(prompt) {
  const messages = await getConversationOpenAI();

  const promptUser = {
    role: "user",
    content: prompt,
  };
  messages.push(promptUser);

  let newMessages = [];
  if (messages.length > 10) {
    messages.forEach((msg, index) => {
      if (index === 0 || index > messages.length - 10) {
        newMessages.push(msg);
      }
    });
  } else {
    newMessages = messages;
  }

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    // messages: message -> [Se ha simplificado]
    messages: newMessages,
  });
  const response = completion.data.choices[0].message.content;

  setConversationOpenAI(promptUser.content, response, messages.length - 1);
  return response;
}
