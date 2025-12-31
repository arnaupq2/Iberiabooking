import express from 'express';
import cors from 'cors';
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

console.log('Current working directory:', process.cwd());
const token = process.env.DISCORD_TOKEN;
console.log('Token form .env:', token ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : 'undefined');
if (token) {
    console.log(`Token Length: ${token.length}`);
    console.log(`First 5 chars codes: ${token.substring(0, 5).split('').map(c => c.charCodeAt(0))}`);
    console.log(`Last 5 chars codes: ${token.substring(token.length - 5).split('').map(c => c.charCodeAt(0))}`);
    // Check for common issues
    if (token.includes(' ')) console.warn('WARNING: Token contains spaces!');
    if (token.includes('"')) console.warn('WARNING: Token contains quotes!');
    if (token.includes('\r')) console.warn('WARNING: Token contains carriage returns!');
}

const app = express();
app.use(cors()); // Allow Vite frontend
app.use(express.json());

const PORT = 3001;
const ALLOWED_USERS = ['arnaupq', 'sternials', 'iconicute'];

// Discord Client Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// Store codes temporarily: { username: { code: '123456', expires: 123456789 } }
const codeStore = new Map();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN.trim());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the dist directory (for production/deployment)
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.post('/api/send-code', async (req, res) => {
    const { username } = req.body;
    console.log(`[AUTH] Solicitud de código para: ${username}`);

    if (!username || !ALLOWED_USERS.includes(username.toLowerCase())) {
        console.log(`[AUTH] Usuario no autorizado: ${username}`);
        return res.status(403).json({ error: 'Usuario no autorizado.' });
    }

    try {
        let targetUser = null;
        console.log('[AUTH] Buscando usuario en Discord...');

        // Strategy 1: Default Channel
        if (process.env.DEFAULT_CHANNEL_ID) {
            console.log(`[AUTH] Estrategia 1: Buscando en canal ${process.env.DEFAULT_CHANNEL_ID}`);
            try {
                const channel = await client.channels.fetch(process.env.DEFAULT_CHANNEL_ID);
                if (channel && channel.guild) {
                    const members = await channel.guild.members.fetch({ query: username, limit: 1 });
                    const member = members.first();
                    if (member && member.user.username.toLowerCase() === username.toLowerCase()) {
                        targetUser = member.user;
                        console.log('[AUTH] Usuario encontrado en Estrategia 1.');
                    }
                }
            } catch (err) {
                console.error('[AUTH] Error en Estrategia 1:', err.message);
            }
        }

        // Strategy 2: Iterate Guilds
        if (!targetUser) {
            console.log('[AUTH] Estrategia 2: Iterando servidores...');
            for (const [guildId, guild] of client.guilds.cache) {
                try {
                    console.log(`[AUTH] Buscando en servidor: ${guild.name} (${guildId})`);
                    const members = await guild.members.fetch({ query: username, limit: 20 });
                    // Filter specifically for exact match because query is fuzzy
                    const member = members.find(m => m.user.username.toLowerCase() === username.toLowerCase());

                    if (member) {
                        targetUser = member.user;
                        console.log(`[AUTH] Usuario encontrado en servidor: ${guild.name}`);
                        break;
                    }
                } catch (e) {
                    console.error(`[AUTH] Error en servidor ${guildId}:`, e.message);
                }
            }
        }

        if (!targetUser) {
            console.log('[AUTH] Usuario no encontrado en ningún servidor common.');
            return res.status(404).json({ error: 'Usuario no encontrado en los servidores del bot.' });
        }

        // Generate Code
        const code = crypto.randomInt(100000, 999999).toString();
        const expires = Date.now() + 5 * 60 * 1000; // 5 mins
        codeStore.set(username.toLowerCase(), { code, expires });

        console.log(`[AUTH] Generado código para ${username}. Enviando MD...`);

        // Send DM
        await targetUser.send(`**Iberia Control Auth**\nTu código de acceso es: \`${code}\`\n\nEste código expira en 5 minutos.`);

        console.log('[AUTH] MD enviado correctamente.');
        res.json({ success: true, message: 'Código enviado por MD.' });

    } catch (error) {
        console.error('[AUTH] ERROR CRITICO:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje directo. Asegúrate de tener MDs abiertos.' });
    }
});

app.post('/api/verify-code', (req, res) => {
    const { username, code } = req.body;
    console.log(`[AUTH-VERIFY] Verificando código para: ${username}, Código: ${code}`);

    const stored = codeStore.get(username.toLowerCase());

    if (!stored) {
        console.log(`[AUTH-VERIFY] Fallo: Código no encontrado/expirado para ${username}`);
        return res.status(400).json({ error: 'Código no solicitado o expirado.' });
    }

    if (Date.now() > stored.expires) {
        console.log(`[AUTH-VERIFY] Fallo: Código expirado.`);
        codeStore.delete(username.toLowerCase());
        return res.status(400).json({ error: 'Código expirado.' });
    }

    if (stored.code !== code) {
        console.log(`[AUTH-VERIFY] Fallo: Código incorrecto. Esperado: ${stored.code}, Recibido: ${code}`);
        return res.status(400).json({ error: 'Código incorrecto.' });
    }

    // Success - clean up
    console.log(`[AUTH-VERIFY] Éxito! Usuario autenticado: ${username}`);
    codeStore.delete(username.toLowerCase());
    res.json({ success: true, token: 'mock-session-token' });
});

// Handle React routing, return all requests to React app (Regex for Express 5 compliance)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
