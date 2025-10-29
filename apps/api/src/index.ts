import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import fastify from 'fastify';

import healthRoutes from './routes/health.js';
import lyricsRoutes from './routes/lyrics.js';
import playlistsRoutes from './routes/playlists.js';
import searchRoutes from './routes/search.js';
import songsRoutes from './routes/songs.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const staticDir = join(currentDir, 'public');
const server = fastify({
  logger: true,
});

const start = async () => {
  await server.register(cors, {
    origin: true,
  });

  if (fs.existsSync(staticDir)) {
    // Serve static assets when the frontend build is present
    await server.register(staticPlugin, {
      root: staticDir,
      prefix: '/',
    });
  }

  await server.register(healthRoutes);
  await server.register(lyricsRoutes);
  await server.register(playlistsRoutes);
  await server.register(searchRoutes);
  await server.register(songsRoutes);

  const port = Number.parseInt(process.env.PORT ?? '4000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`MusicVibe API listening on http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start().catch((error) => {
  server.log.error(error);
  process.exit(1);
});
