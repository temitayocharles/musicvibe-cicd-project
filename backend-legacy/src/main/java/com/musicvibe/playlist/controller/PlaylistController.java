package com.musicvibe.playlist.controller;

import com.musicvibe.playlist.entity.Playlist;
import com.musicvibe.playlist.entity.Song;
import com.musicvibe.playlist.repository.PlaylistRepository;
import com.musicvibe.playlist.repository.SongRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/playlists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlaylistController {
    
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    
    @GetMapping
    public List<Playlist> getAllPlaylists() {
        return playlistRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Playlist> getPlaylistById(@PathVariable Long id) {
        return playlistRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/mood/{mood}")
    public List<Playlist> getPlaylistsByMood(@PathVariable String mood) {
        return playlistRepository.findByMood(mood);
    }
    
    @GetMapping("/search")
    public List<Playlist> searchPlaylists(@RequestParam String name) {
        return playlistRepository.findByNameContainingIgnoreCase(name);
    }
    
    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(@Valid @RequestBody Playlist playlist) {
        Playlist savedPlaylist = playlistRepository.save(playlist);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlaylist);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Playlist> updatePlaylist(@PathVariable Long id, @Valid @RequestBody Playlist playlistDetails) {
        return playlistRepository.findById(id)
                .map(playlist -> {
                    playlist.setName(playlistDetails.getName());
                    playlist.setDescription(playlistDetails.getDescription());
                    playlist.setMood(playlistDetails.getMood());
                    playlist.setCoverUrl(playlistDetails.getCoverUrl());
                    return ResponseEntity.ok(playlistRepository.save(playlist));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<Playlist> addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        return playlistRepository.findById(playlistId)
                .flatMap(playlist -> songRepository.findById(songId)
                        .map(song -> {
                            if (!playlist.getSongs().contains(song)) {
                                playlist.getSongs().add(song);
                                return ResponseEntity.ok(playlistRepository.save(playlist));
                            }
                            return ResponseEntity.ok(playlist);
                        }))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<Playlist> removeSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        return playlistRepository.findById(playlistId)
                .flatMap(playlist -> songRepository.findById(songId)
                        .map(song -> {
                            playlist.getSongs().remove(song);
                            return ResponseEntity.ok(playlistRepository.save(playlist));
                        }))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id) {
        if (playlistRepository.existsById(id)) {
            playlistRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
