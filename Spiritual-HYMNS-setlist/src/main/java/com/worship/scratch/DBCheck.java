package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;

public class DBCheck {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            
            System.out.println("\n--- FETCHING REMAINING ENGLISH ---");
            String exportSql = "SELECT s.song_number, s.title, sec.label, sl.line_order, sl.line_text " +
                               "FROM songs s " +
                               "JOIN sections sec ON s.id = sec.song_id " +
                               "JOIN song_lines sl ON sec.id = sl.section_id " +
                               "WHERE s.language = 'english' AND s.book = 'prime_songbook' " +
                               "AND (s.song_number IN (37, 38, 39, 321)) " +
                               "ORDER BY s.song_number, sec.section_order, sl.line_order";
            
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(exportSql);
                 java.io.PrintWriter writer = new java.io.PrintWriter("C:/Users/Lenovo/.gemini/antigravity/brain/1f97565e-d26e-4d24-b5ed-cac0f536a47d/scratch/lyrics_english_rem.txt", "UTF-8")) {
                
                int currentSong = -1;
                String currentSection = "";
                
                while(rs.next()) {
                    int num = rs.getInt("song_number");
                    String title = rs.getString("title");
                    String section = rs.getString("label");
                    String text = rs.getString("line_text");
                    
                    if (num != currentSong) {
                        writer.println("\n" + num + ". " + title);
                        currentSong = num;
                        currentSection = "";
                    }
                    if (!section.equals(currentSection)) {
                        writer.println("[" + section + "]");
                        currentSection = section;
                    }
                    writer.println(text);
                }
                System.out.println("Lyrics exported to lyrics_english_rem.txt");
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
