package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.dao.SongDAO;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;

import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Utility to perform bulk ingestion of 232 Hindi worship songs.
 * Source: processed_songs/hindi_songs.json
 * 
 * Processing:
 * 1. Deactivates existing Hindi songs in prime_songbook
 * 2. Inserts all 232 new Hindi songs from JSON
 * 3. Preserves song structure: sections (verse/chorus) and lines
 * 4. Sets book = "prime_songbook" for all songs
 * 5. Sets language = "hindi" for all songs
 */
public class HindiBulkImporter {

    public static void main(String[] args) throws Exception {
        File jsonFile = new File("d:/worship-song-library/processed_songs/hindi_songs.json");
        if (!jsonFile.exists()) {
            System.err.println("ERROR: JSON file not found: " + jsonFile.getAbsolutePath());
            return;
        }

        System.out.println("========================================");
        System.out.println("HINDI SONGS BULK IMPORTER");
        System.out.println("========================================");
        System.out.println("Source: " + jsonFile.getAbsolutePath());
        System.out.println();

        // Parse JSON
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> songMaps = mapper.readValue(jsonFile, new TypeReference<List<Map<String, Object>>>() {});
        
        System.out.println("Total songs loaded from JSON: " + songMaps.size());
        System.out.println();

        SongDAO songDAO = new SongDAO();

        // 1. Delete existing Hindi songs in prime_songbook (both active and inactive)
        System.out.println("Step 1: Deleting existing Hindi songs in prime_songbook...");
        try (Connection conn = DBConnection.getConnection()) {
            String deleteSql = "DELETE FROM songs WHERE language = 'hindi' AND book = 'prime_songbook'";
            try (PreparedStatement ps = conn.prepareStatement(deleteSql)) {
                int count = ps.executeUpdate();
                System.out.println("  ✓ Deleted " + count + " existing Hindi songs");
            }
        }
        System.out.println();

        // 2. Insert new songs
        System.out.println("Step 2: Inserting " + songMaps.size() + " Hindi songs...");
        System.out.println();

        int successCount = 0;
        int failCount = 0;
        List<String> failedSongs = new ArrayList<>();

        for (Map<String, Object> map : songMaps) {
            Song song = new Song();
            
            // Set required fields
            song.setSongNumber((Integer) map.get("number"));
            song.setTitle((String) map.get("title"));
            song.setLanguage("hindi");
            song.setBook("prime_songbook");
            song.setCreatedBy(1); // Admin user
            song.setActive(true);

            // Parse sections and lines
            List<Map<String, Object>> sectionMaps = (List<Map<String, Object>>) map.get("sections");
            List<Section> sections = new ArrayList<>();
            
            if (sectionMaps != null) {
                for (Map<String, Object> secMap : sectionMaps) {
                    Section section = new Section();
                    section.setType((String) secMap.get("type"));
                    section.setLabel((String) secMap.get("label"));
                    
                    // Parse lines
                    List<String> lineTexts = (List<String>) secMap.get("lines");
                    List<SongLine> lines = new ArrayList<>();
                    
                    if (lineTexts != null) {
                        for (String text : lineTexts) {
                            SongLine line = new SongLine();
                            line.setText(text);
                            lines.add(line);
                        }
                    }
                    
                    section.setLines(lines);
                    sections.add(section);
                }
            }
            
            song.setSections(sections);

            // Insert song
            if (songDAO.addSongWithStructure(song)) {
                successCount++;
                System.out.println("  ✓ [" + String.format("%3d", song.getSongNumber()) + "] " + song.getTitle());
            } else {
                failCount++;
                String failMsg = "[" + song.getSongNumber() + "] " + song.getTitle();
                failedSongs.add(failMsg);
                System.err.println("  ✗ FAILED: " + failMsg);
            }
        }

        System.out.println();
        System.out.println("========================================");
        System.out.println("IMPORT SUMMARY");
        System.out.println("========================================");
        System.out.println("Successfully Inserted: " + successCount + " songs");
        System.out.println("Failed: " + failCount + " songs");
        
        if (failCount > 0) {
            System.out.println();
            System.out.println("Failed Songs:");
            for (String failedSong : failedSongs) {
                System.out.println("  - " + failedSong);
            }
        }
        
        System.out.println();
        System.out.println("Total: " + (successCount + failCount) + " / " + songMaps.size());
        System.out.println("Success Rate: " + String.format("%.2f", (double) successCount / songMaps.size() * 100) + "%");
        System.out.println("========================================");
    }
}
