export const mostrarPing = {
  name: "ping",
  alias: ["p", "pi"],

  async execute(message, args) {
    const ping = Date.now() - message.createdTimestamp;
    message.channel.send(`Tu ping es: ${ping}ms.`);
  },
};
