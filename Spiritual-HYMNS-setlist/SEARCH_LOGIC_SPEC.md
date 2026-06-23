# SEARCH_LOGIC_SPEC.md

**Purpose:** Deterministic mathematical and logical specification for search system. Eliminates all ambiguity in scoring, ranking, and matching logic.

**Version:** v1.0-STABLE (Frozen - April 15, 2026)
**Last Updated:** 2026-04-15
**Audience:** Developers implementing search. Reference for QA testing. AI implementation guide.
**Referenced By:** SYSTEM_CHANGE_PLAN.md (Section 5), SEARCH_TEST_CASES.md
**Freeze Status:** ✅ LOCKED - All 25 bugs resolved, 12 architectural decisions locked, 5-layer architecture defined. No further changes without version bump to v1.1+

---

## SECTION A: NORMALIZATION RULES (DETERMINISTIC)

### A.1: Normalization Pipeline (In Order)

**Step 1: Trim Whitespace**
- Input: `"  hello  world  "`
- Operation: Remove leading/trailing whitespace, collapse internal multiple spaces to single space
- Output: `"hello world"`

**Step 2: Convert to Lowercase**
- Input: `"JESUS Love Me"`
- Operation: Unicode lowercase conversion (use String.toLowerCase() in Java)
- Output: `"jesus love me"`

**Step 3: NFD Normalization (Unicode)**
- Input: `"हिंदी"` (Hindi with diacritics)
- Operation: Unicode NFD normalization (decompose combining characters)
- Output: Decomposed form (consistent across platforms)
- Reason: Ensures consistent comparison across different input methods

**Step 4: Remove Punctuation (With Exceptions)**
- Input: `"don't say: hello-world, yes?"`
- Rules:
  - Remove: `,` `.` `;` `:` `?` `!` `"` `'` `(` `)` `[` `]` `{` `}` `/` `\` `@` `#` `$` `%` `^` `&` `*` `+` `=`
  - KEEP: `-` (only if between letters, not at start/end)
  - Keep: spaces (already handled by collapsing)
- Output: `"dont say hello-world yes"`
- Algorithm:
  ```
  FOR each character in input:
    IF character in remove_set: skip
    IF character == "-":
      IF (previous char is letter) AND (next char is letter): keep
      ELSE: remove
    ELSE: keep character
  ```

**Step 5: Collapse to Single Space (Final)**
- Input: `"hello  world"`
- Operation: Convert any remaining whitespace sequences to single space
- Output: `"hello world"`

**Final Output:** Normalized query ready for matching

### A.2: Normalization Constraints

**Constraint 1: Bidirectionality**
- Normalization MUST be deterministic (same input = same output always)
- Test: `normalize("JESUS") == normalize("jesus")` must be TRUE

**Constraint 2: Reversibility Safety**
- Normalization must NOT lose semantic meaning
- Example: `"krushna"` → (no normalization removes letters)
- Example: `"जीवित"` → (diacritics decomposed but base characters intact)

**Constraint 3: Hindi/Marathi Specific**
- Diacritic handling: `ा` (long a) remains distinct from `ा` (short step)
- But after NFD normalization, both treated as decomposed base letter
- Consequence: `"कात"` and `"काठ"` are different after NFD

**Constraint 4: Zero-Padding Not Allowed**
- Normalization MUST NOT add zero-width characters
- MUST NOT change string length in significant way

---

## SECTION B: MATCH TYPES (DETERMINISTIC PRECEDENCE)

### B.1: Match Type Hierarchy (Ranked by Score)

**RANK 1: EXACT MATCH (Score: 100)**
```
Condition: normalized_query == normalized_field_substring
Example: query="jesus", field="Jesus loves me" → normalized: "jesus" == "jesus" in title
Result: MATCH, Score: 100
Applies to: Each field independently (title, artist, lyrics_roman, lyrics_original)
```

**RANK 2: PREFIX MATCH (Score: 95)**
```
Condition: normalized_field starts with normalized_query (at word boundary)
Example: query="jes", field="jesus" → normalized: "jesus" starts with "jes"
Result: MATCH, Score: 95

Word Boundary Definition:
- At start of string: position 0
- After space: " j" matches prefix
- NOT in middle of word: "sus" in "jesus" → NO MATCH

Algorithm:
FOR each word in normalized_field:
  IF word starts with normalized_query:
    MATCH found, score 95, stop
```

**RANK 3: NORMALIZED EXACT (Score: 90)**
```
Condition: After removing vowel modifiers (not full variant generation)
Example: query="kaat", field="काठ" normalized to "kaat"
Result: MATCH if fields normalize to same string
Score: 90 (lower than prefix because less precise)
```

**RANK 4: VARIANT MATCH (Score: 85)**
```
Condition: Query generates variant, variant matches exactly
Generated variants applied BEFORE fuzzy matching
Example: query="jeevit" generates ["jeevit", "jivit"]
  - If field="jivit" (exact on variant): Score 85
  - If field="jeevit" (exact on original): Score 100 (not variant, exact)

Variant Generation Rules (see Section C)
```

**RANK 5: FUZZY MATCH (Score: 50-80 based on distance)**
```
Condition: Levenshtein distance <= 2 AND token_length >= 4
Scoring (see Section B.2 for exact formula)
Example: query="yesu", field="yeshu" → distance=1, score=75
Note: Disabled for tokens with length < 4 (see Section B.6)
```

### B.6: Short Token & Fuzzy Restrictions (MANDATORY)

**Rule: Disable fuzzy matching for short tokens**

```
IF token_length < 4:
  Disable fuzzy matching (no distance tolerance)
  Allow: exact, prefix, normalized, variant
  Deny: fuzzy (distance-based)
  
Rationale: Single-character and 2-3 char tokens are too noisy for fuzzy matching
  "a" fuzzy could match "e", "b", etc. (unacceptable)
  "ab" fuzzy adds too many false positives
  4+ characters have enough specificity for distance-2 tolerance

Example:
  Query: "am" → token_length=2
    Field: "amazing" → EXACT "am" prefix → ✓ MATCH (95)
    Field: "alarm" → EXACT "am" prefix → ✓ MATCH (95)
    Field: "xm" → FUZZY distance=1 → ✗ REJECTED (fuzzy disabled)
  
  Query: "amaz" → token_length=4
    Field: "amazing" → PREFIX "amaz" → ✓ MATCH (95)
    Field: "amzg" → FUZZY distance=2 → ✓ MATCH (50)
```

### B.2: Fuzzy Score Formula (MANDATORY)

**Levenshtein Distance-Based Scoring:**

```
distance = levenshtein_distance(normalized_query, normalized_field)

IF distance == 0:
  score = 100 (exact match, should not reach fuzzy scorer)

IF distance == 1:
  score = 75

IF distance == 2:
  score = 50

IF distance > 2:
  score = 0 (NO MATCH, reject result)

THRESHOLD: Max allowed distance = 2
```

**Example Calculations:**
```
Query: "yesu" (normalized)
Field: "yeshu" (normalized)
Distance: 1 (insert 'h')
Score: 75

Query: "jesus"
Field: "jess" 
Distance: 1 (delete 'u')
Score: 75

Query: "hello"
Field: "hallo"
Distance: 1 (substitute 'e' → 'a')
Score: 75

Query: "abc"
Field: "xyz"
Distance: 3 (all different)
Score: 0 (REJECTED)
```

---

## SECTION C: VARIANT GENERATION RULES (DETERMINISTIC)

### C.1: Variant Rules by Language

**Hindi Vowel Pair Rules (Bidirectional):**
```
Rule Set:
  vowel_i: ["i", "ii"]      (short ि / long ी)
  vowel_e: ["e", "ee"]      (short े / long ी)
  vowel_a: ["a", "aa"]      (short (none) / long ा)
  vowel_o: ["o", "oo"]      (short ो / long ौ)
  vowel_u: ["u", "uu"]      (short ु / long ू)

Application:
  FOR each vowel in query:
    IF vowel in vowel_pairs:
      Generate alternative form
      Add to variant list (if not already present)

Constraint: Max 3 variants total (includes original)
```

**Example: Input "jeevit"**
```
Step 1: Find vowels: j[e]ev[i]t
Step 2: Apply rules:
  - First 'e' (ee) → variant with 'e': "jevit"
  - Second 'i' (i) → variant with 'ii': "jeevit" (already have)
Step 3: Stop at 3 variants
Output: ["jeevit", "jevit"] (original first, then variants)
```

**Marathi-Specific Rules (Consonant Clusters):**
```
Rule Set:
  sh ↔ s  (श ↔ स)
  ch ↔ c  (छ ↔ च)
  th ↔ t  (ठ ↔ त)
  kh ↔ k  (ख ↔ क)

Application: Same as Hindi vowel pairs
Generates max 1 additional variant per cluster
```

### C.2: Variant Generation Algorithm (DETERMINISTIC)

**Input:** Normalized query string
**Output:** List of variants (max 3, including original)

```
Algorithm:
1. Start with original query: variants = [query]
2. FOR each character position in query:
   3. IF character in vowel_pairs:
      4. Create new string with alternative vowel
      5. IF new string not in variants AND size(variants) < 3:
         6. Add new string to variants
3. RETURN variants (ordered: original first, then generated)

Constraint: Bidirectional variants
   - "jeevit" generates "jevit"
   - "jevit" generates "jeevit"
   - Both generate same set

Constraint: No Recursion
   - Variants of variants NOT generated
   - Only one level deep
```

**Example Execution:**
```
Input: "krushna"
Step 1: variants = ["krushna"]
Step 2a: Check 'k' - not a vowel, skip
Step 2b: Check 'r' - not a vowel, skip
Step 2c: Check 'u' - IS vowel (u/uu pair)
   Generate "krushna" with 'uu': "kruushna"
   variants = ["krushna", "kruushna"]
Step 2d: Check 's','h','n','a' - only 'a' is vowel
   Generate "krushna" with 'aa': "krushnaa"
   variants = ["krushna", "kruushna", "krushnaa"]
Step 3: Max reached (3), stop
Output: ["krushna", "kruushna", "krushnaa"]
```

---

## SECTION D: MULTI-FIELD SCORING RESOLUTION (DETERMINISTIC)

### D.1: Field Priority Weights (MANDATORY - NO ALTERNATIVES)

**Primary Rule: Title has highest priority**

```
Field Priority Ranking:
1. title_weight = 1.0 (highest)
2. artist_weight = 0.7
3. lyrics_roman_weight = 0.4
4. lyrics_original_weight = 0.4

Calculation Method:
1. Calculate best_match_score per field (using match types from Section B)
2. Multiply by field weight
3. Take MAXIMUM weighted score (not sum)

Example:
Song A:
  - title_score = 100 (exact match) → 100 * 1.0 = 100
  - artist_score = 50 (fuzzy) → 50 * 0.7 = 35
  - lyrics_score = 0 (no match)
  → FINAL = max(100, 35, 0) = 100

Song B:
  - title_score = 0 (no match)
  - artist_score = 75 (prefix) → 75 * 0.7 = 52.5
  - lyrics_score = 100 (exact) → 100 * 0.4 = 40
  → FINAL = max(0, 52.5, 40) = 52.5

Song C:
  - title_score = 90 (normalized match) → 90 * 1.0 = 90
  - artist_score = 100 (exact) → 100 * 0.7 = 70
  - lyrics_score = 80 (prefix) → 80 * 0.4 = 32
  → FINAL = max(90, 70, 32) = 90
```

**Rule: Weight differences automatically enforce title priority without special cases**

Consequence: An exact title match (100 * 1.0 = 100) beats exact lyrics match (100 * 0.4 = 40) through weights alone.

### D.3: Final Score Calculation (Single MAX Model)

**Core Rule: Use MAXIMUM formula (never SUM) - MANDATORY**

```
Algorithm (Deterministic):

1. For each field (title, artist, lyrics_roman, lyrics_original):
   - For each token in query:
     - Find best match score across all variants (Section C)
     - Store token_scores for this field
   - field_score = MIN(token_scores)  // All tokens required for AND logic
   
2. Weighted field scores:
   title_weighted = field_score[title] * 1.0
   artist_weighted = field_score[artist] * 0.7
   lyrics_roman_weighted = field_score[lyrics_roman] * 0.4
   lyrics_original_weighted = field_score[lyrics_original] * 0.4

3. Apply phrase bonus (if applicable):
   IF tokens appear consecutively in field (phrase match):
     field_score_before_weight += 20 (applied BEFORE weighting)
   Constraint: Phrase bonus capped at 100 (no overflow)

4. FINAL SCORE = MAX(title_weighted, artist_weighted, lyrics_roman_weighted, lyrics_original_weighted)
   Input: Four weighted field scores
   Output: Highest weighted score
   Range: [0, 100]

Constraint: NO weighting combinations, NO SUM formula, NO cross-field overrides
```

**Example:**
```
Query: "yesu mahima" tokens=["yesu", "mahima"]

Song A: Title="Yesu Mahima"
  - title_field_score: yesu=100(exact), mahima=100(exact) → MIN(100,100)=100
  - artist_field_score: (no match) → 0
  - lyrics_field_score: (no match) → 0
  - Phrase bonus: YES (consecutive) → 100+20=120 → capped at 100
  - title_weighted = 100 * 1.0 = 100
  - FINAL = MAX(100, 0, 0) = 100 ✓

Song B: Title="Unknown", Lyrics="Yesu Ki Mahima"
  - title_field_score: (no match) → 0
  - lyrics_field_score: yesu=100(exact), mahima=100(exact) → MIN(100,100)=100
  - lyrics_roman_weighted = 100 * 0.4 = 40
  - FINAL = MAX(0, 0, 40) = 40 ✓

Song C: Title="Yesu", Artist="Mahima Band"
  - title_field_score: yesu=100(exact), mahima NOT FOUND → missing token → 0 (AND logic)
  - artist_field_score: yesu NOT FOUND, mahima=95(prefix) → missing token → 0 (AND logic)
  - FINAL = MAX(0, 0, 0) = 0 → REJECTED ✓
```

---

## SECTION E: MULTI-WORD QUERY LOGIC (DETERMINISTIC - AND LOGIC)

### E.1: Core Rule & Tokenization (MANDATORY)

**Rule: ALL tokens must be present (AND logic, not OR)**

When query contains multiple words separated by spaces:
- Each word becomes a separate search token
- Song is valid ONLY if ALL tokens match in some field
- A song missing any token is REJECTED entirely
- Order of tokens does NOT matter
- Matching can be across different fields (title, artist, lyrics)

**Token Processing Pipeline:**
```
Input: "yesu mahima" (multi-word query)
Step 1: Split by spaces (collapse internal multiples): ["yesu", "mahima"]
Step 2: Normalize each token individually (lowercase, NFD, punctuation removal): ["yesu", "mahima"]
Step 3: Remove empty tokens: Filter out empty strings
Output: List of tokens to match
```

**Example:**
```
Query: "yesu mahima"
Tokens: ["yesu", "mahima"]

Song A: Title "Yeshu Mahima" → Contains "yesu" (prefix) AND "mahima" (exact) → VALID ✓
Song B: Title "Yeshu" → Missing "mahima" → INVALID ✗ (REJECTED)
Song C: Title "Mahima Gaana", Lyrics "Yeshu Ki" → Contains both across fields → VALID ✓
Song D: "mahima" only → Missing "yesu" → INVALID ✗ (REJECTED)
```

### E.2: Multi-Word Matching Rule (AND Logic - MANDATORY)

```
Requirement: ALL tokens must match (AND logic, not OR)

Algorithm:
1. Filter songs by AND logic:
   FOR each song in candidates:
     FOR each token in query:
       found = FALSE
       FOR each field in [title, artist, lyrics_roman, lyrics_original]:
         IF field contains token (using match types from Section B):
           found = TRUE
           break
       
       IF NOT found: REJECT entire song, skip to next song
   
   2. IF all tokens found in song: KEEP song for scoring

Example:
Query: "yesu mahima" → tokens ["yesu", "mahima"]

Song A: Title="Yesu Mahima"
  - Token "yesu": Found in title (EXACT) ✓
  - Token "mahima": Found in title (EXACT) ✓
  → KEEP for scoring

Song B: Title="Jesus Christ"
  - Token "yesu": Found in title (FUZZY distance=1) ✓
  - Token "mahima": NOT found in any field ✗
  → REJECT entirely (do not score, do not return)

Song C: Title="Mahima Gaana", Lyrics="yesu ki kripya"
  - Token "yesu": Found in lyrics (EXACT) ✓
  - Token "mahima": Found in title (EXACT) ✓
  → KEEP for scoring
```

### E.3: Phrase Match Bonus (APPLIED DURING SCORING)

```
IF query tokens appear consecutively in same field (exact phrase):
  ADD +20 bonus to field_score (before weighting)
  Cap the result at 100 (no overflow)

Example:
Query: "yesu mahima" tokens=["yesu", "mahima"]

Field: "Yesu Mahima Gaana" (normalized: "yesu mahima gaana")
  field_score=100 (both tokens exact, all tokens present)
  +20 phrase bonus → 100 + 20 = 120 → capped at 100
  final: 100

Field: "Mahima yesu Gaana" (words reversed)
  field_score=100 (all tokens present)
  NO bonus (not consecutive in query order, order matters)
  final: 100

Field: "Yeshu item. Mahima song" (words separated)
  field_score=100 (all tokens present via fuzzy/variant)
  NO bonus (not consecutive, items between tokens)
  final: 100

Constraint: Bonus applies ONLY for exact consecutive phrase (normalized field must contain tokens adjacently in query order)
```

---

## SECTION F: SCORE FILTERING & THRESHOLDS (MANDATORY)

### F.1: Dual Threshold System (MANDATORY)

**Rule 1: Raw Token Score Threshold (BEFORE field weighting)**
```
AFTER matching each token in each field:
  IF token_score < 50:
    token REJECTED (fuzzy distance > 2, or other low match types)
  ELSE:
    token ACCEPTED (exact, prefix, variant, fuzzy distance ≤2)

Purpose: Eliminate single-character noise and very-long-distance fuzzy matches early
```

**Rule 2: Final Score Threshold (AFTER field weighting)**
```
AFTER calculating weighted field scores and applying MAX:
  IF final_score < 30:
    REMOVE song from results (do not return)
  ELSE:
    KEEP song in results for ranking

Rationale: Final threshold of 30 preserves weighted matches even from lower-priority fields
```

**Threshold Impact Examples:**
```
Final Score 100: ✓ RETURN
Final Score 50: ✓ RETURN
Final Score 30: ✓ RETURN (boundary inclusive)
Final Score 29: ✗ REJECT
Final Score 0: ✗ REJECT

Raw Token Threshold:
  token_score 100: ✓ ACCEPT
  token_score 50: ✓ ACCEPT (boundary inclusive)
  token_score 49: ✗ REJECT (must refilter results)
```

### F.2: Empty Results Handling

```
IF no results >= 50 threshold:
  RETURN: empty result set with message "No songs found"
  DO NOT: return low-scoring partial matches
```

---

## SECTION G: RANKING & TIE-BREAKING RULES (CRITICAL DETERMINISM)

### G.1: Primary Ranking (By Score)

```
Step 1: Sort all results by final_score DESCENDING (highest first)

Example:
Song A: score 100
Song B: score 85
Song C: score 50
Result order: A, B, C
```

### G.2: Tie-Breaking Hierarchy (When Scores Equal)

```
**IF two songs have IDENTICAL final_score:**

Tiebreaker 1: Match Type Precision
  Exact match > Prefix match > Variant match > Fuzzy match
  (Re-calculate which match type each song used, use hierarchy)

Tiebreaker 2: Field Priority
  Title match > Artist match > Lyrics match
  (If both songs matched via title, continue. If one title/one lyrics: title wins)

Tiebreaker 3: Popularity (play_count)
  Song with higher play_count ranks first
  (Requires play_count field in database)

Tiebreaker 4: Recency (last_played timestamp)
  Song played more recently ranks first
  (Requires last_played_date field in database)

Tiebreaker 5: Title Alphabetical Order
  A-Z alphabetical order of normalized title
  (ASCII-safe, deterministic)
  Example: "Amazing" < "Beautiful"

Tiebreaker 6: Song ID (Ultimate Fallback)
  Lower song ID ranks first
  (ALWAYS deterministic, guaranteed unique)

Algorithm:
IF score[A] == score[B]:
  compare match_type[A] vs match_type[B]
  IF equal:
    compare field_priority[A] vs field_priority[B]
  IF equal:
    compare play_count[A] vs play_count[B] (descending)
  IF equal:
    compare last_played[A] vs last_played[B] (most recent first)
  IF equal:
    compare title[A] vs title[B] (alphabetical)
  IF equal:
    RETURN song_id[A] vs song_id[B] (ascending)
```

**Example Tiebreaker Execution:**
```
Query: "jesus"
Song A: title="Jesus", score=100, play_count=50, song_id=5
Song B: title="Jesus", score=100, play_count=50, song_id=10

Comparison:
1. Scores equal (100 == 100)
2. Match types equal (both EXACT)
3. Field priority equal (both title)
4. Popularity equal (50 == 50)
5. Recency unknown (assume equal)
6. Titles equal ("jesus" == "jesus")
7. Song IDs differ: 5 < 10 → Song A ranks first ✓
```

### G.3: Determinism Guarantee

```
CRITICAL: For identical input (query, user, database state):
  - Run 1: Search returns [A, B, C]
  - Run 2: Search returns [A, B, C]
  - Run 3: Search returns [A, B, C]
  (MUST be identical)

Implementation: Use stable sort algorithm + tiebreaker hierarchy
Never use: random(), shuffle(), or non-deterministic operations
```

---

## SECTION H: COMPLETE 5-LAYER PIPELINE ARCHITECTURE

### H.1: 5-Layer Deterministic Pipeline

**Architecture Overview: Five Distinct Layers with Clear Separation**

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: NORMALIZATION & TOKENIZATION & VARIANT GENERATION │
├─────────────────────────────────────────────────────────────┤
INPUT: raw query string
PROCESS:
  1. Normalize query (trim → lowercase → NFD → punctuation removal → collapse spaces)
  2. Split into tokens (Section A)
  3. Generate variants for each token (Section C)
  4. Check for empty result
OUTPUT: tokens[], variants{}
CONSTRAINT: Deterministic, same input = same output

┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: DATABASE RETRIEVAL & FILTERING                    │
├─────────────────────────────────────────────────────────────┤
INPUT: tokens[], variants{}
PROCESS:
  1. FOR each token and variant: Query DB with LIKE %token% on each field
  2. Collect matching songs (title, artist, lyrics_roman, lyrics_original)
  3. Apply AND logic: Keep ONLY songs containing ALL tokens (across any fields)
  4. Deduplicate by song_id (best match for each song per field)
OUTPUT: candidate_songs with field match presence
CONSTRAINT: Deterministic DB query, stable deduplication

┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: GREEDY MATCHING & TOKEN ALLOCATION & FIELD SCORING│
├─────────────────────────────────────────────────────────────┤
INPUT: candidate_songs, tokens[], variants{}
PROCESS:
  1. FOR each song:
     2. FOR each field (title, artist, lyrics_roman, lyrics_original):
        3. FOR each token:
           - Try greedy left-to-right position allocation
           - Match token against field value (Section B match types)
           - Record token_score, match_type used
           - Compare token_score against raw token threshold (50)
           - Mark positions consumed to prevent overlap
        4. Calculate field_score = MIN(all token scores) for this field
        5. Add phrase bonus (+20) if tokens consecutive, cap at 100
        6. Field_score_weighted = field_score * field_weight
  3. Store per-song: field_scores[], weighted_field_scores[]
OUTPUT: per-song weighted field scores
CONSTRAINT: Greedy left-to-right, no overlaps, position consumed after use

┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: SCORING & FILTERING                               │
├─────────────────────────────────────────────────────────────┤
INPUT: per-song weighted_field_scores[]
PROCESS:
  1. FOR each song:
     2. final_score = MAX(title_weighted, artist_weighted, lyrics_roman_weighted, lyrics_original_weighted)
     3. IF final_score < 30 (final threshold):
        - REJECT song, remove from results
     4. ELSE:
        - KEEP song with final_score
OUTPUT: ranked_songs with final_score ≥ 30
CONSTRAINT: Threshold filtering, MAX formula only

┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: RANKING & TIEBREAKING & PAGINATION                │
├─────────────────────────────────────────────────────────────┤
INPUT: ranked_songs with final_score
PROCESS:
  1. SORT songs by (final_score DESC, tiebreaker_hierarchy)
  2. Tiebreaker hierarchy (Section G.2):
     - Match type precision (exact > prefix > variant > fuzzy)
     - Field priority (title > artist > lyrics)
     - Play count (descending)
     - Last played date (most recent first)
     - Title alphabetical (A-Z)
     - Song ID (ascending, fallback)
  3. Apply pagination: results[(page-1)*size : page*size]
OUTPUT: paginated songs, total_count, has_next
CONSTRAINT: Stable sort, deterministic tiebreaker, no randomization

═══════════════════════════════════════════════════════════════
CRITICAL CONSTRAINTS (Layer Separation):
  ✓ Layer 1 produces tokens ONLY (no scoring)
  ✓ Layer 2 produces candidates ONLY (no scoring)
  ✓ Layer 3 produces field scores ONLY (no final score)
  ✓ Layer 4 produces final score ONLY (no ranking)
  ✓ Layer 5 produces ranked results ONLY (no scoring)
  ✓ No mixing of concerns
  ✓ Each layer output is input to next layer
  ✓ Deterministic: same input at any layer = same output
```

---

## SECTION I: NULL & EDGE CASE HANDLING

### I.1: NULL Field Handling

```
IF song.title IS NULL:
  title_score = 0 (treated as no match)

IF song.lyrics_roman IS NULL:
  lyrics_roman_score = 0

Consequence: NULL fields weighted by weight but score 0
Example: Song with NULL artist: no artist bonus, but other fields count
```

### I.2: Empty Query Handling

```
IF normalized_query IS EMPTY or WHITESPACE ONLY:
  RETURN error: "Query cannot be empty"
  DO NOT: return all songs
```

### I.3: Very Long Query Handling

```
IF normalized_query length > 1000 characters:
  TRUNCATE to 1000 characters (prevent DOS)
  WARN: "Query truncated to 1000 characters"
```

### I.4: Single Character & Short Query Handling

```
IF normalized_query == single character (length=1):
  Apply normal matching:
    - prefix match on single char allowed
    - fuzzy disabled for length < 4 (Section B.6)
  Example: query="a"
    Matches prefix: "Amazing", "Amen", "Alpha" → ✓ (prefix score 95)
    Does NOT match via fuzzy (disabled)

IF normalized_query length in [2-3] (short query):
  - Exact, prefix, normalized, variant matching allowed
  - Fuzzy matching DISABLED (Section B.6)
  - Phrase bonus still applies if multiple tokens consecutive
  
Constraint: Short query protection prevents single-char noise explosion
```

---

## SECTION J: VALIDATION CHECKLIST FOR IMPLEMENTATION

Before deploying, verify:

- [ ] Normalization: same input always produces same normalized output
- [ ] Match types: hierarchy followed (exact > prefix > fuzzy)
- [ ] Fuzzy scoring: distance correctly produces scores 100/75/50/0
- [ ] Variants: bidirectional, max 3, no recursion
- [ ] Multi-field: weights sum to 100%, title conflict rule applied
- [ ] Multi-word: AND logic enforced on all tokens
- [ ] Thresholds: scores <50 rejected
- [ ] Tiebreaking: all 6 levels work, deterministic always
- [ ] Pagination: snapshot consistency across pages
- [ ] Determinism: 100 identical queries produce identical results

---

## SECTION K: EXAMPLES REFERENCED BY TEST CASES

See SEARCH_TEST_CASES.md for concrete examples validating this spec.

Key test case mappings:
- B.1 rank examples → TEST 1.1-1.5, 2.1-2.8, 3.1-3.12
- C.2 variant algorithm → TEST 4.1-4.8
- G.2 tiebreaking → TEST 5.1-5.10
- D.3 multi-field → TEST 6.1-6.7
- E multi-word → TEST 11.2

---

**Document Status:** ✅ v1.0-STABLE LOCKED (April 15, 2026)
**Changes Applied:** D.2 deleted, D.3 rewritten (MAX formula), E.0/E.1 consolidated, F.1 dual threshold, H.1 5-layer pipeline, B.6 added, E.3 clarified, I.4 extended
**Bugs Fixed:** 25 total (12 original + 13 advanced) - all resolved with explicit locked decisions
**Implementation Note:** Implement EXACTLY per this spec. Any deviation requires version bump to v1.1+ and new QA cycle.
**Determinism Guarantee:** Identical input → Identical output (ALWAYS). No randomization. Stable sort with 6-level tiebreaker hierarchy.
