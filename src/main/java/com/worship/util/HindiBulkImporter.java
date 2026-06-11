package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.dao.SongDAO;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;
import java.io.File;
import java.sql.*;
import java.util.*;

/**
 * Utility to import Hindi songs from JSON into the database CLEANLY.
 * Handles duplicates by activating existing records instead of inserting new ones.
 */
public class HindiBulkImporter {
    public static void main(String[] args) {
        System.out.println("--- Hindi Song Bulk Import (Clean Version) Initialized ---");
        
        ObjectMapper mapper = new ObjectMapper();
        SongDAO songDAO = new SongDAO();
        File jsonFile = new File("processed_songs/hindi_songs.json");

        if (!jsonFile.exists()) {
            System.err.println("Error: JSON file not found at " + jsonFile.getAbsolutePath());
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            // 1. Load JSON data
            List<Map<String, Object>> rawData = mapper.readValue(jsonFile, new TypeReference<List<Map<String, Object>>>() {});
            System.out.println("Loaded " + rawData.size() + " songs from JSON.");

            // 2. Map existing Hindi songs in prime_songbook (Active or Inactive)
            // We use title as the primary key for matching as per requirements
            Map<String, Integer> existingSongs = new HashMap<>();
            String fetchSql = "SELECT id, title FROM songs WHERE language = 'hindi' AND book = 'prime_songbook'";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(fetchSql)) {
                while (rs.next()) {
                    existingSongs.put(rs.getString("title").toUpperCase().trim(), rs.getInt("id"));
                }
            }
            System.out.println("Found " + existingSongs.size() + " existing Hindi records in prime_songbook.");

            int inserted = 0;
            int activated = 0;
            int skipped = 0;

            String activateSql = "UPDATE songs SET is_active = TRUE, song_number = ? WHERE id = ?";
            try (PreparedStatement activatePs = conn.prepareStatement(activateSql)) {
                
                for (Map<String, Object> data : rawData) {
                    String title = (String) data.get("title");
                    if (title == null || title.trim().isEmpty()) {
                        skipped++;
                        continue;
                    }

                    String normTitle = title.toUpperCase().trim();
                    Integer existingId = existingSongs.get(normTitle);
                    int songNumber = data.get("number") != null ? (Integer) data.get("number") : 0;

                    if (existingId != null) {
                        // UPDATE / ACTIVATE
                        activatePs.setInt(1, songNumber);
                        activatePs.setInt(2, existingId);
                        activatePs.executeUpdate();
                        activated++;
                    } else {
                        // INSERT NEW
                        Song song = new Song();
                        song.setSongNumber(songNumber);
                        song.setTitle(title);
                        song.setLanguage("hindi");
                        song.setBook("prime_songbook");
                        song.setCreatedBy(1);
                        song.setActive(true);

                        List<Map<String, Object>> sectionsData = (List<Map<String, Object>>) data.get("sections");
                        List<Section> sections = new ArrayList<>();
                        if (sectionsData != null) {
                            for (Map<String, Object> secMap : sectionsData) {
                                Section section = new Section();
                                section.setType((String) secMap.get("type"));
                                section.setLabel((String) secMap.get("label"));
                                List<String> linesText = (List<String>) secMap.get("lines");
                                List<SongLine> lines = new ArrayList<>();
                                if (linesText != null) {
                                    int lineOrder = 1;
                                    for (int i = 0; i < linesText.size(); i++) {
                                        String rawLine = linesText.get(i);
                                        
                                        // Two-line chord format detection
                                        if (com.worship.util.ChordParser.isChordOnlyLine(rawLine) && i + 1 < linesText.size()) {
                                            String nextLine = linesText.get(i + 1);
                                            if (!nextLine.trim().isEmpty() && !com.worship.util.ChordParser.isChordOnlyLine(nextLine)) {
                                                List<com.worship.model.ChordOccurrence> chords = com.worship.util.ChordParser.parseChordOnlyLine(rawLine);
                                                SongLine sl = new SongLine(nextLine, lineOrder++);
                                                sl.setChords(chords);
                                                lines.add(sl);
                                                i++; // skip next line
                                                continue;
                                            }
                                        }
                                        
                                        // Normal bracketed or pure lyrics
                                        com.worship.model.StructuredLine structuredLine = com.worship.util.ChordParser.parseStructuredLine(rawLine);
                                        if (structuredLine.getLyrics() != null && !structuredLine.getLyrics().trim().isEmpty()) {
                                            SongLine sl = new SongLine(structuredLine.getLyrics(), lineOrder++);
                                            sl.setChords(structuredLine.getChords());
                                            lines.add(sl);
                                        } else {
                                            // Fallback for purely empty lines or unparseable lines
                                            SongLine sl = new SongLine(rawLine, lineOrder++);
                                            lines.add(sl);
                                        }
                                    }
                                }
                                section.setLines(lines);
                                sections.add(section);
                            }
                        }
                        song.setSections(sections);

                        if (songDAO.addSongWithStructure(song)) {
                            inserted++;
                        }
                    }
                }
            }

            // 4. Final Report
            System.out.println("\n========================================");
            System.out.println("IMPORT COMPLETE");
            System.out.println("========================================");
            System.out.println("✔ Total Inserted:  " + inserted);
            System.out.println("✔ Total Activated: " + activated + " (Existing records)");
            System.out.println("✔ Total Skipped:   " + skipped);
            
            // Verification Query
            String verifySql = "SELECT COUNT(*) FROM songs WHERE language = 'hindi' AND book = 'prime_songbook' AND is_active = TRUE";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(verifySql)) {
                if (rs.next()) {
                    System.out.println("✔ Final Active Hindi Songs in DB: " + rs.getInt(1));
                }
            }
            System.out.println("========================================\n");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
