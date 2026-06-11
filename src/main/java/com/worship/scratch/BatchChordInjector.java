package com.worship.scratch;

import com.worship.util.DBConnection;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BatchChordInjector {

    public static void main(String[] args) {
        String filePath = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\1f97565e-d26e-4d24-b5ed-cac0f536a47d\\scratch\\chords_english_rem.txt";

        try (Connection conn = DBConnection.getConnection();
             BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(filePath), StandardCharsets.UTF_8))) {

            String line;
            int currentSongNumber = -1;
            Pattern songHeaderPattern = Pattern.compile("^(\\d+)\\.\\s+(.*)");
            Pattern chordPattern = Pattern.compile("\\[(.*?)\\]");

            // Prepare statements - Note: Language changed to 'hindi'
            PreparedStatement findLineStmt = conn.prepareStatement(
                "SELECT sl.id FROM song_lines sl " +
                "JOIN sections s ON sl.section_id = s.id " +
                "JOIN songs song ON s.song_id = song.id " +
                "WHERE song.song_number = ? AND song.book = 'prime_songbook' AND song.language = 'english' " +
                "AND LOWER(REGEXP_REPLACE(sl.line_text, '[^a-zA-Z0-9]', '')) = ? LIMIT 1"
            );

            PreparedStatement deleteChordsStmt = conn.prepareStatement(
                "DELETE lc FROM line_chords lc " +
                "JOIN song_lines sl ON lc.line_id = sl.id " +
                "JOIN sections s ON sl.section_id = s.id " +
                "WHERE s.song_id = (SELECT id FROM songs WHERE song_number = ? AND book = 'prime_songbook' AND language = 'english' LIMIT 1)"
            );

            PreparedStatement insertChordStmt = conn.prepareStatement(
                "INSERT IGNORE INTO line_chords (line_id, chord, char_index, confidence) VALUES (?, ?, ?, 1.0)"
            );

            int totalChordsInserted = 0;
            int totalLinesMatched = 0;

            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("[VERSE") || line.startsWith("[CHORUS") || line.startsWith("[BRIDGE")) {
                    continue;
                }

                Matcher headerMatcher = songHeaderPattern.matcher(line);
                if (headerMatcher.find()) {
                    currentSongNumber = Integer.parseInt(headerMatcher.group(1));
                    System.out.println("Processing Song #" + currentSongNumber);
                    
                    // Cleanup existing chords for this song
                    deleteChordsStmt.setInt(1, currentSongNumber);
                    deleteChordsStmt.executeUpdate();
                    
                    continue;
                }

                if (currentSongNumber == -1) continue;

                // Process chords on the line
                String lineToMatch = line.replaceAll("\\[.*?\\]", "").trim();
                // Extremely robust normalization: lowercase alphanumeric only
                String normalizedLine = lineToMatch.toLowerCase().replaceAll("[^a-z0-9]", "");
                
                // Find line_id
                findLineStmt.setInt(1, currentSongNumber);
                findLineStmt.setString(2, normalizedLine);
                
                try (ResultSet rs = findLineStmt.executeQuery()) {
                    if (rs.next()) {
                        int lineId = rs.getInt("id");
                        totalLinesMatched++;

                        // Extract chords and positions
                        Matcher m = chordPattern.matcher(line);
                        int offset = 0;
                        while (m.find()) {
                            String chord = m.group(1);
                            int position = m.start() - offset;
                            offset += m.group().length(); // Adjust subsequent positions

                            insertChordStmt.setInt(1, lineId);
                            insertChordStmt.setString(2, chord);
                            insertChordStmt.setInt(3, position);
                            totalChordsInserted += insertChordStmt.executeUpdate();
                        }
                    } else {
                        System.out.println("WARNING: Could not find line match in DB for Song " + currentSongNumber + " -> " + lineToMatch);
                    }
                }
            }

            System.out.println("------------------------------------");
            System.out.println("SUCCESS: Injection Complete.");
            System.out.println("Lines Matched: " + totalLinesMatched);
            System.out.println("Chords Inserted: " + totalChordsInserted);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
