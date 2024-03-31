import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "@discord-api-types/v9";

const automodCommand = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("Setup the auto moderation rules.");

const automodSubcommands = [
  {
    name: "flagged-words",
    description: "Block profanity, sexual content, and slurs",
    commandHandler: async (interaction) => {
      if (
        !interaction.member.premissions.has(
          PermissionsBitField.Flags.ManageGuild
        )
      ) {
        await interaction.reply({
          content: "No tienes permiso para gestionar las reglas de Automod",
          ephemeral: true,
        });
        return;
      }

      const keywords = interaction.options.getSring("keywords").split(",");
      const ruleName = interaction.options.getSring("rule-name");

      const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

      try {
        const data = {
          name: ruleName,
          event_type: 1, //MESSAGE_SEND
          trigger_type: 1, //KEYWORD
          trigger_metadata: {
            keyword_filter: keywords,
          },
          actions: [
            {
              type: 1, // BLOCK_MESSAGE
              metadata: {
                custom_message:
                  "Tu mensaje ha sido bloqueado por uso de lenguaje inapropiado.",
              },
            },
          ],
          enabled: true,
        };
        await rest.post(Routes.guidlAutoModerationRules(interaction.guild.id), {
          body: data,
        });
        await interaction.reply(
          "La regla de AutoMod para palabras prohibidas ha sido creadad con éxito."
        );
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `Hubo un error al crear la regla de AutoMod: ${error}`,
          ephemeral: true,
        });
      }
    },
  },
  {
    name: "mention-spam",
    description: "Block messages containing a certain amount of mentions",
    commandHandler: async (interaction) => {
      // Aquí va la lógica para manejar el subcomando 'mention-spam'
    },
    options: [
      {
        type: "INTEGER",
        name: "number",
        description: "Number of mentions to trigger the rule",
        required: true,
      },
    ],
  },
  {
    name: "keyword",
    description: "Block a given keyword in the server",
    commandHandler: async (interaction) => {
      // Aquí va la lógica para manejar el subcomando 'keyword'
    },
    options: [
      {
        type: "STRING",
        name: "word",
        description: "The word to block",
        required: true,
      },
    ],
  },
];

automodSubcommands.forEach((sub) => {
  let newSubcommand = automodCommand.addSubcommand((subcommand) =>
    subcommand.setName(sub.name).setDescription(sub.description)
  );

  sub.options?.forEach((option) => {
    newSubcommand = newSubcommand.addOption((option) =>
      option
        .setType(option.type)
        .setName(option.name)
        .setDescription(option.description)
        .setRequired(option.required)
    );
  });
});

const executeSubcommand = async (interaction, commandHandler) => {
  await commandHandler(interaction);
};

export const slashAutomodCommand = {
  data: automodCommand,
  async execute(interaction) {
    const subcommandName = interaction.options.getSubcommand();
    const subcommand = automodSubcommands.find(
      (sub) => sub.name === subcommandName
    );
    if (subcommand) {
      await executeSubcommand(interaction, subcommand.commandHandler);
    } else {
      await interaction.reply({
        content: "Subcommand not found.",
        ephemeral: true,
      });
    }
  },
};
