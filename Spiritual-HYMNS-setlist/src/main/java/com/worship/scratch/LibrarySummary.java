package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;

public class LibrarySummary {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            System.out.println("\n--- WORSHIP LIBRARY SUMMARY ---");
            
            String sql = "SELECT language, COUNT(*) as count FROM songs GROUP BY language";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                int total = 0;
                while(rs.next()) {
                    String lang = rs.getString("language");
                    int count = rs.getInt("count");
                    System.out.println(lang.toUpperCase() + ": " + count + " songs");
                    total += count;
                }
                System.out.println("TOTAL: " + total + " songs");
            }

            System.out.println("\n--- RECENT CHORD COVERAGE ---");
            String chordSql = "SELECT s.language, COUNT(DISTINCT s.id) as songs_with_chords " +
                              "FROM songs s " +
                              "JOIN sections sec ON s.id = sec.song_id " +
                              "JOIN song_lines sl ON sec.id = sl.section_id " +
                              "JOIN line_chords lc ON sl.id = lc.line_id " +
                              "GROUP BY s.language";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(chordSql)) {
                while(rs.next()) {
                    String lang = rs.getString("language");
                    int count = rs.getInt("songs_with_chords");
                    System.out.println(lang.toUpperCase() + ": " + count + " songs with chords");
                }
            }
        }
    }
}
