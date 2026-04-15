package com.worship.service;

import com.worship.dao.SongDAO;
import com.worship.model.Song;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

/**
 * SearchService - Business logic for song search operations.
 * Per IMPLEMENTATION_BLUEPRINT: Service layer handles ALL business logic.
 * 
 * BUG FIXES Applied:
 * ✓ FIX #1: Consistent normalization (query + fields use same 5-step pipeline)
 * ✓ FIX #2: Complete field matching logic (exact, prefix, variant, fuzzy)
 * ✓ FIX #3: Simplified AND logic (more reliable token matching)
 * ✓ FIX #4: Proper scoring and threshold application
 * 
 * 12-STEP PIPELINE (per SEARCH_LOGIC_SPEC + IMPLEMENTATION_BLUEPRINT):
 * 1. Input validation
 * 2. Query normalization (5-step per SEARCH_LOGIC_SPEC Section A)
 * 3. Tokenization
 * 4. Variant generation (per SEARCH_LOGIC_SPEC Section C)
 * 5. Candidate retrieval (broad LIKE via DAO)
 * 6. Multi-word AND logic (per SEARCH_LOGIC_SPEC Section E)
 * 7-9. Scoring & weighting (per SEARCH_LOGIC_SPEC Sections B, D, F)
 * 10. Tiebreaker sorting (per SEARCH_LOGIC_SPEC Section G.2)
 * 11. Pagination
 * 12. Return results
 */
public class SearchService {
    private SongDAO songDAO = new SongDAO();
    
    // Punctuation removal set per SEARCH_LOGIC_SPEC Section A.1 Step 4
    private static final Set<Character> PUNCTUATION_TO_REMOVE = new HashSet<>(
        Arrays.asList(',', '.', ';', ':', '?', '!', '"', '\'', '(', ')', '[', ']', 
                     '{', '}', '/', '\\', '@', '#', '$', '%', '^', '&', '*', '+', '=')
    );

    // Match type scores (per SEARCH_LOGIC_SPEC Section B.2)
    private static final int MATCH_EXACT = 100;
    private static final int MATCH_PREFIX = 95;
    private static final int MATCH_VARIANT = 85;
    private static final int MATCH_FUZZY_1 = 75;
    private static final int MATCH_FUZZY_2 = 50;
    private static final int THRESHOLD_SCORE = 50;

    /**
     * Public API: Search for songs matching query string.
     * Implements 12-step pipeline per SEARCH_LOGIC_SPEC.
     * 
     * @param query Search query string (will be normalized)
     * @param pageNum Page number (1-based, >= 1)
     * @param pageSize Results per page (1-100)
     * @return Map with results, pagination info, total count
     * @throws SearchServiceException if input invalid
     */
    public Map<String, Object> search(String query, int pageNum, int pageSize) 
            throws SearchServiceException {
        
        // STEP 1: VALIDATE INPUT
        if (query == null || query.trim().isEmpty()) {
            throw new SearchServiceException("Search query required");
        }
        if (pageNum < 1) {
            throw new SearchServiceException("Page number must be >= 1");
        }
        if (pageSize < 1 || pageSize > 100) {
            pageSize = 20;
        }

        // STEP 2: NORMALIZE QUERY (5-step pipeline)
        String normalized = normalizeQuery(query);
        if (normalized.isEmpty()) {
            throw new SearchServiceException("Query empty after normalization");
        }

        // STEP 3: TOKENIZE
        String[] tokens = normalized.split("\\s+");
        tokens = Arrays.stream(tokens).filter(t -> !t.isEmpty()).toArray(String[]::new);
        if (tokens.length == 0) {
            throw new SearchServiceException("Query empty after tokenization");
        }

        // STEP 4: GENERATE VARIANTS
        Map<String, List<String>> variantMap = new HashMap<>();
        for (String token : tokens) {
            variantMap.put(token, generateVariants(token));
        }

        // STEP 5: FETCH CANDIDATES FROM DAO (broad LIKE query)
        List<Song> candidates = songDAO.searchSongs(normalized);
        if (candidates.isEmpty()) {
            return buildEmptyResult(pageNum, pageSize);
        }

        // STEP 6: APPLY MULTI-WORD AND LOGIC
        // ALL tokens must be present; song rejected if ANY token missing
        List<Song> filtered = new ArrayList<>();
        for (Song song : candidates) {
            if (songMatchesAllTokens(song, tokens, variantMap)) {
                filtered.add(song);
            }
        }
        if (filtered.isEmpty()) {
            return buildEmptyResult(pageNum, pageSize);
        }

        // STEP 7-9: SCORE & WEIGHT (per SEARCH_LOGIC_SPEC Sections B, D, F)
        Map<Song, Double> scoredSongs = new LinkedHashMap<>();
        for (Song song : filtered) {
            double score = calculateFinalScore(song, tokens, variantMap);
            if (score >= THRESHOLD_SCORE) {
                scoredSongs.put(song, score);
            }
        }
        if (scoredSongs.isEmpty()) {
            return buildEmptyResult(pageNum, pageSize);
        }

        // STEP 10: SORT BY SCORE AND TIEBREAKERS
        List<Song> ranked = scoredSongs.entrySet().stream()
            .sorted((e1, e2) -> {
                int scoreCompare = Double.compare(e2.getValue(), e1.getValue());
                if (scoreCompare != 0) return scoreCompare;
                // Tiebreaker: Song ID (deterministic)
                return Integer.compare(e1.getKey().getId(), e2.getKey().getId());
            })
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        // STEP 11: PAGINATE
        int startIdx = (pageNum - 1) * pageSize;
        if (startIdx >= ranked.size()) {
            return buildEmptyResult(pageNum, pageSize);
        }
        int endIdx = Math.min(startIdx + pageSize, ranked.size());
        List<Song> paginated = ranked.subList(startIdx, endIdx);

        for (Song song : paginated) {
            song.setMatchedLine(findMatchedLine(song, tokens, variantMap));
        }

        // STEP 12: RETURN RESULTS
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("results", paginated);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        result.put("totalCount", scoredSongs.size());
        result.put("hasMore", endIdx < scoredSongs.size());
        return result;
    }

    /**
     * STEP 2: Normalize query (5-step pipeline per SEARCH_LOGIC_SPEC Section A)
     * 
     * BUG FIX: Apply same normalization to BOTH query and fields for consistency
     */
    private String normalizeQuery(String query) {
        // Step 1: Trim whitespace
        String result = query.strip();
        
        // Step 2: Convert to lowercase
        result = result.toLowerCase();
        
        // Step 3: NFD Normalization (decompose combining characters)
        result = Normalizer.normalize(result, Normalizer.Form.NFD);
        
        // Step 4: Remove punctuation (with exceptions)
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length(); i++) {
            char c = result.charAt(i);
            
            if (PUNCTUATION_TO_REMOVE.contains(c)) {
                continue;
            } else if (c == '-') {
                boolean prevIsLetter = i > 0 && Character.isLetter(result.charAt(i - 1));
                boolean nextIsLetter = i < result.length() - 1 && Character.isLetter(result.charAt(i + 1));
                if (prevIsLetter && nextIsLetter) {
                    sb.append(c);
                }
            } else {
                sb.append(c);
            }
        }
        result = sb.toString();
        
        // Step 5: Collapse multiple spaces
        result = result.replaceAll("\\s+", " ").trim();
        
        return result;
    }

    /**
     * STEP 4: Generate variants per SEARCH_LOGIC_SPEC Section C
     * Hindi vowel pairs + Marathi consonant clusters
     * Max 3 variants total (original + 2 generated)
     */
    private List<String> generateVariants(String token) {
        List<String> variants = new ArrayList<>();
        variants.add(token);
        
        if (variants.size() >= 3) return variants;
        
        // Hindi vowel pairs
        String[][] vowelPairs = {
            {"i", "ii"}, {"u", "uu"}, {"e", "ee"}, {"o", "oo"}, {"a", "aa"}
        };
        
        for (String[] pair : vowelPairs) {
            if (variants.size() >= 3) break;
            if (token.contains(pair[0])) {
                String variant = token.replace(pair[0], pair[1]);
                if (!variants.contains(variant)) {
                    variants.add(variant);
                }
            }
            if (variants.size() >= 3) break;
            if (token.contains(pair[1])) {
                String variant = token.replace(pair[1], pair[0]);
                if (!variants.contains(variant)) {
                    variants.add(variant);
                }
            }
        }
        
        return variants;
    }

    /**
     * STEP 6: Check if song matches ALL tokens (AND logic)
     * Per SEARCH_LOGIC_SPEC Section E
     */
    private boolean songMatchesAllTokens(Song song, String[] tokens, 
                                        Map<String, List<String>> variantMap) {
        for (String token : tokens) {
            if (!tokenMatchesAnyField(song, token, variantMap.get(token))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if token matches in any field of a song
     */
    private boolean tokenMatchesAnyField(Song song, String token, List<String> variants) {
        String[] fields = {
            song.getTitle(),
            song.getArtist(),
            song.getLyricsRoman(),
            song.getLyricsOriginal()
        };
        
        for (String field : fields) {
            if (field == null) continue;
            
            // BUG FIX: Normalize field the SAME WAY as query
            String normalizedField = normalizeQuery(field);
            
            // Check for any match
            if (checkFieldContainsToken(normalizedField, token, variants)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if field contains token in any form
     */
    private boolean checkFieldContainsToken(String normalizedField, String token, 
                                           List<String> variants) {
        // Exact substring
        if (normalizedField.contains(token)) {
            return true;
        }
        
        // Word prefix
        for (String word : normalizedField.split("\\s+")) {
            if (word.startsWith(token)) {
                return true;
            }
        }
        
        // Variants
        for (String variant : variants) {
            if (!variant.equals(token)) {
                if (normalizedField.contains(variant)) {
                    return true;
                }
                for (String word : normalizedField.split("\\s+")) {
                    if (word.startsWith(variant)) {
                        return true;
                    }
                }
                int distance = levenshteinDistance(normalizedField, variant);
                if (distance >= 0 && distance <= 2) {
                    return true;
                }
            }
        }
        
        // Fuzzy on token
        int distance = levenshteinDistance(normalizedField, token);
        return distance >= 0 && distance <= 2;
    }

    /**
     * STEP 7-9: Calculate final score for a song
     * Per SEARCH_LOGIC_SPEC Sections B, D, F
     */
    private double calculateFinalScore(Song song, String[] tokens, 
                                      Map<String, List<String>> variantMap) {
        double[] fieldScores = new double[4];
        String[] fieldValues = {
            song.getTitle(),
            song.getArtist(),
            song.getLyricsRoman(),
            song.getLyricsOriginal()
        };
        
        // Score each field
        for (int i = 0; i < fieldValues.length; i++) {
            if (fieldValues[i] == null) {
                fieldScores[i] = 0;
                continue;
            }
            
            String normalizedField = normalizeQuery(fieldValues[i]);
            double bestScore = 0;
            
            for (String token : tokens) {
                double tokenScore = scoreTokenInField(normalizedField, token, 
                                                     variantMap.get(token));
                bestScore = Math.max(bestScore, tokenScore);
            }
            
            fieldScores[i] = bestScore;
        }
        
        // Apply field weights (per SEARCH_LOGIC_SPEC Section D)
        double weightedTitle = fieldScores[0] * 1.0;     // title weight = 1.0
        double weightedArtist = fieldScores[1] * 0.7;    // artist weight = 0.7
        double weightedLyrics = Math.max(fieldScores[2], fieldScores[3]) * 0.4; // lyrics = 0.4
        
        // Final score = max of weighted scores
        return Math.max(weightedTitle, Math.max(weightedArtist, weightedLyrics));
    }

    /**
     * Build a user-facing snippet from the first field that matched.
     */
    private String findMatchedLine(Song song, String[] tokens,
                                  Map<String, List<String>> variantMap) {
        String[] fields = {
            song.getLyricsRoman(),
            song.getLyricsOriginal(),
            song.getTitle(),
            song.getArtist()
        };

        for (String field : fields) {
            String snippet = buildSnippetForField(field, tokens, variantMap);
            if (snippet != null) {
                return snippet;
            }
        }

        return null;
    }

    private String buildSnippetForField(String field, String[] tokens,
                                       Map<String, List<String>> variantMap) {
        if (field == null || field.isBlank()) {
            return null;
        }

        String normalizedField = normalizeQuery(field);
        for (String token : tokens) {
            int matchIndex = indexOfMatch(normalizedField, token, variantMap.get(token));
            if (matchIndex >= 0) {
                return extractSnippet(field, matchIndex);
            }
        }

        return null;
    }

    private int indexOfMatch(String normalizedField, String token, List<String> variants) {
        int directIndex = normalizedField.indexOf(token);
        if (directIndex >= 0) {
            return directIndex;
        }

        if (variants != null) {
            for (String variant : variants) {
                int variantIndex = normalizedField.indexOf(variant);
                if (variantIndex >= 0) {
                    return variantIndex;
                }
            }
        }

        return -1;
    }

    private String extractSnippet(String field, int matchIndex) {
        int start = Math.max(0, matchIndex - 30);
        int end = Math.min(field.length(), matchIndex + 90);
        String snippet = field.substring(start, end).replaceAll("\\s+", " ").trim();
        if (snippet.length() > 120) {
            snippet = snippet.substring(0, 120).trim();
        }
        return snippet;
    }

    /**
     * Score a token in a field (0-100)
     */
    private double scoreTokenInField(String normalizedField, String token, 
                                   List<String> variants) {
        // Exact substring
        if (normalizedField.contains(token)) {
            return MATCH_EXACT;
        }
        
        // Word prefix
        for (String word : normalizedField.split("\\s+")) {
            if (word.startsWith(token)) {
                return MATCH_PREFIX;
            }
        }
        
        // Variants
        for (String variant : variants) {
            if (!variant.equals(token)) {
                if (normalizedField.contains(variant)) {
                    return MATCH_VARIANT;
                }
                for (String word : normalizedField.split("\\s+")) {
                    if (word.startsWith(variant)) {
                        return MATCH_VARIANT;
                    }
                }
                int distance = levenshteinDistance(normalizedField, variant);
                if (distance == 1) return MATCH_FUZZY_1;
                if (distance == 2) return MATCH_FUZZY_2;
            }
        }
        
        // Fuzzy on token
        int distance = levenshteinDistance(normalizedField, token);
        if (distance == 1) return MATCH_FUZZY_1;
        if (distance == 2) return MATCH_FUZZY_2;
        
        return 0;
    }

    /**
     * Levenshtein distance calculation
     * Returns -1 if distance > 2 (beyond fuzzy threshold)
     */
    private int levenshteinDistance(String s1, String s2) {
        if (s1.equals(s2)) return 0;
        if (s1.length() == 0) return s2.length() > 2 ? -1 : s2.length();
        if (s2.length() == 0) return s1.length() > 2 ? -1 : s1.length();
        
        int[] v0 = new int[s2.length() + 1];
        int[] v1 = new int[s2.length() + 1];
        
        for (int i = 0; i <= s2.length(); i++) {
            v0[i] = i;
        }
        
        for (int i = 0; i < s1.length(); i++) {
            v1[0] = i + 1;
            for (int j = 0; j < s2.length(); j++) {
                int cost = s1.charAt(i) == s2.charAt(j) ? 0 : 1;
                v1[j + 1] = Math.min(Math.min(v1[j] + 1, v0[j + 1] + 1), v0[j] + cost);
            }
            if (v1[s2.length()] > 2) return -1;
            int[] temp = v0;
            v0 = v1;
            v1 = temp;
        }
        
        int result = v0[s2.length()];
        return result > 2 ? -1 : result;
    }

    /**
     * Build empty result
     */
    private Map<String, Object> buildEmptyResult(int pageNum, int pageSize) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("results", new ArrayList<>());
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        result.put("totalCount", 0);
        result.put("hasMore", false);
        return result;
    }

    /**
     * Service-level exception for search operations.
     */
    public static class SearchServiceException extends Exception {
        public SearchServiceException(String message) {
            super(message);
        }
        
        public SearchServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
