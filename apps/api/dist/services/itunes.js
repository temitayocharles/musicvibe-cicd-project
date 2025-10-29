import fetch from 'node-fetch';
import { z } from 'zod';
const iTunesResultSchema = z.object({
    trackId: z.number(),
    trackName: z.string().optional(),
    artistName: z.string().optional(),
    collectionName: z.string().optional(),
    primaryGenreName: z.string().optional(),
    trackTimeMillis: z.number().optional(),
    artworkUrl100: z.string().optional(),
    previewUrl: z.string().optional()
});
const iTunesResponseSchema = z.object({
    resultCount: z.number(),
    results: z.array(iTunesResultSchema)
});
export const searchGlobal = async (term) => {
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('term', term);
    url.searchParams.set('media', 'music');
    url.searchParams.set('limit', '20');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url.toString(), {
        headers: {
            'User-Agent': 'MusicVibe/1.0'
        },
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
        throw new Error(`iTunes API error: ${response.status}`);
    }
    const payload = await response.json();
    const parsed = iTunesResponseSchema.safeParse(payload);
    if (!parsed.success) {
        throw new Error('Unexpected response from iTunes Search API');
    }
    return parsed.data.results.map((result) => ({
        id: `itunes-${result.trackId}`,
        title: result.trackName ?? 'Unknown Title',
        artist: result.artistName ?? 'Unknown Artist',
        album: result.collectionName ?? 'Unknown Album',
        genre: result.primaryGenreName ?? 'Unknown Genre',
        duration: result.trackTimeMillis ? Math.round(result.trackTimeMillis / 1000) : 0,
        artworkUrl: result.artworkUrl100 ?? '',
        previewUrl: result.previewUrl ?? null
    }));
};
