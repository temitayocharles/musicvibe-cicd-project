import { Type } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';

import { songs } from '../data.js';

const SongIdParam = Type.Object({
  id: Type.String({ minLength: 1 })
});

const ErrorResponse = Type.Object({
  message: Type.String()
});

export default async function songsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/songs', {
    schema: {
      response: {
        200: Type.Array(Type.Any())
      }
    }
  }, async () => songs);

  fastify.get('/api/v1/songs/:id', {
    schema: {
      params: SongIdParam,
      response: {
        200: Type.Any(),
        404: ErrorResponse
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const song = songs.find((item) => item.id === id);

    if (!song) {
      return reply.status(404).send({ message: 'Song not found' });
    }

    return song;
  });

  fastify.post('/api/v1/songs/:id/favorite', {
    schema: {
      params: SongIdParam,
      response: {
        200: Type.Object({ success: Type.Boolean() }),
        404: ErrorResponse
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const song = songs.find((item) => item.id === id);

    if (!song) {
      return reply.status(404).send({ message: 'Song not found' });
    }

    song.isFavorite = true;
    return { success: true };
  });

  fastify.delete('/api/v1/songs/:id/favorite', {
    schema: {
      params: SongIdParam,
      response: {
        200: Type.Object({ success: Type.Boolean() }),
        404: ErrorResponse
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const song = songs.find((item) => item.id === id);

    if (!song) {
      return reply.status(404).send({ message: 'Song not found' });
    }

    song.isFavorite = false;
    return { success: true };
  });
}
