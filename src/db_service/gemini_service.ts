import { Content } from '@google/generative-ai';
import { Reference } from 'firebase-admin/database';
import { db } from '../michi.js';

export class GeminiChat {
  private databaseRef: Reference;
  public initialMessage: Content[] = [];
  constructor() {
    this.databaseRef = db.child('geminiChat');
  }

  async getConversationGemini(): Promise<[Content[], string]> {
    const conversation = await this.databaseRef.once('value');

    const arrayConversation = conversation.val();

    const messages: Content[] = arrayConversation.map(
      (msg: { role: 'user' | 'model'; content: string }) => {
        return {
          role: Object.keys(msg)[0],
          parts: [{ text: Object.values(msg)[0] }],
        };
      }
    );
   
    const lastIndex = Object.keys(arrayConversation).at(-1)!;

    const history = this.initialMessage
      .concat(messages.slice(-10))
      .filter((msg) => msg.role === 'user' || msg.role === 'model');

    return [history, lastIndex];
  }

  async setConversationGemini(
    contentUser: string,
    contentModel: string,
    index: number
  ) {
   

    if (index >= 10) {
      await this.databaseRef.child((index - 8).toString()).remove();
      await this.databaseRef.child((index + 1 - 8).toString()).remove();
    }

    await this.databaseRef.child(index.toString()).set({ user: contentUser });
    await this.databaseRef
      .child((index + 1).toString())
      .set({ model: contentModel });
  }
}
