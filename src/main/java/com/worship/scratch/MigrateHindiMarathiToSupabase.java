package com.worship.scratch;

import com.worship.util.DBConnection;
import com.worship.scratch.ChordLyricsExtractor.ChordPosition;
import com.worship.scratch.ChordLyricsExtractor.ExtractionResult;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Migration utility to extract Hindi and Marathi songs from MySQL
 * and prepare them for Supabase import with separated chords and lyrics.
 */
public class MigrateHindiMarathiToSupabase {
    
    public static void main(String[] args) {
        System.out.println("=== Hindi/Marathi Migration to Supabase ===");
        System.out.println("Started at: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        System.out.println();
        
        try (Connection conn = DBConnection.getConnection()) {
            
            // 1. Get all Hindi and Marathi songs
            String sql = "SELECT id, song_number, title, artist, composer, language, " +
                    "lyrics_original, lyrics_roman, chords, original_key, capo, bpm, " +
                    "time_signature, structure, audio_url, created_by " +
                    "FROM songs WHERE language IN ('hindi', 'marathi') AND is_active = TRUE " +
                    "ORDER BY language, song_number";
            
            List<SongExportData> songsToExport = new ArrayList<>();
            
            try (PreparedStatement ps = conn.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                
                int count = 0;
                while (rs.next()) {
                    SongExportData song = extractSongData(rs);
                    songsToExport.add(song);
                    count++;
                    
                    if (count % 10 == 0) {
                        System.out.println("Processed " + count + " songs...");
                    }
                }
                
                System.out.println("Total songs processed: " + count);
            }
            
            // 2. Generate export files
            System.out.println("\nGenerating export files...");
            generateSQLExport(songsToExport, "hindi_marathi_export.sql");
            generateJSONExport(songsToExport, "hindi_marathi_export.json");
            generateCSVExport(songsToExport, "hindi_marathi_export.csv");
            
            // 3. Generate summary report
            generateSummaryReport(songsToExport, "migration_summary.txt");
            
            System.out.println("\n=== Migration Export Complete ===");
            System.out.println("Generated files:");
            System.out.println("  - hindi_marathi_export.sql (SQL INSERT statements)");
            System.out.println("  - hindi_marathi_export.json (JSON format)");
            System.out.println("  - hindi_marathi_export.csv (CSV format)");
            System.out.println("  - migration_summary.txt (Summary report)");
            System.out.println("\nCompleted at: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
        } catch (Exception e) {
            System.err.println("Error during migration: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static SongExportData extractSongData(ResultSet rs) throws Exception {
        SongExportData song = new SongExportData();
        
        song.setId(rs.getInt("id"));
        song.setSongNumber(rs.getInt("song_number"));
        song.setTitle(rs.getString("title"));
        song.setArtist(rs.getString("artist"));
        song.setComposer(rs.getString("composer"));
        song.setLanguage(rs.getString("language"));
        song.setLyricsOriginal(rs.getString("lyrics_original"));
        song.setLyricsRoman(rs.getString("lyrics_roman"));
        song.setChordsEmbedded(rs.getString("chords"));
        song.setOriginalKey(rs.getString("original_key"));
        song.setCapo(rs.getInt("capo"));
        song.setBpm(rs.getInt("bpm"));
        song.setTimeSignature(rs.getString("time_signature"));
        song.setStructure(rs.getString("structure"));
        song.setAudioUrl(rs.getString("audio_url"));
        song.setCreatedBy(rs.getInt("created_by"));
        
        // Extract plain lyrics and chord positions from embedded chords
        String embeddedChords = song.getChordsEmbedded();
        if (embeddedChords != null && !embeddedChords.isEmpty()) {
            ExtractionResult result = ChordLyricsExtractor.extractAll(embeddedChords);
            song.setChordsPlainLyrics(result.getPlainLyrics());
            song.setChordPositions(result.getChordPositions());
        }
        
        return song;
    }
    
    private static void generateSQLExport(List<SongExportData> songs, String filename) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            writer.write("-- =============================================\n");
            writer.write("-- Hindi/Marathi Songs Export for Supabase\n");
            writer.write("-- Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "\n");
            writer.write("-- Total songs: " + songs.size() + "\n");
            writer.write("-- =============================================\n\n");
            
            writer.write("-- Note: This exports songs with separated chord data\n");
            writer.write("-- The 'chords' column now contains plain lyrics\n");
            writer.write("-- Chord positions are stored in a separate JSON structure\n\n");
            
            for (SongExportData song : songs) {
                writer.write("-- Song #" + song.getSongNumber() + ": " + song.getTitle() + " (" + song.getLanguage() + ")\n");
                writer.write("INSERT INTO songs (song_number, title, artist, composer, language, " +
                        "lyrics_original, lyrics_roman, chords, chord_positions, " +
                        "original_key, capo, bpm, time_signature, structure, audio_url, created_by, is_active) VALUES (");
                
                writer.write(song.getSongNumber() + ", ");
                writer.write(sqlEscape(song.getTitle()) + ", ");
                writer.write(sqlEscape(song.getArtist()) + ", ");
                writer.write(sqlEscape(song.getComposer()) + ", ");
                writer.write(sqlEscape(song.getLanguage()) + ", ");
                writer.write(sqlEscape(song.getLyricsOriginal()) + ", ");
                writer.write(sqlEscape(song.getLyricsRoman()) + ", ");
                writer.write(sqlEscape(song.getChordsPlainLyrics()) + ", ");
                writer.write(sqlEscape(chordPositionsToJson(song.getChordPositions())) + ", ");
                writer.write(sqlEscape(song.getOriginalKey()) + ", ");
                writer.write(song.getCapo() + ", ");
                writer.write(song.getBpm() + ", ");
                writer.write(sqlEscape(song.getTimeSignature()) + ", ");
                writer.write(sqlEscape(song.getStructure()) + ", ");
                writer.write(sqlEscape(song.getAudioUrl()) + ", ");
                writer.write(song.getCreatedBy() + ", TRUE);\n\n");
            }
        }
        System.out.println("  Generated: " + filename);
    }
    
    private static void generateJSONExport(List<SongExportData> songs, String filename) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            writer.write("[\n");
            
            for (int i = 0; i < songs.size(); i++) {
                SongExportData song = songs.get(i);
                writer.write("  {\n");
                writer.write("    \"song_number\": " + song.getSongNumber() + ",\n");
                writer.write("    \"title\": " + jsonEscape(song.getTitle()) + ",\n");
                writer.write("    \"artist\": " + jsonEscape(song.getArtist()) + ",\n");
                writer.write("    \"composer\": " + jsonEscape(song.getComposer()) + ",\n");
                writer.write("    \"language\": " + jsonEscape(song.getLanguage()) + ",\n");
                writer.write("    \"lyrics_original\": " + jsonEscape(song.getLyricsOriginal()) + ",\n");
                writer.write("    \"lyrics_roman\": " + jsonEscape(song.getLyricsRoman()) + ",\n");
                writer.write("    \"chords_plain_lyrics\": " + jsonEscape(song.getChordsPlainLyrics()) + ",\n");
                writer.write("    \"chord_positions\": " + chordPositionsToJson(song.getChordPositions()) + ",\n");
                writer.write("    \"original_key\": " + jsonEscape(song.getOriginalKey()) + ",\n");
                writer.write("    \"capo\": " + song.getCapo() + ",\n");
                writer.write("    \"bpm\": " + song.getBpm() + ",\n");
                writer.write("    \"time_signature\": " + jsonEscape(song.getTimeSignature()) + ",\n");
                writer.write("    \"structure\": " + jsonEscape(song.getStructure()) + ",\n");
                writer.write("    \"audio_url\": " + jsonEscape(song.getAudioUrl()) + ",\n");
                writer.write("    \"created_by\": " + song.getCreatedBy() + "\n");
                writer.write("  }" + (i < songs.size() - 1 ? "," : "") + "\n");
            }
            
            writer.write("]\n");
        }
        System.out.println("  Generated: " + filename);
    }
    
    private static void generateCSVExport(List<SongExportData> songs, String filename) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            // Header
            writer.write("song_number,title,artist,composer,language,lyrics_original,lyrics_roman,chords_plain_lyrics,chord_positions_json,original_key,capo,bpm,time_signature,structure,audio_url,created_by\n");
            
            for (SongExportData song : songs) {
                writer.write(song.getSongNumber() + ",");
                writer.write(csvEscape(song.getTitle()) + ",");
                writer.write(csvEscape(song.getArtist()) + ",");
                writer.write(csvEscape(song.getComposer()) + ",");
                writer.write(csvEscape(song.getLanguage()) + ",");
                writer.write(csvEscape(song.getLyricsOriginal()) + ",");
                writer.write(csvEscape(song.getLyricsRoman()) + ",");
                writer.write(csvEscape(song.getChordsPlainLyrics()) + ",");
                writer.write(csvEscape(chordPositionsToJson(song.getChordPositions())) + ",");
                writer.write(csvEscape(song.getOriginalKey()) + ",");
                writer.write(song.getCapo() + ",");
                writer.write(song.getBpm() + ",");
                writer.write(csvEscape(song.getTimeSignature()) + ",");
                writer.write(csvEscape(song.getStructure()) + ",");
                writer.write(csvEscape(song.getAudioUrl()) + ",");
                writer.write(song.getCreatedBy() + "\n");
            }
        }
        System.out.println("  Generated: " + filename);
    }
    
    private static void generateSummaryReport(List<SongExportData> songs, String filename) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            writer.write("========================================\n");
            writer.write("Hindi/Marathi Migration Summary Report\n");
            writer.write("========================================\n\n");
            writer.write("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "\n\n");
            
            int hindiCount = 0;
            int marathiCount = 0;
            int withChords = 0;
            int withoutChords = 0;
            int withLyricsOriginal = 0;
            int withLyricsRoman = 0;
            
            for (SongExportData song : songs) {
                if ("hindi".equals(song.getLanguage())) hindiCount++;
                else if ("marathi".equals(song.getLanguage())) marathiCount++;
                
                if (song.getChordsEmbedded() != null && !song.getChordsEmbedded().isEmpty()) withChords++;
                else withoutChords++;
                
                if (song.getLyricsOriginal() != null && !song.getLyricsOriginal().isEmpty()) withLyricsOriginal++;
                if (song.getLyricsRoman() != null && !song.getLyricsRoman().isEmpty()) withLyricsRoman++;
            }
            
            writer.write("Total Songs: " + songs.size() + "\n");
            writer.write("  Hindi: " + hindiCount + "\n");
            writer.write("  Marathi: " + marathiCount + "\n\n");
            
            writer.write("Data Completeness:\n");
            writer.write("  Songs with chords: " + withChords + "\n");
            writer.write("  Songs without chords: " + withoutChords + "\n");
            writer.write("  Songs with lyrics_original: " + withLyricsOriginal + "\n");
            writer.write("  Songs with lyrics_roman: " + withLyricsRoman + "\n\n");
            
            writer.write("Song List:\n");
            writer.write("----------\n");
            for (SongExportData song : songs) {
                writer.write(String.format("#%d [%s] %s - %s (Chords: %s, Chord Positions: %d)%n",
                        song.getSongNumber(),
                        song.getLanguage().toUpperCase(),
                        song.getTitle(),
                        song.getArtist(),
                        song.getChordsEmbedded() != null && !song.getChordsEmbedded().isEmpty() ? "Yes" : "No",
                        song.getChordPositions() != null ? song.getChordPositions().size() : 0));
            }
        }
        System.out.println("  Generated: " + filename);
    }
    
    private static String sqlEscape(String value) {
        if (value == null) return "NULL";
        return "'" + value.replace("'", "''").replace("\\", "\\\\") + "'";
    }
    
    private static String jsonEscape(String value) {
        if (value == null) return "null";
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }
    
    private static String csvEscape(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
    
    private static String chordPositionsToJson(List<ChordPosition> positions) {
        if (positions == null || positions.isEmpty()) return "[]";
        
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < positions.size(); i++) {
            ChordPosition cp = positions.get(i);
            json.append("{\"chord\":\"").append(cp.getChord()).append("\",\"position\":").append(cp.getPosition()).append("}");
            if (i < positions.size() - 1) json.append(",");
        }
        json.append("]");
        return json.toString();
    }
    
    static class SongExportData {
        private int id;
        private int songNumber;
        private String title;
        private String artist;
        private String composer;
        private String language;
        private String lyricsOriginal;
        private String lyricsRoman;
        private String chordsEmbedded;
        private String chordsPlainLyrics;
        private List<ChordPosition> chordPositions;
        private String originalKey;
        private int capo;
        private int bpm;
        private String timeSignature;
        private String structure;
        private String audioUrl;
        private int createdBy;
        
        // Getters and setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        
        public int getSongNumber() { return songNumber; }
        public void setSongNumber(int songNumber) { this.songNumber = songNumber; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getArtist() { return artist; }
        public void setArtist(String artist) { this.artist = artist; }
        
        public String getComposer() { return composer; }
        public void setComposer(String composer) { this.composer = composer; }
        
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        
        public String getLyricsOriginal() { return lyricsOriginal; }
        public void setLyricsOriginal(String lyricsOriginal) { this.lyricsOriginal = lyricsOriginal; }
        
        public String getLyricsRoman() { return lyricsRoman; }
        public void setLyricsRoman(String lyricsRoman) { this.lyricsRoman = lyricsRoman; }
        
        public String getChordsEmbedded() { return chordsEmbedded; }
        public void setChordsEmbedded(String chordsEmbedded) { this.chordsEmbedded = chordsEmbedded; }
        
        public String getChordsPlainLyrics() { return chordsPlainLyrics; }
        public void setChordsPlainLyrics(String chordsPlainLyrics) { this.chordsPlainLyrics = chordsPlainLyrics; }
        
        public List<ChordPosition> getChordPositions() { return chordPositions; }
        public void setChordPositions(List<ChordPosition> chordPositions) { this.chordPositions = chordPositions; }
        
        public String getOriginalKey() { return originalKey; }
        public void setOriginalKey(String originalKey) { this.originalKey = originalKey; }
        
        public int getCapo() { return capo; }
        public void setCapo(int capo) { this.capo = capo; }
        
        public int getBpm() { return bpm; }
        public void setBpm(int bpm) { this.bpm = bpm; }
        
        public String getTimeSignature() { return timeSignature; }
        public void setTimeSignature(String timeSignature) { this.timeSignature = timeSignature; }
        
        public String getStructure() { return structure; }
        public void setStructure(String structure) { this.structure = structure; }
        
        public String getAudioUrl() { return audioUrl; }
        public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
        
        public int getCreatedBy() { return createdBy; }
        public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }
    }
}
