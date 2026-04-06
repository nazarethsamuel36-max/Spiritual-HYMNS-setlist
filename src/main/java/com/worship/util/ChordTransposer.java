package com.worship.util;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Transposes chords by semitones using chromatic scale.
 * Handles major, minor, 7th, sus, dim, aug, sharps, and flats.
 */
public class ChordTransposer {

    // Chromatic scale using most common musician-friendly names
    // Bug #21 fix: Uses flats for Db, Eb, Ab, Bb which are more common than C#, D#, G#, A#
    private static final String[] CHORD_ORDER = {
        "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
    };

    // Mapping to find index for any valid chord name (sharps or flats)
    private static final Map<String, Integer> NAME_TO_INDEX = new HashMap<>();
    static {
        NAME_TO_INDEX.put("C", 0);  NAME_TO_INDEX.put("B#", 0);
        NAME_TO_INDEX.put("C#", 1); NAME_TO_INDEX.put("Db", 1);
        NAME_TO_INDEX.put("D", 2);
        NAME_TO_INDEX.put("D#", 3); NAME_TO_INDEX.put("Eb", 3);
        NAME_TO_INDEX.put("E", 4);  NAME_TO_INDEX.put("Fb", 4);
        NAME_TO_INDEX.put("F", 5);  NAME_TO_INDEX.put("E#", 5);
        NAME_TO_INDEX.put("F#", 6); NAME_TO_INDEX.put("Gb", 6);
        NAME_TO_INDEX.put("G", 7);
        NAME_TO_INDEX.put("G#", 8); NAME_TO_INDEX.put("Ab", 8);
        NAME_TO_INDEX.put("A", 9);
        NAME_TO_INDEX.put("A#", 10); NAME_TO_INDEX.put("Bb", 10);
        NAME_TO_INDEX.put("B", 11);  NAME_TO_INDEX.put("Cb", 11);
    }

    private static final Pattern CHORD_ROOT_PATTERN = Pattern.compile("^([A-G][#b]?)(.*)$");
    private static final Pattern BRACKET_CHORD_PATTERN = Pattern.compile("\\[([A-Ga-g][#b]?[^\\]]*?)\\]");

    /**
     * Transpose a single chord by the given number of semitones.
     * Example: transposeChord("G", 2) → "A"
     *          transposeChord("Bb", 1) → "B"
     */
    public static String transposeChord(String chord, int semitones) {
        if (chord == null || chord.isEmpty() || semitones == 0) return chord;

        Matcher matcher = CHORD_ROOT_PATTERN.matcher(chord);
        if (!matcher.matches()) return chord;

        String root = matcher.group(1);
        String suffix = matcher.group(2); // m, 7, sus4, dim, etc.

        // Bug #21 fix: Lookup index directly to support both sharps/flats
        Integer index = NAME_TO_INDEX.get(root);
        if (index == null) return chord; 

        // Transpose and wrap around 0-11
        int newIndex = ((index + semitones) % 12 + 12) % 12;
        
        return CHORD_ORDER[newIndex] + suffix;
    }

    /**
     * Transpose all chords in a chord line (space-separated).
     */
    public static String transposeChordLine(String chordLine, int semitones) {
        if (chordLine == null || chordLine.isEmpty() || semitones == 0) return chordLine;

        StringBuilder result = new StringBuilder();
        StringBuilder currentChord = new StringBuilder();

        for (int i = 0; i < chordLine.length(); i++) {
            char c = chordLine.charAt(i);
            if (c == ' ') {
                if (currentChord.length() > 0) {
                    result.append(transposeChord(currentChord.toString(), semitones));
                    currentChord.setLength(0);
                }
                result.append(' ');
            } else {
                currentChord.append(c);
            }
        }

        if (currentChord.length() > 0) {
            result.append(transposeChord(currentChord.toString(), semitones));
        }

        return result.toString();
    }

    /**
     * Transpose all [X] bracket chord markers in a full raw lyric string.
     */
    public static String transposeSong(String fullChordLyrics, int semitones) {
        if (fullChordLyrics == null || fullChordLyrics.isEmpty() || semitones == 0) {
            return fullChordLyrics;
        }

        Matcher matcher = BRACKET_CHORD_PATTERN.matcher(fullChordLyrics);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String originalChord = matcher.group(1);
            String transposed = transposeChord(originalChord, semitones);
            matcher.appendReplacement(result, "[" + Matcher.quoteReplacement(transposed) + "]");
        }
        matcher.appendTail(result);

        return result.toString();
    }

    /**
     * Get the resulting key after transposing from originalKey by semitones.
     */
    public static String getKeyAfterTranspose(String originalKey, int semitones) {
        if (originalKey == null || originalKey.isEmpty()) return originalKey;
        return transposeChord(originalKey, semitones);
    }

    public static String getCapoSuggestion(int semitones) {
        int normalized = ((semitones % 12) + 12) % 12;
        if (normalized == 0) return "";

        int capo = 12 - normalized;
        if (capo <= 7) {
            return "Capo " + capo;
        }
        return "";
    }
}
