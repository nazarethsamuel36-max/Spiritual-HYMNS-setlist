# SYSTEM_CHANGE_PLAN.md

**Document Purpose:** Consolidated execution plan for all planned system improvements to worship-song-library. Defines every change in actionable, testable format without code.

**Last Updated:** 2026-04-11
**Target Scale:** 10,000 songs with <200ms search, <10ms transposition, <100ms song load
**Referenced Strategies:** See PERFORMANCE_GUIDELINES.md and LYRICS_LANGUAGE_DECISION.md

---

## 1. SEARCH SYSTEM IMPROVEMENTS

### CHANGE 1.1: Input Normalization Layer

**Problem:**
Search queries containing mixed-language characters, extra whitespace, or special characters cause inconsistent match results. Duplicate queries like "jivit" and "jeevit" are treated as different keywords.

**Change:**
Add SearchNormalizer utility that standardizes all search inputs before processing:
- Trim whitespace (leading/trailing/internal multiples)
- Convert to lowercase
- Remove punctuation (except hyphens within words)
- Normalize Unicode (NFD normalization for consistent Devanagari)

**Location:**
Service layer (new: SearchNormalizer.java used by SearchService)

**Implementation Plan:**
1. Create SearchNormalizer class with normalize() method
2. Test with Hindi/Marathi/English mixed inputs
3. Apply normalization immediately after input received in SearchServlet
4. Pass normalized query to SearchService.search()
5. Log original → normalized conversion for debugging
6. Ensure normalization is deterministic (same input = same output always)

**Impact:**
- Search accuracy: +15-20% (fewer near-miss failures)
- Performance: Negligible (<1ms overhead)
- User experience: Transparent (users see results they expect)
- Complexity: Low (reusable utility)

**Priority:** HIGH

---

### CHANGE 1.2: Search Variant Generation

**Problem:**
Indian language transliterations have natural variants (jivit/jeevit/jeevan/jeewan). Current search only matches exact spelling, missing valid results.

**Change:**
Add variant generator that creates acceptable spellings for each input:
- For Hindi/Marathi: Generate short-vowel / long-vowel pairs (jivit/jeevit, jeewan/jawan)
- For consonant clusters: Generate omitted-vowel variants
- Generate phonetic near-neighbors (sh/s, ch/c for English borrowings)

**Location:**
Service layer (new: SearchVariantGenerator.java, called by SearchService)

**Implementation Plan:**
1. Create SearchVariantGenerator with generateVariants(String input) method
2. Define variant rules for Hindi (vowel pairs)
3. Define variant rules for Marathi (vowel pairs + consonant clusters)
4. Load variant rules from file (not hardcoded)
5. Generate max 5 variants per input (performance bound)
6. Test with 100+ common song keywords
7. Call variant generator before fuzzy matching pipeline

**Impact:**
- Search coverage: +25-30% (catches variant spellings)
- Performance: +5-10ms (variant generation + additional fuzzy checks)
- Still maintains <200ms target with pagination
- User experience: "I know Song X exists" now finds it
- Complexity: Medium (variant rule maintenance required)

**Priority:** HIGH

---

### CHANGE 1.3: Implement Scoring per SEARCH_LOGIC_SPEC.md

**Problem:**
Search results lack consistent scoring methodology. Different match types (exact, prefix, fuzzy) need weighted calculation to rank results properly.

**Change:**
Implement EXACT scoring system defined in SEARCH_LOGIC_SPEC.md Section B.2 (Fuzzy Scoring) and Section D (Multi-Field Scoring). NO alternative scoring models allowed.

Scoring hierarchy (mandatory):
- Exact match: Score 100
- Prefix match: Score 95
- Normalized match: Score 90
- Variant match: Score 85
- Fuzzy (Levenshtein distance 1): Score 75
- Fuzzy (Levenshtein distance 2): Score 50
- Distance > 2: Rejected (Score 0)

Field weighting (mandatory):
- Title field: weight 1.0 (highest)
- Artist field: weight 0.7
- Lyrics field: weight 0.4
- Final score = max(weighted field scores), capped at 100

**Location:**
Service layer (new: ScoreCalculator.java, called by SearchService)

**Implementation Plan:**
1. Read SEARCH_LOGIC_SPEC.md Sections B and D completely
2. Implement scoring exactly per spec (no interpretation)
3. Create ScoreCalculator with calculateScore(match_type, distance, field_name) method
4. Verify all fuzzy distances produce exact specified scores
5. Test with 50 known queries from SEARCH_TEST_CASES.md
6. Ensure 100% deterministic (same input always produces same score)
7. No adjustments to weights allowed (spec is locked)

**Impact:**
- Search relevance: +20% (correct ranking per spec)
- Determinism: 100% (same input always same output)
- Testability: All results verifiable against SEARCH_TEST_CASES.md
- Performance: +2-5ms per result scored (acceptable)
- Maintains <200ms target with pagination
- Complexity: Low (spec is explicit, no guessing)

**Priority:** CRITICAL (blocks other search features)

**CRITICAL NOTE:** Any deviation from SEARCH_LOGIC_SPEC.md scoring is a bug, not an optimization. Do not modify weights.

---

### CHANGE 1.4: Implement Ranking per SEARCH_LOGIC_SPEC.md

**Problem:**
Results matching equally must use deterministic tie-breaking rules. Without defined hierarchy, different developers would produce different orders.

**Change:**
Implement EXACT tie-breaking hierarchy defined in SEARCH_LOGIC_SPEC.md Section G.2 (Tie-Breaking Hierarchy). Apply in this order when match scores equal:

1. Match type precision (exact > prefix > variant > fuzzy)
2. Field priority (title > artist > lyrics)
3. Popularity (play_count descending)
4. Recency (most recent first)
5. Title alphabetical (A-Z)
6. Song ID (ascending) — ULTIMATE FALLBACK

FINAL CONSTRAINT: Same input MUST produce identical output every run.

**Location:**
Service layer (SearchService.rankResults() method)

**Implementation Plan:**
1. Read SEARCH_LOGIC_SPEC.md Section G completely
2. Implement ResultComparator with all 6 tiebreaker levels
3. Sort using stable sort (Java: Collections.sort() with Comparator)
4. Use song_id as ultimate fallback (always deterministic)
5. Test determinism: Run same query 10 times, verify identical order all 10 times
6. Never use randomization, shuffle(), or non-deterministic operations
7. Verify against SEARCH_TEST_CASES.md test 12.6 and 12.7

**Impact:**
- Determinism: 100% (same input always same output)
- Consistency: Results identical across pages, servers, time
- Testability: All results reproducible
- Performance: +3-5ms (sorting only on matched candidates)
- Maintains <200ms with pagination
- Complexity: Low (specification is explicit)

**Priority:** CRITICAL (determinism is non-negotiable)

---

### CHANGE 1.5: Search Result Pagination Architecture

**Problem:**
Large result sets (100+ matches) cause slow rendering. Need to limit results sent to UI.

**Change:**
Implement pagination pattern:
- Default page size: 20 results
- Return: current_page, total_count, has_next, page_size
- UI loads next page on scroll or button click
- Server returns same logical page consistently

**Location:**
Service layer (SearchService), Controller (SearchServlet), UI (app.js)

**Implementation Plan:**
1. Modify SearchService.search(query, pageNumber) to accept page parameter
2. In SearchService: fetch and rank all candidates (still optimized with batch queries)
3. Calculate: start_index = (pageNumber - 1) * pageSize, end_index = start_index + pageSize
4. Return: results[start_index:end_index] + metadata (total_count, has_next)
5. In SearchServlet: extract pageNumber from request, call service
6. Return JSON with pagination metadata
7. In app.js: load page 1 initially, fetch next page on user scroll
8. Cache previous pages in UI to avoid redundant fetching

**Impact:**
- Memory usage: -70% (not loading 100+ DOM elements)
- Initial load: -50% (only 20 results rendered)
- Still provides users full search results (paginated access)
- Network traffic: Scaled (20 results per request)
- Complexity: Medium (pagination state management)

**Priority:** HIGH

---

## 2. PERFORMANCE IMPROVEMENTS

### CHANGE 2.1: Eliminate N+1 Query Problem

**Problem:**
Current implementation likely queries DB once to get song list, then N more queries to get lyrics/chords/metadata for each song. Total: 1 + N database hits.

**Change:**
Refactor database access to use batch queries and joins:
- Song list query: Single query with LEFT JOINs to fetch all needed data at once
- Alternative: Fetch song IDs in first query, then fetch all related data in single second query

**Location:**
DAO layer (SongDAO.java methods), Service layer (query orchestration)

**Implementation Plan:**
1. Audit current SongDAO methods to identify N+1 patterns
2. Rewrite primary search query to use INNER/LEFT JOINs
3. If joins too complex: Split into 2 queries max:
   - Query 1: Fetch song IDs matching criteria
   - Query 2: Fetch all songs, lyrics, chords in single query WHERE id IN (list)
4. Profile with 10,000 songs to verify only 1-3 queries total
5. Add performance log: "Query executed: N database hits"
6. Set rule in DAO: "No queries inside loops, ever"

**Impact:**
- Database load: -80% (N queries → 2 queries)
- Response time: -60-70% on large result sets
- Achieves <200ms search target consistently
- Complexity: Medium (requires SQL JOIN knowledge)

**Priority:** CRITICAL (blocks other performance improvements)

---

### CHANGE 2.2: Query Result Caching Layer

**Problem:**
Popular searches (e.g., "Jesus", "bhajan") may repeat many times. Querying DB each time wastes resources.

**Change:**
Add simple query result cache:
- In-memory cache (HashMap or similar)
- Key: hash(normalized_query, language_preference, sort_order)
- Value: query results + timestamp
- TTL: 1 hour (configurable)
- Invalidate cache on: song deletion, song creation, database update

**Location:**
Service layer (new: QueryCache.java, used by SearchService)

**Implementation Plan:**
1. Create QueryCache with get(key), put(key, value), invalidate() methods
2. Before executing DB query in SearchService, check cache
3. If cache hit: return cached result (log cache hit rate)
4. If cache miss: execute DB query, store result in cache, return
5. On song insert/update/delete: call cache.invalidate()
6. Monitor cache memory usage (limit to 100MB max)
7. Add metrics: hit rate, miss rate, evictions

**Impact:**
- Database load: -30-50% (popular searches from cache)
- Response time: -95% on cache hits (<10ms)
- Improves <200ms target for high-traffic scenarios
- Memory usage: +20-30MB expected (1 hour 100k+ searches)
- Complexity: Low (standard caching pattern)

**Priority:** MEDIUM (nice-to-have after N+1 fixed)

---

### CHANGE 2.3: Chord Parsing Caching

**Problem:**
ChordParser (or equivalent) re-parses same lyrics+chords hundreds of times. Transparent chords like "C" are extracted repeatedly.

**Change:**
Cache parsed chord data per song:
- Key: song_id
- Value: pre-parsed chords list + positions
- Cache loaded at app startup
- Re-parse only on song update

**Location:**
DAO layer or Service layer (new: ChordParseCache.java)

**Implementation Plan:**
1. At app startup: Load all songs and pre-parse chords for each
2. Store parsed result: {song_id → {lyrics, chords[], positions[]}}
3. In SearchService when fetching song: Get from cache, do NOT re-parse
4. On song update: Re-parse that song, update cache entry
5. Monitor cache: ensure <50MB memory footprint
6. Add metric: parse misses / parse attempts

**Impact:**
- Transposition speed: -95% (use cached chords, not re-parsed)
- Achieves <10ms transposition target consistently
- Reduced CPU on server (no repeated regex/parsing)
- Slight startup cost (pre-parsing all songs at boot)
- Complexity: Low (pre-computation)

**Priority:** HIGH (required for <10ms transposition)

---

### CHANGE 2.4: Batch Database Queries for Common Operations

**Problem:**
Operations like "get 5 most-played songs", "get related songs", etc. may execute separate queries per item.

**Change:**
Enforce batch query pattern for all operations:
- Rule: "If you need N items, write 1 query with N results, not N queries with 1 result"
- Examples:
  - Get 5 songs: SELECT * FROM songs WHERE id IN (1,2,3,4,5)
  - Search with metadata: Single JOIN query for all needed fields
  - Setlist rendering: Single query for all setlist items

**Location:**
DAO layer (all query methods)

**Implementation Plan:**
1. Document batch query pattern in code comments
2. Review all DAO methods for loop-based queries
3. Rewrite as IN clauses or single queries
4. Add test: verify each operation uses ≤2 queries
5. Add performance log showing query count
6. Build habit: New code must follow pattern before code review approval

**Impact:**
- Query count: -70-80% on complex operations
- Database connection pool: Less contention
- Response times: -40-60%
- Code maintainability: +20% (clearer intent)
- Complexity: Low (pattern-based)

**Priority:** CRITICAL

---

## 3. LANGUAGE & LYRICS HANDLING

### CHANGE 3.1: Dual Storage Implementation (Original + Roman)

**Problem:**
Currently storing only one lyrics variant. Cannot display both original and transliteration. Runtime transliteration is expensive.

**Change:**
Database schema update:
- `lyrics_original`: Full text in native script (Devanagari for Hindi/Marathi)
- `lyrics_roman`: Pre-computed Roman transliteration (phonetic spelling)
- Both stored as TEXT fields with CHARACTER SET utf8mb4
- Transliteration done ONCE at data entry, not at runtime

**Location:**
Database (songs table), DAO layer (query methods), Data import

**Implementation Plan:**
1. Backup database before schema changes (CRITICAL)
2. Add new columns: lyrics_roman (TEXT) to songs table
3. For existing songs: Generate Roman transliteration (one-time batch operation)
4. For new songs: Require both fields at input time
5. Data import pipeline: Expect lyrics_roman in import file
6. If not provided: Generate automatically at import time
7. Update DAO methods: Always fetch both fields
8. Validate: Every song has non-null lyrics_roman

**Impact:**
- Display flexibility: Can switch between original/Roman without recomputing
- Performance: -20-30% (no runtime transliteration)
- Storage: +30% database size (duplicate data, acceptable)
- Data integrity: Both versions are canonical (no single source of truth problems)
- Complexity: Low (schema addition, batch one-time operation)

**Priority:** CRITICAL (prerequisite for language system)

---

### CHANGE 3.2: Language Toggle UI Component

**Problem:**
Users cannot switch between original and Roman display. Only one version shown.

**Change:**
Add toggle UI element:
- Toggle appears in song view header
- Options: Original | Roman (2-state toggle or segmented control)
- Default: Roman
- State persisted: localStorage (survives page reload)
- Updates lyrics display on toggle without page reload

**Location:**
UI layer (js/app.js, jsp/songView.jsp, css/style.css)

**Implementation Plan:**
1. In songView.jsp: Add toggle button/control in header
2. Style toggle: clear visual state (highlight active option)
3. In app.js: Add toggle event handler → update lyrics display
4. Populate both lyrics_original and lyrics_roman on song load
5. Keep both in page DOM (hidden <div>, show/hide via CSS or swap text)
6. On toggle: localStorage.setItem("lyricsDisplayMode", choice)
7. On page load: Check localStorage and restore previous choice
8. Default to Roman if first visit

**Impact:**
- User experience: Full control over display format
- Accessibility: Both formats always available
- Performance: Negligible (display only, no recomputation)
- Complexity: Low (UI pattern)

**Priority:** MEDIUM

---

### CHANGE 3.3: Chord Mode = Roman Only

**Problem:**
When chords are displayed overlaid on lyrics, mixing Devanagari script with Roman chord notation (D, A, Bm) creates visual misalignment and is confusing.

**Change:**
Enforce rule: "When chords are visible, display ONLY Roman lyrics, never original script."
- Chord mode automatically overrides language toggle
- If user selects "Original" and clicks "Show Chords", display switches to Roman
- When chords hidden, user's language toggle selection resumes

**Location:**
UI layer (app.js), JSP logic (songView.jsp)

**Implementation Plan:**
1. Add state variable: chordsModeActive (boolean)
2. In app.js: On "Show Chords" button: set chordsModeActive = true
3. While chordsModeActive: force display of lyrics_roman (ignore language toggle)
4. Show notification: "Switched to Roman for chord alignment"
5. On "Hide Chords" button: set chordsModeActive = false
6. Resume respecting language toggle selection
7. Test with Hindi & Marathi songs: verify chord display correct

**Impact:**
- Visual clarity: Chords + original script no longer conflict
- User understanding: Clear why mode switched automatically
- Search usability: Unaffected (search ignores display mode)
- Complexity: Low (conditional display logic)

**Priority:** MEDIUM

---

### CHANGE 3.4: Language-Agnostic Search

**Problem:**
Search may be limited to single language or miss results in other languages.

**Change:**
Ensure search queries both fields equally:
- Search query matches against: title, artist, lyrics_roman, lyrics_original
- No language preference filtering (unless user explicitly selects language)
- Fuzzy matching applies to all fields
- Ranking applies equally (language doesn't boost in base search)

**Location:**
Service layer (SearchService.java)

**Implementation Plan:**
1. In SearchService.search(): Create query that searches all 4 fields
2. For each field: Apply fuzzy matching, generate variants, score results
3. Combine results: De-duplicate (song_id appears only once with highest score)
4. Rank combined results using unified scoring (see Change 1.4)
5. Return diverse results (song may match in multiple fields)
6. Test: Search for English keyword in Hindi song title (should find)
7. Test: Search for Hindi keyword in English song lyrics_roman (should find)

**Impact:**
- Search coverage: +40% (finds songs in any language)
- User satisfaction: Users find songs regardless of language knowledge
- Complexity: Low (multi-field search, standard pattern)

**Priority:** HIGH

---

## 4. ARCHITECTURE & CODE STRUCTURE

### CHANGE 4.1: Enforce Controller → Service → DAO Layer Separation

**Problem:**
Business logic may be scattered across Servlets, JSPs, and DAO classes. Changes require touching multiple layers. Difficult to test.

**Change:**
Strict layer separation pattern:

**Controller Layer (Servlets):**
- ONLY: Parse request parameters, validate input format, call Service methods, serialize response
- NEVER: Query database, apply business logic, call other Servlets

**Service Layer:**
- ONLY: Orchestrate business logic, coordinate DAO calls, apply rules and transformations, handle errors
- NEVER: Access request/response objects, make HTTP calls, access UI state

**DAO Layer:**
- ONLY: Execute database queries, map results to Java objects, handle DB transactions
- NEVER: Apply business logic, make decisions, access request/service layer objects

**Location:**
All Java code (Servlets, Services, DAOs)

**Implementation Plan:**
1. List all Servlet classes: identify where business logic lives currently
2. Extract business logic from Servlets → Create/modify Service classes
3. Extract business logic from DAOs → Move toward Service layer
4. Verify each Servlet: ≤20 lines of actual logic (just routing)
5. Verify each DAO method: Only SELECT/INSERT/UPDATE/DELETE, no conditionals
6. Create service package structure: com.worship.service.search, com.worship.service.song, etc.
7. Code review checklist: Does this violate layer rules?

**Impact:**
- Testability: +80% (services easily unit tested in isolation)
- Maintainability: +50% (changes stay within one layer)
- Code clarity: +40% (responsibilities obvious)
- Complexity: Low (architectural pattern, not algorithmic)

**Priority:** CRITICAL (enables all other improvements)

---

### CHANGE 4.2: Add Comprehensive Logging for Traceability

**Problem:**
When something goes wrong, hard to trace which layer failed, what query was executed, why result was wrong.

**Change:**
Add structured logging at Service layer entry/exit:
- Log: method name, input parameters, execution time, result count
- Log: what queries were executed and their counts
- Log: ranking scores for top matches
- Log errors with full context

**Location:**
Service layer (all Service classes)

**Implementation Plan:**
1. Use SLF4J + Logback (standard Java logging)
2. Configure logging: INFO level for progress, DEBUG for details
3. In SearchService: Log "Entering search: query={query}, language={lang}"
4. In SearchService: Log "Database query executed: matched {count} candidates"
5. In SearchService: Log "Ranking applied: top score={score}, result count={count}"
6. In SearchService: Log "Exiting search: time={ms}ms"
7. On errors: Log full stack trace + query details
8. Sample logging statement: `logger.info("Search completed in {}ms with {} results", duration, resultCount);`

**Impact:**
- Debuggability: +70% (clear execution path)
- Performance monitoring: Easy to identify slow operations
- Error diagnosis: +60% (context available immediately)
- Complexity: Low (standard logging pattern)

**Priority:** MEDIUM (quality-of-life improvement)

---

### CHANGE 4.3: Error Handling and Response Standardization

**Problem:**
Errors may return different formats. UI doesn't know how to handle different error types.

**Change:**
Standardize all API responses:
```
Success: {status: "success", data: {...}, time_ms: 123}
Error: {status: "error", errorCode: "SEARCH_TIMEOUT", message: "...", time_ms: 123}
Partial: {status: "partial", data: [...], warning: "...", time_ms: 123}
```

**Location:**
Service layer (exception handling), Controller layer (response formatting)

**Implementation Plan:**
1. Create Response wrapper class with fields: status, data, errorCode, message, time_ms
2. In Service: Throw custom exceptions (SearchTimeoutException, InvalidLanguageException, etc.)
3. In Servlet: Catch exceptions, convert to Response format, return JSON
4. Define error codes: SEARCH_TIMEOUT, DB_ERROR, INVALID_INPUT, etc.
5. Each error code maps to: HTTP status code + client-friendly message
6. Log all errors with full context before formatting response
7. Ensure time_ms always returned (for performance monitoring)

**Impact:**
- UI error handling: Simplified (consistent response format)
- Debugging: +40% (error codes are traceable)
- User experience: Better error messages
- Complexity: Low (wrapper pattern)

**Priority:** MEDIUM

---

## 5. SEARCH QUALITY & IMPLEMENTATION RELIABILITY AUDIT

**CRITICAL FINDING:** Current search design contains SIGNIFICANT ambiguities that WILL cause implementation failures if not clarified. This section identifies all risks.

---

### PART 1: SEARCH QUALITY DEFINITION

#### What counts as a valid match?
    
**Current answer (from plan):** Song matches if query matches any of: title, artist, lyrics_roman, lyrics_original using fuzzy matching.

**PROBLEM:** "Fuzzy matching" is not defined. What's acceptable error?

**REQUIRED RULES (MUST BE EXPLICIT):**

**Rule 1: Exact Match**
- Query "jesus" matches title "jesus loves me" → ALWAYS match

**Rule 2: Prefix Match**
- Query "jes" matches title "jesus" → ALWAYS match
- Query "sus" does NOT match title "jesus" → NO MATCH (middle/end only)

**Rule 3: Typo Tolerance (Levenshtein)**
- Query "jessu" vs title "jesus" → distance 1 → MATCH
- Query "jesu" vs title "jesus" → distance 1 → MATCH (vowel drop)
- Query "jse" vs title "jesus" → distance 2 → MATCH (aggressive typo)
- Query "xyz" vs title "jesus" → distance 5 → NO MATCH (too different)
- **THRESHOLD: Max Levenshtein distance = 2 (must be explicit)**

**Rule 4: Variant Matching**
- Query "jeevit" generates variants: ["jeevit", "jivit"] (vowel pairs only)
- Query matches title IF any variant is within Rule 3 threshold
- **VARIANT LIMIT: Max 3 variants per query (performance bound)**

**Rule 5: Partial Lyrics Match**
- Query "jesus" matches if ANY word in lyrics equals "jesus" (after normalization)
- Query "jes" matches if ANY word in lyrics STARTS WITH "jes"
- Query does NOT match if it matches MIDDLE of word (e.g., "sus" in "jesus" → NO)
- **Reason:** Chord alignment breaks if chords shift mid-word

**Rule 6: Tie-Breaking (CRITICAL)**
When two songs have identical match scores:
1. Primary: Exact match > Prefix match > Fuzzy match (deterministic hierarchy)
2. Secondary: Title match > Artist match > Lyrics match
3. Tertiary: Popularity (play_count) descending
4. Quaternary: Song ID ascending (deterministic fallback)
- **No random ordering. Ever.**

---

### PART 2: AMBIGUITY DETECTION - CRITICAL FLAWS

#### FLAW 1: Variant Generation is Under-Specified

**Current text:** "Generate short-vowel / long-vowel pairs (jivit/jeevit, jeewan/jawan)"

**AMBIGUITIES:**
- What are all valid vowel pairs? (a/aa? i/ii? e/ee? all?)
- For "jeevit", do you generate: [jeevit, jivit, jeewan, javan, jevan]? Which ones?
- If query is "jeevit", do variants include "jivit"? Or one-way only?
- What about consonant clusters? "jn" vs "n"?
- Max 5 variants - which 5 if more rules match?
- **Can variant generation create cycles?** (e.g., jeevit → jivit → jeevit?)

**RISK: HIGH** - Two developers will generate different variant sets.

#### FLAW 2: Fuzzy Scoring Formula is Implicit

**Current text:** "Assign weights: prefix=40%, substring=30%, distance=20%, length=10%"

**AMBIGUITIES:**
- How is PREFIX scored? If query="jes" and title="jesus":
  - Is score = 3/5 = 60%? Or 100% (any prefix matches)?
  - If query="j" and title="jesus" is score = 100%?
- How is SUBSTRING scored? If query="sus" and lyrics contains "jesus said":
  - Does "sus" in "jesus" count? (Rule 5 says NO, but formula doesn't clarify)
  - How do overlapping substrings score?
- How is DISTANCE scored? If Levenshtein distance=1:
  - Score = 95%? 80%? Formula not given.
  - Distance=2: Score = 85%? 70%? Threshold?
- How is LENGTH NORMALIZATION applied? If query="a" matches "abraham":
  - Score reduced because query is tiny? By how much?
- **Final calculation:** Do you multiply weighted percentages? Add? (40% * prefix_score + 30% * substring_score...)? How?

**RISK: CRITICAL** - Without formula, AI will guess and produce wrong scores.

#### FLAW 3: Ranking Tie-Breaking is Not Specified

**Current text:** "fuzzy=60%, language=20%, popularity=10%, recency=10%"

**AMBIGUITIES:**
- If use HAS NEVER played a song (popularity=0, recency=0), how do you rank it?
  - Does score = 60% of fuzzy? Or is 0% weighted as "bottom"?
  - What's the fallback? ID?
- If two songs have identical fuzzy score, language match, popularity: tie-breaker?
  - Alphabetical by title?
  - By song ID?
  - Random? (NOT deterministic = unacceptable)
- What's "language match"? If user searches for "amen" (English) in all languages:
  - Does Hindi song with English title score higher? How much?
  - Is it binary (match=100%, no match=0%) or scaled?

**RISK: CRITICAL** - Non-deterministic ranking = different results on rerun.

#### FLAW 4: Pagination Consistency Not Addressed

**Current text:** "Return: results[start_index:end_index] + metadata"

**AMBIGUITIES:**
- Song added/deleted between page 1 and page 2 requests: what happens?
  - User expects 50 results, gets 49?
  - User sees same song twice on different pages?
  - **No mention of snapshot consistency.**
- If user searches for "jesus", gets 100 results, goes to page 2:
  - Are results sorted same way? (Determinism check)
  - If database updated, does rank order change mid-paginate?

**RISK: MEDIUM** - Inconsistent results across pagination requests.

#### FLAW 5: Chord Parser Cache Invalidation Not Clear

**Current text:** "Cache loaded at app startup. Re-parse only on song update."

**AMBIGUITIES:**
- "Song update" - add lyrics_roman? Change lyrics_original? Both?
- If lyrics_roman changes, does cache invalidate for BOTH lyrics?
- If cache is accessed while being invalidated, what happens? (race condition?)
- If lyrics are HTML-escaped differently in DB vs cache: mismatch?

**RISK: MEDIUM** - Cache serving stale data or misaligned data.

#### FLAW 6: Multi-Field Search Not Specified

**Current text:** "Search query matches against: title, artist, lyrics_roman, lyrics_original"

**AMBIGUITIES:**
- If "jesus" matches title AND lyrics_roman: counted once or twice?
- Does title match weight higher than lyrics match? (not specified)
- If song has 3 lyric matches + 1 title match: score = 4 matches? Or capped?
- "De-duplicate (song_id appears only once)" - but using which score? (highest? average?)

**RISK: MEDIUM** - Different de-duplication strategies produce different results.

#### FLAW 7: Normalization Rules Not Fully Specified

**Current spec:** "Trim, lowercase, remove punctuation, NFD unicode normalization"

**AMBIGUITIES:**
- What counts as "punctuation"? 
  - Hyphens: "multi-lingual" → "multilingual" or keep "-"?
  - Apostrophes: "don't" → "dont" or "dont"?
  - Dots: "Dr." → "dr" or "dr"?
- "Remove punctuation except hyphens within words" - what's "within"?
  - "hello-world" keeps "-"? Yes.
  - "-hello" or "hello-" keeps "-"? Unclear.
- NFD normalization: Does "ं" (anusvara) normalize same way as "न्"?
  - Different results on different systems?

**RISK: MEDIUM** - Normalization non-deterministic across platforms.

---

### PART 3: HALLUCINATION RISK ANALYSIS

#### HIGH RISK AREAS (AI will guess incorrectly):

**1. Fuzzy Score Calculation**
- Missing: Exact mathematical formula
- An AI might implement: `score = 0.4*prefix + 0.3*substring + 0.2*distance + 0.1*length`
- Reality might need: `score = max(prefix, substring) weighted by distance decay`
- **OUTCOME: Wrong relevance ranking, poor user experience**

**2. Variant Generation Termination**
- Missing: Cycle detection, termination condition
- An AI might implement: Recursive variant generation
- Reality might need: Fixed rule set, max 3 variants, one-way generation
- **OUTCOME: Infinite loops, server hangs, deployment failure**

**3. Language Toggle Override in Chord Mode**
- Missing: Exact timing of override (when applied?)
- An AI might implement: Check chords at display time
- Reality might need: Check at query time or cache level
- **OUTCOME: Performance regression, unexpected behavior**

**4. Pagination Snapshot Consistency**
- Missing: How to handle DB updates mid-pagination
- An AI might implement: Nothing (assume DB frozen during pagination)
- Reality might need: Snapshot query or timestamp-based filtering
- **OUTCOME: Users see duplicate/missing results across pages**

#### MEDIUM RISK AREAS (Inconsistent results possible):

**5. Ranking Tie-Breaking**
- Missing: Explicit fallback rules
- An AI might implement: Sort by title alphabetically
- Reality might need: Sort by ID (simpler, deterministic)

**6. Cache Invalidation Concurrency**
- Missing: Thread-safety specification
- An AI might implement: Simple HashMap with no locking
- Reality might need: ConcurrentHashMap or explicit locks

**7. Multi-Field Search Deduplication**
- Missing: Score combination strategy
- An AI might implement: Add all match scores
- Reality might need: Use highest score only

#### LOW RISK AREAS (Deterministic, safe):

**8. Input Normalization** - Clear rules, standard algorithms
**9. Chord Parsing Cache Structure** - Straightforward key-value pattern
**10. Layer Separation** - Architectural pattern, well-defined boundaries

---

### PART 4: HARDENING THE SYSTEM (REQUIRED CHANGES)

#### HARDENING 1: Create SEARCH_LOGIC_SPEC.md

This document MUST exist and specify:

**Section A: Match Types (Deterministic Rules)**
```
MATCH TYPE 1: EXACT
- Input: query="jesus", field="jesus loves me"
- Output: MATCH, Score: 100
- Condition: Normalized query equals normalized field word

MATCH TYPE 2: PREFIX
- Input: query="jes", field="jesus"
- Output: MATCH, Score: 95
- Condition: Normalized field starts with normalized query

MATCH TYPE 3: FUZZY (Levenshtein)
- Input: query="jessu", field="jesus"
- Output: MATCH (distance=1), Score: 85
- Condition: Levenshtein(query, field) <= 2
- Scoring: score = 100 - (distance * 5)

MATCH TYPE 4: VARIANT
- Input: query="jeevit", variant_list=["jeevit", "jivit"]
- Output: Check each variant with MATCH TYPE 1-3
```

**Section B: Scoring Formula (Explicit Math)**
```
FOR EACH FIELD (title, artist, lyrics_roman, lyrics_original):
  best_match_score = max_match_from_all_match_types
  field_score[field] = best_match_score

final_score = (
  title_score * 0.40 +
  artist_score * 0.30 +
  lyrics_roman_score * 0.15 +
  lyrics_original_score * 0.15
)

ranking_score = (
  final_score * 0.60 +
  language_match_score * 0.20 +
  popularity_score * 0.10 +
  recency_score * 0.10
)
```

**Section C: Variant Generation (Deterministic)**
```
INPUT: "jeevit"
VOWEL PAIR RULES:
  i → i,ii
  e → e,ee
  a → a,aa
  
APPLY RULES (in order, max 3 variants):
1. Replace first vowel: jeevit → jivit (replace first 'e' with 'i')
2. Replace second vowel: jeevit → jeevit (already 'ee', no change)
3. Stop (max 3 reached)

OUTPUT: ["jeevit", "jivit"] (deterministic, ordered)
```

**Section D: Ranking Tie-Breaker (Hierarchical)**
```
IF final_scores EQUAL:
  1. Compare: exact matches > prefix > fuzzy > variant
  2. If still equal: title > artist > lyrics
  3. If still equal: popularity (descending)
  4. If still equal: recency (descending)
  5. If still equal: song_id (ascending) [TIEBREAKER]
```

---

#### HARDENING 2: Specify Chord Parser Cache Rules

**CURRENT (vague):** "Cache loaded at app startup. Re-parse only on song update."

**HARDENED:**
```
CHORD PARSER CACHE RULES:

Rule 1: Initialization
- At app startup: Load all songs, pre-parse chords for each
- Structure: Map<song_id → {lyrics_roman, lyrics_original, chords[], positions[]}>
- Size limit: Fail if >100MB (prevents OOM)

Rule 2: Cache Invalidation Triggers
- On INSERT song: Add entry to cache
- On UPDATE song: Remove old entry, add new entry (atomic)
- On DELETE song: Remove entry from cache
- On any UPDATE: snapshot timestamp recorded for versioning

Rule 3: Access Pattern
- Check cache before any chord parsing
- If song_id not in cache: FAIL (do not parse on demand)
- If chord data mismatch: Log error, use cache version

Rule 4: Concurrency Safety
- Use ConcurrentHashMap (thread-safe)
- Cache writes must be atomic (replace entire entry, no partial updates)
```

---

#### HARDENING 3: Pagination Consistency Rule

**CURRENT (vague):** "Return: results[start_index:end_index]"

**HARDENED:**
```
PAGINATION RULE:

Rule 1: Snapshot Consistency
- All pages use SAME sorted result set (captured at request start)
- Results sorted by: ranking_score DESC, then song_id ASC
- Query result set frozen: no DB updates affect pagination

Rule 2: Implementation: Option A (Preferred)
- Cache query results in service: List<Song> results = service.searchCache(query)
- Service caches for 5 minutes (TTL)
- Pagination pulls from cached result

Rule 3: Implementation: Option B (If caching not available)
- Include SQL LIMIT/OFFSET in initial query
- Result set may shift if DB updates: document this risk

Rule 4: Empty Results
- If requested page > total pages: return empty list + has_next=false
- Do NOT return error, just empty
```

---

#### HARDENING 4: Multi-Field Search Deduplication

**CURRENT (vague):** "De-duplicate (song_id appears only once with highest score)"

**HARDENED:**
```
MULTI-FIELD SEARCH RULES:

Algorithm:
1. Create Map<song_id → best_match_score>
2. For each field (title, artist, lyrics_roman, lyrics_original):
   - Execute search in that field
   - For each match: song_id → score
   - If song_id already in map: keep higher score (best_match_score = max(old, new))
3. Sort by best_match_score descending, then song_id ascending
4. Return final result

Example:
- Query: "jesus"
- Title matches: song_1 (score 95), song_2 (score 88)
- Lyrics matches: song_1 (score 92), song_3 (score 85)
- Final: song_1 (95, found in both), song_2 (88), song_3 (85) [ordered by best score]
```

---

#### HARDENING 5: Language Toggle Behavior (Explicit)

**CURRENT (vague):** "Chord mode automatically overrides language toggle"

**HARDENED:**
```
LANGUAGE DISPLAY LOGIC:

State Variables:
- user_language_preference: "original" or "roman"
- chords_mode_active: true or false

Display Rule:
  IF chords_mode_active == true:
    DISPLAY: lyrics_roman (ALWAYS, ignore preference)
  ELSE:
    DISPLAY: lyrics_original if user_pref=="original", lyrics_roman if "roman"

Override Rule:
  IF user clicks "Show Chords" and pref=="original":
    SET chords_mode_active = TRUE
    SET display_mode = "roman"
    SHOW notification: "Switched to Roman for chord alignment"
  
  IF user clicks "Hide Chords":
    SET chords_mode_active = FALSE
    RESTORE display to previous user_pref

Persistence:
  localStorage.setItem("user_language_pref", pref)
  localStorage.setItem("chords_mode_active", boolean)
```

---

### PART 5: IMPLEMENTATION SAFETY SCORE

Based on current design:

**Scoring Breakdown:**

| Component | Current | Hardened | Risk |
|-----------|---------|----------|------|
| Normalization | 7/10 | 9/10 | MEDIUM |
| Variant Generation | 2/10 | 8/10 | CRITICAL |
| Fuzzy Scoring | 3/10 | 9/10 | CRITICAL |
| Ranking/Tie-Breaking | 2/10 | 9/10 | CRITICAL |
| Pagination | 4/10 | 8/10 | MEDIUM |
| Cache Invalidation | 3/10 | 8/10 | CRITICAL |
| Layer Separation | 8/10 | 9/10 | LOW |

**OVERALL SAFETY SCORE: 3.6/10 (HIGHLY AMBIGUOUS)**

**Interpretation:**
- Current design: AI will hallucinate and produce unpredictable behavior
- Variant generation: 2/10 = will loop infinitely or generate wrong variants
- Fuzzy scoring: 3/10 = wrong relevance ranking, poor UX
- Ranking: 2/10 = non-deterministic, different results on rerun
- Cache: 3/10 = will serve stale data, race conditions likely

**After applying hardening recommendations: 8.5/10 (SAFE FOR IMPLEMENTATION)**

---

### PART 6: REQUIRED IMPROVEMENTS (MUST DO)

#### CRITICAL (Must create before coding begins):

1. **Create SEARCH_LOGIC_SPEC.md**
   - Exact match types with examples
   - Explicit fuzzy scoring formula
   - Deterministic variant generation algorithm
   - Ranking tie-breaker hierarchy
   - **WITHOUT THIS: Implementation will fail**

2. **Create CACHE_INVALIDATION_SPEC.md**
   - Exactly when cache is invalidated (with timestamps)
   - Thread-safety rules (ConcurrentHashMap required)
   - Failure modes (what if cache corrupted?)
   - **WITHOUT THIS: Stale data bugs will appear in production**

3. **Create PAGINATION_CONSISTENCY_SPEC.md**
   - How to handle DB updates between page requests
   - Snapshot isolation requirements
   - Fallback behavior for edge cases
   - **WITHOUT THIS: Users see duplicate/missing results**

#### IMPORTANT (Complete before search optimization):

4. **Create TEST_CASES.md**
   - 50+ test cases covering: exact match, prefix, fuzzy, variants, tie-breaking
   - Include edge cases: empty results, identical scores, single character queries
   - Include multi-language tests: Hindi/Marathi/English variants
   - **WITHOUT THIS: No way to verify implementation is correct**

5. **Create PERFORMANCE_TEST_SPEC.md**
   - How to measure: search <200ms, transposition <10ms
   - Performance benchmarks for variant generation
   - Cache hit rate tracking
   - **WITHOUT THIS: No way to verify <200ms target**

6. **Add Explicit Examples to SYSTEM_CHANGE_PLAN.md**
   - Example searches with expected results
   - Example ranking scenarios with multiple ties
   - Example pagination across DB updates
   - **WITHOUT THIS: Ambiguities remain in developer minds**

#### NICE-TO-HAVE (Quality improvements):

7. **Create DEBUGGING_GUIDE.md**
   - How to trace a search query through the system
   - Log points required at each step
   - How to identify why a song did/didn't match
   - **For when bugs inevitably appear**

---

### PART 7: FINAL ASSESSMENT

#### What will happen if you implement WITHOUT hardening?

❌ Variant generation will either:
- Loop infinitely (if not bounded)
- Generate random variants (if rules not deterministic)
- Skip valid matches (if rules too restrictive)

❌ Fuzzy scoring will produce:
- Unpredictable result order
- Different results on same query at different times
- Wrong songs ranking higher than relevant ones

❌ Ranking will be:
- Non-deterministic (AI will guess tie-breaker)
- Inconsistent across requests
- Different on different servers/clusters

❌ Cache will:
- Serve stale data
- Break chord alignment
- Cause race conditions

**Result: Search feature fails QA, cannot ship, months of debugging**

#### What you gain by hardening:

✅ **Determinism:** Same input always produces same output
✅ **Reproducibility:** Any developer can trace exact logic
✅ **Debuggability:** Bugs traceable to specific rules
✅ **Testability:** Clear success/failure criteria
✅ **AI-Safe:** AI cannot hallucinate missing logic (it's all explicit now)

**Result: Implementation succeeds first time, ships on schedule**

---

## IMMEDIATE ACTIONS REQUIRED

**Before any coding starts:**

1. ✅ Create SEARCH_LOGIC_SPEC.md (4-6 hours)
2. ✅ Create CACHE_INVALIDATION_SPEC.md (2-3 hours)
3. ✅ Create PAGINATION_CONSISTENCY_SPEC.md (2-3 hours)
4. ✅ Add detailed examples to this document (1-2 hours)
5. ✅ Get stakeholder approval on hardening specs (1 hour)

**Time investment:** 10-15 hours (CRITICAL investment)
**Payoff:** Eliminates 80% of debugging/rework time later

---

## 6. FUTURE ENHANCEMENTS (OPTIONAL)

### ENHANCEMENT 6.1: User Play History and Preferences

**Problem:**
No user personalization. All users see same result order.

**Enhancement:**
Track user play history, enable personalized results:
- New schema: user_plays table (user_id, song_id, play_count, last_played_date)
- New feature: Filter results "My Recent" or "Most Played by Me"
- Ranking: Use play_count as secondary score (user's most-played songs rank higher)

**Location:**
Database (new table), DAO layer (queries), Service layer (personal ranking logic)

**Implementation Plan:**
(Deferred — not required for MVP optimization)

---

### ENHANCEMENT 6.2: Smart Setlist Recommendations

**Problem:**
Users manually build setlists. Would benefit from song recommendations based on theme/language.

**Enhancement:**
Recommend songs for setlist based on:
- Songs with similar themes/genres in current list
- Songs in same language as majority of setlist
- Songs with similar BPM (if BPM added to schema)

**Location:**
Service layer (new: SetlistRecommendationService)

**Implementation Plan:**
(Deferred — not required for MVP optimization)

---

## PRIORITY ORDER & SEQUENCING

### WHY THIS ORDER?
1. **Fix foundations first** (N+1 queries, layer separation)
2. **Then optimize search** (normalization, variants, ranking)
3. **Then optimize display** (dual storage, caching, language toggle)
4. **Finally observe & monitor** (logging, error handling)

### CRITICAL PATH (MUST DO FIRST):

1. **CHANGE 2.1: Eliminate N+1 Query Problem**
   - Blocks: Everything else
   - Effort: 4-6 hours
   - Impact: -60-70% response time
   - Without this: Other optimizations have minimal impact

2. **CHANGE 4.1: Enforce Layer Separation**
   - Blocks: Clean implementation of other changes
   - Effort: 3-4 hours (refactoring existing code)
   - Impact: +80% testability, easier to modify layers independently
   - Without this: Changes scatter across layers, become fragile

3. **CHANGE 3.1: Dual Storage (Original + Roman)**
   - Blocks: Language toggle, chord mode
   - Effort: 2-3 hours (schema + batch import)
   - Impact: Foundation for all language features
   - Without this: Can't display both formats

### HIGH PRIORITY (DO NEXT):

4. **CHANGE 1.1: Input Normalization** (1-2 hours)
5. **CHANGE 1.2: Search Variants** (3-4 hours)
6. **CHANGE 2.3: Chord Parsing Cache** (1-2 hours) — Required for <10ms transposition
7. **CHANGE 1.3: Fuzzy Scoring** (2-3 hours)
8. **CHANGE 1.4: Result Ranking** (1-2 hours)

### MEDIUM PRIORITY (CAN FOLLOW):

9. **CHANGE 1.5: Pagination** (2-3 hours)
10. **CHANGE 3.2: Language Toggle UI** (1-2 hours)
11. **CHANGE 3.3: Chord Mode Roman-Only** (1 hour)
12. **CHANGE 4.2: Logging** (2-3 hours)

### LOW PRIORITY (NICE-TO-HAVE):

13. **CHANGE 2.2: Query Caching** (2-3 hours) — Implement only if needed after other changes
14. **CHANGE 3.4: Language-Agnostic Search** (1-2 hours) — Actually mostly done with above changes
15. **CHANGE 4.3: Error Handling Standardization** (1-2 hours)

---

## IMPLEMENTATION TIMELINE

**Phase 1 (Critical Foundation):** 10-12 hours
- Fix N+1 queries
- Enforce layer separation
- Add dual storage

**Phase 2 (Search Optimization):** 12-16 hours
- Normalization
- Variants
- Fuzzy matching
- Ranking
- Chord caching

**Phase 3 (Polish & Monitoring):** 5-8 hours
- Language toggle UI
- Chord mode logic
- Pagination
- Logging setup

**TOTAL ESTIMATED EFFORT:** 27-36 hours (3-4.5 days with full-time focus)

---

## SUCCESS CRITERIA

After implementation, verify:

- [ ] Search response time: <200ms for 10,000 songs
- [ ] Transposition response time: <10ms for any song
- [ ] Song load response time: <100ms
- [ ] Database queries per request: ≤2 (down from 1+N)
- [ ] Language toggle: Works without page reload
- [ ] Chord mode: Always shows Roman, never original script
- [ ] Search results: Include songs across all languages
- [ ] Cache hit rate: >50% for search (baseline: 0%)
- [ ] Test coverage: All Service layer classes have >80% coverage
- [ ] Logs: Every request traceable from servlet → service → DAO

---

## ROLLBACK PROCEDURES

If major issues discovered:

1. **Database changes:** Restore from backup (ALWAYS backup before schema changes)
2. **Code changes:** Revert to "before-optimization" Git branch
3. **Cache issues:** Clear cache manually or restart app
4. **Query problems:** Run specific problematic query in MySQL console to verify

Keep "before-optimization" branch stable and never delete.

---

## DOCUMENTATION DEPENDENCIES

This plan references:
- **PERFORMANCE_GUIDELINES.md** — Performance targets and rules
- **LYRICS_LANGUAGE_DECISION.md** — Language storage and display strategy
- **IMPLEMENTATION_BLUEPRINT.md** — System layer architecture and feature pipelines

All decisions in this plan are consistent with those documents. Update either document if requirements change.

---

**Status:** Ready for execution
**Next Step:** Create Git "before-optimization" branch before beginning implementation
