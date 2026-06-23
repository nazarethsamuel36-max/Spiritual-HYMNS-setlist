package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;

import java.io.File;
import java.sql.*;
import java.util.*;

/**
 * Reconciles the database against english_songs.json.
 *
 * For each song (1–377):
 *   1. Load the JSON "golden" version.
 *   2. Load the DB version (title, sections, lines).
 *   3. Compare them structurally.
 *   4. If mismatch → DELETE the old DB rows + INSERT fresh from JSON (one transaction).
 *   5. Emit a final report.
 */
public class EnglishReconciler {

    private static final String JSON_PATH = "D:/worship-song-library/processed_songs/english_songs.json";

    public static void main(String[] args) throws Exception {
        File jsonFile = new File(JSON_PATH);
        if (!jsonFile.exists()) {
            System.err.println("JSON file not found: " + jsonFile.getAbsolutePath());
            return;
        }

        System.out.println("=== ENGLISH SONG RECONCILER ===");
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> songMaps = mapper.readValue(jsonFile, new TypeReference<>() {});
        System.out.println("Loaded " + songMaps.size() + " songs from JSON.");

        int matched    = 0;  // DB == JSON (no action)
        int replaced   = 0;  // DB ≠ JSON  (delete + re-insert)
        int missing    = 0;  // In JSON but not in DB (fresh insert)
        int failed     = 0;  // Transaction error

        for (Map<String, Object> jsonMap : songMaps) {
            int  number  = (Integer) jsonMap.get("number");
            String jsonTitle   = (String)  jsonMap.get("title");

            // Build the canonical JSON sections structure
            List<Section> jsonSections = extractSections(jsonMap);

            // Load DB version
            DbSong dbSong = loadFromDb(number);

            if (dbSong == null) {
                // Song doesn't exist in DB at all → fresh insert
                boolean ok = insertSong(jsonMap, jsonSections, null);
                if (ok) { missing++; System.out.println("INSERTED (new): [" + number + "] " + jsonTitle); }
                else     { failed++;  System.err.println("FAILED insert:  [" + number + "] " + jsonTitle); }
                continue;
            }

            // Compare title
            boolean titleOk    = jsonTitle.trim().equalsIgnoreCase(dbSong.title.trim());
            // Compare section count
            boolean sectionOk  = jsonSections.size() == dbSong.sections.size();
            // Compare lines (deep)
            boolean linesOk    = sectionOk && linesMatch(jsonSections, dbSong.sections);

            if (titleOk && sectionOk && linesOk) {
                matched++;
                System.out.println("OK:       [" + number + "] " + jsonTitle);
            } else {
                // Mismatch → transactional replace
                System.out.println("MISMATCH: [" + number + "] DB='" + dbSong.title + "' JSON='" + jsonTitle + "'");
                if (!titleOk)   System.out.println("          ↳ title differs");
                if (!sectionOk) System.out.println("          ↳ sections: DB=" + dbSong.sections.size() + " JSON=" + jsonSections.size());
                if (sectionOk && !linesOk) System.out.println("          ↳ line content differs");

                boolean ok = replaceInTransaction(dbSong.dbId, jsonMap, jsonSections);
                if (ok) { replaced++; System.out.println("          ✓ Replaced"); }
                else    { failed++;   System.err.println("          ✗ Replace FAILED — DB unchanged"); }
            }
        }

        System.out.println("\n=== RECONCILIATION REPORT ===");
        System.out.println("Total in JSON  : " + songMaps.size());
        System.out.println("Matched (clean): " + matched);
        System.out.println("Replaced       : " + replaced);
        System.out.println("Inserted (new) : " + missing);
        System.out.println("Errors         : " + failed);
        System.out.println("==============================");
    }

    // -------------------------------------------------------------------------
    // DB read helpers
    // -------------------------------------------------------------------------

    private static DbSong loadFromDb(int songNumber) throws SQLException {
        String sql = "SELECT id, title FROM songs WHERE song_number = ? AND language = 'english' LIMIT 1";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, songNumber);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                DbSong s   = new DbSong();
                s.dbId     = rs.getInt("id");
                s.title    = rs.getString("title");
                s.sections = loadSections(c, s.dbId);
                return s;
            }
        }
    }

    private static List<DbSection> loadSections(Connection c, int songId) throws SQLException {
        List<DbSection> list = new ArrayList<>();
        String sql = "SELECT id FROM sections WHERE song_id = ? ORDER BY section_order";
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, songId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    DbSection sec = new DbSection();
                    sec.id    = rs.getInt("id");
                    sec.lines = loadLines(c, sec.id);
                    list.add(sec);
                }
            }
        }
        return list;
    }

    private static List<String> loadLines(Connection c, int sectionId) throws SQLException {
        List<String> list = new ArrayList<>();
        String sql = "SELECT line_text FROM song_lines WHERE section_id = ? ORDER BY line_order";
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, sectionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(rs.getString("line_text"));
            }
        }
        return list;
    }

    // -------------------------------------------------------------------------
    // Comparison helpers
    // -------------------------------------------------------------------------

    private static boolean linesMatch(List<Section> jsonSections, List<DbSection> dbSections) {
        for (int i = 0; i < jsonSections.size(); i++) {
            List<SongLine> jLines = jsonSections.get(i).getLines();
            List<String>   dLines = dbSections.get(i).lines;
            if (jLines.size() != dLines.size()) return false;
            for (int j = 0; j < jLines.size(); j++) {
                if (!jLines.get(j).getText().equals(dLines.get(j))) return false;
            }
        }
        return true;
    }

    // -------------------------------------------------------------------------
    // Write helpers
    // -------------------------------------------------------------------------

    /** Atomically delete old song + insert fresh from JSON. */
    private static boolean replaceInTransaction(int oldDbId,
                                                Map<String, Object> jsonMap,
                                                List<Section> sections) {
        Connection c = null;
        try {
            c = DBConnection.getConnection();
            c.setAutoCommit(false);

            // 1. Wipe child rows (FK cascades should handle this, but be explicit)
            deleteSongCascade(c, oldDbId);

            // 2. Insert fresh
            int newSongId = insertSongRow(c, jsonMap);
            insertSectionsAndLines(c, newSongId, sections);

            c.commit();
            return true;
        } catch (Exception e) {
            if (c != null) try { c.rollback(); } catch (SQLException ignored) {}
            e.printStackTrace();
            return false;
        } finally {
            if (c != null) try { c.close(); } catch (SQLException ignored) {}
        }
    }

    /** Fresh insert (for songs not yet in DB). */
    private static boolean insertSong(Map<String, Object> jsonMap, List<Section> sections, Object unused) {
        Connection c = null;
        try {
            c = DBConnection.getConnection();
            c.setAutoCommit(false);
            int songId = insertSongRow(c, jsonMap);
            insertSectionsAndLines(c, songId, sections);
            c.commit();
            return true;
        } catch (Exception e) {
            if (c != null) try { c.rollback(); } catch (SQLException ignored) {}
            e.printStackTrace();
            return false;
        } finally {
            if (c != null) try { c.close(); } catch (SQLException ignored) {}
        }
    }

    private static void deleteSongCascade(Connection c, int songId) throws SQLException {
        // 1. Delete from child tables that don't have ON DELETE CASCADE
        String[] tables = {"song_views", "song_hashtags", "chord_reports", "user_songs", "leaflet_songs"};
        for (String table : tables) {
            try (PreparedStatement ps = c.prepareStatement("DELETE FROM " + table + " WHERE song_id = ?")) {
                ps.setInt(1, songId);
                ps.executeUpdate();
            }
        }

        // 2. Wipe lines (FK to sections doesn't always cascade depending on engine setup)
        String delLines = "DELETE sl FROM song_lines sl " +
                          "INNER JOIN sections s ON sl.section_id = s.id " +
                          "WHERE s.song_id = ?";
        try (PreparedStatement ps = c.prepareStatement(delLines)) {
            ps.setInt(1, songId); ps.executeUpdate();
        }
        
        // 3. Delete sections
        try (PreparedStatement ps = c.prepareStatement("DELETE FROM sections WHERE song_id = ?")) {
            ps.setInt(1, songId); ps.executeUpdate();
        }

        // 4. Finally delete the song (setlist_songs has native CASCADE so it's fine)
        try (PreparedStatement ps = c.prepareStatement("DELETE FROM songs WHERE id = ?")) {
            ps.setInt(1, songId); ps.executeUpdate();
        }
    }

    private static int insertSongRow(Connection c, Map<String, Object> map) throws SQLException {
        String sql = "INSERT INTO songs (song_number, title, language, book, created_by, is_active) " +
                     "VALUES (?, ?, ?, ?, 1, TRUE)";
        try (PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt   (1, (Integer) map.get("number"));
            ps.setString(2, (String)  map.get("title"));
            ps.setString(3, map.get("language") != null ? (String) map.get("language") : "english");
            ps.setString(4, map.get("book")     != null ? (String) map.get("book")     : "prime_songbook");
            if (ps.executeUpdate() == 0) throw new SQLException("Failed to insert song row");
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
                throw new SQLException("No generated key for song");
            }
        }
    }

    private static void insertSectionsAndLines(Connection c, int songId, List<Section> sections) throws SQLException {
        String secSql  = "INSERT INTO sections (song_id, type, label, section_order) VALUES (?, ?, ?, ?)";
        String lineSql = "INSERT INTO song_lines (section_id, line_text, line_order) VALUES (?, ?, ?)";
        try (PreparedStatement secPs  = c.prepareStatement(secSql, Statement.RETURN_GENERATED_KEYS);
             PreparedStatement linePs = c.prepareStatement(lineSql)) {

            for (int i = 0; i < sections.size(); i++) {
                Section sec = sections.get(i);
                secPs.setInt   (1, songId);
                secPs.setString(2, sec.getType());
                secPs.setString(3, sec.getLabel());
                secPs.setInt   (4, i + 1);
                secPs.executeUpdate();

                int secId;
                try (ResultSet k = secPs.getGeneratedKeys()) {
                    if (k.next()) secId = k.getInt(1);
                    else throw new SQLException("No key for section");
                }

                List<SongLine> lines = sec.getLines();
                for (int j = 0; j < lines.size(); j++) {
                    linePs.setInt   (1, secId);
                    linePs.setString(2, lines.get(j).getText());
                    linePs.setInt   (3, j + 1);
                    linePs.addBatch();
                }
                linePs.executeBatch();
            }
        }
    }

    // -------------------------------------------------------------------------
    // JSON parse helpers
    // -------------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private static List<Section> extractSections(Map<String, Object> map) {
        List<Section> result = new ArrayList<>();
        List<Map<String, Object>> rawSecs = (List<Map<String, Object>>) map.get("sections");
        if (rawSecs == null) return result;
        for (Map<String, Object> secMap : rawSecs) {
            Section sec = new Section();
            sec.setType ((String) secMap.get("type"));
            sec.setLabel((String) secMap.get("label"));
            List<String> rawLines = (List<String>) secMap.get("lines");
            List<SongLine> lines = new ArrayList<>();
            if (rawLines != null) {
                for (String text : rawLines) {
                    SongLine sl = new SongLine();
                    sl.setText(text);
                    lines.add(sl);
                }
            }
            sec.setLines(lines);
            result.add(sec);
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // Internal value objects
    // -------------------------------------------------------------------------

    private static class DbSong {
        int           dbId;
        String        title;
        List<DbSection> sections;
    }

    private static class DbSection {
        int          id;
        List<String> lines;
    }
}
