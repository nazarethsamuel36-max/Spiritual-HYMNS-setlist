package com.worship.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.dao.SongDAO;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;

import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility for ingesting Special Marathi songs from JSON.
 * Follows strict identity rules: (song_number, language, book).
 */
public class MarathiIngestor {

    private static final String SOURCE_JSON = "extracted_songs/marathi_songs.json";
    private static final String TARGET_BOOK = "special_marathi";
    private static final String TARGET_LANG = "marathi";
    private static final int CREATED_BY = 1; // Admin

    public static void main(String[] args) {
        System.out.println("Starting Special Marathi Ingestion...");
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(new File(SOURCE_JSON));
            
            SongDAO songDAO = new SongDAO();
            
            for (JsonNode songNode : root) {
                int number = songNode.get("number").asInt();
                String title = songNode.get("title").asText();
                
                System.out.println("Processing Song #" + number + ": " + title);
                
                Song song = new Song();
                song.setSongNumber(number);
                song.setTitle(title);
                song.setLanguage(TARGET_LANG);
                song.setBook(TARGET_BOOK);
                song.setCreatedBy(CREATED_BY);
                
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
                
                // Identity Check
                Integer existingId = findExistingSongId(number, TARGET_LANG, TARGET_BOOK);
                
                if (existingId != null) {
                    // Compare (Simple check: title and section count)
                    if (isDifferent(existingId, song)) {
                        System.out.println("  -> Content differs. REPLACING...");
                        deleteSongCompletely(existingId);
                        songDAO.addSongWithStructure(song);
                        System.out.println("  -> REPLACED: Song #" + number);
                    } else {
                        System.out.println("  -> Content matches. SKIPPING.");
                    }
                } else {
                    songDAO.addSongWithStructure(song);
                    System.out.println("  -> INSERTED: Song #" + number);
                }
            }
            
            System.out.println("Ingestion Complete.");
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Ingestion Failed: " + e.getMessage());
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

    private static boolean isDifferent(int existingId, Song newSong) throws SQLException {
        // Fetch existing title and section count
        String sql = "SELECT title, (SELECT COUNT(*) FROM sections WHERE song_id = songs.id) as sec_count " +
                     "FROM songs WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, existingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String existingTitle = rs.getString("title");
                    int existingSecCount = rs.getInt("sec_count");
                    
                    if (!existingTitle.equals(newSong.getTitle())) return true;
                    if (existingSecCount != newSong.getSections().size()) return true;
                    
                    // Could do deeper comparison but this is usually enough for a data push
                    return false;
                }
            }
        }
        return true; // Should not happen if Id exists
    }

    private static void deleteSongCompletely(int id) throws SQLException {
        // Rely on ON DELETE CASCADE if set up, or manual delete
        // Based on schema.sql, sections/song_lines/line_chords have ON DELETE CASCADE
        String sql = "DELETE FROM songs WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }
}
