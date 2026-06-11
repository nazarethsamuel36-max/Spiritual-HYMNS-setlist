package com.worship.util;

import com.worship.model.ChordToken;
import java.util.regex.Pattern;

/**
 * Detects whether a song's text uses "chords-above-lyrics" format
 * vs the existing inline bracket format [C]Hello [G]world.
 *
 * Detection is CONSERVATIVE: if uncertain, returns INLINE (fail-safe).
 */
public class SongFormatDetector {

    public enum Format {
        INLINE_BRACKET,   // [C]Hello [G]world  (existing system)
        CHORDS_ABOVE      // chord line above lyrics line
    }

    // A chord token: root note + optional modifiers + optional bass
    // Examples: C, Am, F#m7, Bb, Dsus4, G/B, Cmaj7/E
    private static final Pattern CHORD_TOKEN_PATTERN = Pattern.compile(
        "(?i)[A-G][#b]?" +
        "(?:maj|min|dim|aug|sus[24]?|m|5)?" +
        "(?:13|11|9|7|69|6)?" +
        "(?:(?:#|b)(?:13|11|9|5))?" +
        "(?:add(?:13|11|9)|no[35]|2)?" +
        "(?:/[A-G][#b]?)?"
    );

    // A full chord line: only chord tokens separated by whitespace
    private static final Pattern CHORD_LINE_PATTERN = Pattern.compile(
        "^\\s*" + CHORD_TOKEN_PATTERN.pattern() +
        "(?:\\s+" + CHORD_TOKEN_PATTERN.pattern() + ")*\\s*$"
    );

    // Quick check: does the text already contain bracket chords?
    private static final Pattern BRACKET_PATTERN = Pattern.compile("\\[[A-G]");

    /**
     * Detect the format of the entire song text.
     *
     * Rules (in order):
     * 1. If ANY bracket chord is found → INLINE_BRACKET (existing format)
     * 2. If we find at least one chord-line + lyrics-line pair → CHORDS_ABOVE
     * 3. Otherwise → INLINE_BRACKET (fail-safe default)
     */
    public static Format detect(String songText) {
        if (songText == null || songText.trim().isEmpty()) {
            return Format.INLINE_BRACKET;
        }

        // Rule 1: Brackets present → already inline
        if (BRACKET_PATTERN.matcher(songText).find()) {
            return Format.INLINE_BRACKET;
        }

        // Rule 2: Scan for chord-above-lyrics pairs
        String[] lines = songText.split("\\r?\\n");
        int pairsFound = 0;

        for (int i = 0; i < lines.length - 1; i++) {
            String current = lines[i];
            String next = lines[i + 1];

            if (isChordLine(current) && isLyricsLine(next)) {
                pairsFound++;
                i++; // skip the lyrics line, move to next potential pair
            }
        }

        // Need at least 2 pairs to be confident, or 1 pair if the song is very short
        if (pairsFound >= 2 || (pairsFound == 1 && lines.length <= 4)) {
            return Format.CHORDS_ABOVE;
        }

        // Rule 3: Fail-safe
        return Format.INLINE_BRACKET;
    }

    /**
     * Check if a line consists ONLY of valid chord tokens separated by spaces.
     * Must have at least one chord token and NO lowercase words.
     */
    public static boolean isChordLine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return false;
        }

        String trimmed = line.trim();

        // Must match the full chord line pattern
        if (!CHORD_LINE_PATTERN.matcher(trimmed).matches()) {
            return false;
        }

        // Extract individual tokens and validate each one
        String[] tokens = trimmed.split("\\s+");
        if (tokens.length == 0) {
            return false;
        }

        int validChords = 0;
        for (String token : tokens) {
            if (token.isEmpty()) continue;

            // Each token must start with A-G (case-insensitive but typically uppercase)
            ChordToken parsed = ChordParser.parseChordToken(token);
            if (parsed.isValid()) {
                validChords++;
            } else {
                // One invalid token → not a chord line
                return false;
            }
        }

        return validChords > 0;
    }

    /**
     * Check if a line is a lyrics line (contains actual words, not just chords).
     * A lyrics line must have at least one lowercase letter or non-ASCII character.
     */
    public static boolean isLyricsLine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return false;
        }

        String trimmed = line.trim();

        // Section headers like {CHORUS} or {VERSE 1} are not lyrics
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            return false;
        }

        // Must contain at least one lowercase letter OR non-ASCII (for Hindi/Marathi)
        for (char c : trimmed.toCharArray()) {
            if (Character.isLowerCase(c)) return true;
            if (c > 127) return true; // Non-ASCII (Hindi, Marathi, etc.)
        }

        // If it's ALL CAPS, check if it's also a valid chord line
        // If it IS a valid chord line → not lyrics
        // If it's NOT a valid chord line → it's likely a lyrics line in caps
        return !isChordLine(trimmed);
    }
}
