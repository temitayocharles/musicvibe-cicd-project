package com.musicvibe.playlist.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Song {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;
    
    @NotBlank(message = "Artist is required")
    @Column(nullable = false)
    private String artist;
    
    private String album;
    
    @NotBlank(message = "Genre is required")
    private String genre;
    
    private Integer duration; // in seconds
    
    @Column(name = "cover_url")
    private String coverUrl;
    
    @Column(name = "release_year")
    private Integer releaseYear;
    
    @Column(name = "play_count")
    private Integer playCount = 0;
    
    @Column(name = "is_favorite")
    private Boolean isFavorite = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
