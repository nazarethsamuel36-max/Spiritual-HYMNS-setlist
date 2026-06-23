package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;

public class ChordCleanup {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            
            System.out.println("\n--- DELETING ALL HINDI CHORDS ---");
            String deleteSql = "DELETE lc FROM line_chords lc " +
                               "JOIN song_lines sl ON lc.line_id = sl.id " +
                               "JOIN sections sec ON sl.section_id = sec.id " +
                               "JOIN songs s ON sec.song_id = s.id " +
                               "WHERE s.language = 'hindi' AND s.book = 'prime_songbook'";
            
            try (Statement stmt = conn.createStatement()) {
                int affectedRows = stmt.executeUpdate(deleteSql);
                System.out.println("Deleted " + affectedRows + " Hindi chords.");
            }

            System.out.println("\n--- VERIFYING CLEAN STATE ---");
            String countSql = "SELECT COUNT(*) as total_chords " +
                              "FROM line_chords lc " +
                              "JOIN song_lines sl ON lc.line_id = sl.id " +
                              "JOIN sections sec ON sl.section_id = sec.id " +
                              "JOIN songs s ON sec.song_id = s.id " +
                              "WHERE s.language = 'hindi' AND s.book = 'prime_songbook'";
            
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(countSql)) {
                if (rs.next()) {
                    int count = rs.getInt("total_chords");
                    System.out.println("Current Hindi Chord Count: " + count);
                    if (count == 0) {
                        System.out.println("SUCCESS: Database is clean.");
                    } else {
                        System.out.println("WARNING: Deletion may have failed or was partial.");
                    }
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
