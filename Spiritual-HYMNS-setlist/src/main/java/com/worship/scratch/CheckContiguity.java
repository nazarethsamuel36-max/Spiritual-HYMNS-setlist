package com.worship.scratch;

import com.worship.util.DBConnection;
import java.sql.*;
import java.util.*;

public class CheckContiguity {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            String[] langs = {"hindi", "marathi", "english"};
            
            for (String lang : langs) {
                System.out.println("\n--- CHECKING " + lang.toUpperCase() + " CONTIGUITY ---");
                String sql = "SELECT song_number FROM songs WHERE language = ? AND book = 'prime_songbook' ORDER BY song_number";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, lang);
                    try (ResultSet rs = stmt.executeQuery()) {
                        int expected = 1;
                        List<Integer> gaps = new ArrayList<>();
                        int max = 0;
                        while(rs.next()) {
                            int num = rs.getInt("song_number");
                            while (expected < num) {
                                gaps.add(expected);
                                expected++;
                            }
                            expected = num + 1;
                            max = num;
                        }
                        System.out.println("Max Song Number: " + max);
                        if (gaps.isEmpty()) {
                            System.out.println("No gaps found (1 to " + max + ")");
                        } else {
                            System.out.println("Gaps found: " + gaps);
                        }
                    }
                }
            }
        }
    }
}
