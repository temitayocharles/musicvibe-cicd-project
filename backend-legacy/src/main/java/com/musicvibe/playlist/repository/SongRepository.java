package com.musicvibe.playlist.repository;

import com.musicvibe.playlist.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    
    List<Song> findByGenre(String genre);
    
    List<Song> findByArtistContainingIgnoreCase(String artist);
    
    List<Song> findByTitleContainingIgnoreCase(String title);
    
    List<Song> findByIsFavoriteTrue();
    
    List<Song> findByGenreOrderByPlayCountDesc(String genre);
}
