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

public class UnifiedSpecialIngestor {

    private static final int CREATED_BY = 1;

    public static void main(String[] args) {
        if (args.length < 3) {
            System.out.println("Usage: UnifiedSpecialIngestor <json_path> <target_lang> <target_book> [--purge-incorrect-marathi]");
            return;
        }

        String sourceJson = args[0];
        String targetLang = args[1];
        String targetBook = args[2];
        boolean purgeIncorrect = args.length > 3 && args[3].equals("--purge-incorrect-marathi");

        try {
            if (purgeIncorrect) {
                purgeIncorrectSpecialMarathi();
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(new File(sourceJson));

            int inserted = 0;
            for (JsonNode songNode : root) {
                int number = songNode.get("number").asInt();
                String title = songNode.get("title").asText();
                String lang = songNode.get("language").asText();
                String book = songNode.get("book").asText();
                
                String finalLang = targetLang.equals("auto") ? lang : targetLang;
                String finalBook = targetBook.equals("auto") ? book : targetBook;

                Integer existingId = findExistingSongId(number, finalLang, finalBook);
                if (existingId != null) {
                    deleteSong(existingId);
                }

                Song song = new Song();
                song.setSongNumber(number);
                song.setTitle(title);
                song.setLanguage(finalLang);
                song.setBook(finalBook);
                song.setCreatedBy(CREATED_BY);
                if (songNode.has("originalKey")) {
                    song.setOriginalKey(songNode.get("originalKey").asText());
                }

                List<Section> sections = new ArrayList<>();
                JsonNode sectionsNode = songNode.get("sections");
                if (sectionsNode != null) {
                    for (int i = 0; i < sectionsNode.size(); i++) {
                        JsonNode secNode = sectionsNode.get(i);
                        Section sec = new Section();
                        sec.setType(secNode.get("type").asText());
                        sec.setLabel(secNode.get("label").asText());
                        sec.setSectionOrder(i + 1);

                        JsonNode linesNode = secNode.get("lines");
                        for (int j = 0; j < linesNode.size(); j++) {
                            SongLine line = new SongLine();
                            line.setText(linesNode.get(j).asText());
                            line.setLineOrder(j + 1);
                            sec.addLine(line);
                        }
                        sections.add(sec);
                    }
                }
                song.setSections(sections);
                if (insertSongWithKey(song)) inserted++;
            }
            System.out.println("Ingestion complete. Inserted: " + inserted);
            verifyBook(targetBook.equals("auto") ? "prime_songbook" : targetBook);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void purgeIncorrectSpecialMarathi() throws SQLException {
        System.out.println("Purging incorrect songs (1-1500) from special_marathi...");
        String sql = "DELETE FROM songs WHERE book = 'special_marathi' AND song_number < 1501";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int deleted = ps.executeUpdate();
            System.out.println("Purged " + deleted + " incorrect records.");
        }
    }

    private static boolean insertSongWithKey(Song song) throws SQLException {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);
            String songSql = "INSERT INTO songs (song_number, title, language, created_by, is_active, book, original_key) VALUES (?, ?, ?, ?, TRUE, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(songSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, song.getSongNumber());
                ps.setString(2, song.getTitle());
                ps.setString(3, song.getLanguage());
                ps.setInt(4, song.getCreatedBy());
                ps.setString(5, song.getBook());
                ps.setString(6, song.getOriginalKey());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) song.setId(keys.getInt(1));
                }
            }
            String secSql = "INSERT INTO sections (song_id, type, label, section_order) VALUES (?, ?, ?, ?)";
            String lineSql = "INSERT INTO song_lines (section_id, line_text, line_order) VALUES (?, ?, ?)";
            try (PreparedStatement secPs = conn.prepareStatement(secSql, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement linePs = conn.prepareStatement(lineSql)) {
                for (Section sec : song.getSections()) {
                    secPs.setInt(1, song.getId());
                    secPs.setString(2, sec.getType());
                    secPs.setString(3, sec.getLabel());
                    secPs.setInt(4, sec.getSectionOrder());
                    secPs.executeUpdate();
                    int secId;
                    try (ResultSet keys = secPs.getGeneratedKeys()) {
                        keys.next();
                        secId = keys.getInt(1);
                    }
                    for (SongLine line : sec.getLines()) {
                        linePs.setInt(1, secId);
                        linePs.setString(2, line.getText());
                        linePs.setInt(3, line.getLineOrder());
                        linePs.executeUpdate();
                    }
                }
            }
            conn.commit();
            return true;
        } catch (Exception e) {
            if (conn != null) conn.rollback();
            throw e;
        } finally {
            if (conn != null) conn.close();
        }
    }

    private static Integer findExistingSongId(int number, String lang, String book) throws SQLException {
        String sql = "SELECT id FROM songs WHERE song_number = ? AND language = ? AND book = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, number); ps.setString(2, lang); ps.setString(3, book);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("id");
            }
        }
        return null;
    }

    private static void deleteSong(int id) throws SQLException {
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM songs WHERE id = ?")) {
            ps.setInt(1, id); ps.executeUpdate();
        }
    }

    private static void verifyBook(String book) throws SQLException {
        String sql = "SELECT song_number, title FROM songs WHERE book = ? ORDER BY song_number";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, book);
            try (ResultSet rs = ps.executeQuery()) {
                System.out.println("Book '" + book + "' Status:");
                while (rs.next()) {
                    System.out.println("  [" + rs.getInt(1) + "] " + rs.getString(2));
                }
            }
        }
    }
}
