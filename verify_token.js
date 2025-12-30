import { Client, GatewayIntentBits } from 'discord.js';

const token = "";

console.log("Testing HARDCODED token...");
console.log(`Token: ${token.substring(0, 5)}...`);

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.on('ready', () => {
    console.log(`SUCCESS: Logged in as ${client.user.tag}!`);
    console.log("The token is VALID.");
    client.destroy();
    process.exit(0);
});

client.login(token).catch(err => {
    console.error("FAILURE: Login failed with hardcoded token.");
    console.error(err.message);
    process.exit(1);
});
