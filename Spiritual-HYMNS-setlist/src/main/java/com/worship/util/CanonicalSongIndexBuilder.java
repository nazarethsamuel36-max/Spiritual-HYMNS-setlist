package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Song;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CanonicalSongIndexBuilder {

    private static final String DATABASE_CSV = "database_song_index.csv";
    private static final String DATABASE_TXT = "database_song_index.txt";
    private static final String REFERENCE_CSV = "reference_song_index.csv";
    private static final String REFERENCE_TXT = "reference_song_index.txt";
    private static final String MATCHING_CSV = "reference_matching_report.csv";

    private static final Pattern SONG_HEADER_PATTERN = Pattern.compile("^(\\d+)\\.\\s*(.+)");
    private static final Pattern CHORD_PATTERN = Pattern.compile("\\[(.*?)\\]");

    public static void main(String[] args) throws Exception {
        Instant started = Instant.now();
        SongDAO songDAO = new SongDAO();

        List<Song> dbSongs = songDAO.getAllSongs();
        sortDatabaseSongs(dbSongs);

        List<ReferenceSong> referenceSongs = loadReferenceSongs();
        sortReferenceSongs(referenceSongs);

        writeDatabaseIndex(dbSongs);
        writeReferenceIndex(referenceSongs);
        writeMatchingReport(dbSongs, referenceSongs);

        System.out.println("Canonical index export complete.");
        System.out.println("Database CSV: " + Paths.get(DATABASE_CSV).toAbsolutePath());
        System.out.println("Database TXT: " + Paths.get(DATABASE_TXT).toAbsolutePath());
        System.out.println("Reference CSV: " + Paths.get(REFERENCE_CSV).toAbsolutePath());
        System.out.println("Reference TXT: " + Paths.get(REFERENCE_TXT).toAbsolutePath());
        System.out.println("Matching CSV: " + Paths.get(MATCHING_CSV).toAbsolutePath());
        System.out.println("Elapsed: " + Duration.between(started, Instant.now()).toMillis() + " ms");
    }

    private static void sortDatabaseSongs(List<Song> songs) {
        songs.sort(Comparator.comparing(Song::getLanguage, Comparator.nullsFirst(String::compareTo))
                .thenComparingInt(Song::getSongNumber)
                .thenComparing(Song::getTitle, Comparator.nullsFirst(String::compareTo)));
    }

    private static void sortReferenceSongs(List<ReferenceSong> songs) {
        songs.sort(Comparator.comparing(ReferenceSong::getLanguage, Comparator.nullsFirst(String::compareTo))
                .thenComparingInt(ReferenceSong::getSongNumber)
                .thenComparing(ReferenceSong::getOriginalTitle, Comparator.nullsFirst(String::compareTo)));
    }

    private static void writeDatabaseIndex(List<Song> songs) throws IOException {
        Path csvPath = Paths.get(DATABASE_CSV);
        Path txtPath = Paths.get(DATABASE_TXT);

        StringBuilder csv = new StringBuilder();
        csv.append("Database ID,Language,Song Number,English Title,Hindi Title,Marathi Title,Current Original Key\n");

        StringBuilder txt = new StringBuilder();
        txt.append("Canonical Database Song Index\n");
        txt.append("=======================================\n");

        for (Song song : songs) {
            String englishTitle = "";
            String hindiTitle = "";
            String marathiTitle = "";
            String language = song.getLanguage() != null ? song.getLanguage() : "";
            String title = song.getTitle() != null ? song.getTitle() : "";

            switch (language.toLowerCase(Locale.ROOT)) {
                case "english" -> englishTitle = title;
                case "hindi" -> hindiTitle = title;
                case "marathi" -> marathiTitle = title;
                default -> {
                    if (language.isEmpty()) {
                        englishTitle = title;
                    } else {
                        englishTitle = title;
                    }
                }
            }

            String key = song.getOriginalKey() != null ? song.getOriginalKey() : "";
            csv.append(song.getId()).append(",")
                    .append(csvEscape(language)).append(",")
                    .append(song.getSongNumber()).append(",")
                    .append(csvEscape(englishTitle)).append(",")
                    .append(csvEscape(hindiTitle)).append(",")
                    .append(csvEscape(marathiTitle)).append(",")
                    .append(csvEscape(key)).append("\n");

            txt.append(song.getId()).append(" | ")
                    .append(language).append(" | #").append(song.getSongNumber()).append(" | ")
                    .append(title).append(" | ")
                    .append(key).append("\n");
        }

        Files.writeString(csvPath, csv.toString(), StandardCharsets.UTF_8);
        Files.writeString(txtPath, txt.toString(), StandardCharsets.UTF_8);
    }

    private static void writeReferenceIndex(List<ReferenceSong> songs) throws IOException {
        Path csvPath = Paths.get(REFERENCE_CSV);
        Path txtPath = Paths.get(REFERENCE_TXT);

        StringBuilder csv = new StringBuilder();
        csv.append("Language,Song Number,Original Title,Normalized Title,Reference Key\n");

        StringBuilder txt = new StringBuilder();
        txt.append("Canonical Reference Song Index\n");
        txt.append("=======================================\n");

        for (ReferenceSong song : songs) {
            csv.append(csvEscape(song.getLanguage())).append(",")
                    .append(song.getSongNumber()).append(",")
                    .append(csvEscape(song.getOriginalTitle())).append(",")
                    .append(csvEscape(song.getNormalizedTitle())).append(",")
                    .append(csvEscape(song.getReferenceKey())).append("\n");

            txt.append(song.getLanguage()).append(" | #").append(song.getSongNumber()).append(" | ")
                    .append(song.getOriginalTitle()).append(" | ")
                    .append(song.getReferenceKey()).append(" | normalized= ")
                    .append(song.getNormalizedTitle()).append("\n");
        }

        Files.writeString(csvPath, csv.toString(), StandardCharsets.UTF_8);
        Files.writeString(txtPath, txt.toString(), StandardCharsets.UTF_8);
    }

    private static void writeMatchingReport(List<Song> dbSongs, List<ReferenceSong> referenceSongs) throws IOException {
        Path csvPath = Paths.get(MATCHING_CSV);
        StringBuilder csv = new StringBuilder();
        csv.append("Language,Song Number,Database Title,Reference Title,Normalized Match,Exact Match,Notes\n");

        Map<String, ReferenceSong> referenceMap = new HashMap<>();
        for (ReferenceSong ref : referenceSongs) {
            referenceMap.put(ref.getKey(), ref);
        }

        Set<String> matchedReferenceKeys = new HashSet<>();

        for (Song dbSong : dbSongs) {
            String language = dbSong.getLanguage() != null ? dbSong.getLanguage() : "";
            int songNumber = dbSong.getSongNumber();
            String dbTitle = dbSong.getTitle() != null ? dbSong.getTitle() : "";
            String normalizedDbTitle = normalizeTitleForMatching(dbTitle);
            String mapKey = buildMapKey(language, songNumber);
            ReferenceSong ref = referenceMap.get(mapKey);
            if (ref == null) {
                csv.append(csvEscape(language)).append(",")
                        .append(songNumber).append(",")
                        .append(csvEscape(dbTitle)).append(",")
                        .append(",")
                        .append("false").append(",")
                        .append("false").append(",")
                        .append("Reference Missing").append("\n");
                continue;
            }
            matchedReferenceKeys.add(mapKey);

            boolean exactMatch = dbTitle.equals(ref.getOriginalTitle());
            boolean normalizedMatch = normalizedDbTitle.equals(ref.getNormalizedTitle());
            String notes;
            if (exactMatch) {
                notes = "Exact Match";
            } else if (normalizedMatch) {
                notes = "Normalized Match";
            } else {
                notes = "Manual Review Required";
            }

            csv.append(csvEscape(language)).append(",")
                    .append(songNumber).append(",")
                    .append(csvEscape(dbTitle)).append(",")
                    .append(csvEscape(ref.getOriginalTitle())).append(",")
                    .append(normalizedMatch).append(",")
                    .append(exactMatch).append(",")
                    .append(csvEscape(notes)).append("\n");
        }

        for (ReferenceSong ref : referenceSongs) {
            String key = ref.getKey();
            if (!matchedReferenceKeys.contains(key)) {
                csv.append(csvEscape(ref.getLanguage())).append(",")
                        .append(ref.getSongNumber()).append(",")
                        .append(",")
                        .append(csvEscape(ref.getOriginalTitle())).append(",")
                        .append("false").append(",")
                        .append("false").append(",")
                        .append("Database Missing").append("\n");
            }
        }

        Files.writeString(csvPath, csv.toString(), StandardCharsets.UTF_8);
    }

    private static List<ReferenceSong> loadReferenceSongs() throws IOException {
        Path referenceFile = Paths.get("reference_chords", "english_master_chordbook.txt");
        if (!Files.exists(referenceFile)) {
            throw new IOException("Reference file not found: " + referenceFile.toAbsolutePath());
        }

        List<ReferenceSong> songs = new ArrayList<>();
        List<String> lines = Files.readAllLines(referenceFile, StandardCharsets.UTF_8);
        Integer currentNumber = null;
        String currentTitle = null;
        StringBuilder content = new StringBuilder();

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank() || line.startsWith("#")) {
                continue;
            }
            Matcher matcher = SONG_HEADER_PATTERN.matcher(line);
            if (matcher.matches()) {
                if (currentNumber != null && currentTitle != null) {
                    addReferenceSong(songs, currentNumber, currentTitle, content.toString());
                }
                currentNumber = Integer.parseInt(matcher.group(1));
                currentTitle = matcher.group(2).trim();
                content.setLength(0);
                content.append(line).append("\n");
                continue;
            }
            if (line.startsWith("---")) {
                if (currentNumber != null && currentTitle != null) {
                    addReferenceSong(songs, currentNumber, currentTitle, content.toString());
                    currentNumber = null;
                    currentTitle = null;
                    content.setLength(0);
                }
                continue;
            }
            if (currentNumber != null) {
                content.append(line).append("\n");
            }
        }

        if (currentNumber != null && currentTitle != null) {
            addReferenceSong(songs, currentNumber, currentTitle, content.toString());
        }

        return songs;
    }

    private static void addReferenceSong(List<ReferenceSong> songs, int songNumber, String title, String rawText) {
        String language = "english";
        String normalizedTitle = normalizeTitleForMatching(title);
        String referenceKey = detectReferenceKey(rawText);
        songs.add(new ReferenceSong(language, songNumber, title, normalizedTitle, referenceKey));
    }

    private static String buildMapKey(String language, int songNumber) {
        String normalizedLanguage = language != null ? language.trim().toLowerCase(Locale.ROOT) : "";
        return normalizedLanguage + "#" + songNumber;
    }

    private static String normalizeTitleForMatching(String title) {
        if (title == null) {
            return "";
        }
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFKC);
        normalized = normalized.replace("“", "\"")
                .replace("”", "\"")
                .replace("‘", "'")
                .replace("’", "'");
        normalized = normalized.toLowerCase(Locale.ROOT);
        normalized = normalized.replaceAll("[^\\p{L}\\p{N} ]+", " ");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        return normalized;
    }

    private static String detectReferenceKey(String chordText) {
        if (chordText == null || chordText.isBlank()) {
            return "";
        }
        Matcher matcher = CHORD_PATTERN.matcher(chordText);
        while (matcher.find()) {
            String token = matcher.group(1).trim();
            if (token.isBlank()) {
                continue;
            }
            String root = token;
            if (root.contains("/")) {
                root = root.substring(0, root.indexOf('/'));
            }
            root = root.replace("♭", "b").replace("♯", "#");
            root = root.replaceAll("[^A-Ga-g#bm]+", "");
            if (root.isBlank()) {
                continue;
            }
            root = root.substring(0, 1).toUpperCase(Locale.ROOT) + (root.length() > 1 ? root.substring(1) : "");
            if (root.length() == 1) {
                return root;
            }
            if (root.matches("^[A-G]m$")) {
                return root;
            }
            if (root.matches("^[A-G][#b]$")) {
                return root;
            }
            if (root.length() > 2) {
                return root.substring(0, 2);
            }
            return root;
        }
        return "";
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

        public ReferenceSong(String language, int songNumber, String originalTitle, String normalizedTitle, String referenceKey) {
            this.language = language;
            this.songNumber = songNumber;
            this.originalTitle = originalTitle;
            this.normalizedTitle = normalizedTitle;
            this.referenceKey = referenceKey != null ? referenceKey : "";
        }

        public String getLanguage() {
            return language;
        }

        public int getSongNumber() {
            return songNumber;
        }

        public String getOriginalTitle() {
            return originalTitle;
        }

        public String getNormalizedTitle() {
            return normalizedTitle;
        }

        public String getReferenceKey() {
            return referenceKey;
        }

        public String getKey() {
            return buildMapKey(language, songNumber);
        }
    }
}
