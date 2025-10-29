package com.musicvibe.playlist.config;

import com.musicvibe.playlist.entity.Playlist;
import com.musicvibe.playlist.entity.Song;
import com.musicvibe.playlist.repository.PlaylistRepository;
import com.musicvibe.playlist.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;

    @Override
    public void run(String... args) {
        // Create sample songs
        Song song1 = new Song(null, "Blinding Lights", "The Weeknd", "After Hours", "Pop", 200, 
                "https://i.scdn.co/image/ab67616d0000b273a5b1e58925d2f96e7e83c2b8", 2020, 0, false, null);
        
        Song song2 = new Song(null, "Shape of You", "Ed Sheeran", "÷ (Divide)", "Pop", 233, 
                "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96", 2017, 0, false, null);
        
        Song song3 = new Song(null, "Bohemian Rhapsody", "Queen", "A Night at the Opera", "Rock", 354, 
                "https://i.scdn.co/image/ab67616d0000b2731bf5e655f2ec98ae16b0d9d7", 1975, 0, true, null);
        
        Song song4 = new Song(null, "Lose Yourself", "Eminem", "8 Mile Soundtrack", "Hip-Hop", 326, 
                "https://i.scdn.co/image/ab67616d0000b273726d48d93d02e1271774f929", 2002, 0, false, null);
        
        Song song5 = new Song(null, "Hotel California", "Eagles", "Hotel California", "Rock", 391, 
                "https://i.scdn.co/image/ab67616d0000b273a0fcf77ba1bb6b8c8c02e09f", 1976, 0, true, null);
        
        Song song6 = new Song(null, "Levitating", "Dua Lipa", "Future Nostalgia", "Pop", 203, 
                "https://i.scdn.co/image/ab67616d0000b273dbc41926e1a99e0bb69a0f63", 2020, 0, false, null);
        
        Song song7 = new Song(null, "Smells Like Teen Spirit", "Nirvana", "Nevermind", "Rock", 301, 
                "https://i.scdn.co/image/ab67616d0000b273ddb3ac1fbc8f88ee41b6ef1d", 1991, 0, false, null);
        
        Song song8 = new Song(null, "Clair de Lune", "Claude Debussy", "Suite Bergamasque", "Classical", 300, 
                "https://i.scdn.co/image/ab67616d0000b273a5b1e58925d2f96e7e83c2b8", 1905, 0, false, null);
        
        Song song9 = new Song(null, "God's Plan", "Drake", "Scorpion", "Hip-Hop", 198, 
                "https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5", 2018, 0, false, null);
        
        Song song10 = new Song(null, "Weightless", "Marconi Union", "Weightless", "Ambient", 510, 
                "https://i.scdn.co/image/ab67616d0000b2731bf5e655f2ec98ae16b0d9d7", 2011, 0, false, null);

        List<Song> songs = songRepository.saveAll(Arrays.asList(
                song1, song2, song3, song4, song5, song6, song7, song8, song9, song10
        ));

        // Create sample playlists
        Playlist workout = new Playlist(null, "Workout Mix", "High energy songs for your workout", "Workout", 
                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f", new ArrayList<>(), null, null);
        workout.getSongs().addAll(Arrays.asList(songs.get(0), songs.get(3), songs.get(8)));
        
        Playlist chill = new Playlist(null, "Chill Vibes", "Relax and unwind", "Chill", 
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745", new ArrayList<>(), null, null);
        chill.getSongs().addAll(Arrays.asList(songs.get(7), songs.get(9), songs.get(1)));
        
        Playlist classics = new Playlist(null, "Classic Rock Hits", "Timeless rock anthems", "Rock", 
                "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee", new ArrayList<>(), null, null);
        classics.getSongs().addAll(Arrays.asList(songs.get(2), songs.get(4), songs.get(6)));

        playlistRepository.saveAll(Arrays.asList(workout, chill, classics));

        System.out.println("✅ Sample data initialized: " + songs.size() + " songs and 3 playlists created!");
    }
}
