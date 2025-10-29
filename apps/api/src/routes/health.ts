import { FastifyInstance } from 'fastify';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => ({ status: 'ok', service: 'musicvibe-api' }));
  fastify.get('/ready', async () => ({ status: 'ready' }));
  fastify.get('/live', async () => ({ status: 'live' }));
}
