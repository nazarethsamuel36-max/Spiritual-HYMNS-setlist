package com.worship.util;

import com.worship.model.ChordOccurrence;
import com.worship.model.ChordToken;
import com.worship.model.StructuredLine;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic Chord Transposer.
 * Implements index-based chromatic mapping and enharmonic resolution.
 */
public class ChordTransposer {

    public enum EnharmonicPref { AUTO, SHARP, FLAT, FORCE_SHARP, FORCE_FLAT, PRESERVE_INPUT_STYLE }

    private static final String[] SHARP_SCALE   = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};
    private static final String[] FLAT_SCALE    = {"C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"};
    private static final String[] AUTO_SCALE    = {"C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"};
    private static final String[] NATURAL_SCALE = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};

    private static final boolean[] AMBIGUOUS_MASK = {false, true, false, true, false, false, true, false, true, false, true, false};

    private static final Map<String, Integer> NAME_TO_INDEX = new HashMap<>();
    static {
        String[] allNames = {
            "C", "0", "B#", "0", "C#", "1", "Db", "1", "D", "2", "D#", "3", "Eb", "3",
            "E", "4", "Fb", "4", "F", "5", "E#", "5", "F#", "6", "Gb", "6", "G", "7",
            "G#", "8", "Ab", "8", "A", "9", "A#", "10", "Bb", "10", "B", "11", "Cb", "11"
        };
        for (int i = 0; i < allNames.length; i += 2) {
            NAME_TO_INDEX.put(allNames[i], Integer.parseInt(allNames[i+1]));
        }
    }

    private static final Pattern BRACKET_PATTERN = Pattern.compile("\\[(.*?)\\]");

    public static String transposeChord(String chordStr, int semitones) {
        return transposeChord(chordStr, semitones, EnharmonicPref.AUTO, false);
    }

    public static String transposeChord(String chordStr, int semitones, EnharmonicPref pref, boolean cleanSlash) {
        return transposeChord(chordStr, semitones, pref, EnharmonicPref.AUTO, cleanSlash);
    }

    private static String transposeChord(String chordStr, int semitones, EnharmonicPref pref, EnharmonicPref globalStyle, boolean cleanSlash) {
        ChordToken token = ChordParser.parseChordToken(chordStr);
        if (!token.isValid()) return chordStr;

        // Transpose Root
        token.setRoot(shiftNote(token.getRoot(), semitones, pref, globalStyle));

        // Transpose Bass
        if (token.getBass() != null) {
            token.setBass(shiftNote(token.getBass(), semitones, pref, globalStyle));
            
            // Optional cleanup (C/C -> C)
            if (cleanSlash && token.getBass().equals(token.getRoot())) {
                token.setBass(null);
            }
        }

        return ChordParser.rebuild(token);
    }

    private static String shiftNote(String note, int semitones, EnharmonicPref pref, EnharmonicPref globalStyle) {
        // 1. Identity Protection
        if (semitones == 0) return note;

        // 2. Resolve Index
        Integer index = NAME_TO_INDEX.get(note);
        if (index == null) return note;

        int newIndex = ((index + semitones) % 12 + 12) % 12;

        // 3. User Override (HIGHEST PRIORITY)
        if (pref == EnharmonicPref.FORCE_SHARP) return SHARP_SCALE[newIndex];
        if (pref == EnharmonicPref.FORCE_FLAT) return FLAT_SCALE[newIndex];

        if (pref == EnharmonicPref.PRESERVE_INPUT_STYLE) {
            if (isSharp(note)) return SHARP_SCALE[newIndex];
            if (isFlat(note)) return FLAT_SCALE[newIndex];
        }

        // 4. Global Style
        if (globalStyle == EnharmonicPref.SHARP) return SHARP_SCALE[newIndex];
        if (globalStyle == EnharmonicPref.FLAT) return FLAT_SCALE[newIndex];

        // 5. Natural Note Shortcut
        if (!AMBIGUOUS_MASK[newIndex]) {
            return NATURAL_SCALE[newIndex];
        }

        // 6. Local Bias (ONLY if ambiguous)
        if (AMBIGUOUS_MASK[newIndex]) {
            if (isSharp(note)) return SHARP_SCALE[newIndex];
            if (isFlat(note)) return FLAT_SCALE[newIndex];
        }

        // 7. Directional AUTO Fallback (LAST RESORT ONLY)
        if (AMBIGUOUS_MASK[newIndex]) {
            if (semitones > 0) return SHARP_SCALE[newIndex];
            if (semitones < 0) return FLAT_SCALE[newIndex];
        }

        // 8. Final Fallback
        return AUTO_SCALE[newIndex];
    }

    private static boolean isSharp(String root) {
        return root.length() > 1 && root.charAt(1) == '#';
    }

    private static boolean isFlat(String root) {
        return root.length() > 1 && root.charAt(1) == 'b';
    }

    public static String transposeSong(String fullChordLyrics, int semitones) {
        return transposeSong(fullChordLyrics, semitones, false);
    }

    public static String transposeSong(String fullChordLyrics, int semitones, boolean cleanSlash) {
        if (fullChordLyrics == null || fullChordLyrics.isEmpty()) return fullChordLyrics;
        if (semitones == 0) return fullChordLyrics;

        // Detect dominant accidental style from input for consistency
        EnharmonicPref globalStyle = detectDominantStyle(fullChordLyrics);

        Matcher matcher = BRACKET_PATTERN.matcher(fullChordLyrics);
        StringBuilder result = new StringBuilder();
        int lastEnd = 0;

        while (matcher.find()) {
            result.append(fullChordLyrics, lastEnd, matcher.start());
            String originalChord = matcher.group(1);
            String transposed = transposeChord(originalChord, semitones, EnharmonicPref.AUTO, globalStyle, cleanSlash);
            result.append("[").append(transposed).append("]");
            lastEnd = matcher.end();
        }
        result.append(fullChordLyrics.substring(lastEnd));

        return result.toString();
    }

    private static EnharmonicPref detectDominantStyle(String input) {
        int sharps = 0;
        int flats = 0;
        // Search inside brackets for chords
        Matcher matcher = BRACKET_PATTERN.matcher(input);
        while (matcher.find()) {
            String chord = matcher.group(1);
            for (char c : chord.toCharArray()) {
                if (c == '#') sharps++;
                if (c == 'b') flats++;
            }
        }
        if (sharps > flats) return EnharmonicPref.SHARP;
        if (flats > sharps) return EnharmonicPref.FLAT;
        return EnharmonicPref.AUTO;
    }

    public static String getKeyAfterTranspose(String originalKey, int semitones) {
        if (originalKey == null || originalKey.isEmpty()) return originalKey;
        return transposeChord(originalKey, semitones);
    }

    public static int getKeyIndex(String key) {
        if (key == null || key.isBlank()) {
            return -1;
        }
        String normalized = key.trim()
                .replace("♭", "b")
                .replace("♯", "#")
                .replace("♌", "")
                .replaceAll("\\s+", "");
        return NAME_TO_INDEX.getOrDefault(normalized, -1);
    }

    public static String getCapoSuggestion(int semitones) {
        int normalized = ((semitones % 12) + 12) % 12;
        if (normalized == 0) return "";
        int capo = 12 - normalized;
        return capo <= 7 ? "Capo " + capo : "";
    }

    /**
     * Transposes all chords within a structured line while maintaining positions.
     */
    public static void transposeStructuredLine(StructuredLine line, int semitones, EnharmonicPref globalStyle, boolean cleanSlash) {
        if (line == null || semitones == 0) return;
        
        for (ChordOccurrence occurrence : line.getChords()) {
            String original = occurrence.getChord();
            String transposed = transposeChord(original, semitones, EnharmonicPref.AUTO, globalStyle, cleanSlash);
            occurrence.setChord(transposed);
        }
    }

    /**
     * Detects dominant accidental style from a list of structured lines.
     */
    public static EnharmonicPref detectStructuredStyle(List<StructuredLine> lines) {
        int sharps = 0;
        int flats = 0;
        for (StructuredLine line : lines) {
            for (ChordOccurrence occ : line.getChords()) {
                String chord = occ.getChord();
                for (char c : chord.toCharArray()) {
                    if (c == '#') sharps++;
                    if (c == 'b') flats++;
                }
            }
        }
        if (sharps > flats) return EnharmonicPref.SHARP;
        if (flats > sharps) return EnharmonicPref.FLAT;
        return EnharmonicPref.AUTO;
    }
}
