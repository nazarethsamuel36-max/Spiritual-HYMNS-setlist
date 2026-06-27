package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JsonDatabaseTransposer {

    private static final List<String> SHARP_NOTES = List.of(
            "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
    );

    private static final Map<String, Integer> NOTE_TO_SEMITONE = createNoteMap();

    private static final Map<String, String> FLAT_TO_SHARP = Map.of(
            "DB", "C#",
            "EB", "D#",
            "GB", "F#",
            "AB", "G#",
            "BB", "A#",
            "CB", "B",
            "FB", "E"
    );

    public static void main(String[] args) {
        String jsonPath = "refernece.json";
        Path path = Paths.get(jsonPath);

        if (!Files.exists(path)) {
            System.err.println("Reference JSON file not found: " + path.toAbsolutePath());
            return;
        }

        try {
            List<ReferenceSong> referenceSongs = readReferenceFile(path);

            try (Connection connection = DBConnection.getConnection()) {
                connection.setAutoCommit(false);

                String selectSql = "SELECT id, original_key, chords FROM songs WHERE language = ? AND song_number = ?";
                String updateSql = "UPDATE songs SET original_key = ?, chords = ? WHERE id = ?";

                try (PreparedStatement selectStmt = connection.prepareStatement(selectSql);
                     PreparedStatement updateStmt = connection.prepareStatement(updateSql)) {

                    for (ReferenceSong item : referenceSongs) {
                        try {
                            String language = item.language().trim().toLowerCase(Locale.ROOT);
                            int number = item.number();
                            String targetKey = item.key().trim();

                            selectStmt.setString(1, language);
                            selectStmt.setInt(2, number);

                            try (ResultSet rs = selectStmt.executeQuery()) {
                                if (!rs.next()) {
                                    System.out.printf("Skipping %s_%d: no matching song found.%n", language, number);
                                    continue;
                                }

                                int songId = rs.getInt("id");
                                String originalKey = rs.getString("original_key");
                                String chords = rs.getString("chords");

                                if (originalKey == null || originalKey.isBlank()) {
                                    String updatedChords = chords;
                                    updateStmt.setString(1, targetKey);
                                    updateStmt.setString(2, updatedChords);
                                    updateStmt.setInt(3, songId);
                                    updateStmt.executeUpdate();
                                    System.out.printf("Updated %s_%d: set original_key=%s (was empty), chords unchanged.%n",
                                            language, number, targetKey);
                                    continue;
                                }

                                int delta = computeSemitoneDelta(originalKey, targetKey);
                                String updatedChords = chords;
                                if (delta != 0 && chords != null) {
                                    updatedChords = transposeChordText(chords, delta);
                                }

                                updateStmt.setString(1, targetKey);
                                updateStmt.setString(2, updatedChords);
                                updateStmt.setInt(3, songId);
                                updateStmt.executeUpdate();

                                String deltaLabel = delta == 0 ? "0" : (delta > 6 ? "-" + (12 - delta) : "+" + delta);
                                System.out.printf("Updated %s_%d: original_key %s -> %s, transposed chords by %s semitones.%n",
                                        language, number, originalKey, targetKey, deltaLabel);
                            }
                        } catch (IllegalArgumentException e) {
                            System.err.printf("Skipping %s_%d: Invalid key format - %s%n", item.language(), item.number(), e.getMessage());
                        }
                    }
                }

                connection.commit();
                System.out.println("Completed JSON database update successfully.");
            }
        } catch (Exception e) {
            System.err.println("Error during JSON DB transpose: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static List<ReferenceSong> readReferenceFile(Path path) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        try (InputStream in = Files.newInputStream(path)) {
            return mapper.readValue(in, new TypeReference<>() {});
        }
    }

    private static int computeSemitoneDelta(String fromKey, String toKey) {
        Integer fromIndex = NOTE_TO_SEMITONE.get(normalizeNoteName(fromKey));
        Integer toIndex = NOTE_TO_SEMITONE.get(normalizeNoteName(toKey));

        if (fromIndex == null || toIndex == null) {
            throw new IllegalArgumentException("Unsupported key: " + fromKey + " or " + toKey);
        }

        int delta = (toIndex - fromIndex) % 12;
        if (delta < 0) {
            delta += 12;
        }
        return delta;
    }

    private static String transposeChordText(String chordText, int delta) {
        if (chordText == null || chordText.isBlank()) {
            return chordText;
        }

        Pattern bracketPattern = Pattern.compile("\\[([^\\]]+)]");
        Matcher matcher = bracketPattern.matcher(chordText);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String original = matcher.group(1);
            String transposed = transposeChordToken(original, delta);
            matcher.appendReplacement(sb, Matcher.quoteReplacement("[" + transposed + "]"));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private static String transposeChordToken(String chordToken, int delta) {
        String[] parts = chordToken.split("/", 2);
        String rootPart = parts[0];
        String bassPart = parts.length > 1 ? parts[1] : null;

        String transposedRoot = transposeSingleChord(rootPart, delta);
        if (bassPart == null) {
            return transposedRoot;
        }

        String transposedBass = transposeSingleChord(bassPart, delta);
        return transposedRoot + "/" + transposedBass;
    }

    private static String transposeSingleChord(String chord, int delta) {
        Pattern chordPattern = Pattern.compile("^([A-Ga-g])([#b]?)(.*)$");
        Matcher matcher = chordPattern.matcher(chord.trim());
        if (!matcher.matches()) {
            return chord;
        }

        String note = matcher.group(1).toUpperCase(Locale.ROOT) + matcher.group(2);
        String suffix = matcher.group(3);

        String transposedNote = transposeNoteName(note, delta);
        return transposedNote + suffix;
    }

    private static String transposeNoteName(String noteName, int delta) {
        String normalized = normalizeNoteName(noteName);
        Integer index = NOTE_TO_SEMITONE.get(normalized);
        if (index == null) {
            return noteName;
        }

        int newIndex = (index + delta) % 12;
        if (newIndex < 0) {
            newIndex += 12;
        }
        return SHARP_NOTES.get(newIndex);
    }

    private static String normalizeNoteName(String noteName) {
        if (noteName == null || noteName.isBlank()) {
            return noteName;
        }

        String normalized = noteName.trim().toUpperCase(Locale.ROOT);
        if (normalized.length() >= 2 && normalized.charAt(1) == 'B') {
            return FLAT_TO_SHARP.getOrDefault(normalized, normalized);
        }
        return normalized;
    }

    private static Map<String, Integer> createNoteMap() {
        Map<String, Integer> map = new LinkedHashMap<>();
        map.put("C", 0);
        map.put("C#", 1);
        map.put("D", 2);
        map.put("D#", 3);
        map.put("E", 4);
        map.put("F", 5);
        map.put("F#", 6);
        map.put("G", 7);
        map.put("G#", 8);
        map.put("A", 9);
        map.put("A#", 10);
        map.put("B", 11);
        return map;
    }

    private static record ReferenceSong(String language, int number, String title, String key) {}
}
