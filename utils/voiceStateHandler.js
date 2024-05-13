import { getVoiceConnection } from "@discordjs/voice";

export async function checkAndDisconnectIfAloneOrInactive(
  connection,
  channel,
  guildId
) {
  if (connection.inactivityTimeout) clearTimeout(connection.inactivityTimeout);
  connection.inactivityTimeout = setTimeout(async () => {
    const currentConnection = getVoiceConnection(guildId);
    if (currentConnection !== connection) {
      console.log("La conexión ha cambiado o ya no es relevante.");
      return;
    }

    const freshChannel = await channel.guild.channels.fetch(channel.id);
    if (!freshChannel) {
      console.log("El canal ya no existe.");
      connection.destroy();
      return;
    }

    const memberCount = freshChannel.members.filter(
      (member) => !member.user.bot
    ).size;
    if (memberCount === 0) {
      console.log("Desconectado porque no hay más usuarios en el canal...");
      connection.destroy();
    } else {
      console.log("Aún hay usuarios en el canal.");
    }
  }, 180000); // 180000 ms = 3 minutos
}
