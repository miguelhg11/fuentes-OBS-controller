// @ts-nocheck
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { obsClient } from './obs/client';
import { startDiscovery } from './discovery/mdns';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: true });
const PORT = parseInt(process.env.PORT || '17800');

fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST']
});

fastify.get('/health', async () => {
    return { status: 'ok', model: 'OBS Orchestra Companion', version: '1.0.0 Alpha' };
});

fastify.post('/api/scene', async (request: any, reply) => {
    const { sceneName } = request.body;
    try {
        await obsClient.setCurrentScene(sceneName);
        return { status: 'ok' };
    } catch (error) {
        reply.status(500).send({ error: 'Error al cambiar de escena' });
    }
});

fastify.get('/api/scenes', async (request, reply) => {
    try {
        const scenes = await obsClient.getScenes();
        return scenes;
    } catch (error) {
        reply.status(500).send({ error: 'No se pudo conectar con OBS' });
    }
});

fastify.get('/api/scene-items', async (request: any, reply) => {
    const { sceneName } = request.query;
    try {
        const items = await obsClient.getSceneItems(sceneName);
        return items;
    } catch (error) {
        reply.status(500).send({ error: 'Error al obtener items' });
    }
});

fastify.post('/api/item-toggle', async (request: any, reply) => {
    const { sceneName, itemId, enabled } = request.body;
    try {
        await obsClient.setSceneItemEnabled(sceneName, itemId, enabled);
        return { status: 'ok' };
    } catch (error) {
        reply.status(500).send({ error: 'Error al cambiar visibilidad' });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`[SERVER] Companion corriendo en http://0.0.0.0:${PORT}`);
        await obsClient.connect();
        startDiscovery();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
