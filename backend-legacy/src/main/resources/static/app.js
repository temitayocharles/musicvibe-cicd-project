// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// State
let allSongs = [];
let allPlaylists = [];
let currentView = 'songs';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadData();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchView(e.target.dataset.view);
        });
    });

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        filterSongs(e.target.value);
    });

    // Genre filter
    document.getElementById('genre-filter').addEventListener('change', (e) => {
        filterByGenre(e.target.value);
    });

    // Global search
    document.getElementById('global-search-btn').addEventListener('click', () => {
        performGlobalSearch();
    });

    document.getElementById('global-search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performGlobalSearch();
        }
    });
}

// Load Data
async function loadData() {
    showLoading(true);
    try {
        await Promise.all([
            loadSongs(),
            loadPlaylists()
        ]);
        updateStats();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please make sure the backend is running on ' + API_BASE_URL);
    } finally {
        showLoading(false);
    }
}

// Load Songs
async function loadSongs() {
    const response = await fetch(`${API_BASE_URL}/songs`);
    allSongs = await response.json();
    displaySongs(allSongs);
}

// Load Playlists
async function loadPlaylists() {
    const response = await fetch(`${API_BASE_URL}/playlists`);
    allPlaylists = await response.json();
    displayPlaylists(allPlaylists);
}

// Display Songs
function displaySongs(songs) {
    const grid = document.getElementById('songs-grid');
    grid.innerHTML = songs.map(song => `
        <div class="song-card">
            <img src="${song.coverUrl}" alt="${song.title}" class="song-cover" onerror="this.src='https://via.placeholder.com/250x250/667eea/ffffff?text=🎵'">
            <div class="song-info">
                <h3 class="song-title">${song.title}</h3>
                <p class="song-artist">${song.artist}</p>
                <p class="song-artist" style="font-size: 12px;">${song.album}</p>
                <div class="song-details">
                    <span class="song-genre">${song.genre}</span>
                    <span class="song-duration">${formatDuration(song.duration)}</span>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: space-between; align-items: center;">
                    <button class="action-btn" onclick="viewLyrics(event, '${escapeHtml(song.artist)}', '${escapeHtml(song.title)}')" title="View Lyrics">
                        📝
                    </button>
                    <button class="favorite-btn" onclick="toggleFavorite(event, ${song.id})">
                        ${song.isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display Playlists
function displayPlaylists(playlists) {
    const grid = document.getElementById('playlists-grid');
    grid.innerHTML = playlists.map(playlist => `
        <div class="playlist-card" onclick="viewPlaylist(${playlist.id})">
            <div class="playlist-header">
                <h3 class="playlist-title">${playlist.name}</h3>
                <span class="playlist-mood">${playlist.mood || 'Mixed'}</span>
            </div>
            <p class="playlist-description">${playlist.description || 'No description'}</p>
            <p class="playlist-count">🎵 ${playlist.songs ? playlist.songs.length : 0} songs</p>
        </div>
    `).join('');
}

// Display Favorites
function displayFavorites() {
    const favorites = allSongs.filter(song => song.isFavorite);
    const grid = document.getElementById('favorites-grid');
    
    if (favorites.length === 0) {
        grid.innerHTML = '<p style="color: white; text-align: center; padding: 40px;">No favorite songs yet. Click the heart icon on songs to add them to favorites!</p>';
    } else {
        grid.innerHTML = favorites.map(song => `
            <div class="song-card">
                <img src="${song.coverUrl}" alt="${song.title}" class="song-cover" onerror="this.src='https://via.placeholder.com/250x250/667eea/ffffff?text=🎵'">
                <div class="song-info">
                    <h3 class="song-title">${song.title}</h3>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-artist" style="font-size: 12px;">${song.album}</p>
                    <div class="song-details">
                        <span class="song-genre">${song.genre}</span>
                        <span class="song-duration">${formatDuration(song.duration)}</span>
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: space-between; align-items: center;">
                        <button class="action-btn" onclick="viewLyrics(event, '${escapeHtml(song.artist)}', '${escapeHtml(song.title)}')" title="View Lyrics">
                            📝
                        </button>
                        <button class="favorite-btn" onclick="toggleFavorite(event, ${song.id})">
                            ${song.isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Switch View
function switchView(view) {
    currentView = view;
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');
    
    // Load specific view data
    if (view === 'favorites') {
        displayFavorites();
    }
}

// Filter Songs
function filterSongs(searchTerm) {
    const filtered = allSongs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.album.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displaySongs(filtered);
}

// Filter by Genre
function filterByGenre(genre) {
    if (!genre) {
        displaySongs(allSongs);
        return;
    }
    const filtered = allSongs.filter(song => song.genre === genre);
    displaySongs(filtered);
}

// Toggle Favorite
async function toggleFavorite(event, songId) {
    event.stopPropagation();
    try {
        const response = await fetch(`${API_BASE_URL}/songs/${songId}/favorite`, {
            method: 'PATCH'
        });
        const updatedSong = await response.json();
        
        // Update local state
        const index = allSongs.findIndex(s => s.id === songId);
        if (index !== -1) {
            allSongs[index] = updatedSong;
        }
        
        // Refresh current view
        if (currentView === 'songs') {
            displaySongs(allSongs);
        } else if (currentView === 'favorites') {
            displayFavorites();
        }
        
        updateStats();
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

// Play Song (increment play count)
async function playSong(songId) {
    try {
        await fetch(`${API_BASE_URL}/songs/${songId}/play`, {
            method: 'PATCH'
        });
        console.log(`Playing song ${songId}`);
        // In a real app, you would play the song here
    } catch (error) {
        console.error('Error playing song:', error);
    }
}

// View Playlist
async function viewPlaylist(playlistId) {
    try {
        const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`);
        const playlist = await response.json();
        alert(`Playlist: ${playlist.name}\nSongs: ${playlist.songs.length}\n\n` + 
              playlist.songs.map(s => `${s.title} - ${s.artist}`).join('\n'));
    } catch (error) {
        console.error('Error viewing playlist:', error);
    }
}

// Update Stats
function updateStats() {
    document.getElementById('total-songs').textContent = allSongs.length;
    document.getElementById('total-playlists').textContent = allPlaylists.length;
    document.getElementById('total-favorites').textContent = allSongs.filter(s => s.isFavorite).length;
}

// Format Duration
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Show/Hide Loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// Global Search
async function performGlobalSearch() {
    const query = document.getElementById('global-search-input').value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/search/global?query=${encodeURIComponent(query)}&type=track`);
        const results = await response.json();
        displayGlobalResults(results);
    } catch (error) {
        console.error('Error searching globally:', error);
        document.getElementById('discover-results').innerHTML = 
            '<p class="discover-placeholder">Unable to search at the moment. Please configure Spotify API credentials in the backend.</p>';
    } finally {
        showLoading(false);
    }
}

// Display Global Search Results
function displayGlobalResults(results) {
    const grid = document.getElementById('discover-results');
    
    if (results.length === 0) {
        grid.innerHTML = '<p class="discover-placeholder">No results found. Try a different search term! 🔍</p>';
        return;
    }

    grid.innerHTML = results.map(song => `
        <div class="song-card">
            <img src="${song.coverUrl || 'https://via.placeholder.com/250x250/667eea/ffffff?text=🎵'}" 
                 alt="${song.title}" class="song-cover">
            <div class="song-info">
                <h3 class="song-title">${song.title}</h3>
                <p class="song-artist">${song.artist}</p>
                <p class="song-artist" style="font-size: 12px;">${song.album || 'Unknown Album'}</p>
                <div class="song-details">
                    <span class="song-genre">${song.genre || '🌍 Global'}</span>
                    <span class="song-duration">${formatDuration(song.duration)}</span>
                </div>
                ${song.previewUrl ? `
                    <div style="margin-top: 12px;">
                        <p style="font-size: 11px; color: #666; margin-bottom: 4px;">🎧 30-second preview:</p>
                        <audio controls style="width: 100%; height: 32px;">
                            <source src="${song.previewUrl}" type="audio/mp4">
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                ` : ''}
                <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="action-btn" onclick="viewLyrics(event, '${escapeHtml(song.artist)}', '${escapeHtml(song.title)}')" 
                            style="flex: 1; padding: 8px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
                        📝 View Lyrics
                    </button>
                    ${song.externalUrl ? `
                        <a href="${song.externalUrl}" target="_blank" 
                           style="flex: 1; display: inline-block; padding: 8px; background: #ff6b6b; 
                                  color: white; text-decoration: none; border-radius: 8px; 
                                  font-size: 12px; font-weight: 600; text-align: center;">
                            🎵 iTunes
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// View Lyrics
async function viewLyrics(event, artist, title) {
    event.stopPropagation();
    showLoading(true);
    
    try {
        const response = await fetch(
            `${API_BASE_URL}/lyrics/search?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
        );
        const data = await response.json();
        
        if (data.found) {
            showLyricsModal(data.artist, data.title, data.lyrics);
        } else {
            alert(data.message || 'Lyrics not found. Try different keywords.');
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        alert('Unable to fetch lyrics at the moment.');
    } finally {
        showLoading(false);
    }
}

// Show Lyrics in Modal
function showLyricsModal(artist, title, lyrics) {
    const modal = document.createElement('div');
    modal.className = 'lyrics-modal';
    modal.innerHTML = `
        <div class="lyrics-content">
            <div class="lyrics-header">
                <h2>🎤 ${title}</h2>
                <p style="color: #666; margin: 8px 0 16px 0;">by ${artist}</p>
                <button onclick="this.closest('.lyrics-modal').remove()" class="close-btn">✕</button>
            </div>
            <div class="lyrics-body">
                <pre>${lyrics}</pre>
            </div>
        </div>
    `;
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    document.body.appendChild(modal);
}

// Escape HTML for security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'");
}

