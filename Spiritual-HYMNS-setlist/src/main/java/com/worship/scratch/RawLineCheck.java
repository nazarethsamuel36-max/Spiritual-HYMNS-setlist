package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;

public class RawLineCheck {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT sl.line_text FROM song_lines sl " +
                         "JOIN sections s ON sl.section_id = s.id " +
                         "JOIN songs song ON s.song_id = song.id " +
                         "WHERE song.song_number = 16 AND song.language = 'english' AND song.book = 'prime_songbook'";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                while(rs.next()) {
                    String text = rs.getString("line_text");
                    System.out.println("Line: [" + text + "]");
                    for (char c : text.toCharArray()) {
                        System.out.print((int)c + " ");
                    }
                    System.out.println();
                }
            }
        }
    }
}
