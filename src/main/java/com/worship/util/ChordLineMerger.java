package com.worship.util;

import com.worship.model.ChordToken;
import java.util.ArrayList;
import java.util.List;

/**
 * Converts "chords-above-lyrics" format into inline bracket format.
 *
 * Input:
 *   G       C       D
 *   Amazing grace how sweet
 *
 * Output:
 *   [G]Amazing [C]grace [D]how sweet
 *
 * This is a PRE-PROCESSOR. Its output feeds directly into the existing
 * ChordParser.parseStructuredLine() pipeline — no changes needed downstream.
 */
public class ChordLineMerger {

    /**
     * Convert an entire song from chords-above format to inline bracket format.
     * Handles section headers, empty lines, and orphan lines gracefully.
     *
     * @param songText Raw song text in chords-above-lyrics format.
     * @return Song text converted to inline bracket format.
     */
    public static String convertToInline(String songText) {
        if (songText == null || songText.trim().isEmpty()) {
            return songText;
        }

        String[] lines = songText.split("\\r?\\n", -1); // preserve trailing empty lines
        List<String> result = new ArrayList<>();

        int i = 0;
        while (i < lines.length) {
            String current = lines[i];

            // Pass through empty lines
            if (current.trim().isEmpty()) {
                result.add(current);
                i++;
                continue;
            }

            // Pass through section headers like {CHORUS} or {VERSE 1}
            if (current.trim().startsWith("{") && current.trim().endsWith("}")) {
                result.add(current);
                i++;
                continue;
            }

            // Check: is this a chord line followed by a lyrics line?
            if (i + 1 < lines.length
                    && SongFormatDetector.isChordLine(current)
                    && SongFormatDetector.isLyricsLine(lines[i + 1])) {

                String chordLine = current;
                String lyricsLine = lines[i + 1];
                result.add(mergePair(chordLine, lyricsLine));
                i += 2; // consumed both lines
                continue;
            }

            // Check: chord line at end of song with no lyrics after it (instrumental marker)
            if (SongFormatDetector.isChordLine(current)) {
                // Standalone chord line → wrap each chord in brackets on its own line
                result.add(wrapStandaloneChordLine(current));
                i++;
                continue;
            }

            // Normal lyrics line (no chords above it) → pass through as-is
            result.add(current);
            i++;
        }

        return String.join("\n", result);
    }

    /**
     * Core merge: takes one chord line and one lyrics line, produces a single
     * inline bracket line.
     *
     * Algorithm:
     * 1. Parse chord positions from the chord line (start index of each token).
     * 2. Walk the lyrics string left-to-right.
     * 3. At each chord position, insert [ChordName] before the lyrics character.
     *
     * Handles:
     * - Chords that extend beyond the lyrics length (appended at end)
     * - Uneven spacing between chords
     * - Multiple consecutive spaces in chord line
     */
    static String mergePair(String chordLine, String lyricsLine) {
        // Step 1: Extract chord tokens with their column positions
        List<ChordPosition> chordPositions = extractChordPositions(chordLine);

        if (chordPositions.isEmpty()) {
            // No valid chords found → return lyrics as-is
            return lyricsLine;
        }

        // Step 2: Build the inline result
        StringBuilder sb = new StringBuilder();
        int lyricsCursor = 0;

        for (ChordPosition cp : chordPositions) {
            int targetCol = cp.column;

            // Append lyrics characters up to this chord's position
            if (targetCol > lyricsCursor && lyricsCursor < lyricsLine.length()) {
                int end = Math.min(targetCol, lyricsLine.length());
                sb.append(lyricsLine, lyricsCursor, end);
                lyricsCursor = end;
            }

            // Insert the bracketed chord
            sb.append('[').append(cp.chord).append(']');
        }

        // Append any remaining lyrics after the last chord
        if (lyricsCursor < lyricsLine.length()) {
            sb.append(lyricsLine.substring(lyricsCursor));
        }

        return sb.toString();
    }

    /**
     * Extract chord names and their column positions from a chord line.
     * "G       C       D" → [(G, 0), (C, 8), (D, 16)]
     */
    static List<ChordPosition> extractChordPositions(String chordLine) {
        List<ChordPosition> positions = new ArrayList<>();

        int i = 0;
        while (i < chordLine.length()) {
            // Skip whitespace
            if (Character.isWhitespace(chordLine.charAt(i))) {
                i++;
                continue;
            }

            // Found start of a token — scan to end of token
            int start = i;
            while (i < chordLine.length() && !Character.isWhitespace(chordLine.charAt(i))) {
                i++;
            }

            String token = chordLine.substring(start, i);

            // Validate it's a real chord using ChordParser
            ChordToken parsed = ChordParser.parseChordToken(token);
            if (parsed.isValid()) {
                positions.add(new ChordPosition(token, start));
            }
            // If invalid, still record it (conservative: keep original text)
            // This handles edge cases like "N.C." or unusual notation
            else {
                positions.add(new ChordPosition(token, start));
            }
        }

        return positions;
    }

    /**
     * Wrap a standalone chord line (no lyrics beneath) into bracket format.
     * "G  C  D" → "[G] [C] [D]"
     */
    static String wrapStandaloneChordLine(String chordLine) {
        String[] tokens = chordLine.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < tokens.length; i++) {
            if (i > 0) sb.append(' ');
            sb.append('[').append(tokens[i]).append(']');
        }
        return sb.toString();
    }

    /**
     * Internal holder for a chord name and its column position in the chord line.
     */
    static class ChordPosition {
        final String chord;
        final int column;

        ChordPosition(String chord, int column) {
            this.chord = chord;
            this.column = column;
        }
    }
}
