import { Events, Client, Interaction } from "discord.js";
import { arraySlashCommands } from "./slashIndex.js";

export const onInteractionCreate = async (client: Client) => {
    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (!interaction.isCommand()) return;

        const slashCommand = arraySlashCommands.find(
            (slashCommand) => slashCommand.data.name === interaction.commandName
        );

        if (slashCommand) {
            try {
                await slashCommand.execute(interaction);
            } catch (error) {
                console.error("Error ejecutando el comando:", error);
                await interaction.reply({
                    content: "Hubo un error al ejecutar este comando.",
                    ephemeral: true,
                });
            }
        } else {
            await interaction.reply({ content: "Comando no encontrado", ephemeral: true });
        }
    });
};
