import moment from "moment-timezone";

export const horaServer = {
  name: "horaserver",
  alias: ["hs", "hora"],

  async execute(message, args) {
    const horaServer = "America/Bogota";

    function obtenerHoraServer() {
      return moment().tz(horaServer).format("HH:mm:ss");
    }
    message.channel.send(`La hora servidor es: ${obtenerHoraServer()}`)
   
  },
};
