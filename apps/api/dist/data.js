const now = () => new Date().toISOString();
export const songs = [
    {
        id: 'song-1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        genre: 'Pop',
        duration: 200,
        coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ca/10/52/ca1052eb-f512-b4e2-629b-fecef4f59760/source/600x600bb.jpg',
        releaseYear: 2020,
        isFavorite: false,
        playCount: 0
    },
    {
        id: 'song-2',
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        genre: 'Pop',
        duration: 233,
        coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/01/dd/37/01dd370e-3f28-0fef-65eb-8f5b0a3ab759/source/600x600bb.jpg',
        releaseYear: 2017,
        isFavorite: true,
        playCount: 0
    },
    {
        id: 'song-3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        genre: 'Pop',
        duration: 203,
        coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/7f/b7/20/7fb7200e-33cb-ba02-4cd7-61c33488001c/source/600x600bb.jpg',
        releaseYear: 2020,
        isFavorite: true,
        playCount: 0
    }
];
export const playlists = [
    {
        id: 'playlist-1',
        name: 'Global Hits',
        description: 'Worldwide chart-toppers for Temitayo Charles Akinniranye',
        mood: 'Energetic',
        coverUrl: songs[0].coverUrl,
        songIds: songs.map((s) => s.id),
        createdAt: now(),
        updatedAt: now()
    },
    {
        id: 'playlist-2',
        name: 'Afrobeats Vibes',
        description: 'Feel-good rhythms curated by Temitayo Charles Akinniranye.',
        mood: 'Vibrant',
        coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/1c/a7/c4/1ca7c4f0-96f0-1e90-2734-6b5480bec219/dj.yrxejcwc.jpg/600x600cc.jpg',
        songIds: ['song-1'],
        createdAt: now(),
        updatedAt: now()
    }
];
