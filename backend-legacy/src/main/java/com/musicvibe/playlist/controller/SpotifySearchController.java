package com.musicvibe.playlist.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.stream.Collectors;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/search")
@CrossOrigin(origins = "*")
@Slf4j
public class SpotifySearchController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/global")
    public ResponseEntity<?> searchGlobal(@RequestParam String query, @RequestParam(defaultValue = "track") String type) {
        try {
            // Using iTunes Search API - FREE, no authentication required!
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String searchUrl = String.format(
                "https://itunes.apple.com/search?term=%s&media=music&entity=song&limit=20",
                encodedQuery
            );

            log.info("Searching iTunes API for: {}", query);

            ResponseEntity<Map> response = restTemplate.exchange(
                searchUrl,
                HttpMethod.GET,
                null,
                Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("results")) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("results");
                
                // Transform iTunes data to our format
                List<Map<String, Object>> songs = results.stream().map(track -> {
                    Map<String, Object> song = new HashMap<>();
                    song.put("title", track.get("trackName"));
                    song.put("artist", track.get("artistName"));
                    song.put("album", track.get("collectionName"));
                    song.put("coverUrl", track.get("artworkUrl100"));
                    
                    // Extract year from release date
                    String releaseDate = (String) track.get("releaseDate");
                    if (releaseDate != null && releaseDate.length() >= 4) {
                        song.put("releaseYear", releaseDate.substring(0, 4));
                    }
                    
                    // Convert milliseconds to seconds
                    Object trackTimeMillis = track.get("trackTimeMillis");
                    if (trackTimeMillis instanceof Number) {
                        song.put("duration", ((Number) trackTimeMillis).intValue() / 1000);
                    } else {
                        song.put("duration", 0);
                    }
                    
                    song.put("genre", track.get("primaryGenreName"));
                    song.put("previewUrl", track.get("previewUrl"));
                    song.put("externalUrl", track.get("trackViewUrl"));
                    song.put("price", track.get("trackPrice"));
                    song.put("currency", track.get("currency"));
                    song.put("isGlobal", true);
                    
                    return song;
                }).collect(Collectors.toList());
                
                log.info("Found {} songs for query: {}", songs.size(), query);
                return ResponseEntity.ok(songs);
            }
            
            return ResponseEntity.ok(Collections.emptyList());
        } catch (Exception e) {
            log.error("Error searching iTunes API: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Search failed. Please try again.");
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

}
