import { useState, useEffect } from 'react';
import './App.css';

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  isFavorite: boolean;
  artworkUrl?: string;
  previewUrl?: string;
};

type Playlist = {
  id: string;
  name: string;
  description: string;
  mood: string;
  coverUrl: string;
  songIds: string[];
};

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists'>('home');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, playlistsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/songs`),
          fetch(`${API_BASE}/api/v1/playlists`)
        ]);
        if (songsRes.ok) setSongs(await songsRes.json());
        if (playlistsRes.ok) setPlaylists(await playlistsRes.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/search/global?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLyrics = async (artist: string, title: string) => {
    setLoadingLyrics(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      const data = await res.json();
      setLyrics(data.lyrics || 'Lyrics not available');
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
      setLyrics('Failed to load lyrics');
    } finally {
      setLoadingLyrics(false);
    }
  };

  const playPreview = (song: Song) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const previewUrl = song.previewUrl;
    if (!previewUrl) {
      alert('No preview available for this track');
      return;
    }
    const audio = new Audio(previewUrl);
    audio.play().catch(() => alert('Unable to play preview'));
    setCurrentAudio(audio);
  };

  const viewSongDetails = (song: Song) => {
    setSelectedSong(song);
    fetchLyrics(song.artist, song.title);
  };

  const closeSongDetails = () => {
    setSelectedSong(null);
    setLyrics('');
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>MusicVibe</h1>
        <p className="subtitle">Curated by Temitayo Charles Akinniranye</p>
      </header>
      <nav className="nav">
        <button className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
        <button className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
        <button className={`nav-btn ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => setActiveTab('playlists')}>Playlists</button>
      </nav>
      <main className="main">
        {activeTab === 'home' && (
          <section>
            <h2>Popular Tracks</h2>
            <div className="song-grid">
              {songs.map((song) => (
                <div key={song.id} className="song-card">
                  <img src={song.coverUrl} alt={song.title} onClick={() => viewSongDetails(song)} style={{ cursor: 'pointer' }} />
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                  <p className="album">{song.album}</p>
                  <div className="song-actions">
                    <button onClick={() => playPreview(song)}>Play Preview</button>
                    <button onClick={() => viewSongDetails(song)}>View Lyrics</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === 'search' && (
          <section>
            <h2>Search Global Music</h2>
            <form onSubmit={handleSearch} className="search-form">
              <input type="text" placeholder="Search for songs, artists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
            </form>
            <div className="song-grid">
              {searchResults.map((song) => (
                <div key={song.id} className="song-card">
                  <img src={song.artworkUrl} alt={song.title} onClick={() => viewSongDetails(song)} style={{ cursor: 'pointer' }} />
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                  <div className="song-actions">
                    <button onClick={() => playPreview(song)}>Play Preview</button>
                    <button onClick={() => viewSongDetails(song)}>View Lyrics</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === 'playlists' && (
          <section>
            <h2>Playlists</h2>
            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-card">
                  <img src={playlist.coverUrl} alt={playlist.name} />
                  <h3>{playlist.name}</h3>
                  <p>{playlist.mood}</p>
                  <p className="count">{playlist.songIds.length} songs</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      {selectedSong && (
        <div className="modal-overlay" onClick={closeSongDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeSongDetails}>&times;</button>
            <div className="modal-header">
              <img src={selectedSong.coverUrl || selectedSong.artworkUrl} alt={selectedSong.title} />
              <div>
                <h2>{selectedSong.title}</h2>
                <p>{selectedSong.artist}</p>
                <p className="album">{selectedSong.album}</p>
              </div>
            </div>
            <div className="modal-body">
              <h3>Lyrics</h3>
              {loadingLyrics ? <p>Loading lyrics...</p> : <pre className="lyrics-text">{lyrics}</pre>}
            </div>
          </div>
        </div>
      )}
      <footer className="footer">
        <p>&copy; 2025 MusicVibe. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
