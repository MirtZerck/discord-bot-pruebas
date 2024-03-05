// Importamos la clase SlashCommandBuilder de la biblioteca 'discord.js'
import { SlashCommandBuilder } from "discord.js";
import { arrayCommands } from "../commands/index.js";

// Exportamos una constante llamada reloadCommand que contiene toda la funcionalidad del comando
export const reloadCommand = {
  // Definimos la categoría del comando (puede ser útil para organizar comandos)
  category: "utility",
  // Definimos la estructura del comando utilizando SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("reload") // Nombre del comando
    .setDescription("Recarga un comando") // Descripción del comando
    .addStringOption(
      (
        option // Opción para el nombre del comando a recargar
      ) =>
        option
          .setName("command")
          .setDescription("El comando para recargar")
          .setRequired(true)
    ), // Esta opción es requerida

  // Definimos la función execute que se ejecutará cuando el comando sea usado
  async execute(interaction) {
    // Obtenemos el nombre del comando a recargar desde la interacción del usuario
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();

    const command = arrayCommands.find((cmd) => cmd.data.name === commandName);

    // Verificamos si el comando existe
    if (!command) {
      return interaction.reply(
        `No existe un comando con el nombre \`${commandName}\`!`
      );
    }

    try {
      // Actualizamos el comando eliminándolo del array y volviéndolo a agregar
      const index = arrayCommands.find(
        (cmd) => cmd.data.name === commandName
      );
      arrayCommands.splice(index, 1);

      const newCommand = await import(`./${command.data.name}.js`); // Importamos el nuevo comando
      arrayCommands.push(newCommand); // Agregamos el nuevo comando al array

      await interaction.reply(`Comando \`${commandName}\` fue recargado!`);
    } catch (error) {
      console.error(error);
      await interaction.reply(
        `Hubo un error al recargar el comando \`${commandName}\`:\n\`${error.message}\``
      );
    }
  },
};
