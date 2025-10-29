import { randomUUID } from 'node:crypto';
import { Type } from '@sinclair/typebox';
import { playlists, songs } from '../data.js';
const PlaylistIdParam = Type.Object({
    id: Type.String({ minLength: 1 })
});
const PlaylistSongParams = Type.Object({
    id: Type.String({ minLength: 1 }),
    songId: Type.String({ minLength: 1 })
});
const CreatePlaylistBody = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    mood: Type.Optional(Type.String()),
    songIds: Type.Optional(Type.Array(Type.String())),
    coverUrl: Type.Optional(Type.String())
});
const ErrorResponse = Type.Object({
    message: Type.String()
});
export default async function playlistsRoutes(fastify) {
    fastify.get('/api/v1/playlists', {
        schema: {
            response: {
                200: Type.Array(Type.Any())
            }
        }
    }, async () => playlists);
    fastify.get('/api/v1/playlists/:id', {
        schema: {
            params: PlaylistIdParam,
            response: {
                200: Type.Any(),
                404: ErrorResponse
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const playlist = playlists.find((item) => item.id === id);
        if (!playlist) {
            return reply.status(404).send({ message: 'Playlist not found' });
        }
        return playlist;
    });
    fastify.post('/api/v1/playlists', {
        schema: {
            body: CreatePlaylistBody,
            response: {
                201: Type.Any(),
                400: ErrorResponse
            }
        }
    }, async (request, reply) => {
        const body = request.body;
        const songIds = (body.songIds ?? []).filter((songId) => songs.some((song) => song.id === songId));
        const newPlaylist = {
            id: randomUUID(),
            name: body.name,
            description: body.description ?? 'Curated by Temitayo Charles Akinniranye',
            mood: body.mood ?? 'Custom',
            coverUrl: body.coverUrl ?? songs[0]?.coverUrl ?? '',
            songIds,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        playlists.push(newPlaylist);
        return reply.status(201).send(newPlaylist);
    });
    fastify.post('/api/v1/playlists/:id/songs/:songId', {
        schema: {
            params: PlaylistSongParams,
            response: {
                200: Type.Object({ success: Type.Boolean() }),
                404: ErrorResponse
            }
        }
    }, async (request, reply) => {
        const { id, songId } = request.params;
        const playlist = playlists.find((item) => item.id === id);
        const songExists = songs.some((song) => song.id === songId);
        if (!playlist || !songExists) {
            return reply.status(404).send({ message: 'Playlist or song not found' });
        }
        if (!playlist.songIds.includes(songId)) {
            playlist.songIds.push(songId);
            playlist.updatedAt = new Date().toISOString();
        }
        return { success: true };
    });
    fastify.delete('/api/v1/playlists/:id/songs/:songId', {
        schema: {
            params: PlaylistSongParams,
            response: {
                200: Type.Object({ success: Type.Boolean() }),
                404: ErrorResponse
            }
        }
    }, async (request, reply) => {
        const { id, songId } = request.params;
        const playlist = playlists.find((item) => item.id === id);
        if (!playlist) {
            return reply.status(404).send({ message: 'Playlist not found' });
        }
        playlist.songIds = playlist.songIds.filter((existingId) => existingId !== songId);
        playlist.updatedAt = new Date().toISOString();
        return { success: true };
    });
}
