require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { status } = require('minecraft-server-util');
const simpleGit = require('simple-git');
const { exec } = require('child_process');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const git = simpleGit();
const repoURL = 'https://github.com/safder2000/endereye.git'; // Your repository URL

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    const logChannelId = process.env.CHANNEL_ID;  // Replace with the channel ID where you want to log messages
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

    // Update the bot's code
    if (message.content.toLowerCase() === 'update bot') {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You don’t have permission to update the bot.');
        }

        message.channel.send('Checking for updates...');
        
        try {
            // Pull updates from GitHub
            await git.pull('origin', 'main');
            
            message.channel.send('Updates pulled. Restarting bot...');
            
            // Restart the bot
            exec('npm install', (err) => {
                if (err) {
                    return message.channel.send('Error while installing dependencies: ' + err.message);
                }
                
                exec('node bot.js', (restartErr) => {
                    if (restartErr) {
                        return message.channel.send('Failed to restart bot: ' + restartErr.message);
                    }
                    process.exit(); // Exit the current process so the new one takes over
                });
            });
        } catch (error) {
            message.channel.send('Failed to update the bot: ' + error.message);
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
