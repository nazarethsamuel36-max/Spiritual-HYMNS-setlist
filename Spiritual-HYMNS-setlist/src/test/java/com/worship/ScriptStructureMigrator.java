package com.worship;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ScriptStructureMigrator {

    // Same credentials as DBConnection.java in the project
    private static final String URL = "jdbc:mysql://localhost:3306/worship_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "root123"; // from DBConnection.java default

    public static void main(String[] args) {
        System.out.println("Starting Database Structure Migration for English Songs...");

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
            
            // 1. Fetch all English songs
            String selectSql = "SELECT id, title, lyrics_original, chords, structure FROM songs WHERE LOWER(language) = 'english'";
            
            List<SongData> songsToUpdate = new ArrayList<>();
            
            try (PreparedStatement stmt = conn.prepareStatement(selectSql);
                 ResultSet rs = stmt.executeQuery()) {
                
                while (rs.next()) {
                    SongData sd = new SongData();
                    sd.id = rs.getInt("id");
                    sd.title = rs.getString("title");
                    sd.lyrics = rs.getString("lyrics_original");
                    sd.chords = rs.getString("chords");
                    sd.structure = rs.getString("structure");
                    songsToUpdate.add(sd);
                }
            }
            
            System.out.println("Found " + songsToUpdate.size() + " English songs. Processing...");
            
            int updatedCount = 0;
            String updateSql = "UPDATE songs SET lyrics_original = ?, chords = ? WHERE id = ?";
            
            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                for (SongData sd : songsToUpdate) {
                    
                    String newLyrics = processText(sd.lyrics, sd.structure);
                    String newChords = processText(sd.chords, sd.structure);
                    
                    boolean lyricsChanged = (sd.lyrics == null && newLyrics != null) || (sd.lyrics != null && !sd.lyrics.equals(newLyrics));
                    boolean chordsChanged = (sd.chords == null && newChords != null) || (sd.chords != null && !sd.chords.equals(newChords));
                    
                    // Only update if something actually changed to avoid unnecessary writes
                    if (lyricsChanged || chordsChanged) {
                        updateStmt.setString(1, newLyrics);
                        updateStmt.setString(2, newChords);
                        updateStmt.setInt(3, sd.id);
                        updateStmt.addBatch();
                        updatedCount++;
                        System.out.println("Prepared update for: " + sd.title);
                    }
                }
                
                if (updatedCount > 0) {
                    int[] results = updateStmt.executeBatch();
                    System.out.println("Successfully updated " + results.length + " songs in the database!");
                } else {
                    System.out.println("No songs needed updating. All good!");
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private static String processText(String text, String structureCsv) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Normalize line endings to \n
        text = text.replace("\r\n", "\n");
        
        // Split perfectly on double newlines (stanzas)
        String[] stanzas = text.split("\n\n+");
        
        // Split structure labels if available
        String[] labels = null;
        if (structureCsv != null && !structureCsv.trim().isEmpty()) {
            labels = structureCsv.split(",");
        }
        
        StringBuilder result = new StringBuilder();
        
        for (int i = 0; i < stanzas.length; i++) {
            String stanza = stanzas[i].trim();
            if (stanza.isEmpty()) continue;
            
            // Check if stanza already starts with a section marker
            String firstLine = stanza.substring(0, Math.min(stanza.length(), stanza.indexOf('\n') > -1 ? stanza.indexOf('\n') : stanza.length())).trim();
            
            boolean hasHeader = firstLine.matches("^[\\{\\[].*[\\}\\]]$");
            
            // We want to force {Verse} brackets, so if it has [Verse], we replace it with {Verse}
            if (hasHeader && firstLine.startsWith("[")) {
                // If it's a bracketed header like [VERSE 1], convert it to {Verse 1}
                // Careful not to convert chords like [G]Amazing grace.
                // Section markers usually don't have other text on the same line, and typically contain words like Verse, Chorus.
                if (firstLine.toLowerCase().contains("verse") || 
                    firstLine.toLowerCase().contains("chorus") || 
                    firstLine.toLowerCase().contains("bridge") ||
                    firstLine.toLowerCase().contains("outro")) {
                    
                    String inner = firstLine.substring(1, firstLine.length() - 1);
                    // Standardize casing: VERSE 1 -> Verse 1
                    inner = capitalizeWords(inner.toLowerCase());
                    
                    stanza = "{" + inner + "}\n" + stanza.substring(firstLine.length()).trim();
                }
            } else if (!hasHeader && firstLine.toLowerCase().equals("verse") || firstLine.toLowerCase().equals("chorus")) {
               // Rare case: user typed "VERSE" without brackets (like in Amazing Grace screenshot)
               String inner = capitalizeWords(firstLine.toLowerCase());
               stanza = "{" + inner + "}\n" + stanza.substring(firstLine.length()).trim();
            } else if (!hasHeader) {
                // IT TRULY HAS NO HEADER. Inject one based on `structure` column.
                String labelToApply = "Verse " + (i + 1); // default fallback
                
                if (labels != null && i < labels.length) {
                    labelToApply = labels[i].trim();
                    // Inject a space before numbers (e.g. "Verse1" -> "Verse 1")
                    labelToApply = labelToApply.replaceAll("([a-zA-Z])(\\d)", "$1 $2");
                    labelToApply = capitalizeWords(labelToApply.toLowerCase());
                } else if (labels != null && i >= labels.length) {
                    // if there are more stanzas than labels, assume Verse X
                     labelToApply = "Verse " + (i + 1);
                }
                
                stanza = "{" + labelToApply + "}\n" + stanza;
            }
            
            result.append(stanza);
            if (i < stanzas.length - 1) {
                result.append("\n\n");
            }
        }
        
        return result.toString();
    }
    
    private static String capitalizeWords(String str) {
        String[] words = str.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }
    
    private static class SongData {
        int id;
        String title;
        String lyrics;
        String chords;
        String structure;
    }
}
