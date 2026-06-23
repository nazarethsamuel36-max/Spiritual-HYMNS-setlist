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
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Utility to perform bulk ingestion of English songs into the database.
 * Requirement: Safe Mode (Validate structure, no duplicates, atomicity).
 */
public class EnglishBulkImporter {

    public static void main(String[] args) throws Exception {
        File jsonFile = new File("D:/worship-song-library/processed_songs/english_songs.json");
        if (!jsonFile.exists()) {
            System.err.println("JSON file not found: " + jsonFile.getAbsolutePath());
            return;
        }

        System.out.println("--- Starting English Song Ingestion ---");
        System.out.println("Source: " + jsonFile.getAbsolutePath());

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> songMaps = mapper.readValue(jsonFile, new TypeReference<List<Map<String, Object>>>() {});

        SongDAO songDAO = new SongDAO();
        
        // Fetch existing song numbers to prevent duplicates
        Set<Integer> existingSongNumbers = getExistingSongNumbers();
        System.out.println("Found " + existingSongNumbers.size() + " existing songs in DB.");

        int successCount = 0;
        int skipCount = 0;
        int failCount = 0;
        int validationErrorCount = 0;

        for (Map<String, Object> map : songMaps) {
            // STEP 1: PRE-VALIDATION
            if (!isValid(map)) {
                System.err.println("VALIDATION FAILED: Missing fields or empty sections for song number " + map.get("number"));
                validationErrorCount++;
                continue;
            }

            int number = (Integer) map.get("number");
            String title = (String) map.get("title");

            // STEP 2: DUPLICATE CHECK
            if (existingSongNumbers.contains(number)) {
                System.out.println("SKIPPED: Song #" + number + " (" + title + ") already exists.");
                skipCount++;
                continue;
            }

            // STEP 3: MAPPING & INSERTION
            Song song = mapToSong(map);
            
            if (songDAO.addSongWithStructure(song)) {
                successCount++;
                System.out.println("IMPORTED: [" + number + "] " + title);
            } else {
                failCount++;
                System.err.println("FAILED to import: [" + number + "] " + title);
            }
        }

        System.out.println("\n--- Ingestion Report ---");
        System.out.println("Total Songs in JSON: " + songMaps.size());
        System.out.println("Successfully Ingested: " + successCount);
        System.out.println("Skipped (Duplicates): " + skipCount);
        System.out.println("Validation Errors: " + validationErrorCount);
        System.out.println("Database Failures: " + failCount);
        System.out.println("-------------------------");
    }

    private static boolean isValid(Map<String, Object> map) {
        if (map.get("number") == null || map.get("title") == null) return false;
        
        List<Map<String, Object>> sectionMaps = (List<Map<String, Object>>) map.get("sections");
        if (sectionMaps == null || sectionMaps.isEmpty()) return false;

        for (Map<String, Object> secMap : sectionMaps) {
            List<String> lines = (List<String>) secMap.get("lines");
            if (lines == null || lines.isEmpty()) return false;
        }

        return true;
    }

    private static Song mapToSong(Map<String, Object> map) {
        Song song = new Song();
        song.setSongNumber((Integer) map.get("number"));
        song.setTitle((String) map.get("title"));
        song.setLanguage((String) map.get("language"));
        song.setBook((String) map.get("book"));
        song.setCreatedBy(1); // Default Admin
        song.setActive(true);

        List<Map<String, Object>> sectionMaps = (List<Map<String, Object>>) map.get("sections");
        List<Section> sections = new ArrayList<>();
        for (Map<String, Object> secMap : sectionMaps) {
            Section section = new Section();
            section.setType((String) secMap.get("type"));
            section.setLabel((String) secMap.get("label"));
            
            List<String> lineTexts = (List<String>) secMap.get("lines");
            List<SongLine> lines = new ArrayList<>();
            for (String text : lineTexts) {
                SongLine line = new SongLine();
                line.setText(text);
                lines.add(line);
            }
            section.setLines(lines);
            sections.add(section);
        }
        song.setSections(sections);
        return song;
    }

    private static Set<Integer> getExistingSongNumbers() {
        Set<Integer> numbers = new HashSet<>();
        String sql = "SELECT song_number FROM songs";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                numbers.add(rs.getInt("song_number"));
            }
        } catch (Exception e) {
            System.err.println("Error fetching existing song numbers: " + e.getMessage());
        }
        return numbers;
    }
}
