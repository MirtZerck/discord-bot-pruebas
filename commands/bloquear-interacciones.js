import { getBlockCommandsUser, setUserBlockHugs } from "../constants/interaccionesService.js";

export const blockHugCommand = {
  name: "bloquearabrazos",
  alias: ["blockhugs"],

  async execute(message, args) {
    const userID = message.author.id;

    const abrazos = await getBlockCommandsUser();
    const keys = Object.keys(abrazos);

    if (keys.includes(message.author.id)) {
      const user = abrazos[message.author.id];
      console.log(user);
    } else {
      const user = {
        nickname: message.member.nickname ?? message.author.username,
        id: userID,
      };
      setUserBlockHugs(message.author.id, user);
      message.reply("Has bloqueado los abrazos")
    }
  },
};
