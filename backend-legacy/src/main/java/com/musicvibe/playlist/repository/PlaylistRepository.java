package com.musicvibe.playlist.repository;

import com.musicvibe.playlist.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    
    List<Playlist> findByMood(String mood);
    
    List<Playlist> findByNameContainingIgnoreCase(String name);
}
