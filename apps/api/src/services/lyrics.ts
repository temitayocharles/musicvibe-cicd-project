import fetch from 'node-fetch';

export type LyricsResult = {
  lyrics: string;
};

export const fetchLyrics = async (artist: string, title: string): Promise<LyricsResult> => {
  const safeArtist = encodeURIComponent(artist.trim());
  const safeTitle = encodeURIComponent(title.trim());
  const url = `https://api.lyrics.ovh/v1/${safeArtist}/${safeTitle}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MusicVibe/1.0'
    },
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    if (response.status === 404) {
      return { lyrics: 'Lyrics not found for this track.' };
    }
    throw new Error(`Lyrics API error: ${response.status}`);
  }

  const payload = (await response.json()) as { lyrics?: string };

  if (!payload.lyrics) {
    return { lyrics: 'Lyrics not found for this track.' };
  }

  return { lyrics: payload.lyrics };
};
