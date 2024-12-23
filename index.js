require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { status } = require('minecraft-server-util');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    const logChannelId = '1052251122192101518';  // Replace with the channel ID where you want to log messages
    const serverIP = 'arjunmpanarchy.in';  // Replace with your Minecraft server IP
    const serverPort = 25565;  // Default Minecraft port, change if different

    // Log messages in the specified channel
    if (message.channel.id === logChannelId) {
        console.log(`Message logged: ${message.content}`);
    }

    // Check the Minecraft server status
    if (
        message.content.toLowerCase() === 'check arjun mp' ||
        message.content.toLowerCase() === 'check arjunmp' ||
        message.content.toLowerCase() === 'check arjun server' ||
        message.content.toLowerCase() === 'arjunmp status' ||
        message.content.toLowerCase() === 'arjun mp status'
    ) {
        try {
            const response = await status(serverIP, serverPort);
            const { onlinePlayers, maxPlayers, samplePlayers } = response;

            let replyMessage = `Server is **online** with **${onlinePlayers}/${maxPlayers}** players.\n`;

            if (samplePlayers) {
                replyMessage += `Players online: ${samplePlayers.map(player => player.name).join(', ')}.`;
            }

            message.channel.send(replyMessage);
        } catch (error) {
            message.channel.send('Server is **offline** or unreachable.');
        }
    }

    // Respond to bot mentions with keyword checking
    if (message.mentions.has(client.user)) {
        const content = message.content.toLowerCase();
        if (content.includes('status') || content.includes('check') || content.includes('server')) {
            // Check server status if related keywords are found
            if (content.includes('server') || content.includes('arjun')) {
                message.reply('You can check the server status by typing "check arjun mp" or similar commands.');
            } else {
                message.reply('I didn\'t quite catch that. Please try again or check the server status using a command like "check arjun mp".');
            }
        } else {
            // Provide a brief manual if no specific keyword is found
            message.reply(`Hi ${message.author.username}! How can I help you?\nYou can use commands like "check arjun mp" to check the server status or "check player [name]" to see if a specific player is online.`);
        }
    }

    // Check if a specific player is online
    if (message.content.toLowerCase().startsWith('check player')) {
        const playerName = message.content.split(' ')[2];

        try {
            const response = await status(serverIP, serverPort);
            const { samplePlayers } = response;

            if (samplePlayers && samplePlayers.some(player => player.name === playerName)) {
                message.channel.send(`${playerName} is **online**.`);
            } else {
                message.channel.send(`${playerName} is **offline** or not found on the server.`);
            }
        } catch (error) {
            message.channel.send('Server is **offline** or unreachable.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
