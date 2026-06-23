package com.worship.chord;

import com.worship.model.*;
import com.worship.util.ChordParser;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Core Chord Alignment Engine.
 *
 * Orchestrates the full pipeline:
 *   1. Parse external text → StructuredLine (reuses ChordParser)
 *   2. Normalize & match lines (Levenshtein)
 *   3. Transfer chord positions (direct or Needleman-Wunsch alignment)
 *   4. Compute confidence and flag decisions
 *
 * RULES:
 *   - DB lyrics are NEVER modified
 *   - Only chord positions (line_id, chord, char_index) are output
 *   - External text is discarded after processing
 */
public class ChordAligner {

    // Thresholds
    private static final double DIRECT_TRANSFER_THRESHOLD = 0.95;
    private static final double ACCEPT_THRESHOLD = 0.70;
    private static final double REVIEW_THRESHOLD = 0.40;

    private static final double CONFIDENCE_AUTO_ACCEPT = 0.75;
    private static final double CONFIDENCE_FLAGGED     = 0.50;

    private static final double PATTERN_SIMILARITY_THRESHOLD = 0.80;

    // Needleman-Wunsch scores
    private static final int NW_MATCH    =  2;
    private static final int NW_MISMATCH = -1;
    private static final int NW_GAP      = -1;

    private static final Pattern SECTION_HEADER = Pattern.compile(
        "^\\s*\\[?(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Interlude|Tag)\\s*\\d*\\]?\\s*:?\\s*$",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Main entry point: align external chorded text onto a DB song's structured lines.
     *
     * @param dbSong   The song with sections and lines loaded from DB
     * @param extText  Raw external text with bracket chords (e.g., "[C]Amazing [G]grace")
     * @return SongMappingResult with per-line chord positions and confidence
     */
    public SongMappingResult align(Song dbSong, String extText) {
        SongMappingResult result = new SongMappingResult(dbSong.getId());
        result.setSourceInfo("manual");

        if (extText == null || extText.trim().isEmpty()) return result;
        if (dbSong.getSections() == null || dbSong.getSections().isEmpty()) return result;

        // Step 1: Parse external text into sections of StructuredLines
        List<ExtSection> extSections = parseExternal(extText);

        // Step 2: Match external sections to DB sections
        Map<Section, ExtSection> sectionPairs = matchSections(dbSong.getSections(), extSections);

        // Flag extra external sections
        if (extSections.size() > dbSong.getSections().size()) {
            result.addGlobalFlag("EXTRA_SECTION");
        }

        // Step 3 & 4: For each matched section, match and align lines
        for (Section dbSection : dbSong.getSections()) {
            ExtSection extSection = sectionPairs.get(dbSection);
            if (extSection == null) {
                // No matching external section — mark all lines as unmatched
                for (SongLine dbLine : dbSection.getLines()) {
                    LineMappingResult lr = new LineMappingResult(dbLine.getId(), dbLine.getText());
                    lr.setConfidence(0.0);
                    lr.addFlag("UNMATCHED_LINE");
                    result.addLineResult(lr);
                }
                continue;
            }

            alignSection(dbSection, extSection, result);
        }

        // Step 5: Detect PATTERN_CANDIDATE
        detectPatternCandidates(dbSong, result);

        result.computeOverallConfidence();
        return result;
    }

    /**
     * Parse raw external text into sections, each containing StructuredLines.
     */
    public List<ExtSection> parseExternal(String rawText) {
        List<ExtSection> sections = new ArrayList<>();
        ExtSection current = new ExtSection("unknown", "");

        String[] lines = rawText.split("\\r?\\n");
        for (int i = 0; i < lines.length; i++) {
            String rawLine = lines[i];
            String trimmed = rawLine.trim();
            if (trimmed.isEmpty()) continue;

            Matcher m = SECTION_HEADER.matcher(trimmed);
            if (m.matches()) {
                if (!current.lines.isEmpty()) sections.add(current);
                current = new ExtSection(m.group(1).toLowerCase(), trimmed);
                continue;
            }

            // Two-line detection:
            // If current line is chord-only AND next line exists AND is NOT chord-only AND NOT a header
            if (ChordParser.isChordOnlyLine(rawLine) && i + 1 < lines.length) {
                String nextLine = lines[i + 1];
                if (!nextLine.trim().isEmpty() && 
                    !SECTION_HEADER.matcher(nextLine.trim()).matches() && 
                    !ChordParser.isChordOnlyLine(nextLine)) {
                    
                    // Combine them
                    List<ChordOccurrence> chords = ChordParser.parseChordOnlyLine(rawLine);
                    StructuredLine sl = new StructuredLine(nextLine); // Keep spaces for alignment
                    sl.setChords(chords);
                    current.lines.add(sl);
                    i++; // Skip the next line
                    continue;
                }
            }

            // Parse as chord+lyric line (bracketed format)
            StructuredLine sl = ChordParser.parseStructuredLine(rawLine);
            if (sl.getLyrics() != null && !sl.getLyrics().trim().isEmpty()) {
                current.lines.add(sl);
            }
        }

        if (!current.lines.isEmpty()) sections.add(current);
        return sections;
    }

    /**
     * Match DB sections to external sections by type, then by content similarity.
     */
    public Map<Section, ExtSection> matchSections(List<Section> dbSections, List<ExtSection> extSections) {
        Map<Section, ExtSection> pairs = new LinkedHashMap<>();
        Set<Integer> usedExt = new HashSet<>();

        // Pass 1: Match by type (verse↔verse, chorus↔chorus) in order
        Map<String, Queue<Integer>> extByType = new LinkedHashMap<>();
        for (int i = 0; i < extSections.size(); i++) {
            extByType.computeIfAbsent(extSections.get(i).type, k -> new LinkedList<>()).add(i);
        }

        for (Section dbSec : dbSections) {
            String dbType = dbSec.getType() != null ? dbSec.getType().toLowerCase() : "unknown";
            Queue<Integer> queue = extByType.get(dbType);
            if (queue != null && !queue.isEmpty()) {
                int idx = queue.poll();
                pairs.put(dbSec, extSections.get(idx));
                usedExt.add(idx);
            }
        }

        // Pass 2: For unmatched DB sections, use text similarity
        for (Section dbSec : dbSections) {
            if (pairs.containsKey(dbSec)) continue;
            String dbFirst = getFirstLineText(dbSec);
            if (dbFirst.isEmpty()) continue;

            double bestScore = 0;
            int bestIdx = -1;
            for (int i = 0; i < extSections.size(); i++) {
                if (usedExt.contains(i)) continue;
                String extFirst = extSections.get(i).lines.isEmpty() ? ""
                    : extSections.get(i).lines.get(0).getLyrics();
                double score = levenshteinSimilarity(normalize(dbFirst), normalize(extFirst));
                if (score > bestScore) {
                    bestScore = score;
                    bestIdx = i;
                }
            }
            if (bestIdx >= 0 && bestScore >= REVIEW_THRESHOLD) {
                pairs.put(dbSec, extSections.get(bestIdx));
                usedExt.add(bestIdx);
            }
        }

        return pairs;
    }

    /**
     * Align lines within a matched section pair.
     */
    private void alignSection(Section dbSection, ExtSection extSection, SongMappingResult result) {
        Set<Integer> usedExt = new HashSet<>();

        for (SongLine dbLine : dbSection.getLines()) {
            String dbText = dbLine.getText();
            String dbNorm = normalize(dbText);

            // Find best matching external line
            double bestScore = 0;
            int bestIdx = -1;
            for (int i = 0; i < extSection.lines.size(); i++) {
                if (usedExt.contains(i)) continue;
                String extNorm = normalize(extSection.lines.get(i).getLyrics());
                double score = levenshteinSimilarity(dbNorm, extNorm);
                if (score > bestScore) {
                    bestScore = score;
                    bestIdx = i;
                }
            }

            LineMappingResult lr = new LineMappingResult(dbLine.getId(), dbText);

            if (bestIdx < 0 || bestScore < REVIEW_THRESHOLD) {
                lr.setConfidence(0.0);
                lr.addFlag("UNMATCHED_LINE");
                result.addLineResult(lr);
                continue;
            }

            usedExt.add(bestIdx);
            StructuredLine extLine = extSection.lines.get(bestIdx);

            if (extLine.getChords() == null || extLine.getChords().isEmpty()) {
                // External line has no chords — nothing to transfer
                lr.setConfidence(bestScore);
                lr.addFlag("NO_CHORDS_IN_SOURCE");
                result.addLineResult(lr);
                continue;
            }

            // Transfer chord positions
            List<ChordOccurrence> mapped;
            double mappingAccuracy;

            if (bestScore >= DIRECT_TRANSFER_THRESHOLD) {
                // Direct transfer — positions match 1:1
                mapped = directTransfer(dbText, extLine);
                mappingAccuracy = 1.0;
            } else {
                // Character-level alignment
                String extPlain = extLine.getLyrics();
                int[] posMap = buildPositionMap(extPlain, dbText);
                mapped = alignedTransfer(extLine.getChords(), posMap, dbText.length());
                mappingAccuracy = computeMappingAccuracy(posMap);
            }

            lr.setChordPositions(mapped);

            // Confidence = similarity × mappingAccuracy
            double confidence = bestScore * mappingAccuracy;
            lr.setConfidence(confidence);

            if (bestScore < ACCEPT_THRESHOLD) {
                lr.addFlag("LOW_CONFIDENCE");
            }
            if (confidence < CONFIDENCE_FLAGGED) {
                lr.addFlag("LOW_CONFIDENCE");
            }

            result.addLineResult(lr);
        }
    }

    /**
     * Direct transfer: chord positions map 1:1 from external to DB text.
     * Validates each position and clamps to DB text length.
     */
    List<ChordOccurrence> directTransfer(String dbText, StructuredLine extLine) {
        List<ChordOccurrence> result = new ArrayList<>();
        for (ChordOccurrence ext : extLine.getChords()) {
            int pos = Math.max(0, Math.min(ext.getPosition(), dbText.length()));
            result.add(new ChordOccurrence(ext.getChord(), pos));
        }
        Collections.sort(result);
        return result;
    }

    /**
     * Aligned transfer: use Needleman-Wunsch position map to translate
     * external chord positions to DB text positions.
     */
    List<ChordOccurrence> alignedTransfer(List<ChordOccurrence> extChords, int[] posMap, int dbLen) {
        List<ChordOccurrence> result = new ArrayList<>();
        for (ChordOccurrence ext : extChords) {
            int extPos = ext.getPosition();
            int dbPos;

            if (extPos < posMap.length && posMap[extPos] >= 0) {
                dbPos = posMap[extPos];
            } else {
                // Find nearest mapped position
                dbPos = findNearestMapped(posMap, extPos);
            }

            dbPos = Math.max(0, Math.min(dbPos, dbLen));
            result.add(new ChordOccurrence(ext.getChord(), dbPos));
        }
        Collections.sort(result);
        return result;
    }

    /**
     * Build position map using Needleman-Wunsch global alignment.
     * posMap[extIndex] = dbIndex, or -1 if the ext char maps to a gap.
     */
    public int[] buildPositionMap(String extText, String dbText) {
        int m = extText.length();
        int n = dbText.length();

        if (m == 0) return new int[0];
        if (n == 0) {
            int[] map = new int[m];
            Arrays.fill(map, 0);
            return map;
        }

        // DP matrix
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i * NW_GAP;
        for (int j = 0; j <= n; j++) dp[0][j] = j * NW_GAP;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                int match = dp[i - 1][j - 1] +
                    (Character.toLowerCase(extText.charAt(i - 1)) == Character.toLowerCase(dbText.charAt(j - 1))
                        ? NW_MATCH : NW_MISMATCH);
                int gapExt = dp[i - 1][j] + NW_GAP;
                int gapDb  = dp[i][j - 1] + NW_GAP;
                dp[i][j] = Math.max(match, Math.max(gapExt, gapDb));
            }
        }

        // Traceback
        int[] posMap = new int[m];
        Arrays.fill(posMap, -1);

        int i = m, j = n;
        while (i > 0 && j > 0) {
            int score = dp[i][j];
            int diagScore = dp[i - 1][j - 1] +
                (Character.toLowerCase(extText.charAt(i - 1)) == Character.toLowerCase(dbText.charAt(j - 1))
                    ? NW_MATCH : NW_MISMATCH);

            if (score == diagScore) {
                posMap[i - 1] = j - 1; // ext char i-1 maps to db char j-1
                i--; j--;
            } else if (score == dp[i - 1][j] + NW_GAP) {
                // ext char has no match (gap in DB)
                i--;
            } else {
                // DB char has no match (gap in ext)
                j--;
            }
        }
        // Remaining ext chars map to gap (posMap already -1)

        return posMap;
    }

    /**
     * Find nearest mapped position for an unmapped external index.
     */
    private int findNearestMapped(int[] posMap, int targetIdx) {
        // Search outward from targetIdx
        for (int offset = 1; offset < posMap.length; offset++) {
            int before = targetIdx - offset;
            int after  = targetIdx + offset;
            if (before >= 0 && posMap[before] >= 0) return posMap[before];
            if (after < posMap.length && posMap[after] >= 0) return posMap[after];
        }
        return 0; // Fallback to start
    }

    /**
     * Compute mapping accuracy: proportion of ext chars that got mapped.
     */
    private double computeMappingAccuracy(int[] posMap) {
        if (posMap.length == 0) return 0.0;
        int mapped = 0;
        for (int p : posMap) {
            if (p >= 0) mapped++;
        }
        return (double) mapped / posMap.length;
    }

    /**
     * Detect PATTERN_CANDIDATE: if only one verse has chords in the result,
     * and other verses are structurally similar, flag them.
     */
    private void detectPatternCandidates(Song dbSong, SongMappingResult result) {
        // Find verse sections that got chords vs those that didn't
        List<Section> versesWithChords = new ArrayList<>();
        List<Section> versesWithoutChords = new ArrayList<>();

        int lineIdx = 0;
        for (Section sec : dbSong.getSections()) {
            String type = sec.getType() != null ? sec.getType().toLowerCase() : "";
            if (!"verse".equals(type)) {
                lineIdx += sec.getLines().size();
                continue;
            }

            boolean hasChords = false;
            for (int i = 0; i < sec.getLines().size() && lineIdx + i < result.getLineResults().size(); i++) {
                LineMappingResult lr = result.getLineResults().get(lineIdx + i);
                if (lr.isAccepted() && !lr.getChordPositions().isEmpty()) {
                    hasChords = true;
                    break;
                }
            }

            if (hasChords) versesWithChords.add(sec);
            else versesWithoutChords.add(sec);

            lineIdx += sec.getLines().size();
        }

        // Only flag if exactly one verse has chords
        if (versesWithChords.size() != 1 || versesWithoutChords.isEmpty()) return;

        String chordedFirst = normalize(getFirstLineText(versesWithChords.get(0)));

        for (Section unchordedVerse : versesWithoutChords) {
            String otherFirst = normalize(getFirstLineText(unchordedVerse));
            if (levenshteinSimilarity(chordedFirst, otherFirst) >= PATTERN_SIMILARITY_THRESHOLD) {
                result.addGlobalFlag("PATTERN_CANDIDATE");
                break;
            }
        }
    }

    // --- Shared Utilities ---

    public static String normalize(String text) {
        if (text == null) return "";
        text = Normalizer.normalize(text, Normalizer.Form.NFC);
        text = text.toLowerCase();
        text = text.replaceAll("[^\\p{L}\\p{N}\\s]", "");
        text = text.replaceAll("\\s+", " ").trim();
        return text;
    }

    public static double levenshteinSimilarity(String a, String b) {
        if (a.equals(b)) return 1.0;
        int maxLen = Math.max(a.length(), b.length());
        if (maxLen == 0) return 1.0;
        return 1.0 - ((double) levenshteinDistance(a, b) / maxLen);
    }

    static int levenshteinDistance(String a, String b) {
        int m = a.length(), n = b.length();
        if (m == 0) return n;
        if (n == 0) return m;
        int[] prev = new int[n + 1];
        int[] curr = new int[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = j;

        for (int i = 1; i <= m; i++) {
            curr[0] = i;
            for (int j = 1; j <= n; j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(Math.min(curr[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
            }
            int[] tmp = prev; prev = curr; curr = tmp;
        }
        return prev[n];
    }

    private String getFirstLineText(Section section) {
        if (section.getLines() == null || section.getLines().isEmpty()) return "";
        return section.getLines().get(0).getText();
    }

    /**
     * Internal holder for a parsed external section.
     */
    public static class ExtSection {
        public String type;
        public String rawLabel;
        public List<StructuredLine> lines = new ArrayList<>();

        public ExtSection(String type, String rawLabel) {
            this.type = type;
            this.rawLabel = rawLabel;
        }
    }

    /**
     * Helper to format a lyric line with inline bracketed chords at their correct positions.
     */
    public String formatChordedLine(String text, List<ChordOccurrence> chords) {
        if (chords == null || chords.isEmpty()) return text;
        StringBuilder sb = new StringBuilder();
        int lastPos = 0;
        for (ChordOccurrence co : chords) {
            int pos = Math.min(co.getPosition(), text.length());
            sb.append(text, lastPos, pos);
            sb.append("[").append(co.getChord()).append("]");
            lastPos = pos;
        }
        sb.append(text.substring(lastPos));
        return sb.toString();
    }

    /**
     * Reconstruct the full inline-chorded song text from the relational schema.
     * This is the SINGLE SOURCE OF TRUTH for building editable/displayable chord text.
     *
     * Output format (matches what the edit textarea expects):
     *   {Verse 1}
     *   [G]Amazing [C]grace how [D]sweet the sound
     *   That [G]saved a [C]wretch like [G]me
     *
     * @param sections The song's sections with their lines loaded
     * @param chordMap Map of lineId → List<ChordOccurrence> from LineChordDAO.getChordsForSong()
     * @return Full inline-chorded text, or plain lyrics if no chords exist
     */
    public static String reconstructInlineChordText(List<Section> sections,
                                                     Map<Integer, List<ChordOccurrence>> chordMap) {
        if (sections == null || sections.isEmpty()) return "";

        ChordAligner aligner = new ChordAligner();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < sections.size(); i++) {
            Section section = sections.get(i);

            // Section header
            sb.append("{").append(section.getLabel()).append("}").append("\n");

            // Lines with chords
            for (SongLine line : section.getLines()) {
                String text = line.getText();
                if (text == null) text = "";

                List<ChordOccurrence> lineChords = chordMap != null
                        ? chordMap.get(line.getId()) : null;

                if (lineChords != null && !lineChords.isEmpty()) {
                    sb.append(aligner.formatChordedLine(text, lineChords));
                } else {
                    sb.append(text);
                }
                sb.append("\n");
            }

            // Blank line between sections (not after the last one)
            if (i < sections.size() - 1) {
                sb.append("\n");
            }
        }

        return sb.toString().trim();
    }

    /**
     * Reconstruct plain lyrics text from the relational schema (no chords).
     * Preserves section structure and line ordering.
     *
     * @param sections The song's sections with their lines loaded
     * @return Plain lyrics text with section headers
     */
    public static String reconstructPlainLyrics(List<Section> sections) {
        if (sections == null || sections.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < sections.size(); i++) {
            Section section = sections.get(i);

            for (SongLine line : section.getLines()) {
                String text = line.getText();
                if (text == null) text = "";
                sb.append(text).append("\n");
            }

            if (i < sections.size() - 1) {
                sb.append("\n");
            }
        }

        return sb.toString().trim();
    }

    /**
     * Build the list of StructuredLine objects from relational data for the song view page.
     * This is the SINGLE SOURCE OF TRUTH for building the view-page structured representation.
     *
     * @param sections The song's sections with their lines loaded
     * @param chordMap Map of lineId → List<ChordOccurrence> from LineChordDAO.getChordsForSong()
     * @return List of StructuredLine objects ready for JSON serialization to the JSP
     */
    public static List<StructuredLine> buildStructuredLines(List<Section> sections,
                                                             Map<Integer, List<ChordOccurrence>> chordMap) {
        if (sections == null || sections.isEmpty()) return new ArrayList<>();

        List<StructuredLine> structuredLines = new ArrayList<>();

        for (Section section : sections) {
            // Section header marker for app.js detection
            structuredLines.add(new StructuredLine("{" + section.getLabel() + "}"));

            for (SongLine line : section.getLines()) {
                String text = line.getText();
                if (text == null) text = "";

                StructuredLine sl = ChordParser.parseStructuredLine(text);

                // Attach mapped chords from the relational pipeline
                List<ChordOccurrence> lineChords = chordMap != null
                        ? chordMap.get(line.getId()) : null;
                if (lineChords != null && !lineChords.isEmpty()) {
                    sl.setChords(lineChords);
                }

                structuredLines.add(sl);
            }
        }

        return structuredLines;
    }
}
