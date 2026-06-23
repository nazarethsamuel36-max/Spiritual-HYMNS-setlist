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
 * Utility to perform bulk ingestion of refined Marathi songs.
 * 1. Hides existing Marathi songs in prime_songbook.
 * 2. Inserts new songs from marathi_songs.json.
 */
public class MarathiBulkImporter {

    public static void main(String[] args) throws Exception {
        File jsonFile = new File("D:/worship-song-library/extracted_songs/marathi_songs.json");
        if (!jsonFile.exists()) {
            System.err.println("JSON file not found: " + jsonFile.getAbsolutePath());
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> songMaps = mapper.readValue(jsonFile, new TypeReference<List<Map<String, Object>>>() {});

        SongDAO songDAO = new SongDAO();

        // 1. Hide existing Marathi songs in prime_songbook
        try (Connection conn = DBConnection.getConnection()) {
            String deactivateSql = "UPDATE songs SET is_active = FALSE WHERE language = 'marathi' AND book = 'prime_songbook'";
            try (PreparedStatement ps = conn.prepareStatement(deactivateSql)) {
                int count = ps.executeUpdate();
                System.out.println("Deactivated " + count + " existing Marathi songs.");
            }
        }

        // 2. Insert new songs
        int successCount = 0;
        int failCount = 0;

        for (Map<String, Object> map : songMaps) {
            Song song = new Song();
            song.setSongNumber((Integer) map.get("number"));
            song.setTitle((String) map.get("title"));
            song.setLanguage((String) map.get("language"));
            song.setBook((String) map.get("book"));
            song.setCreatedBy(1); // Default Admin
            song.setActive(true);

            List<Map<String, Object>> sectionMaps = (List<Map<String, Object>>) map.get("sections");
            List<Section> sections = new ArrayList<>();
            if (sectionMaps != null) {
                for (Map<String, Object> secMap : sectionMaps) {
                    Section section = new Section();
                    section.setType((String) secMap.get("type"));
                    section.setLabel((String) secMap.get("label"));
                    
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

            if (songDAO.addSongWithStructure(song)) {
                successCount++;
                System.out.println("Imported: [" + song.getSongNumber() + "] " + song.getTitle());
            } else {
                failCount++;
                System.err.println("FAILED to import: [" + song.getSongNumber() + "] " + song.getTitle());
            }
        }

        System.out.println("\n--- Import Summary ---");
        System.out.println("Successfully Ingested: " + successCount);
        System.out.println("Failed: " + failCount);
    }
}
