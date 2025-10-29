import { Type } from '@sinclair/typebox';
import { fetchLyrics } from '../services/lyrics.js';
const LyricsQuery = Type.Object({
    artist: Type.String({ minLength: 1 }),
    title: Type.String({ minLength: 1 })
});
const ErrorResponse = Type.Object({
    message: Type.String()
});
export default async function lyricsRoutes(fastify) {
    fastify.get('/api/v1/lyrics', {
        schema: {
            querystring: LyricsQuery,
            response: {
                200: Type.Any(),
                400: ErrorResponse,
                502: ErrorResponse
            }
        }
    }, async (request, reply) => {
        const artist = request.query.artist?.trim();
        const title = request.query.title?.trim();
        if (!artist || !title) {
            return reply.status(400).send({ message: 'Both "artist" and "title" query parameters are required.' });
        }
        try {
            const result = await fetchLyrics(artist, title);
            return result;
        }
        catch (error) {
            fastify.log.error({ err: error, artist, title }, 'Failed to fetch lyrics');
            return reply.status(502).send({ message: 'Unable to fetch lyrics at this time.' });
        }
    });
}
