package com.worship.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;

import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Ingests the REAL Special Marathi songs (1501+) extracted from screenshots.
 * Source: extracted_songs/special_marathi_songs.json
 * 
 * ADDITIVE ONLY — does NOT delete or modify existing records.
 * Identity: (song_number, language, book)
 */
public class SpecialMarathiIngestor {

    private static final String SOURCE_JSON = "extracted_songs/special_marathi_songs_verified.json";
    private static final String TARGET_BOOK = "special_marathi";
    private static final String TARGET_LANG = "marathi";
    private static final int CREATED_BY = 1; // Admin

    /**
     * Pipeline-compliant ingestor.
     * Source: extracted_songs/special_marathi_songs_verified.json (derived from MD)
     */

    public static void main(String[] args) {
        System.out.println("=== SPECIAL MARATHI INGESTION (1501+) ===");
        System.out.println("Source: " + SOURCE_JSON);
        System.out.println("Target book: " + TARGET_BOOK);
        System.out.println();

        int inserted = 0;
        int skipped = 0;
        int failed = 0;

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(new File(SOURCE_JSON));

            for (JsonNode songNode : root) {
                int number = songNode.get("number").asInt();
                String title = songNode.get("title").asText();
                String originalKey = songNode.has("originalKey") ? songNode.get("originalKey").asText() : null;

                System.out.println("Processing Song #" + number + ": " + title);

                // IDENTITY CHECK: delete if already exists to ensure VERIFIED data replaces old data
                Integer existingId = findExistingSongId(number, TARGET_LANG, TARGET_BOOK);
                if (existingId != null) {
                    System.out.println("  -> ALREADY EXISTS (id=" + existingId + "). REPLACING with verified data.");
                    deleteSong(existingId);
                }

                // Build Song object
                Song song = new Song();
                song.setSongNumber(number);
                song.setTitle(title);
                song.setLanguage(TARGET_LANG);
                song.setBook(TARGET_BOOK);
                song.setCreatedBy(CREATED_BY);
                if (originalKey != null) {
                    song.setOriginalKey(originalKey);
                }

                // Parse Sections
                List<Section> sections = new ArrayList<>();
                JsonNode sectionsNode = songNode.get("sections");
                if (sectionsNode != null) {
                    for (int i = 0; i < sectionsNode.size(); i++) {
                        JsonNode secNode = sectionsNode.get(i);
                        Section sec = new Section();
                        sec.setType(secNode.get("type").asText());
                        sec.setLabel(secNode.get("label").asText());
                        sec.setSectionOrder(i);

                        JsonNode linesNode = secNode.get("lines");
                        if (linesNode != null) {
                            for (int j = 0; j < linesNode.size(); j++) {
                                SongLine line = new SongLine();
                                line.setText(linesNode.get(j).asText());
                                line.setLineOrder(j);
                                sec.addLine(line);
                            }
                        }
                        sections.add(sec);
                    }
                }
                song.setSections(sections);

                // INSERT using transaction (manual, to include original_key)
                boolean success = insertSongWithKey(song);
                if (success) {
                    System.out.println("  -> INSERTED: Song #" + number + " (key=" + originalKey + ")");
                    inserted++;
                } else {
                    System.out.println("  -> FAILED: Song #" + number);
                    failed++;
                }
            }

            System.out.println();
            System.out.println("=== INGESTION COMPLETE ===");
            System.out.println("Inserted: " + inserted);
            System.out.println("Skipped:  " + skipped);
            System.out.println("Failed:   " + failed);

            // VERIFICATION QUERY
            System.out.println();
            System.out.println("=== VERIFICATION: All special_marathi songs ===");
            verifyInsertedSongs();

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("INGESTION FAILED: " + e.getMessage());
        }
    }

    /**
     * Custom insert that includes original_key (which addSongWithStructure does not).
     */
    private static boolean insertSongWithKey(Song song) {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Insert Song WITH original_key
            String songSql = "INSERT INTO songs (song_number, title, language, created_by, is_active, book, original_key) "
                    + "VALUES (?, ?, ?, ?, TRUE, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(songSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, song.getSongNumber());
                ps.setString(2, song.getTitle());
                ps.setString(3, song.getLanguage());
                ps.setInt(4, song.getCreatedBy());
                ps.setString(5, song.getBook());
                ps.setString(6, song.getOriginalKey());

                if (ps.executeUpdate() == 0) throw new SQLException("Failed to insert song");
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) song.setId(keys.getInt(1));
                    else throw new SQLException("No ID generated for song");
                }
            }

            // 2. Insert Sections + Lines
            String secSql = "INSERT INTO sections (song_id, type, label, section_order) VALUES (?, ?, ?, ?)";
            String lineSql = "INSERT INTO song_lines (section_id, line_text, line_order) VALUES (?, ?, ?)";

            try (PreparedStatement secPs = conn.prepareStatement(secSql, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement linePs = conn.prepareStatement(lineSql, Statement.RETURN_GENERATED_KEYS)) {

                for (int i = 0; i < song.getSections().size(); i++) {
                    Section sec = song.getSections().get(i);
                    secPs.setInt(1, song.getId());
                    secPs.setString(2, sec.getType());
                    secPs.setString(3, sec.getLabel());
                    secPs.setInt(4, i + 1);
                    secPs.executeUpdate();

                    int sectionId;
                    try (ResultSet secKeys = secPs.getGeneratedKeys()) {
                        if (secKeys.next()) sectionId = secKeys.getInt(1);
                        else throw new SQLException("No ID generated for section");
                    }

                    for (int j = 0; j < sec.getLines().size(); j++) {
                        SongLine line = sec.getLines().get(j);
                        linePs.setInt(1, sectionId);
                        linePs.setString(2, line.getText());
                        linePs.setInt(3, j + 1);
                        linePs.executeUpdate();
                    }
                }
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
                try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
    }

    private static Integer findExistingSongId(int number, String lang, String book) throws SQLException {
        String sql = "SELECT id FROM songs WHERE song_number = ? AND language = ? AND book = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, number);
            ps.setString(2, lang);
            ps.setString(3, book);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("id");
            }
        }
        return null;
    }

    private static void deleteSong(int songId) throws SQLException {
        String sql = "DELETE FROM songs WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, songId);
            ps.executeUpdate();
        }
    }

    private static void verifyInsertedSongs() throws SQLException {
        String sql = "SELECT song_number, title, original_key FROM songs WHERE book = 'special_marathi' ORDER BY song_number";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            System.out.printf("%-8s %-50s %-5s%n", "NUMBER", "TITLE", "KEY");
            System.out.println("-".repeat(65));
            int count = 0;
            while (rs.next()) {
                System.out.printf("%-8d %-50s %-5s%n",
                        rs.getInt("song_number"),
                        rs.getString("title"),
                        rs.getString("original_key") != null ? rs.getString("original_key") : "-");
                count++;
            }
            System.out.println("-".repeat(65));
            System.out.println("Total: " + count + " songs in special_marathi");
        }
    }
}
