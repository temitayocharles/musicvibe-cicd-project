package com.musicvibe.playlist.controller;

import com.musicvibe.playlist.entity.Song;
import com.musicvibe.playlist.repository.SongRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/songs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SongController {
    
    private final SongRepository songRepository;
    
    @GetMapping
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Song> getSongById(@PathVariable Long id) {
        return songRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Song> searchSongs(@RequestParam(required = false) String title,
                                   @RequestParam(required = false) String artist,
                                   @RequestParam(required = false) String genre) {
        if (title != null) {
            return songRepository.findByTitleContainingIgnoreCase(title);
        }
        if (artist != null) {
            return songRepository.findByArtistContainingIgnoreCase(artist);
        }
        if (genre != null) {
            return songRepository.findByGenre(genre);
        }
        return songRepository.findAll();
    }
    
    @GetMapping("/favorites")
    public List<Song> getFavoriteSongs() {
        return songRepository.findByIsFavoriteTrue();
    }
    
    @GetMapping("/genre/{genre}/top")
    public List<Song> getTopSongsByGenre(@PathVariable String genre) {
        return songRepository.findByGenreOrderByPlayCountDesc(genre);
    }
    
    @PostMapping
    public ResponseEntity<Song> createSong(@Valid @RequestBody Song song) {
        Song savedSong = songRepository.save(song);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSong);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Song> updateSong(@PathVariable Long id, @Valid @RequestBody Song songDetails) {
        return songRepository.findById(id)
                .map(song -> {
                    song.setTitle(songDetails.getTitle());
                    song.setArtist(songDetails.getArtist());
                    song.setAlbum(songDetails.getAlbum());
                    song.setGenre(songDetails.getGenre());
                    song.setDuration(songDetails.getDuration());
                    song.setCoverUrl(songDetails.getCoverUrl());
                    song.setReleaseYear(songDetails.getReleaseYear());
                    song.setIsFavorite(songDetails.getIsFavorite());
                    return ResponseEntity.ok(songRepository.save(song));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/favorite")
    public ResponseEntity<Song> toggleFavorite(@PathVariable Long id) {
        return songRepository.findById(id)
                .map(song -> {
                    song.setIsFavorite(!song.getIsFavorite());
                    return ResponseEntity.ok(songRepository.save(song));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/play")
    public ResponseEntity<Song> incrementPlayCount(@PathVariable Long id) {
        return songRepository.findById(id)
                .map(song -> {
                    song.setPlayCount(song.getPlayCount() + 1);
                    return ResponseEntity.ok(songRepository.save(song));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        if (songRepository.existsById(id)) {
            songRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
