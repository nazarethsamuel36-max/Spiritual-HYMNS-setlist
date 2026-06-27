package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Song;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class InternalKeyMigrationRunner {

    private static final String DEFAULT_DETECTION_CSV = "detected_song_keys_722.csv";
    private static final String REPORT_FILE = "internal_key_migration_report.txt";
    private static final String UPDATE_SQL = "UPDATE songs SET original_key = ? WHERE id = ?";

    public static void main(String[] args) throws Exception {
        boolean dryRun = true;
        String csvPath = DEFAULT_DETECTION_CSV;

        for (String arg : args) {
            if ("--execute".equalsIgnoreCase(arg) || "-x".equalsIgnoreCase(arg)) {
                dryRun = false;
                continue;
            }
            if ("--dry-run".equalsIgnoreCase(arg) || "-d".equalsIgnoreCase(arg)) {
                dryRun = true;
                continue;
            }
            if (arg.startsWith("--file=")) {
                csvPath = arg.substring("--file=".length()).trim();
                continue;
            }
            if (!arg.isBlank()) {
                csvPath = arg.trim();
            }
        }

        new InternalKeyMigrationRunner().run(csvPath, dryRun);
    }

    public void run(String csvPath, boolean dryRun) throws IOException {
        Path path = Paths.get(csvPath);
        if (!Files.exists(path)) {
            throw new IOException("Detected key CSV not found: " + path.toAbsolutePath());
        }

        Map<String, DetectionEntry> detectionMap = loadDetectedKeys(path);
        SongDAO songDAO = new SongDAO();
        List<Song> songs = songDAO.getAllSongs();

        int processed = 0;
        int updated = 0;
        int alreadyConsistent = 0;
        int missingDetectorEntry = 0;
        int invalidDetectedKey = 0;
        int failedUpdates = 0;
        List<String> reportLines = new ArrayList<>();

        for (Song song : songs) {
            if (song == null
                    || song.getSongNumber() <= 0
                    || song.getLanguage() == null
                    || song.getLanguage().isBlank()) {
                continue;
            }

            String lookupKey = buildLookupKey(song.getLanguage(), song.getSongNumber());
            DetectionEntry detection = detectionMap.get(lookupKey);
            String currentKey = song.getOriginalKey();
            String detectedKey = detection == null ? null : normalizeKey(detection.detectedKey);

            if (detection == null) {
                missingDetectorEntry++;
                reportLines.add(formatDetailedReport(song, currentKey, null, "Missing detector entry"));
                continue;
            }

            if (detectedKey == null || detectedKey.isEmpty()) {
                invalidDetectedKey++;
                reportLines.add(formatDetailedReport(song, currentKey, null, "Detector produced no key"));
                continue;
            }

            processed++;
            String normalizedCurrentKey = normalizeKey(currentKey);
            boolean isConsistent = normalizedCurrentKey != null && normalizedCurrentKey.equals(detectedKey);

            if (dryRun) {
                String status = isConsistent ? "Already consistent (dry run)" : "Candidate update (dry run)";
                reportLines.add(formatDetailedReport(song, currentKey, detectedKey, status));
                continue;
            }

            boolean success = applyOriginalKeyUpdate(song.getId(), detectedKey);
            if (success) {
                if (isConsistent) {
                    alreadyConsistent++;
                    reportLines.add(formatDetailedReport(song, currentKey, detectedKey, "ALREADY CONSISTENT"));
                } else {
                    updated++;
                    reportLines.add(formatDetailedReport(song, currentKey, detectedKey, "UPDATED"));
                }
            } else {
                failedUpdates++;
                reportLines.add(formatDetailedReport(song, currentKey, detectedKey, "UPDATE FAILED"));
            }
        }

        StringBuilder summary = new StringBuilder();
        summary.append("Internal Key Migration Report\n");
        summary.append("========================================\n");
        summary.append("CSV source: ").append(path.toAbsolutePath()).append("\n");
        summary.append("Report file: ").append(Paths.get(REPORT_FILE).toAbsolutePath()).append("\n");
        summary.append("Dry run: ").append(dryRun).append("\n\n");
        summary.append("Songs processed: ").append(songs.size()).append("\n");
        summary.append("Matched detector entries: ").append(processed).append("\n");
        summary.append("Updated: ").append(updated).append("\n");
        summary.append("Already consistent: ").append(alreadyConsistent).append("\n");
        summary.append("Missing detector entry: ").append(missingDetectorEntry).append("\n");
        summary.append("Invalid detected key: ").append(invalidDetectedKey).append("\n");
        if (!dryRun) {
            summary.append("Failed updates: ").append(failedUpdates).append("\n");
        }
        summary.append("\n");

        List<String> outputLines = new ArrayList<>();
        outputLines.add(summary.toString());
        outputLines.addAll(reportLines);
        Files.writeString(Paths.get(REPORT_FILE), String.join("\n\n", outputLines), StandardCharsets.UTF_8);

        System.out.println(summary.toString());
        reportLines.forEach(System.out::println);
    }

    private boolean applyOriginalKeyUpdate(int songId, String detectedKey) {
        try (java.sql.Connection conn = com.worship.util.DBConnection.getConnection();
             java.sql.PreparedStatement ps = conn.prepareStatement(UPDATE_SQL)) {
            conn.setAutoCommit(false);
            ps.setString(1, detectedKey);
            ps.setInt(2, songId);
            int rows = ps.executeUpdate();
            if (rows == 1) {
                conn.commit();
                return true;
            }
            conn.rollback();
        } catch (java.sql.SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Map<String, DetectionEntry> loadDetectedKeys(Path csvPath) throws IOException {
        List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
        Map<String, DetectionEntry> detectionMap = new HashMap<>();
        boolean headerSkipped = false;
        for (String rawLine : lines) {
            if (!headerSkipped) {
                headerSkipped = true;
                continue;
            }
            if (rawLine == null || rawLine.isBlank()) {
                continue;
            }
            String[] parts = splitCsvLine(rawLine);
            if (parts.length < 5) {
                continue;
            }
            String language = parts[3].trim().toLowerCase(Locale.ROOT);
            String songNumberText = parts[1].trim();
            String detectedKey = parts[4].trim();
            String status = parts.length > 9 ? parts[9].trim().toLowerCase(Locale.ROOT) : "";

            if (songNumberText.isEmpty()) {
                continue;
            }

            int songNumber;
            try {
                songNumber = Integer.parseInt(songNumberText);
            } catch (NumberFormatException e) {
                continue;
            }

            if (language.isEmpty()) {
                continue;
            }

            if (!"success".equalsIgnoreCase(status) && !"".equals(status)) {
                continue;
            }

            String lookupKey = buildLookupKey(language, songNumber);
            detectionMap.put(lookupKey, new DetectionEntry(songNumber, language, detectedKey, status));
        }
        return detectionMap;
    }

    private String[] splitCsvLine(String rawLine) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < rawLine.length(); i++) {
            char c = rawLine.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
                continue;
            }
            current.append(c);
        }
        values.add(current.toString());
        return values.toArray(new String[0]);
    }

    private String normalizeKey(String key) {
        if (key == null) {
            return null;
        }
        String normalized = key.trim().replace("♭", "b").replace("♯", "#");
        normalized = normalized.replaceAll("(?i)major", "");
        normalized = normalized.replaceAll("(?i)minor", "m");
        normalized = normalized.replaceAll("[^A-Ga-g#bm]+", "");
        if (normalized.isEmpty()) {
            return null;
        }
        String root = normalized.substring(0, 1).toUpperCase(Locale.ROOT);
        String suffix = normalized.length() > 1 ? normalized.substring(1) : "";
        if (suffix.equalsIgnoreCase("M")) {
            suffix = "";
        } else if (suffix.equalsIgnoreCase("m")) {
            suffix = "m";
        } else {
            suffix = suffix.toUpperCase(Locale.ROOT);
        }
        return root + suffix;
    }

    private String buildLookupKey(String language, int songNumber) {
        return language.trim().toLowerCase(Locale.ROOT) + "#" + songNumber;
    }

    private String formatDetailedReport(Song song, String currentKey, String detectedKey, String status) {
        StringBuilder sb = new StringBuilder();
        sb.append(song.getLanguage() == null ? "Unknown" : capitalize(song.getLanguage())).append(" #").append(song.getSongNumber()).append("\n\n");
        sb.append(song.getTitle() == null ? "<untitled>" : song.getTitle()).append("\n\n");
        sb.append("Old Key:\n");
        sb.append(currentKey == null || currentKey.isBlank() ? "NULL" : currentKey).append("\n\n");
        sb.append("New Key:\n");
        sb.append(detectedKey == null || detectedKey.isBlank() ? "NULL" : detectedKey).append("\n\n");
        sb.append("Status:\n");
        sb.append(status);
        return sb.toString();
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1).toLowerCase(Locale.ROOT);
    }

    private static class DetectionEntry {
        final int songNumber;
        final String language;
        final String detectedKey;
        final String status;

        DetectionEntry(int songNumber, String language, String detectedKey, String status) {
            this.songNumber = songNumber;
            this.language = language;
            this.detectedKey = detectedKey;
            this.status = status;
        }
    }
}
