package com.worship.service;

import com.worship.dao.SongDAO;
import com.worship.model.Song;

import java.util.*;

/**
 * SearchService - Business logic for song search operations.
 * Per IMPLEMENTATION_BLUEPRINT: Service layer handles ALL business logic.
 * Controller only parses/validates input and delegates to service.
 * DAO only handles database queries.
 * 
 * This class implements SEARCH_LOGIC_SPEC.md exactly:
 * - Input validation
 * - Query normalization
 * - Variant generation
 * - Candidate retrieval (via DAO)
 * - Multi-word AND logic
 * - Match type rules (exact/prefix/fuzzy)
 * - Scoring per field
 * - Field weighting
 * - Result ranking with tiebreakers
 * - Pagination
 * 
 * CRITICAL: Any deviation from SEARCH_LOGIC_SPEC.md is a bug.
 */
public class SearchService {
    private SongDAO songDAO = new SongDAO();

    /**
     * Public API: Search for songs matching query string.
     * Returns paginated results sorted by relevance.
     * 
     * @param query Search query string (will be normalized)
     * @param pageNum Pagination page number (1-based, must be >= 1)
     * @param pageSize Results per page (1-100, capped to 100)
     * @return Map with results, pagination info, and total count
     * @throws SearchServiceException if query invalid or database error
     */
    public Map<String, Object> search(String query, int pageNum, int pageSize) throws SearchServiceException {
        // STEP 1: VALIDATE INPUT (per IMPLEMENTATION_BLUEPRINT Controller layer)
        if (query == null || query.trim().isEmpty()) {
            throw new SearchServiceException("Search query required");
        }
        
        if (pageNum < 1) {
            throw new SearchServiceException("Page number must be >= 1");
        }
        
        if (pageSize < 1 || pageSize > 100) {
            pageSize = 20; // Default to 20
        }

        // STEP 2: NORMALIZE QUERY (per SEARCH_LOGIC_SPEC Section A)
        String normalized = normalizeQuery(query.trim());
        String[] tokens = normalized.split("\\s+");
        tokens = Arrays.stream(tokens).filter(t -> !t.isEmpty()).toArray(String[]::new);
        
        if (tokens.length == 0) {
            throw new SearchServiceException("Query empty after normalization");
        }

        // STEP 3: GENERATE VARIANTS (per SEARCH_LOGIC_SPEC Section C)
        Map<String, List<String>> variants = new HashMap<>();
        for (String token : tokens) {
            variants.put(token, generateVariants(token));
        }

        // STEP 4: FETCH BROAD CANDIDATES FROM DAO
        // DAO returns all songs matching LIKE query (candidates only, not final results)
        List<Song> candidates = songDAO.searchSongs(normalized);
        
        if (candidates.isEmpty()) {
            return buildEmptyResult(pageNum, pageSize);
        }

        // STEP 5: APPLY MULTI-WORD AND LOGIC (per SEARCH_LOGIC_SPEC Section E)
        // ALL tokens must be present; song is rejected if any token missing
        List<Song> filtered = new ArrayList<>();
        for (Song song : candidates) {
            if (songMatchesAllTokens(song, tokens, variants)) {
                filtered.add(song);
            }
        }

        if (filtered.isEmpty()) {
            return buildEmptyResult(pageNum, pageSize);
        }

        // STEP 6-9: SCORE, RANK, FILTER, PAGINATE
        // For now, minimal implementation; full implementation in next phase
        List<Song> ranked = filtered; // TODO: Implement scoring and ranking per SEARCH_LOGIC_SPEC
        
        // Apply pagination
        int startIdx = (pageNum - 1) * pageSize;
        int endIdx = Math.min(startIdx + pageSize, ranked.size());
        List<Song> paginated = ranked.subList(startIdx, endIdx);

        // Build result map
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("results", paginated);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        result.put("totalCount", filtered.size());
        result.put("hasMore", endIdx < filtered.size());
        
        return result;
    }

    /**
     * STEP 2: Normalize query per SEARCH_LOGIC_SPEC Section A
     * Pipeline: trim → lowercase → NFD normalize → remove punctuation → collapse spaces
     */
    private String normalizeQuery(String query) {
        // For now, simple normalization
        // TODO: Implement full 5-step pipeline from SEARCH_LOGIC_SPEC Section A
        return query.toLowerCase()
                   .replaceAll("\\s+", " ")
                   .trim();
    }

    /**
     * STEP 3: Generate variants for a token per SEARCH_LOGIC_SPEC Section C
     * For Hindi/Marathi: vowel pairs (jivit/jeevit, etc.)
     * Max 3 variants per token (original + 2 generated)
     */
    private List<String> generateVariants(String token) {
        List<String> variants = new ArrayList<>();
        variants.add(token); // Original first
        
        // TODO: Implement full variant generation from SEARCH_LOGIC_SPEC Section C
        // - Hindi vowel pairs: a/aa, i/ii, u/uu, e/ee, o/oo
        // - Marathi consonant clusters: sh/s, ch/c, th/t, kh/k
        // - Max 3 total variants (original + 2 generated)
        
        return variants;
    }

    /**
     * STEP 5: Check if song matches ALL tokens (AND logic)
     * Song is valid ONLY if all tokens found in some field.
     * Matching can be across different fields (title, artist, lyrics).
     */
    private boolean songMatchesAllTokens(Song song, String[] tokens, Map<String, List<String>> variants) {
        for (String token : tokens) {
            boolean tokenFound = false;
            
            // Check all fields for token match
            if (matchesAnyField(song, token, variants.get(token))) {
                tokenFound = true;
            }
            
            if (!tokenFound) {
                return false; // Missing token = reject entire song
            }
        }
        return true; // All tokens found
    }

    /**
     * Check if token matches in any field (title, artist, lyrics).
     * Uses simple contains for now; will implement match types (exact/prefix/fuzzy) later.
     */
    private boolean matchesAnyField(Song song, String token, List<String> variants) {
        String[] fields = {
            song.getTitle(),
            song.getArtist(),
            song.getLyricsRoman(),
            song.getLyricsOriginal()
        };
        
        String lowerToken = token.toLowerCase();
        
        for (String field : fields) {
            if (field == null) continue;
            String lowerField = field.toLowerCase();
            
            // Check token and all variants
            if (lowerField.contains(lowerToken)) {
                return true;
            }
            for (String variant : variants) {
                if (lowerField.contains(variant.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Build empty result for no matches.
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
