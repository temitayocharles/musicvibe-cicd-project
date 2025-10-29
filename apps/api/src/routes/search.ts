import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { searchGlobal } from '../services/itunes.js';

const SearchQuery = Type.Object({
  q: Type.String({ minLength: 1 })
});

const ErrorResponse = Type.Object({
  message: Type.String()
});

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/search/global', {
    schema: {
      querystring: SearchQuery,
      response: {
        200: Type.Object({
          results: Type.Array(Type.Any())
        }),
        400: ErrorResponse,
        502: ErrorResponse
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { q?: string } }>, reply: FastifyReply) => {
    const term = request.query.q?.trim();

    if (!term) {
      return reply.status(400).send({ message: 'Query parameter "q" is required.' });
    }

    try {
      const results = await searchGlobal(term);
      return { results };
    } catch (error) {
      fastify.log.error({ err: error, term }, 'Failed to search iTunes');
      return reply.status(502).send({ message: 'Unable to complete global search at this time.' });
    }
  });
}
