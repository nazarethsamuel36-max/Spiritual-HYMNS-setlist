package com.worship.chord;

import com.worship.model.CandidateResult;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;
import com.worship.util.ChordParser;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 5-dimension scoring filter for internet chord sheet candidates.
 * Ensures only high-quality, matching candidates enter the core alignment pipeline.
 *
 * Dimensions:
 *   1. Title similarity      (0.25)
 *   2. First verse similarity (0.30)
 *   3. Structure similarity   (0.15)
 *   4. Line sampling          (0.20)
 *   5. Chord density sanity   (0.10)
 */
public class CandidateFilter {

    private static final double WEIGHT_TITLE     = 0.25;
    private static final double WEIGHT_VERSE     = 0.30;
    private static final double WEIGHT_STRUCTURE = 0.15;
    private static final double WEIGHT_SAMPLING  = 0.20;
    private static final double WEIGHT_DENSITY   = 0.10;

    private static final double ACCEPT_THRESHOLD = 0.70;
    private static final double REVIEW_THRESHOLD = 0.50;

    private static final Pattern BRACKET = Pattern.compile("\\[.*?\\]");
    private static final Pattern SECTION_HEADER = Pattern.compile(
        "^\\s*\\[?(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Interlude|Tag)\\s*\\d*\\]?\\s*$",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Score and rank all candidates against a DB song.
     * Returns a sorted list (best first) with scores and rejection reasons populated.
     */
    public List<CandidateResult> scoreAndRank(Song dbSong, List<CandidateResult> candidates) {
        List<CandidateResult> mutable = new ArrayList<>(candidates);
        for (CandidateResult c : mutable) {
            scoreCandidate(dbSong, c);
        }

        mutable.sort((a, b) -> Double.compare(b.getSelectionScore(), a.getSelectionScore()));
        return mutable;
    }

    /**
     * Select the best candidate. Returns null if none qualify.
     * Sets MULTIPLE_CANDIDATES flag on the result if top two are within 0.05.
     */
    public CandidateResult selectBest(Song dbSong, List<CandidateResult> candidates) {
        List<CandidateResult> ranked = scoreAndRank(dbSong, candidates);

        if (ranked.isEmpty()) return null;

        CandidateResult best = ranked.get(0);
        if (!best.isAccepted()) return null;

        // Check for ambiguity: top two within 0.05
        if (ranked.size() >= 2) {
            CandidateResult second = ranked.get(1);
            if (second.isAccepted() &&
                Math.abs(best.getSelectionScore() - second.getSelectionScore()) < 0.05) {
                // Flag ambiguity — caller must handle
                best.getScoreBreakdown().put("MULTIPLE_CANDIDATES", 1.0);
            }
        }

        return best;
    }

    /**
     * Score a single candidate against the DB song across all 5 dimensions.
     */
    void scoreCandidate(Song dbSong, CandidateResult candidate) {
        Map<String, Double> breakdown = new LinkedHashMap<>();

        // 1. Title similarity
        double titleScore = 0.0;
        if (candidate.getExtractedTitle() != null && dbSong.getTitle() != null) {
            titleScore = levenshteinSimilarity(
                normalize(dbSong.getTitle()),
                normalize(candidate.getExtractedTitle())
            );
        }
        breakdown.put("title", titleScore);

        // 2. First verse similarity
        double verseScore = scoreFirstVerse(dbSong, candidate);
        breakdown.put("verse", verseScore);

        // 3. Section structure similarity
        double structureScore = scoreStructure(dbSong, candidate);
        breakdown.put("structure", structureScore);

        // 4. Line sampling
        double samplingScore = scoreLineSampling(dbSong, candidate);
        breakdown.put("sampling", samplingScore);

        // 5. Chord density
        double densityScore = scoreChordDensity(candidate);
        breakdown.put("density", densityScore);

        // Final weighted score
        double total = (titleScore * WEIGHT_TITLE) +
                        (verseScore * WEIGHT_VERSE) +
                        (structureScore * WEIGHT_STRUCTURE) +
                        (samplingScore * WEIGHT_SAMPLING) +
                        (densityScore * WEIGHT_DENSITY);

        candidate.setSelectionScore(total);
        candidate.setScoreBreakdown(breakdown);

        if (total < REVIEW_THRESHOLD) {
            candidate.setRejectionReason(buildRejectionReason(breakdown));
        }
    }

    // --- Dimension Implementations ---

    private double scoreFirstVerse(Song dbSong, CandidateResult candidate) {
        String dbFirst = getDbFirstVerse(dbSong);
        if (dbFirst.isEmpty()) return 0.0;

        String extFirst = getExtFirstVerse(candidate.getRawText());
        if (extFirst.isEmpty()) return 0.0;

        return levenshteinSimilarity(normalize(dbFirst), normalize(extFirst));
    }

    private double scoreStructure(Song dbSong, CandidateResult candidate) {
        Map<String, Integer> dbStruct = countSectionTypes(dbSong);
        Map<String, Integer> extStruct = countExtSectionTypes(candidate.getRawText());

        if (dbStruct.isEmpty() && extStruct.isEmpty()) return 1.0;
        if (dbStruct.isEmpty() || extStruct.isEmpty()) return 0.3;

        Set<String> allTypes = new HashSet<>();
        allTypes.addAll(dbStruct.keySet());
        allTypes.addAll(extStruct.keySet());

        int matches = 0;
        int total = allTypes.size();
        for (String type : allTypes) {
            int dbCount = dbStruct.getOrDefault(type, 0);
            int extCount = extStruct.getOrDefault(type, 0);
            if (dbCount > 0 && extCount > 0) {
                // Partial credit for close counts
                matches++;
                if (Math.abs(dbCount - extCount) > 1) {
                    matches--; // remove credit if counts differ by more than 1
                }
            }
        }

        return total > 0 ? Math.max(0, (double) matches / total) : 0.0;
    }

    private double scoreLineSampling(Song dbSong, CandidateResult candidate) {
        List<String> dbLines = getAllDbLines(dbSong);
        if (dbLines.size() < 3) return 0.5; // Not enough lines to sample

        // Pick up to 3 evenly-spaced lines
        List<String> samples = new ArrayList<>();
        int step = Math.max(1, dbLines.size() / 3);
        for (int i = 0; i < dbLines.size() && samples.size() < 3; i += step) {
            String line = dbLines.get(i).trim();
            if (!line.isEmpty()) samples.add(line);
        }

        if (samples.isEmpty()) return 0.0;

        String[] extLines = candidate.getRawText().split("\\r?\\n");
        int matches = 0;
        for (String sample : samples) {
            String normSample = normalize(sample);
            for (String extLine : extLines) {
                String normExt = normalize(stripChords(extLine));
                if (normExt.isEmpty()) continue;
                if (levenshteinSimilarity(normSample, normExt) >= 0.6) {
                    matches++;
                    break;
                }
            }
        }

        return (double) matches / samples.size();
    }

    private double scoreChordDensity(CandidateResult candidate) {
        String text = candidate.getRawText();
        if (text == null || text.isEmpty()) return 0.0;

        int chordCount = 0;
        Matcher m = BRACKET.matcher(text);
        while (m.find()) chordCount++;

        String[] lines = text.split("\\r?\\n");
        int nonEmptyLines = 0;
        for (String line : lines) {
            if (!line.trim().isEmpty() && !SECTION_HEADER.matcher(line).matches()) {
                nonEmptyLines++;
            }
        }

        if (nonEmptyLines == 0) return 0.0;

        double chordsPerLine = (double) chordCount / nonEmptyLines;

        if (chordsPerLine < 0.5) return 0.3;
        if (chordsPerLine > 8) return 0.2;
        return 1.0;
    }

    // --- Helpers ---

    private String getDbFirstVerse(Song dbSong) {
        if (dbSong.getSections() == null || dbSong.getSections().isEmpty()) return "";
        Section first = dbSong.getSections().get(0);
        StringBuilder sb = new StringBuilder();
        for (SongLine line : first.getLines()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(line.getText());
        }
        return sb.toString();
    }

    private String getExtFirstVerse(String rawText) {
        if (rawText == null) return "";
        String[] lines = rawText.split("\\r?\\n");
        StringBuilder sb = new StringBuilder();
        boolean started = false;
        int lineCount = 0;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) {
                if (started && lineCount >= 2) break; // End of first verse
                continue;
            }
            if (SECTION_HEADER.matcher(trimmed).matches()) {
                if (started) break;
                started = true;
                continue;
            }
            // If no section header, start collecting from first non-empty line
            started = true;
            String plain = stripChords(trimmed);
            if (!plain.isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(plain);
                lineCount++;
                if (lineCount >= 4) break; // Max 4 lines for comparison
            }
        }
        return sb.toString();
    }

    private Map<String, Integer> countSectionTypes(Song dbSong) {
        Map<String, Integer> counts = new HashMap<>();
        if (dbSong.getSections() == null) return counts;
        for (Section s : dbSong.getSections()) {
            String type = s.getType() != null ? s.getType().toLowerCase() : "other";
            counts.merge(type, 1, Integer::sum);
        }
        return counts;
    }

    private Map<String, Integer> countExtSectionTypes(String rawText) {
        Map<String, Integer> counts = new HashMap<>();
        if (rawText == null) return counts;
        for (String line : rawText.split("\\r?\\n")) {
            Matcher m = SECTION_HEADER.matcher(line.trim());
            if (m.matches()) {
                String type = m.group(1).toLowerCase();
                counts.merge(type, 1, Integer::sum);
            }
        }
        return counts;
    }

    private List<String> getAllDbLines(Song dbSong) {
        List<String> lines = new ArrayList<>();
        if (dbSong.getSections() == null) return lines;
        for (Section s : dbSong.getSections()) {
            for (SongLine sl : s.getLines()) {
                lines.add(sl.getText());
            }
        }
        return lines;
    }

    // --- Shared Utilities ---

    static String normalize(String text) {
        if (text == null) return "";
        text = Normalizer.normalize(text, Normalizer.Form.NFC);
        text = text.toLowerCase();
        text = text.replaceAll("[^\\p{L}\\p{N}\\s]", "");
        text = text.replaceAll("\\s+", " ").trim();
        return text;
    }

    static String stripChords(String line) {
        if (line == null) return "";
        return BRACKET.matcher(line).replaceAll("").trim();
    }

    static double levenshteinSimilarity(String a, String b) {
        if (a.equals(b)) return 1.0;
        int maxLen = Math.max(a.length(), b.length());
        if (maxLen == 0) return 1.0;
        return 1.0 - ((double) levenshteinDistance(a, b) / maxLen);
    }

    static int levenshteinDistance(String a, String b) {
        int m = a.length(), n = b.length();
        if (m == 0) return n;
        if (n == 0) return m;

        // Space-optimized: two rows
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

    private String buildRejectionReason(Map<String, Double> breakdown) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Double> entry : breakdown.entrySet()) {
            if (entry.getValue() < 0.4) {
                if (sb.length() > 0) sb.append("; ");
                sb.append("Low ").append(entry.getKey()).append(" (").append(String.format("%.2f", entry.getValue())).append(")");
            }
        }
        return sb.length() > 0 ? sb.toString() : "Overall score below threshold";
    }
}
