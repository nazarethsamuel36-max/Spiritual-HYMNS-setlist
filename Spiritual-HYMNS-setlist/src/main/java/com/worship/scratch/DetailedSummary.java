package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;

public class DetailedSummary {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            System.out.println("\n--- DETAILED SONG SUMMARY BY BOOK ---");
            String sql = "SELECT language, book, COUNT(*) as count FROM songs GROUP BY language, book ORDER BY language, count DESC";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                while(rs.next()) {
                    System.out.println(rs.getString("language").toUpperCase() + " [" + rs.getString("book") + "]: " + rs.getInt("count") + " songs");
                }
            }

            System.out.println("\n--- CHORD PROGRESS (prime_songbook) ---");
            String chordSql = "SELECT s.language, COUNT(*) as total, " +
                              "SUM(CASE WHEN EXISTS (SELECT 1 FROM line_chords lc JOIN song_lines sl ON lc.line_id = sl.id JOIN sections sec ON sl.section_id = sec.id WHERE sec.song_id = s.id) THEN 1 ELSE 0 END) as with_chords " +
                              "FROM songs s WHERE s.book = 'prime_songbook' GROUP BY s.language";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(chordSql)) {
                while(rs.next()) {
                    String lang = rs.getString("language").toUpperCase();
                    int total = rs.getInt("total");
                    int with = rs.getInt("with_chords");
                    System.out.println(lang + ": " + with + " / " + total + " songs with chords (" + (total - with) + " remaining)");
                }
            }
        }
    }
}
