package com.worship.util;

import com.worship.model.ChordOccurrence;
import com.worship.model.ChordToken;
import com.worship.model.StructuredLine;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Authoritative Chord Engine Parser.
 * Implements the deterministic multi-stage parsing pipeline.
 */
public class ChordParser {

    private static final Pattern BRACKET_PATTERN = Pattern.compile("\\[(.*?)\\]");
    private static final Pattern ROOT_PATTERN = Pattern.compile("(?i)^([A-G][#b]?)");
    
    // Prioritized patterns
    private static final String[] EXTENSIONS = {"maj13", "maj11", "maj9", "maj7", "13", "11", "9", "7", "69", "6"};
    private static final String[] QUALITIES = {"min", "dim", "aug", "sus4", "sus2", "sus", "m", "5"};
    private static final String[] ALTERATIONS = {"#13", "b13", "#11", "b11", "#9", "b9", "#5", "b5"};
    private static final String[] ADDITIONS = {"add13", "add11", "add9", "no5", "no3", "2"};

    /**
     * Parse a single chord string (e.g., "Cmaj7/E") into a structured Token.
     */
    public static ChordToken parseChordToken(String input) {
        if (input == null || input.trim().isEmpty()) {
            return new ChordToken(input);
        }

        String raw = input.trim();
        ChordToken token = new ChordToken(raw);

        // 1. Slash Handling
        String body = raw;
        String bass = null;
        if (raw.contains("/")) {
            String[] parts = raw.split("/");
            if (parts.length != 2) return token; // Invalid chord
            body = parts[0];
            bass = parts[1];
            // Validate bass root
            Matcher bassMatcher = ROOT_PATTERN.matcher(bass);
            if (!bassMatcher.matches()) return token;
            // Normalize bass (e.g. 'f#' -> 'F#', 'bb' -> 'Bb')
            String b = bassMatcher.group(1);
            String normB = b.substring(0, 1).toUpperCase() + (b.length() > 1 ? b.substring(1).toLowerCase() : "");
            token.setBass(normB);
        }

        // 2. Root Extraction
        Matcher rootMatcher = ROOT_PATTERN.matcher(body);
        if (!rootMatcher.find()) return token;
        String rootPart = rootMatcher.group(1);
        // Normalize root (e.g. 'c' -> 'C')
        String normRoot = rootPart.substring(0, 1).toUpperCase() + (rootPart.length() > 1 ? rootPart.substring(1).toLowerCase() : "");
        token.setRoot(normRoot);
        String remaining = body.substring(rootPart.length());

        // 3. Greedy Modifier Loop
        remaining = parseModifiers(remaining, token);

        // 4. Final Validation
        if (remaining.isEmpty()) {
            token.setValid(true);
        }

        return token;
    }

    private static String parseModifiers(String remaining, ChordToken token) {
        String current = remaining.replace("(", "").replace(")", ""); // Handle parentheses bridge
        
        boolean matched;
        int safetyCounter = 0;
        do {
            matched = false;
            String lowerCurrent = current.toLowerCase();
            
            // Try Quality
            for (String q : QUALITIES) {
                if (lowerCurrent.startsWith(q)) {
                    // Prevent 'm' from swallowing 'maj' extensions
                    if (q.equals("m") && lowerCurrent.startsWith("maj")) continue;
                    
                    if (token.getQuality() == null) {
                        // Conflict: if we already matched a 'maj' extension, 'm' quality is invalid
                        if (q.equals("m") && token.getExtensions().stream().anyMatch(e -> e.startsWith("maj"))) {
                            return current;
                        }
                        String normalizedQ = q.equals("sus") ? "sus4" : (q.equals("min") ? "m" : q);
                        token.setQuality(normalizedQ);
                        current = current.substring(q.length());
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) continue;

            // Try Extension
            for (String e : EXTENSIONS) {
                if (lowerCurrent.startsWith(e)) {
                    // Rulebook Conflict Check: m + maj7 is invalid (Conflicting Quality)
                    if (e.startsWith("maj") && "m".equals(token.getQuality())) {
                        return current; // Stop and leave residue
                    }

                    if (!token.getExtensions().contains(e)) {
                        // Conflict: maj7 overrides 7
                        if (e.equals("7") && token.getExtensions().contains("maj7")) {
                            // already has maj7, skip 7
                            current = current.substring(e.length());
                            matched = true;
                        } else if (e.equals("maj7")) {
                            token.getExtensions().remove("7");
                            token.getExtensions().add(e);
                            current = current.substring(e.length());
                            matched = true;
                        } else {
                            token.getExtensions().add(e);
                            current = current.substring(e.length());
                            matched = true;
                        }
                    } else {
                        // duplicate, consume and move on
                        current = current.substring(e.length());
                        matched = true;
                    }
                    break;
                }
            }
            if (matched) continue;

            // Try Alteration
            for (String a : ALTERATIONS) {
                if (lowerCurrent.startsWith(a)) {
                    if (!token.getAlterations().contains(a)) {
                        token.getAlterations().add(a);
                    }
                    current = current.substring(a.length());
                    matched = true;
                    break;
                }
            }
            if (matched) continue;

            // Try Addition
            for (String ad : ADDITIONS) {
                if (lowerCurrent.startsWith(ad)) {
                    String cleanAd = ad.equals("2") ? "add9" : ad;
                    if (!token.getAdditions().contains(cleanAd)) {
                        token.getAdditions().add(cleanAd);
                    }
                    current = current.substring(ad.length());
                    matched = true;
                    break;
                }
            }

            safetyCounter++;
        } while (matched && !current.isEmpty() && safetyCounter < 50);

        return current;
    }

    /**
     * Rebuild a chord string from a structured token.
     * Enforces strict ordering and deterministic sorting.
     */
    public static String rebuild(ChordToken token) {
        if (!token.isValid()) return token.getOriginalInput();

        StringBuilder sb = new StringBuilder();
        sb.append(token.getRoot());
        if (token.getQuality() != null) sb.append(token.getQuality());

        // Sort extensions, alterations, additions
        token.getExtensions().stream().sorted(Comparator.naturalOrder()).forEach(sb::append);
        token.getAlterations().stream().sorted(Comparator.naturalOrder()).forEach(sb::append);
        token.getAdditions().stream().sorted(Comparator.naturalOrder()).forEach(sb::append);

        if (token.getBass() != null) {
            sb.append("/").append(token.getBass());
        }

        return sb.toString();
    }

    // Existing methods adapted to use the new engine
    public static String[] parseChordLine(String rawLyricWithChords) {
        if (rawLyricWithChords == null || rawLyricWithChords.isEmpty()) {
            return new String[]{"", ""};
        }

        StringBuilder chordLine = new StringBuilder();
        StringBuilder lyricLine = new StringBuilder();
        Matcher matcher = BRACKET_PATTERN.matcher(rawLyricWithChords);
        int lastEnd = 0;

        while (matcher.find()) {
            String textBefore = rawLyricWithChords.substring(lastEnd, matcher.start());
            lyricLine.append(textBefore);
            while (chordLine.length() < lyricLine.length()) chordLine.append(' ');

            String rawChord = matcher.group(1);
            ChordToken t = parseChordToken(rawChord);
            chordLine.append(rebuild(t));

            lastEnd = matcher.end();
        }
        if (lastEnd < rawLyricWithChords.length()) {
            lyricLine.append(rawLyricWithChords.substring(lastEnd));
        }

        return new String[]{chordLine.toString(), lyricLine.toString()};
    }

    public static List<String[]> parseFullSong(String fullChordLyrics) {
        List<String[]> result = new ArrayList<>();
        if (fullChordLyrics == null || fullChordLyrics.isEmpty()) return result;
        String[] lines = fullChordLyrics.split("\\r?\\n");
        for (String line : lines) result.add(parseChordLine(line));
        return result;
    }

    public static List<String> extractChords(String chordLyrics) {
        List<String> chords = new ArrayList<>();
        if (chordLyrics == null) return chords;
        Matcher matcher = BRACKET_PATTERN.matcher(chordLyrics);
        while (matcher.find()) {
            String c = rebuild(parseChordToken(matcher.group(1)));
            if (!chords.contains(c)) chords.add(c);
        }
        return chords;
    }

    // --- POSITION-BASED RENDERING ENGINE ---

    /**
     * Normalizes input by replacing tabs and NBSP with standard spaces,
     * and removing zero-width characters to prevent alignment drift.
     */
    public static String normalizeInput(String input) {
        if (input == null) return null;
        return input.replace("\t", " ")
                    .replace("\u00A0", " ")
                    .replaceAll("[\u200B\u200C\u200D\uFEFF]", ""); // Strip all zero-width characters to prevent position drift
    }

    /**
     * Authoritative cursor-based parser.
     * Extracts structured coordinates: { lyrics, chords: [{chord, position}] }
     */
    public static StructuredLine parseStructuredLine(String rawLine) {
        if (rawLine == null) return new StructuredLine("");
        
        String input = normalizeInput(rawLine);
        StringBuilder lyrics = new StringBuilder();
        List<ChordOccurrence> chords = new ArrayList<>();
        
        int cursor = 0;
        int i = 0;
        while (i < input.length()) {
            char c = input.charAt(i);
            
            if (c == '[') {
                int closingIndex = input.indexOf(']', i);
                int nextOpenBracket = input.indexOf('[', i + 1);
                
                // If there's a nested '[' before the ']', it's malformed (e.g. "[C[Am]]Word")
                // Or if no closing bracket exists (e.g. "[CWord")
                if (closingIndex != -1 && (nextOpenBracket == -1 || nextOpenBracket > closingIndex)) {
                    String chordText = input.substring(i + 1, closingIndex).trim();
                    // Skip entirely empty brackets (e.g. "[]Word")
                    if (!chordText.isEmpty()) {
                        // Clamp position to current lyrics length to handle trailing markers
                        int position = Math.max(0, Math.min(cursor, lyrics.length()));
                        chords.add(new ChordOccurrence(chordText, position));
                    }
                    i = closingIndex + 1; // Move after ']'
                    continue;
                } else {
                    // Malformed: treat '[' as normal character
                    lyrics.append(c);
                    cursor++;
                }
            } else {
                lyrics.append(c);
                cursor++;
            }
            i++;
        }
        
        StructuredLine line = new StructuredLine(lyrics.toString());
        line.setChords(chords);
        return line;
    }

    /**
     * Parses a full bracketed text into a list of structured lines.
     */
    public static List<StructuredLine> parseStructuredSong(String fullSong) {
        List<StructuredLine> result = new ArrayList<>();
        if (fullSong == null || fullSong.isEmpty()) return result;
        
        String[] lines = fullSong.split("\\r?\\n");
        for (String line : lines) {
            result.add(parseStructuredLine(line));
        }
        return result;
    }
}
