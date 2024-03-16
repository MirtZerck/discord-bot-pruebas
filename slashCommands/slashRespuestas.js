import { Events } from "discord.js";
import { arraySlashCommands } from "./slashIndex.js";

export const onInteractionCreate = async (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const slashCommand = arraySlashCommands.find(
      (slashCommand) => slashCommand.data.name === interaction.commandName
    );

    if (slashCommand) {
      slashCommand.execute(interaction);
    }
  });
};
