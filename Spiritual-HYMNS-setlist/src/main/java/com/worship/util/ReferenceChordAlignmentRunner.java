package com.worship.util;

import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.model.ChordOccurrence;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class ReferenceChordAlignmentRunner {

    private static final String REPORT_TXT = "reference_key_alignment_report.txt";
    private static final String REPORT_CSV = "reference_key_alignment_report.csv";
    private static final String REFERENCE_FILE = "reference_chords/english_master_chordbook.txt";
    private static final Pattern CHORD_PATTERN = Pattern.compile("\\[(.*?)\\]");

    public static void main(String[] args) throws Exception {
        Instant started = Instant.now();
        SongDAO songDAO = new SongDAO();
        LineChordDAO lineChordDAO = new LineChordDAO();

        List<Song> songs = songDAO.getAllSongs().stream()
                .filter(Objects::nonNull)
                .filter(s -> s.getSongNumber() > 0)
                .sorted(Comparator.comparingInt(Song::getSongNumber).thenComparing(Song::getTitle, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        Map<String, ReferenceEntry> references = loadReferenceEntries();
        List<AlignmentRecord> records = new ArrayList<>();
        int updated = 0;
        int noChange = 0;
        int skipped = 0;
        int errors = 0;

        for (Song song : songs) {
            try {
                ReferenceEntry reference = findReferenceEntry(song, references);
                if (reference == null) {
                    skipped++;
                    records.add(AlignmentRecord.skipped(song, "Reference Missing"));
                    continue;
                }

                String currentKey = normalizeKey(song.getOriginalKey());
                String referenceKey = normalizeKey(reference.key);
                if (referenceKey == null || referenceKey.isBlank()) {
                    referenceKey = detectReferenceKey(reference.rawText);
                }
                if (referenceKey == null || referenceKey.isBlank()) {
                    skipped++;
                    records.add(AlignmentRecord.skipped(song, "Missing Reference Key"));
                    continue;
                }
                if (currentKey == null || currentKey.isBlank()) {
                    int semitones = 0;
                    String updatedChords = transposeChordText(song, lineChordDAO, semitones);
                    Song updatedSongModel = new Song();
                    updatedSongModel.setId(song.getId());
                    updatedSongModel.setSongNumber(song.getSongNumber());
                    updatedSongModel.setTitle(song.getTitle());
                    updatedSongModel.setArtist(song.getArtist());
                    updatedSongModel.setComposer(song.getComposer());
                    updatedSongModel.setCopyright(song.getCopyright());
                    updatedSongModel.setLanguage(song.getLanguage());
                    updatedSongModel.setLyricsOriginal(song.getLyricsOriginal());
                    updatedSongModel.setLyricsRoman(song.getLyricsRoman());
                    updatedSongModel.setChords(updatedChords != null ? updatedChords : song.getChords());
                    updatedSongModel.setNotes(song.getNotes());
                    updatedSongModel.setOriginalKey(referenceKey);
                    updatedSongModel.setCapo(song.getCapo());
                    updatedSongModel.setBpm(song.getBpm());
                    updatedSongModel.setTimeSignature(song.getTimeSignature());
                    updatedSongModel.setStructure(song.getStructure());
                    updatedSongModel.setAudioUrl(song.getAudioUrl());
                    updatedSongModel.setBook(song.getBook());
                    updatedSongModel.setActive(song.isActive());

                    boolean songUpdated = songDAO.updateSong(updatedSongModel);
                    if (songUpdated) {
                        updated++;
                        records.add(AlignmentRecord.updated(song, currentKey, referenceKey, 0, "Key Filled From Reference"));
                    } else {
                        errors++;
                        records.add(AlignmentRecord.error(song, currentKey, referenceKey, 0, "Update Failed"));
                    }
                    continue;
                }

                if (currentKey.equalsIgnoreCase(referenceKey)) {
                    noChange++;
                    records.add(AlignmentRecord.noChange(song, currentKey, referenceKey, 0, "Already Correct"));
                    continue;
                }

                int semitones = calculateSemitoneInterval(currentKey, referenceKey);
                if (semitones == Integer.MIN_VALUE) {
                    skipped++;
                    records.add(AlignmentRecord.skipped(song, "Manual Review Required"));
                    continue;
                }

                String updatedChords = transposeChordText(song, lineChordDAO, semitones);
                Song updatedSongModel = new Song();
                updatedSongModel.setId(song.getId());
                updatedSongModel.setSongNumber(song.getSongNumber());
                updatedSongModel.setTitle(song.getTitle());
                updatedSongModel.setArtist(song.getArtist());
                updatedSongModel.setComposer(song.getComposer());
                updatedSongModel.setCopyright(song.getCopyright());
                updatedSongModel.setLanguage(song.getLanguage());
                updatedSongModel.setLyricsOriginal(song.getLyricsOriginal());
                updatedSongModel.setLyricsRoman(song.getLyricsRoman());
                updatedSongModel.setChords(updatedChords != null ? updatedChords : song.getChords());
                updatedSongModel.setNotes(song.getNotes());
                updatedSongModel.setOriginalKey(referenceKey);
                updatedSongModel.setCapo(song.getCapo());
                updatedSongModel.setBpm(song.getBpm());
                updatedSongModel.setTimeSignature(song.getTimeSignature());
                updatedSongModel.setStructure(song.getStructure());
                updatedSongModel.setAudioUrl(song.getAudioUrl());
                updatedSongModel.setBook(song.getBook());
                updatedSongModel.setActive(song.isActive());

                boolean songUpdated = songDAO.updateSong(updatedSongModel);
                int lineChordUpdates = lineChordDAO.transposeChordsForSong(song.getId(), semitones);

                if (songUpdated || lineChordUpdates > 0) {
                    updated++;
                    records.add(AlignmentRecord.updated(song, currentKey, referenceKey, semitones, "Transposed"));
                } else {
                    errors++;
                    records.add(AlignmentRecord.error(song, currentKey, referenceKey, semitones, "Update Failed"));
                }
            } catch (Exception ex) {
                errors++;
                records.add(AlignmentRecord.error(song, null, null, 0, ex.getMessage()));
            }
        }

        Path txtPath = Paths.get(REPORT_TXT);
        Path csvPath = Paths.get(REPORT_CSV);
        Files.writeString(txtPath, buildTextReport(records, started, updated, noChange, skipped, errors), StandardCharsets.UTF_8);
        Files.writeString(csvPath, buildCsvReport(records), StandardCharsets.UTF_8);

        System.out.println("Reference alignment complete");
        System.out.println("Updated: " + updated + ", No change: " + noChange + ", Skipped: " + skipped + ", Errors: " + errors);
        System.out.println("Report TXT: " + txtPath.toAbsolutePath());
        System.out.println("Report CSV: " + csvPath.toAbsolutePath());
    }

    static int calculateSemitoneInterval(String currentKey, String referenceKey) {
        String normalizedCurrent = normalizeKey(currentKey);
        String normalizedReference = normalizeKey(referenceKey);
        if (normalizedCurrent == null || normalizedReference == null) {
            return Integer.MIN_VALUE;
        }

        int currentIndex = keyToIndex(normalizedCurrent);
        int referenceIndex = keyToIndex(normalizedReference);
        if (currentIndex < 0 || referenceIndex < 0) {
            return Integer.MIN_VALUE;
        }

        return (referenceIndex - currentIndex + 12) % 12;
    }

    static String normalizeReferenceTitle(String title) {
        if (title == null) {
            return "";
        }
        return title.replaceFirst("^\\d+\\.\\s*", "")
                .replace("'", "'")
                .replace("\u2019", "'")
                .replaceAll("[^A-Z0-9 ]", "")
                .replaceAll("\\s+", " ")
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    static String normalizeTitleForMatching(String title) {
        if (title == null) {
            return "";
        }
        return normalizeReferenceTitle(title)
                .replaceAll("\\bTHE\\b", "")
                .replaceAll("\\bA\\b", "")
                .replaceAll("\\bAN\\b", "")
                .replaceAll("\\bOF\\b", "")
                .replaceAll("\\bTO\\b", "")
                .replaceAll("\\bAND\\b", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String normalizeKey(String key) {
        if (key == null) {
            return null;
        }
        String trimmed = key.trim();
        if (trimmed.isBlank()) {
            return null;
        }
        return trimmed.replaceAll("\\s+", "").replace("♭", "b").replace("♯", "#");
    }

    private static ReferenceEntry findReferenceEntry(Song song, Map<String, ReferenceEntry> references) {
        String normalizedSongTitle = normalizeTitleForMatching(song.getTitle());
        if (normalizedSongTitle.isBlank()) {
            return null;
        }
        ReferenceEntry exact = references.get(normalizeReferenceTitle(song.getTitle()));
        if (exact != null) {
            return exact;
        }
        String bestMatch = null;
        int bestScore = -1;
        for (Map.Entry<String, ReferenceEntry> entry : references.entrySet()) {
            String referenceTitle = entry.getKey();
            if (referenceTitle.isBlank()) {
                continue;
            }
            int score = scoreTitleMatch(normalizedSongTitle, referenceTitle);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = referenceTitle;
            }
        }
        return bestScore >= 3 ? references.get(bestMatch) : null;
    }

    private static int scoreTitleMatch(String songTitle, String referenceTitle) {
        String normalizedSong = normalizeTitleForMatching(songTitle);
        String normalizedReference = normalizeTitleForMatching(referenceTitle);
        if (normalizedSong.isBlank() || normalizedReference.isBlank()) {
            return 0;
        }
        if (normalizedSong.equals(normalizedReference)) {
            return 100;
        }
        int score = 0;
        String[] songTokens = normalizedSong.split(" ");
        String[] referenceTokens = normalizedReference.split(" ");
        for (String songToken : songTokens) {
            for (String referenceToken : referenceTokens) {
                if (songToken.equals(referenceToken)) {
                    score++;
                    break;
                }
            }
        }
        return score;
    }

    private static Map<String, ReferenceEntry> loadReferenceEntries() throws IOException {
        Path path = Paths.get(REFERENCE_FILE);
        if (!Files.exists(path)) {
            throw new IOException("Reference file not found: " + path.toAbsolutePath());
        }

        Map<String, ReferenceEntry> entries = new LinkedHashMap<>();
        String content = Files.readString(path, StandardCharsets.UTF_8);
        String currentTitle = null;
        String currentNormalizedTitle = null;
        StringBuilder currentRawText = new StringBuilder();

        for (String rawLine : content.split("\\R")) {
            String line = rawLine.trim();
            if (line.isBlank() || line.startsWith("#")) {
                continue;
            }
            if (line.matches("^\\d+\\..+")) {
                if (currentNormalizedTitle != null) {
                    entries.put(currentNormalizedTitle, new ReferenceEntry(currentNormalizedTitle,
                            detectReferenceKey(currentRawText.toString()), currentRawText.toString()));
                }
                String[] parts = line.split("\\s+", 2);
                currentTitle = parts.length > 1 ? parts[1] : parts[0];
                currentNormalizedTitle = normalizeReferenceTitle(currentTitle);
                currentRawText.setLength(0);
                currentRawText.append(line).append("\n");
                continue;
            }
            if (line.startsWith("---")) {
                if (currentNormalizedTitle != null) {
                    entries.put(currentNormalizedTitle, new ReferenceEntry(currentNormalizedTitle,
                            detectReferenceKey(currentRawText.toString()), currentRawText.toString()));
                    currentNormalizedTitle = null;
                    currentRawText.setLength(0);
                }
                continue;
            }
            if (currentNormalizedTitle != null) {
                currentRawText.append(line).append("\n");
            }
        }

        if (currentNormalizedTitle != null) {
            entries.put(currentNormalizedTitle, new ReferenceEntry(currentNormalizedTitle,
                    detectReferenceKey(currentRawText.toString()), currentRawText.toString()));
        }

        return entries;
    }

    static String detectReferenceKey(String chordText) {
        if (chordText == null || chordText.isBlank()) {
            return null;
        }
        Matcher matcher = CHORD_PATTERN.matcher(chordText);
        List<String> roots = new ArrayList<>();
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
            root = root.replaceAll("[^A-G#bm]", "");
            if (!root.isBlank()) {
                roots.add(root);
            }
        }
        if (roots.isEmpty()) {
            return null;
        }
        String firstRoot = roots.get(0);
        if (firstRoot.length() == 1) {
            return firstRoot.toUpperCase(Locale.ROOT);
        }
        if (firstRoot.startsWith("B") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Bm";
        }
        if (firstRoot.startsWith("C") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Cm";
        }
        if (firstRoot.startsWith("D") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Dm";
        }
        if (firstRoot.startsWith("E") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Em";
        }
        if (firstRoot.startsWith("F") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Fm";
        }
        if (firstRoot.startsWith("G") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Gm";
        }
        if (firstRoot.startsWith("A") && firstRoot.length() == 2 && firstRoot.charAt(1) == 'm') {
            return "Am";
        }
        if (firstRoot.equals("F#")) return "F#";
        if (firstRoot.equals("C#")) return "C#";
        if (firstRoot.equals("G#")) return "G#";
        if (firstRoot.equals("D#")) return "D#";
        if (firstRoot.equals("A#")) return "A#";
        if (firstRoot.equals("E#")) return "E#";
        if (firstRoot.equals("B#")) return "B#";
        return firstRoot;
    }

    private static String transposeChordText(Song song, LineChordDAO lineChordDAO, int semitones) {
        if (song.getChords() != null && !song.getChords().isBlank()) {
            return ChordTransposer.transposeSong(song.getChords(), semitones);
        }

        Map<Integer, List<ChordOccurrence>> chordMap = lineChordDAO.getChordsForSong(song.getId());
        if (chordMap.isEmpty()) {
            return null;
        }

        // The app's main render path uses structured lines from sections + line_chords, so this runner preserves the
        // relational chord data by updating the flat text field only when it exists; otherwise it leaves the song intact.
        return null;
    }

    private static int keyToIndex(String key) {
        String normalized = normalizeKey(key);
        if (normalized == null) {
            return -1;
        }
        return switch (normalized) {
            case "C", "Am" -> 0;
            case "C#", "Db", "A#m" -> 1;
            case "D", "Bm" -> 2;
            case "D#", "Eb", "Cm" -> 3;
            case "E", "C#m" -> 4;
            case "F", "Dm" -> 5;
            case "F#", "Gb", "D#m" -> 6;
            case "G", "Em" -> 7;
            case "G#", "Ab", "Ebm" -> 8;
            case "A", "F#m" -> 9;
            case "A#", "Bb", "Gm" -> 10;
            case "B", "G#m" -> 11;
            default -> -1;
        };
    }

    private static String buildTextReport(List<AlignmentRecord> records, Instant started, int updated, int noChange, int skipped, int errors) {
        StringBuilder sb = new StringBuilder();
        sb.append("Reference Chord Alignment Report\n");
        sb.append("Generated from reference_chords/english_master_chordbook.txt\n");
        sb.append("===============================================================\n");
        for (AlignmentRecord record : records) {
            sb.append("- ").append(record.song.getSongNumber()).append(" | ").append(record.song.getTitle())
                    .append(" | Current Key: ").append(record.currentKey == null ? "N/A" : record.currentKey)
                    .append(" | Reference Key: ").append(record.referenceKey == null ? "N/A" : record.referenceKey)
                    .append(" | Interval: ").append(record.semitones)
                    .append(" | Status: ").append(record.status)
                    .append("\n");
        }
        sb.append("Updated: ").append(updated).append("\n");
        sb.append("No Change: ").append(noChange).append("\n");
        sb.append("Skipped: ").append(skipped).append("\n");
        sb.append("Errors: ").append(errors).append("\n");
        sb.append("Execution Time: ").append(Duration.between(started, Instant.now()).toMillis()).append(" ms\n");
        return sb.toString();
    }

    private static String buildCsvReport(List<AlignmentRecord> records) {
        StringBuilder sb = new StringBuilder();
        sb.append("Song ID,Song Number,Title,Current Key,Reference Key,Interval,Status\n");
        for (AlignmentRecord record : records) {
            sb.append(record.song.getId()).append(",");
            sb.append(record.song.getSongNumber()).append(",");
            sb.append(csvEscape(record.song.getTitle())).append(",");
            sb.append(csvEscape(record.currentKey)).append(",");
            sb.append(csvEscape(record.referenceKey)).append(",");
            sb.append(record.semitones).append(",");
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

    private static class ReferenceEntry {
        private final String title;
        private final String key;
        private final String rawText;

        private ReferenceEntry(String title, String key, String rawText) {
            this.title = title;
            this.key = key;
            this.rawText = rawText;
        }
    }

    private static class AlignmentRecord {
        private final Song song;
        private final String currentKey;
        private final String referenceKey;
        private final int semitones;
        private final String status;

        private AlignmentRecord(Song song, String currentKey, String referenceKey, int semitones, String status) {
            this.song = song;
            this.currentKey = currentKey;
            this.referenceKey = referenceKey;
            this.semitones = semitones;
            this.status = status;
        }

        private static AlignmentRecord updated(Song song, String currentKey, String referenceKey, int semitones, String status) {
            return new AlignmentRecord(song, currentKey, referenceKey, semitones, status);
        }

        private static AlignmentRecord noChange(Song song, String currentKey, String referenceKey, int semitones, String status) {
            return new AlignmentRecord(song, currentKey, referenceKey, semitones, status);
        }

        private static AlignmentRecord skipped(Song song, String status) {
            return new AlignmentRecord(song, null, null, 0, status);
        }

        private static AlignmentRecord error(Song song, String currentKey, String referenceKey, int semitones, String status) {
            return new AlignmentRecord(song, currentKey, referenceKey, semitones, status);
        }
    }
}
