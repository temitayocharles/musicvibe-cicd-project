export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  coverUrl: string;
  releaseYear: number;
  isFavorite: boolean;
  playCount: number;
  previewUrl?: string;
  lyrics?: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  mood: string;
  coverUrl: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
};

const now = () => new Date().toISOString();

export const songs: Song[] = [
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
    playCount: 0,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/79/87/bb/7987bb7a-c1d2-4b23-4e9a-20e4e0b2a0b3/mzaf_3241234567.plus.aac.p.m4a'
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
    playCount: 0,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/1e/e2/f5/1ee2f5e6-d3c1-4e0e-f1d5-7b3a4c2c5a1a/mzaf_1234567890.plus.aac.p.m4a'
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
    playCount: 0,
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview113/v4/2f/b8/c3/2fb8c3e4-e5f6-d7a8-b9c0-d1e2f3a4b5c6/mzaf_9876543210.plus.aac.p.m4a'
  }
];

export const playlists: Playlist[] = [
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
