# SEARCH_LOGIC_SPEC.md

**Purpose:** Deterministic mathematical and logical specification for search system. Eliminates all ambiguity in scoring, ranking, and matching logic.

**Last Updated:** 2026-04-11
**Audience:** Developers implementing search. Reference for QA testing. AI implementation guide.
**Referenced By:** SYSTEM_CHANGE_PLAN.md (Section 5), SEARCH_TEST_CASES.md

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
Condition: Levenshtein distance <= 2
Scoring (see Section B.2 for exact formula)
Example: query="yesu", field="yeshu" → distance=1, score=75
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

**Rule: Title match always outranks lyrics match if both present (weight difference enforces this)**

Consequence: An exact title match (100 * 1.0 = 100) will always beat an exact lyrics match (100 * 0.4 = 40).

### D.2: Cross-Field Conflict Resolution

**Rule: Title Outrank Lyrics**
```
IF title_score exists AND lyrics_score exists:
  score_diff = abs(title_score - lyrics_score)
  IF score_diff <= 20:
    title_score ALWAYS wins (higher priority)
    Use: title_score * title_weight (ignore lyrics)
  ELSE IF title_score < 50 AND lyrics_score >= 90:
    lyrics_score wins (rare case: title irrelevant, lyrics strong)
    Use: lyrics_score * lyrics_weight
  ELSE:
    Use weighted combination: title * 0.40 + lyrics * (0.15 + 0.15)
```

**Example:**
```
Song A: title_score=80, lyrics_roman_score=75
  diff = 5 (≤ 20)
  → Use title (80 * 0.40 = 32)

Song B: title_score=40, lyrics_roman_score=92
  title < 50 AND lyrics >= 90
  → Use lyrics (92 * 0.15 = 13.8)

Song C: title_score=100, lyrics_original_score=90
  diff = 10 (≤ 20)
  → Use title (100 * 0.40 = 40)
```

### D.3: Final Score Calculation (Multi-Field)

```
Algorithm:
1. For each field (title, artist, lyrics_roman, lyrics_original):
   - Find best match score from all match types
   - Store: field_score[field_name]

2. Calculate weighted scores:
   title_contribution = field_score[title] * 0.40
   artist_contribution = field_score[artist] * 0.30
   lyrics_roman_contrib = field_score[lyrics_roman] * 0.15
   lyrics_original_contrib = field_score[lyrics_original] * 0.15

3. Apply title conflict rule (see D.2)

4. FINAL SCORE = sum of non-zero contributions (capped at 100)

Constraint: FINAL SCORE range [0, 100]
```

---

## SECTION E: MULTI-WORD QUERY LOGIC (DETERMINISTIC - AND LOGIC)

### E.0: Core Rule (MANDATORY)

**Rule: ALL tokens must be present (AND logic, not OR)**

When query contains multiple words separated by spaces:
- Each word becomes a separate search token
- Song is valid ONLY if ALL tokens match in some field
- A song missing any token is REJECTED entirely
- Order of tokens does NOT matter
- Matching can be across different fields (title, artist, lyrics)

**Example:**
```
Query: "yesu mahima"
Tokens: ["yesu", "mahima"]

Song A: Title "Yeshu Mahima" → Contains "yesu" (prefix) AND "mahima" (exact) → VALID ✓
Song B: Title "Yeshu" → Missing "mahima" → INVALID ✗ (REJECTED)
Song C: Title "Mahima Gaana", Lyrics "Yeshu Ki" → Contains both across fields → VALID ✓
Song D: "mahima" only → Missing "yesu" → INVALID ✗ (REJECTED)
```

---

## SECTION E: MULTI-WORD QUERY LOGIC (DETERMINISTIC)

### E.1: Query Tokenization

```
Input: "yesu mahima" (multi-word query)
Step 1: Split by spaces (collapse internal multiples): ["yesu", "mahima"]
Step 2: Normalize each token individually (lowercase, etc.): ["yesu", "mahima"]
Step 3: Remove empty tokens: Filter out empty strings
Output: List of tokens to match
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

### E.3: Phrase Match Bonus (OPTIONAL, after AND check)

```
IF query tokens appear consecutively in same field:
  (exact phrase match)
  ADD +20 bonus to field_score

Example:
Query: "yesu mahima"
Field: "Yesu Mahima Gaana" (phrase appears consecutively)
→ field_score + 20 bonus

Field: "Mahima yesu Gaana" (words reversed)
→ NO bonus (not consecutive in query order)

Field: "Yeshu item. Mahima song" (words separated by other words)
→ NO bonus (not consecutive)

Rule: Bonus applies ONLY for exact phrase, not partial.
```

---

## SECTION F: SCORE FILTERING & THRESHOLDS (MANDATORY)

### F.1: Minimum Match Threshold

```
RULE: Reject all results with score < 50

Rationale: Prevent low-quality fuzzy matches undermining search quality

Algorithm:
AFTER calculating final_score for each song:
  IF final_score < 50:
    REMOVE from results (do not return)
  ELSE:
    KEEP in results for ranking
```

**Impact Examples:**
```
Score 100: ✓ RETURN
Score 75: ✓ RETURN
Score 50: ✓ RETURN (boundary inclusive)
Score 49: ✗ REJECT
Score 0: ✗ REJECT
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

## SECTION H: RANKING FORMULA CONSOLIDATION (ALL TOGETHER)

This section combines search into single unified algorithm.

### H.1: Complete Search Algorithm

```
INPUT: normalized_query (string)
OUTPUT: List of songs ranked by score

ALGORITHM:

Step 1: Generate Variants
  variants = generate_variants(normalized_query)
  variant_list = [original_query] + variants

Step 2: Search Each Field
  FOR each field in [title, artist, lyrics_roman, lyrics_original]:
    FOR each variant in variant_list:
      matching_songs = search_field(variant, field)
      FOR each song in matching_songs:
        song.field_scores[field] = score_match(variant, song_field_value)

Step 3: Deduplicate by Song ID
  deduplicated = Map<song_id → best_score_across_all_fields>
  FOR each song in all_matches:
    IF song_id not in deduplicated:
      deduplicated[song_id] = song.field_scores
    ELSE:
      FOR each field:
        deduplicated[song_id][field] = max(old_score, new_score)

Step 4: Calculate Final Scores
  FOR each song in deduplicated:
    song.final_score = calculate_final_score(song.field_scores)
    IF song.final_score < 50:
      REMOVE song (threshold filter)

Step 5: Sort Results
  results = deduplicated.sorted_by([final_score DESC, tiebreaker_hierarchy])

Step 6: Apply Pagination
  paginated = results[(page-1)*pagesize : page*pagesize]
  RETURN paginated + metadata (total_count, has_next)

CONSTRAINTS:
  - No randomization
  - All operations deterministic
  - Same input = same output, always
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

### I.4: Single Character Query

```
IF normalized_query == single character:
  Apply normal matching (prefix on single char)
  Example: query="a"
    Matches: "Amazing", "Amen", "Alpha"
    Single-char prefix match is valid
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

**Document Status:** COMPLETE AND DETERMINISTIC
**Next Step:** Implement exactly per this spec. Deviation requires spec update + QA review.
