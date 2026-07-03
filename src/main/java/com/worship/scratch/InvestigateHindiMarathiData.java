package com.worship.scratch;

import com.worship.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Investigation utility to check Hindi and Marathi song data structure
 * to determine if chords and lyrics are stored together or separately.
 */
public class InvestigateHindiMarathiData {
    
    public static void main(String[] args) {
        System.out.println("=== INVESTIGATION: Active Hindi Songs Chord Status ===\n");
        
        try (Connection conn = DBConnection.getConnection()) {
            
            // 1. Check total count of active Hindi songs
            String countSql = "SELECT COUNT(*) as count FROM songs WHERE language = 'hindi' AND is_active = TRUE";
            try (PreparedStatement ps = conn.prepareStatement(countSql);
                 ResultSet rs = ps.executeQuery()) {
                System.out.println("--- Active Hindi Songs Count ---");
                if (rs.next()) {
                    System.out.println("Total active Hindi songs: " + rs.getInt("count"));
                }
                System.out.println();
            }
            
            // 2. Check chord presence for all active Hindi songs
            String chordCheckSql = "SELECT id, song_number, title, " +
                    "CASE WHEN chords IS NULL OR chords = '' THEN 'NO CHORDS' ELSE 'HAS CHORDS' END as chord_status, " +
                    "CASE WHEN chords IS NULL THEN 0 ELSE LENGTH(chords) END as chords_length, " +
                    "chords " +
                    "FROM songs WHERE language = 'hindi' AND is_active = TRUE " +
                    "ORDER BY song_number";
            
            System.out.println("--- Active Hindi Songs Chord Status ---");
            System.out.println("Song # | Title                           | Chord Status | Chords Length");
            System.out.println("-------|---------------------------------|--------------|--------------");
            
            int withChords = 0;
            int withoutChords = 0;
            
            try (PreparedStatement ps = conn.prepareStatement(chordCheckSql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int songNum = rs.getInt("song_number");
                    String title = rs.getString("title");
                    String chordStatus = rs.getString("chord_status");
                    int chordsLength = rs.getInt("chords_length");
                    
                    System.out.printf("%-6d | %-31s | %-12s | %d%n", songNum, 
                            title.length() > 31 ? title.substring(0, 28) + "..." : title,
                            chordStatus, chordsLength);
                    
                    if ("HAS CHORDS".equals(chordStatus)) {
                        withChords++;
                    } else {
                        withoutChords++;
                    }
                }
            }
            
            System.out.println("\n--- Summary ---");
            System.out.println("Total active Hindi songs: " + (withChords + withoutChords));
            System.out.println("Songs WITH chords: " + withChords);
            System.out.println("Songs WITHOUT chords: " + withoutChords);
            
            System.out.println("\n=== INVESTIGATION COMPLETE ===");
            
        } catch (Exception e) {
            System.err.println("Error during investigation: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
