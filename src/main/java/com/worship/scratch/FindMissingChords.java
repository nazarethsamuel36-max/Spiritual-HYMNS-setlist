package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;

public class FindMissingChords {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            System.out.println("\n--- MISSING CHORDS IN PRIME SONGBOOK ---");
            String sql = "SELECT s.song_number, s.title, s.language " +
                         "FROM songs s " +
                         "WHERE s.book = 'prime_songbook' " +
                         "AND NOT EXISTS (SELECT 1 FROM line_chords lc JOIN song_lines sl ON lc.line_id = sl.id JOIN sections sec ON sl.section_id = sec.id WHERE sec.song_id = s.id) " +
                         "ORDER BY s.language, s.song_number";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                while(rs.next()) {
                    System.out.println(rs.getString("language").toUpperCase() + " #" + rs.getInt("song_number") + ": " + rs.getString("title"));
                }
            }
        }
    }
}
