package com.worship.util;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ReferenceIndexFromTitleKeyFileBuilder {

    private static final String DEFAULT_INPUT = "C:/Users/Lenovo/Downloads/song_titles_keys_sorted_cleaned.txt";
    private static final String OUTPUT_CSV = "reference_song_index.csv";
    private static final String OUTPUT_TXT = "reference_song_index.txt";
    private static final String VALID_KEY_PATTERN = "^[A-G](#|b)?m?$";
    private static final Pattern ENTRY_PATTERN = Pattern.compile("^(English|Hindi|Marathi|Konkani)\\s+(\\d+)\\s*\\|\\s*(.+?)\\s*\\|\\s*Key:\\s*(.+)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern SECTION_PATTERN = Pattern.compile("^=====\\s*(English|Hindi|Marathi|Konkani)\\s*=====$", Pattern.CASE_INSENSITIVE);

    public static void main(String[] args) throws Exception {
        Path inputPath = args.length > 0 ? Paths.get(args[0]) : Paths.get(DEFAULT_INPUT);
        if (!Files.exists(inputPath)) {
            throw new IOException("Input file not found: " + inputPath.toAbsolutePath());
        }

        List<String> lines = Files.readAllLines(inputPath, StandardCharsets.UTF_8);
        List<ReferenceSong> songs = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        String currentSection = null;
        int lineNumber = 0;
        for (String rawLine : lines) {
            lineNumber++;
            String line = rawLine.trim();
            if (line.isEmpty()) {
                continue;
            }
            Matcher sectionMatcher = SECTION_PATTERN.matcher(line);
            if (sectionMatcher.matches()) {
                currentSection = sectionMatcher.group(1).toLowerCase(Locale.ROOT);
                continue;
            }
            Matcher entryMatcher = ENTRY_PATTERN.matcher(line);
            if (!entryMatcher.matches()) {
                errors.add("Line " + lineNumber + ": Unrecognized format: " + line);
                continue;
            }

            String language = entryMatcher.group(1).toLowerCase(Locale.ROOT);
            String songNumberText = entryMatcher.group(2);
            String rawTitle = entryMatcher.group(3).trim();
            String rawKey = entryMatcher.group(4).trim();

            if (currentSection != null && !currentSection.equals(language)) {
                errors.add("Line " + lineNumber + ": Section mismatch: line language=" + language + " but section=" + currentSection);
            }

            int songNumber;
            try {
                songNumber = Integer.parseInt(songNumberText);
            } catch (NumberFormatException nfe) {
                errors.add("Line " + lineNumber + ": Invalid song number: " + songNumberText);
                continue;
            }

            String key = normalizeKey(rawKey);
            boolean keyValid = isValidKey(key);
            if (key == null || key.isEmpty() || !keyValid) {
                key = "";
            }

            String normalizedTitle = normalizeTitle(rawTitle);
            if (normalizedTitle.isEmpty()) {
                errors.add("Line " + lineNumber + ": Normalized title empty for original title: " + rawTitle);
            }
            if (rawTitle.isEmpty()) {
                errors.add("Line " + lineNumber + ": Missing original title");
            }

            songs.add(new ReferenceSong(language, songNumber, rawTitle, normalizedTitle, key, lineNumber));
        }

        ValidationSummary summary = validateSongs(songs, errors);
        writeOutputs(songs, summary);
        writeValidationSummary(summary);
    }

    private static boolean isValidKey(String key) {
        if (key == null) {
            return false;
        }
        String normalized = key.trim();
        if (normalized.isEmpty()) {
            return false;
        }
        if (normalized.equalsIgnoreCase("KEY_NOT_FOUND")) {
            return false;
        }
        if (normalized.equalsIgnoreCase("YES") || normalized.equalsIgnoreCase("EE") || normalized.equalsIgnoreCase("VERSE") || normalized.equalsIgnoreCase("CHORUS")) {
            return false;
        }
        return normalized.matches(VALID_KEY_PATTERN);
    }

    private static String normalizeKey(String rawKey) {
        if (rawKey == null) {
            return null;
        }
        String normalized = Normalizer.normalize(rawKey, Normalizer.Form.NFKC).trim();
        normalized = normalized.replace("♭", "b").replace("♯", "#");
        normalized = normalized.replaceAll("[^A-Ga-g#bm]+", "");
        if (normalized.isEmpty()) {
            return null;
        }
        normalized = normalized.toUpperCase(Locale.ROOT);
        if (normalized.length() == 2 && normalized.charAt(1) == 'M') {
            normalized = normalized.substring(0, 1) + "m";
        }
        return normalized;
    }

    private static String normalizeTitle(String title) {
        if (title == null) {
            return "";
        }
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFKC);
        normalized = normalized.replace("“", "\"")
                .replace("”", "\"")
                .replace("‘", "'")
                .replace("’", "'")
                .replace("—", " ")
                .replace("–", " ")
                .replace("\u00A0", " ");
        normalized = normalized.toLowerCase(Locale.ROOT);
        normalized = normalized.replaceAll("[^a-z0-9' ]+", " ");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        return normalized;
    }

    private static ValidationSummary validateSongs(List<ReferenceSong> songs, List<String> inputErrors) {
        ValidationSummary summary = new ValidationSummary();
        summary.totalLines = songs.size();
        summary.errors.addAll(inputErrors);
        summary.totalSongs = songs.size();

        Set<String> seenNumbers = new HashSet<>();
        Set<String> seenTitles = new HashSet<>();
        Map<String, Integer> numberCounts = new LinkedHashMap<>();
        Map<String, Integer> titleCounts = new LinkedHashMap<>();
        Map<String, Set<Integer>> numbersByLanguage = new LinkedHashMap<>();

        for (ReferenceSong song : songs) {
            String numberKey = song.language + "#" + song.songNumber;
            numberCounts.put(numberKey, numberCounts.getOrDefault(numberKey, 0) + 1);
            String titleKey = song.language + "#" + song.normalizedTitle;
            titleCounts.put(titleKey, titleCounts.getOrDefault(titleKey, 0) + 1);

            numbersByLanguage.computeIfAbsent(song.language, ignored -> new HashSet<>()).add(song.songNumber);

            if (!seenNumbers.add(numberKey)) {
                summary.duplicateSongNumbers.add(numberKey);
            }
            if (!seenTitles.add(titleKey)) {
                summary.duplicateTitles.add(titleKey);
            }

            if (song.originalTitle == null || song.originalTitle.isBlank()) {
                summary.blankTitles.add(song.lineNumber + ": " + song.language + " " + song.songNumber);
            }
            if (song.referenceKey == null || song.referenceKey.isBlank() || song.referenceKey.equals("KEY_NOT_FOUND")) {
                summary.missingKeys.add(song.language + " " + song.songNumber + " -> " + song.originalTitle);
            } else if (!isValidKey(song.referenceKey)) {
                summary.invalidKeys.add(song.language + " " + song.songNumber + " -> " + song.referenceKey);
            }
        }

        for (Map.Entry<String, Set<Integer>> entry : numbersByLanguage.entrySet()) {
            String language = entry.getKey();
            Set<Integer> songNumbers = entry.getValue();
            if (songNumbers.isEmpty()) {
                continue;
            }
            int min = songNumbers.stream().min(Integer::compareTo).orElse(0);
            int max = songNumbers.stream().max(Integer::compareTo).orElse(0);
            for (int candidate = min; candidate <= max; candidate++) {
                if (!songNumbers.contains(candidate)) {
                    summary.missingSongNumbers.add(language + " " + candidate);
                }
            }
        }

        for (Map.Entry<String, Integer> entry : numberCounts.entrySet()) {
            if (entry.getValue() > 1) {
                summary.duplicateSongNumberCounts.put(entry.getKey(), entry.getValue());
            }
        }
        for (Map.Entry<String, Integer> entry : titleCounts.entrySet()) {
            if (entry.getValue() > 1) {
                summary.duplicateTitleCounts.put(entry.getKey(), entry.getValue());
            }
        }

        return summary;
    }

    private static void writeOutputs(List<ReferenceSong> songs, ValidationSummary summary) throws IOException {
        Path csvPath = Paths.get(OUTPUT_CSV);
        Path txtPath = Paths.get(OUTPUT_TXT);
        StringBuilder csv = new StringBuilder();
        StringBuilder txt = new StringBuilder();

        csv.append("Language,Song Number,Original Title,Normalized Title,Reference Key\n");
        txt.append("Canonical Reference Song Index\n");
        txt.append("=======================================\n");

        for (ReferenceSong song : songs) {
            String keyValue = song.referenceKey;

            csv.append(csvEscape(song.language)).append(",")
                    .append(song.songNumber).append(",")
                    .append(csvEscape(song.originalTitle)).append(",")
                    .append(csvEscape(song.normalizedTitle)).append(",")
                    .append(csvEscape(keyValue)).append("\n");

            txt.append(song.language).append(" | #").append(song.songNumber).append(" | ")
                    .append(song.originalTitle).append(" | ")
                    .append(keyValue).append(" | normalized= ")
                    .append(song.normalizedTitle).append("\n");
        }

        Files.writeString(csvPath, csv.toString(), StandardCharsets.UTF_8);
        Files.writeString(txtPath, txt.toString(), StandardCharsets.UTF_8);
    }

    private static void writeValidationSummary(ValidationSummary summary) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("Validation Summary\n");
        sb.append("===================\n");
        sb.append("Total lines processed: ").append(summary.totalLines).append("\n");
        sb.append("Total songs indexed: ").append(summary.totalSongs).append("\n");
        sb.append("Missing keys: ").append(summary.missingKeys.size()).append("\n");
        sb.append("Duplicate song numbers: ").append(summary.duplicateSongNumbers.size()).append("\n");
        sb.append("Missing song numbers: ").append(summary.missingSongNumbers.size()).append("\n");
        sb.append("Duplicate titles: ").append(summary.duplicateTitles.size()).append("\n");
        sb.append("Blank titles: ").append(summary.blankTitles.size()).append("\n");
        sb.append("Invalid keys: ").append(summary.invalidKeys.size()).append("\n");

        if (!summary.missingKeys.isEmpty()) {
            sb.append("\nMissing keys:\n");
            for (String entry : summary.missingKeys) {
                sb.append(" - ").append(entry).append("\n");
            }
        }
        if (!summary.duplicateSongNumbers.isEmpty()) {
            sb.append("\nDuplicate song numbers:\n");
            for (String dup : summary.duplicateSongNumbers) {
                sb.append(" - ").append(dup).append("\n");
            }
        }
        if (!summary.missingSongNumbers.isEmpty()) {
            sb.append("\nMissing song numbers:\n");
            for (String missing : summary.missingSongNumbers) {
                sb.append(" - ").append(missing).append("\n");
            }
        }
        if (!summary.duplicateTitles.isEmpty()) {
            sb.append("\nDuplicate titles:\n");
            for (String dup : summary.duplicateTitles) {
                sb.append(" - ").append(dup).append("\n");
            }
        }
        if (!summary.blankTitles.isEmpty()) {
            sb.append("\nBlank titles:\n");
            for (String blank : summary.blankTitles) {
                sb.append(" - ").append(blank).append("\n");
            }
        }
        if (!summary.invalidKeys.isEmpty()) {
            sb.append("\nInvalid keys:\n");
            for (String invalid : summary.invalidKeys) {
                sb.append(" - ").append(invalid).append("\n");
            }
        }
        if (!summary.errors.isEmpty()) {
            sb.append("\nParsing errors:\n");
            for (String error : summary.errors) {
                sb.append(" - ").append(error).append("\n");
            }
        }

        String output = sb.toString();
        System.out.println(output);
        Files.writeString(Paths.get("reference_song_index_validation.txt"), output, StandardCharsets.UTF_8);
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

    private static class ReferenceSong {
        private final String language;
        private final int songNumber;
        private final String originalTitle;
        private final String normalizedTitle;
        private final String referenceKey;
        private final int lineNumber;

        public ReferenceSong(String language, int songNumber, String originalTitle, String normalizedTitle, String referenceKey, int lineNumber) {
            this.language = language;
            this.songNumber = songNumber;
            this.originalTitle = originalTitle;
            this.normalizedTitle = normalizedTitle;
            this.referenceKey = referenceKey;
            this.lineNumber = lineNumber;
        }
    }

    private static class ValidationSummary {
        private int totalLines;
        private int totalSongs;
        private final List<String> missingKeys = new ArrayList<>();
        private final Set<String> duplicateSongNumbers = new HashSet<>();
        private final Set<String> duplicateTitles = new HashSet<>();
        private final List<String> missingSongNumbers = new ArrayList<>();
        private final List<String> blankTitles = new ArrayList<>();
        private final List<String> invalidKeys = new ArrayList<>();
        private final List<String> errors = new ArrayList<>();
        private final Map<String, Integer> duplicateSongNumberCounts = new LinkedHashMap<>();
        private final Map<String, Integer> duplicateTitleCounts = new LinkedHashMap<>();
    }
}
