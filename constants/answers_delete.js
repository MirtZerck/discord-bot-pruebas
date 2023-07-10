export const getReplysDelete = (message, commandBody, commandName, args) => {
  return {
    say: `${commandBody === "" ? "Los espío" : commandBody}`,
    nuke: "¡Borrando 1000 mensajes!",
    xpellit: `Hola! ${
      args[0] ?? message.author.username
    } Xpellit es un juego Indie, de estilo Animé, en el que existe un sistema gacha, en el cual puedes adquirir equipamiento como armaduras, arma y habilidades para crear el rol que más te guste y hacer equipo con otras personas para completar calabozos o bien para enfrentarte contra otros jugadores.`,
  };
};
