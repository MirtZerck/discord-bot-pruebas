import { Command } from "../../types/command.js";
import { Message, TextChannel, GuildMember, VoiceChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ButtonInteraction, Interaction } from "discord.js";
import { musicQueue } from "../../utils/musicQueue.js";
import { getVoiceConnection } from "@discordjs/voice";
import { getDynamicColor } from "../../utils/getDynamicColor.js";

async function verifyUserInSameVoiceChannel(message: Message): Promise<boolean> {
    const member = message.member as GuildMember | null;
    const botUser = message.client.user;
    if (!botUser) {
        message.channel.send("No se pudo obtener la información del bot.");
        return false;
    }

    const voiceChannel = member?.voice.channel as VoiceChannel | null;
    if (!voiceChannel) {
        message.channel.send("Debes estar en un canal de voz para usar este comando.");
        return false;
    }

    const connection = getVoiceConnection(message.guild!.id);
    if (!connection) {
        message.channel.send("El bot no está conectado a ningún canal de voz.");
        return false;
    }

    if (connection.joinConfig.channelId !== voiceChannel.id) {
        message.channel.send("Debes estar en el mismo canal de voz que el bot para usar este comando.");
        return false;
    }

    return true;
}

const state = new Map<string, number>();

async function showQueue(message: Message, page: number = 1, interaction?: ButtonInteraction) {

    const guildId = message.guild!.id;
    const queue = musicQueue.getQueue(guildId);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(queue.length / itemsPerPage);

    if (queue.length === 0) {
        message.channel.send("No hay canciones en la cola.");
        return;
    }

    if (page > totalPages || page < 1) {
        const errorMessage = `Página inválida. Por favor, selecciona una página entre 1 y ${totalPages}.`;
        if (interaction) {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        } else {
            message.channel.send(errorMessage);
        }
        return;
    }

    state.set(message.author.id, page);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, queue.length);
    const queuePage = queue.slice(startIndex, endIndex);
    const dynamicColor = getDynamicColor(message.member!);
    const embed = new EmbedBuilder()
        .setTitle("Cola de Reproducción")
        .setDescription(queuePage.map((song, index) => `${startIndex + index + 1}. ${song.title}`).join("\n"))
        .setColor(dynamicColor)
        .setFooter({ text: `Página ${page} de ${totalPages}` });

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`queue_prev`)
                .setLabel("Anterior")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`queue_next`)
                .setLabel("Siguiente")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages)
        );



    if (interaction) {

        await interaction.update({ embeds: [embed], components: [buttons] });
    } else {

        const sentMessage = await message.channel.send({ embeds: [embed], components: [buttons] });

        const filter = (i: Interaction) => i.isButton() && i.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutos

        collector.on("collect", async (i: ButtonInteraction) => {

            let currentPage = state.get(message.author.id) || 1;
            let newPage = currentPage;
            if (i.customId === "queue_prev") {
                newPage = Math.max(1, currentPage - 1);
            } else if (i.customId === "queue_next") {
                newPage = Math.min(totalPages, currentPage + 1);
            }

            state.set(message.author.id, newPage);
            await showQueue(message, newPage, i);
        });

        collector.on("end", () => {

            sentMessage.edit({ components: [] });
        });
    }
}

const queueCommand: Command = {
    name: "queue",
    alias: ["cola"],

    async execute(message: Message, args: string[]) {
        const page = args.length > 0 ? parseInt(args[0]) : 1;
        await showQueue(message, page);
    },
};

const removeCommand: Command = {
    name: "remove",
    alias: ["remover"],

    async execute(message: Message, args: string[]) {
        if (await verifyUserInSameVoiceChannel(message)) {
            const guildId = message.guild!.id;
            const textChannel = message.channel as TextChannel;
            const index = parseInt(args[0]);

            if (isNaN(index) || index < 1) {
                textChannel.send("Por favor, proporciona un número de canción válido.");
                return;
            }

            const queue = musicQueue.getQueue(guildId);
            if (index > queue.length) {
                textChannel.send("El número de canción proporcionado es mayor que el tamaño de la cola.");
                return;
            }

            const removedSong = queue.splice(index - 1, 1);
            textChannel.send(`La canción \`${removedSong[0].title}\` ha sido removida de la cola.`);
        }
    },
};

export const arrayMusicListControls: Command[] = [
    queueCommand,
    removeCommand,
];
