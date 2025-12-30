import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

dotenv.config({ override: true });

const TARGET_USERNAME = 'arnaupq';
const token = process.env.DISCORD_TOKEN;

console.log("=== DISCORD AUTH DEBUGGER ===");
console.log(`Token loaded: ${token ? 'YES' : 'NO'}`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

client.on('ready', async () => {
    console.log(`Logged in as: ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} guilds.`);

    if (client.guilds.cache.size === 0) {
        console.error("ERROR: Bot is not in any servers! You must invite the bot to your server first.");
        console.log("Invite Link: https://discord.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot&permissions=8");
    }

    let targetUser = null;

    console.log(`Searching for user: ${TARGET_USERNAME}...`);

    for (const [guildId, guild] of client.guilds.cache) {
        console.log(`Checking guild: ${guild.name} (${guildId})`);
        try {
            // Try fetch
            const members = await guild.members.fetch({ query: TARGET_USERNAME, limit: 10 });
            console.log(`  - Fetch returned ${members.size} candidates.`);

            members.forEach(m => console.log(`    - Candidate: ${m.user.username} (ID: ${m.user.id})`));

            const member = members.find(m => m.user.username.toLowerCase() === TARGET_USERNAME.toLowerCase());

            if (member) {
                console.log(`FOUND in guild: ${guild.name}`);
                targetUser = member.user;
                // Don't break immediately, let's see where else they are
            } else {
                console.log(`  - Exact match for '${TARGET_USERNAME}' not found in candidates.`);
            }
        } catch (e) {
            console.error(`Error fetching members in ${guild.name}:`, e.message);
        }
    }

    if (targetUser) {
        console.log(`User object obtained. ID: ${targetUser.id}`);
        try {
            console.log("Attempting to send DM...");
            await targetUser.send("Test message from Iberia Debugger. If you see this, Auth will work.");
            console.log("SUCCESS: DM sent!");
        } catch (e) {
            console.error("FAILURE: Could not send DM.");
            console.error(e);
        }
    } else {
        console.error("FAILURE: User not found in any common guild.");
    }

    client.destroy();
    process.exit(0);
});

client.login(token);
