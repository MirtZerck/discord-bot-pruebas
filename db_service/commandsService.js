import { db } from "../michi.js";

export class CommandsService {
  constructor(serverId) {
    this.serverId = serverId;
    this.commandsDB = db.child("servers").child(serverId).child("commands");
    this.randomReplysDB = this.commandsDB.child("random_replys");
  }

  async getCommands() {
    const commands = await this.commandsDB.once("value");
    if (commands.exists()) {
      return Object.entries(commands.val());
    } else {
      return undefined;
    }
  }

  async getCommandsValue(commandName) {
    const commands = await this.getCommands();
    const command = commands.find((comando) => comando[1][commandName]);
    return command;
  }

  async setCommandByCategory(categoria, key, value) {
    return await this.commandsDB.child(categoria).child(key).set(value);
  }

  async setCommandBySubcategory(categoria, subcategoria, key, value) {
    return await this.commandsDB
      .child(categoria)
      .child(subcategoria)
      .child(key)
      .set(value);
  }

  async setUserReplyCommand(user, replyImg) {
    const id = (await this.randomReplysDB.once("value")).numChildren() + 1;
    return await this.randomReplysDB
      .child(user.toLowerCase())
      .child(id)
      .set(replyImg);
  }
}
