import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { obsClient } from './obs/client';
import { startDiscovery } from './discovery/mdns';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const fastify = Fastify({ logger: false });
const PORT = 17800;
let pwaPath = '';

function getRootPath() { return process.env.PORTABLE_EXECUTABLE_DIR || process.cwd(); }

function loadConfig() {
    const configPath = path.join(getRootPath(), 'config.json');
    if (fs.existsSync(configPath)) {
        try { return JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch (e) { }
    }
    return { obsUrl: process.env.OBS_WS_URL || 'ws://127.0.0.1:4455', obsPassword: process.env.OBS_WS_PASSWORD || '' };
}

function saveConfig(config: any) {
    const configPath = path.join(getRootPath(), 'config.json');
    try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch (e) { }
}

fastify.register(cors, { origin: '*' });

fastify.get('/health', async () => ({ status: 'ok', obsConnected: obsClient.isConnected(), pwaActive: !!pwaPath }));

fastify.get('/api/audio-sources', async (request, reply) => {
    try { return { sources: await obsClient.getAudioSources() }; } catch (error) { reply.status(500).send({ error: 'Error' }); }
});

fastify.post('/api/mute', async (request: any, reply) => {
    try { await obsClient.setMute(request.body.sourceName, request.body.muted); return { status: 'ok' }; } catch (error) { reply.status(500).send({ error: 'Error' }); }
});

fastify.post('/api/obs-config', async (request: any, reply) => {
    const url = `ws://127.0.0.1:${request.body.port}`;
    try { await obsClient.connect(url, request.body.password); saveConfig({ obsUrl: url, obsPassword: request.body.password }); return { status: 'ok' }; } catch (error) { reply.status(500).send({ error: 'Error' }); }
});

fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api')) { reply.status(404).send({ error: 'Not Found' }); return; }
    if (pwaPath && fs.existsSync(path.join(pwaPath, 'index.html'))) { reply.sendFile('index.html'); }
    else { reply.status(404).send({ error: 'Interfaz no disponible', path: pwaPath }); }
});

export const startServer = async (port: number = PORT, injectPwaPath?: string) => {
    pwaPath = injectPwaPath || path.join(__dirname, '../pwa_dist');
    if (fs.existsSync(pwaPath)) {
        fastify.register(fastifyStatic, { root: pwaPath, prefix: '/', index: 'index.html' });
    }
    try {
        const config = loadConfig();
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`[SERVER] Orchestra en puerto ${port}`);
        try { await obsClient.connect(config.obsUrl, config.obsPassword); } catch (e) { }
        startDiscovery();
    } catch (err) { console.error(err); process.exit(1); }
};


if (require.main === module) { startServer(); }
