package com.worship.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses chord-lyric strings in bracket format: [G]Amazing [Em]grace
 * Outputs aligned chord lines and clean lyric lines.
 */
public class ChordParser {

    // Pattern to match chord markers: [G], [Em], [C#m7], [Bb/D], etc.
    private static final Pattern CHORD_PATTERN = Pattern.compile("\\[([A-Ga-g][#b]?[^\\]]*?)\\]");

    /**
     * Parse a single line containing bracket-format chords.
     * Input:  "[G]Amazing [Em]grace how [C]sweet the [G]sound"
     * Output: String[0] = "G           Em        C          G"
     *         String[1] = "Amazing grace how sweet the sound"
     */
    public static String[] parseChordLine(String rawLyricWithChords) {
        if (rawLyricWithChords == null || rawLyricWithChords.isEmpty()) {
            return new String[]{"", ""};
        }

        // If no chords found, return as plain lyric
        if (!rawLyricWithChords.contains("[")) {
            return new String[]{"", rawLyricWithChords};
        }

        StringBuilder chordLine = new StringBuilder();
        StringBuilder lyricLine = new StringBuilder();

        Matcher matcher = CHORD_PATTERN.matcher(rawLyricWithChords);
        int lastEnd = 0;

        while (matcher.find()) {
            // Get text before this chord marker
            String textBefore = rawLyricWithChords.substring(lastEnd, matcher.start());
            lyricLine.append(textBefore);

            // Pad chord line to align with current lyric position
            while (chordLine.length() < lyricLine.length()) {
                chordLine.append(' ');
            }

            // Add the chord name
            String chord = matcher.group(1);
            chordLine.append(chord);

            lastEnd = matcher.end();
        }

        // Append any remaining text after the last chord
        if (lastEnd < rawLyricWithChords.length()) {
            lyricLine.append(rawLyricWithChords.substring(lastEnd));
        }

        return new String[]{chordLine.toString(), lyricLine.toString()};
    }

    /**
     * Parse a full song with multiple lines of bracket-format chord-lyrics.
     * Returns a list of [chordLine, lyricLine] pairs.
     */
    public static List<String[]> parseFullSong(String fullChordLyrics) {
        List<String[]> result = new ArrayList<>();

        if (fullChordLyrics == null || fullChordLyrics.isEmpty()) {
            return result;
        }

        String[] lines = fullChordLyrics.split("\\r?\\n");

        for (String line : lines) {
            result.add(parseChordLine(line));
        }

        return result;
    }

    /**
     * Extract all unique chords from a chord-lyric string.
     */
    public static List<String> extractChords(String chordLyrics) {
        List<String> chords = new ArrayList<>();
        if (chordLyrics == null) return chords;

        Matcher matcher = CHORD_PATTERN.matcher(chordLyrics);
        while (matcher.find()) {
            String chord = matcher.group(1);
            if (!chords.contains(chord)) {
                chords.add(chord);
            }
        }
        return chords;
    }
}
