import {
  getBlockAllCommandsValue,
  getBlockHugsCommandsUser,
  setUserBlockHugs,
} from "../db_service/interaccionesService.js";

export const blockInteractionsCommands = {
  name: "bloquearinteracciones",
  alias: ["blockinteractions", "bii"],

  async execute(message, args) {
    const userID = message.author.id;

    const todas = await getBlockAllCommandsValue();
    const category = todas.find(([key, value]) => key === "all");
    /* const keys = Object.keys(category);  */
    console.log(todas);

    /* if (keys.includes(message.author.id)) {
      const user = todas[message.author.id];
      console.log(user);
    } else {
      const user = {
        nickname: message.member.nickname ?? message.author.username,
        id: userID,
      };
      setUserBlockHugs(message.author.id, user);
      message.reply("Has bloqueado los abrazos")
    } */
  },
};

export const blockHugCommand = {
  name: "bloquearabrazos",
  alias: ["blockhugs"],

  async execute(message, args) {
    const userID = message.author.id;

    const abrazos = await getBlockHugsCommandsUser();
    const keys = Object.keys(abrazos);
    console.log(keys);

    if (keys.includes(userID)) {
      message.reply("Ya tienes los abrazos bloqueados");
    } else {
      const user = {
        nickname: message.member.nickname ?? message.author.username,
      };
      setUserBlockHugs(userID, user);
      message.reply("Has bloqueado los abrazos");
    }
  },
};
