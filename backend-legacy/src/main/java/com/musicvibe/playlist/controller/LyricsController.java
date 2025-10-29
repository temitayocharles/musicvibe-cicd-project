package com.musicvibe.playlist.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@RestController
@RequestMapping("/api/v1/lyrics")
@CrossOrigin(origins = "*")
@Slf4j
public class LyricsController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/search")
    public ResponseEntity<?> searchLyrics(@RequestParam String artist, @RequestParam String title) {
        try {
            // Using lyrics.ovh - FREE API, no authentication required!
            String cleanArtist = artist.trim();
            String cleanTitle = title.trim();
            
            String searchUrl = String.format(
                "https://api.lyrics.ovh/v1/%s/%s",
                cleanArtist.replace(" ", "%20"),
                cleanTitle.replace(" ", "%20")
            );

            log.info("Searching lyrics for: {} - {}", cleanArtist, cleanTitle);

            ResponseEntity<Map> response = restTemplate.exchange(
                searchUrl,
                HttpMethod.GET,
                null,
                Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("lyrics")) {
                Map<String, Object> result = new HashMap<>();
                result.put("artist", cleanArtist);
                result.put("title", cleanTitle);
                result.put("lyrics", body.get("lyrics"));
                result.put("found", true);
                
                log.info("Lyrics found for: {} - {}", cleanArtist, cleanTitle);
                return ResponseEntity.ok(result);
            }
            
            Map<String, Object> notFound = new HashMap<>();
            notFound.put("found", false);
            notFound.put("message", "Lyrics not found. Try adjusting the artist or song name.");
            return ResponseEntity.ok(notFound);
            
        } catch (Exception e) {
            log.error("Error searching lyrics: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("found", false);
            error.put("message", "Unable to find lyrics. Please check the artist and song names.");
            return ResponseEntity.ok(error);
        }
    }
}
