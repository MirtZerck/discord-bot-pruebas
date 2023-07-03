import { Client } from "discord.js";
import dotenv from 'dotenv';
import { arrayCommands } from "./commands/index.js";

dotenv.config();

const token = process.env.TOKEN;

const client = new Client();

// Logear el bot
client.login(token);

client.on('ready', () => {
    console.log('El bot se ha iniciado como', client.user.username);
    client.user.setPresence({
        status: 'dnd',
        activity: {
            name: 'Tiroteo IRL',
            type: 'STREAMING'
        }
    });
});

const prefix = '.';

client.on('message', async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    const content = message.content.slice(prefix.length);
    const args = content.toLowerCase().split(' ');
    const commandName = args.shift();    
    const commandBody = content.slice(commandName.length);
    
    if(commandName === 'ona'){
        return message.reply('Onaaaa');
    }

    arrayCommands.forEach((command) => {
        if(command.name === commandName || command.alias.includes(commandName)){
            command.execute(message, args);
        }
    })

 })


