package com.worship.util;

import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.model.ChordOccurrence;
import com.worship.model.ChordToken;
import com.worship.model.Song;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class VisibleSongLibraryKeyDetectionRunner {

    private static final String TXT_REPORT = "detected_song_keys_722.txt";
    private static final String CSV_REPORT = "detected_song_keys_722.csv";

    public static void main(String[] args) throws Exception {
        Instant started = Instant.now();
        SongDAO songDAO = new SongDAO();
        LineChordDAO lineChordDAO = new LineChordDAO();

        List<Song> songs = songDAO.getAllSongs()
                .stream()
                .filter(Objects::nonNull)
                .filter(s -> s.getSongNumber() > 0)
                .sorted(Comparator.comparingInt(Song::getSongNumber).thenComparing(Song::getTitle, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        List<DetectionRecord> records = new ArrayList<>();
        int skipped = 0;
        int errors = 0;

        for (Song song : songs) {
            try {
                List<String> chords = collectChordTokens(song, lineChordDAO);
                if (chords.isEmpty()) {
                    skipped++;
                    records.add(DetectionRecord.skipped(song, 0, "N/A", "N/A", "N/A", 0, "skipped"));
                    continue;
                }

                WeightedDiatonicKeyDetector.Result result = WeightedDiatonicKeyDetector.detect(chords);
                WeightedDiatonicKeyDetector.KeyScore best = result.getBestKey();
                String detectedKey = formatKey(best.getRoot(), best.getMode());
                records.add(DetectionRecord.success(song, chords.size(), best.getRoot(), best.getMode(), detectedKey, best.getScore(), best.getConfidence(), "success"));
            } catch (Exception ex) {
                errors++;
                records.add(DetectionRecord.error(song, 0, "N/A", "N/A", "N/A", 0, "error", ex.getMessage()));
            }
        }

        Path txtPath = Paths.get(TXT_REPORT);
        Path csvPath = Paths.get(CSV_REPORT);
        Files.writeString(txtPath, buildTextReport(records, songs.size(), skipped, errors, started), StandardCharsets.UTF_8);
        Files.writeString(csvPath, buildCsvReport(records), StandardCharsets.UTF_8);

        System.out.println("Total Visible Songs: " + songs.size());
        System.out.println("Successfully Analysed: " + (records.size() - skipped - errors));
        System.out.println("Skipped: " + skipped);
        System.out.println("Errors: " + errors);
        System.out.println("Execution Time: " + Duration.between(started, Instant.now()).toMillis() + " ms");
        System.out.println("Key Distribution:");
        printDistribution(records);
        System.out.println("Average Confidence: " + averageConfidence(records));
        System.out.println("TXT report: " + txtPath.toAbsolutePath());
        System.out.println("CSV report: " + csvPath.toAbsolutePath());
    }

    private static List<String> collectChordTokens(Song song, LineChordDAO lineChordDAO) {
        List<String> chords = new ArrayList<>();
        Map<Integer, List<ChordOccurrence>> chordMap = lineChordDAO.getChordsForSong(song.getId());
        for (List<ChordOccurrence> occurrences : chordMap.values()) {
            for (ChordOccurrence occurrence : occurrences) {
                String chord = normalizeChordToken(occurrence.getChord());
                if (chord != null && !chord.isBlank()) {
                    chords.add(chord);
                }
            }
        }

        if (!chords.isEmpty()) {
            return chords;
        }

        if (song.getChords() != null && !song.getChords().isBlank()) {
            for (String chord : ChordParser.extractChords(song.getChords())) {
                String normalized = normalizeChordToken(chord);
                if (normalized != null && !normalized.isBlank()) {
                    chords.add(normalized);
                }
            }
        }

        return chords;
    }

    private static String normalizeChordToken(String rawChord) {
        if (rawChord == null || rawChord.isBlank()) {
            return null;
        }

        ChordToken token = ChordParser.parseChordToken(rawChord);
        String rebuilt = ChordParser.rebuild(token);
        if (rebuilt == null || rebuilt.isBlank()) {
            return null;
        }

        if (rebuilt.contains("/")) {
            rebuilt = rebuilt.substring(0, rebuilt.indexOf('/'));
        }

        rebuilt = rebuilt.replace("♭", "b").replace("♯", "#");
        rebuilt = rebuilt.replaceAll("[^A-G#bm]", "");
        if (rebuilt.isBlank()) {
            return null;
        }
        return rebuilt;
    }

    private static String buildTextReport(List<DetectionRecord> records, int totalSongs, int skipped, int errors, Instant started) {
        StringBuilder sb = new StringBuilder();
        sb.append("Weighted Diatonic Key Detection Report - Visible Song Library\n");
        sb.append("Generated from database-backed chord data (read-only)\n");
        sb.append("===============================================================\n");

        for (DetectionRecord record : records) {
            sb.append("---\n");
            sb.append("#").append(record.song.getSongNumber()).append("\n\n");
            sb.append(record.song.getTitle()).append("\n\n");
            sb.append("Language: ").append(record.song.getLanguage() == null ? "Unknown" : record.song.getLanguage()).append("\n\n");
            sb.append("Detected Key: ").append(record.detectedKey).append("\n\n");
            sb.append("Confidence: ").append(capitalize(record.confidence)).append("\n\n");
            sb.append("Chord Count: ").append(record.chordCount).append("\n\n");
            sb.append("Status: ").append(record.status).append("\n");
            if (record.errorMessage != null && !record.errorMessage.isBlank()) {
                sb.append("Error: ").append(record.errorMessage).append("\n");
            }
        }

        sb.append("---\n");
        sb.append("Total Songs Processed: ").append(totalSongs).append("\n");
        sb.append("Key Distribution\n");
        Map<String, Long> distribution = records.stream()
                .filter(r -> !"skipped".equals(r.status) && !"error".equals(r.status))
                .collect(Collectors.groupingBy(r -> r.detectedKey, LinkedHashMap::new, Collectors.counting()));
        for (Map.Entry<String, Long> entry : distribution.entrySet()) {
            sb.append("- ").append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
        }
        sb.append("High Confidence: ").append(countConfidence(records, "high")).append("\n");
        sb.append("Medium Confidence: ").append(countConfidence(records, "medium")).append("\n");
        sb.append("Low Confidence: ").append(countConfidence(records, "low")).append("\n");
        sb.append("Skipped: ").append(skipped).append("\n");
        sb.append("Errors: ").append(errors).append("\n");
        sb.append("Execution Time: ").append(Duration.between(started, Instant.now()).toMillis()).append(" ms\n");
        sb.append("Average Confidence: ").append(averageConfidence(records)).append("\n");
        return sb.toString();
    }

    private static String buildCsvReport(List<DetectionRecord> records) {
        StringBuilder sb = new StringBuilder();
        sb.append("Song ID,Song Number,Title,Language,Detected Key,Mode,Confidence,Score,Chord Count,Status\n");
        for (DetectionRecord record : records) {
            sb.append(record.song.getId()).append(",");
            sb.append(record.song.getSongNumber()).append(",");
            sb.append(csvEscape(record.song.getTitle())).append(",");
            sb.append(csvEscape(record.song.getLanguage())).append(",");
            sb.append(csvEscape(record.detectedKey)).append(",");
            sb.append(csvEscape(record.mode)).append(",");
            sb.append(csvEscape(record.confidence)).append(",");
            sb.append(record.score).append(",");
            sb.append(record.chordCount).append(",");
            sb.append(record.status).append("\n");
        }
        return sb.toString();
    }

    private static String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private static String formatKey(String root, String mode) {
        String normalizedMode = (mode == null || mode.isBlank()) ? "Major" : capitalize(mode);
        String normalizedRoot = root == null || root.isBlank() ? "N/A" : root;
        return normalizedRoot + " " + normalizedMode;
    }

    private static String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "N/A";
        }
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1).toLowerCase(Locale.ROOT);
    }

    private static long countConfidence(List<DetectionRecord> records, String confidence) {
        return records.stream().filter(r -> confidence.equalsIgnoreCase(r.confidence)).count();
    }

    private static String averageConfidence(List<DetectionRecord> records) {
        if (records.isEmpty()) {
            return "0.00";
        }
        double total = 0.0;
        int count = 0;
        for (DetectionRecord record : records) {
            if ("skipped".equals(record.status) || "error".equals(record.status)) {
                continue;
            }
            double value = switch (record.confidence.toLowerCase(Locale.ROOT)) {
                case "high" -> 1.0;
                case "medium" -> 0.5;
                case "low" -> 0.25;
                default -> 0.0;
            };
            total += value;
            count++;
        }
        if (count == 0) {
            return "0.00";
        }
        return String.format(Locale.US, "%.2f", total / count);
    }

    private static void printDistribution(List<DetectionRecord> records) {
        Map<String, Long> distribution = records.stream()
                .filter(r -> !"skipped".equals(r.status) && !"error".equals(r.status))
                .collect(Collectors.groupingBy(r -> r.detectedKey, LinkedHashMap::new, Collectors.counting()));
        for (Map.Entry<String, Long> entry : distribution.entrySet()) {
            System.out.println("- " + entry.getKey() + ": " + entry.getValue());
        }
    }

    private static class DetectionRecord {
        private final Song song;
        private final int chordCount;
        private final String detectedKey;
        private final String mode;
        private final String confidence;
        private final int score;
        private final String status;
        private final String errorMessage;

        private DetectionRecord(Song song, int chordCount, String detectedKey, String mode, String confidence, int score, String status, String errorMessage) {
            this.song = song;
            this.chordCount = chordCount;
            this.detectedKey = detectedKey;
            this.mode = mode;
            this.confidence = confidence;
            this.score = score;
            this.status = status;
            this.errorMessage = errorMessage;
        }

        private static DetectionRecord success(Song song, int chordCount, String root, String mode, String detectedKey, int score, String confidence, String status) {
            return new DetectionRecord(song, chordCount, detectedKey, mode, confidence, score, status, null);
        }

        private static DetectionRecord skipped(Song song, int chordCount, String detectedKey, String mode, String confidence, int score, String status) {
            return new DetectionRecord(song, chordCount, detectedKey, mode, confidence, score, status, null);
        }

        private static DetectionRecord error(Song song, int chordCount, String detectedKey, String mode, String confidence, int score, String status, String errorMessage) {
            return new DetectionRecord(song, chordCount, detectedKey, mode, confidence, score, status, errorMessage);
        }
    }
}
