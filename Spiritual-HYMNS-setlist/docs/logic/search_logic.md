# Search System Logic

**Version:** 1.1-STABLE (Stabilization Update)  
**Status:** ✅ APPROVED  

## 1. Input → Output Behavior

The search system is a deterministic, multi-layered pipeline designed to provide predictable results for worship song lookups.

| Input Type | Logic Path | Output Behavior |
| :--- | :--- | :--- |
| **Numeric-Only** | `NumberSearchService` | Returns exact song number matches. Bypasses text analysis. |
| **Short Text (< 2 chars)** | Early Exit | Returns empty result set. Prevents noisy database scans. |
| **Full Text (>= 2 chars)** | `SearchService` (5-Layer) | Returns ranked results based on Title, Artist, Lyrics, and Hashtags. |

---

## 2. Query Classification Rules

Classification occurs at the **Controller Layer** (Servlets) before invoking services.

1.  **Numeric Check**: If `query.matches("^\\d+$")`, route to `NumberSearchService`.
2.  **Length Check**: If `query.length() < 2`, return empty results immediately.
3.  **Default**: Route to `SearchService`.

---

## 3. Candidate Limiting Rules

To prevent memory exhaustion and slow scoring:

*   **Initial Fetch Limit**: The DAO layer limits initial candidates to a maximum of **100 rows**.
*   **AND Enforcement**: Candidate filtering in SQL uses strict `AND` logic for multi-word queries to minimize the result set early.

---

## 4. Retrieval Strategy

The system uses a **Two-Stage Retrieval** strategy to optimize performance.

### Stage 1: Lightweight Fetch (Candidate Phase)
During the initial database query, only the following fields are retrieved:
*   `id`
*   `title`
*   `song_number`
*   `artist`
*   `lyrics_roman`
*   `lyrics_original`
*   `hashtags` (aggregated)

**Note:** Heavy fields like `sections`, `notes`, and full `chords` are **NOT** loaded in this phase.

### Stage 2: Full Fetch (Display Phase)
Only after ranking and pagination are complete, the system retrieves the full `Song` object for the items being displayed on the current page.

---

## 5. Constraints & Invariants

*   **Determinism**: Identical queries MUST return identical results in the same order.
*   **Scoring Weights**:
    *   Title: 1.0
    *   Artist: 0.7
    *   Lyrics: 0.4
    *   Hashtags: 0.4 (New)
*   **Match Types**: Exact > Prefix > Variant > Fuzzy.
*   **Strict AND**: Full text search requires ALL tokens to be present in at least one searchable field.

---

## 6. Hashtag Integration

Hashtags are treated as a searchable text field. In the database, they are joined and aggregated into a space-separated string for matching. 
*   **Scoring**: Hashtags contribute to the `matchesAllTokens` check and are weighted at `0.4` (consistent with Lyrics).

---

## 7. Live Search Behavior

Live Search is a high-performance suggestion system designed for real-time feedback. It operates on a separate, optimized path.

*   **Endpoint**: `GET /live-search?q=...`
*   **Matching Rules**:
    *   **Prefix Matching**: Matches only if a word in the Title or Artist starts with the query (e.g., "Ame" matches "**Ame**n" and "**Ame**zing").
    *   **Relaxed Logic**: Does NOT require strict AND logic or multi-layered scoring.
*   **Result Limits**: Strictly limited to **10 results** at the database level.
*   **Lightweight Response**: Returns only `id`, `title`, and `song_number`.
*   **Constraints**:
    *   Query must be at least 2 characters.
    *   Numeric queries bypass text search and return exact number matches.
    *   Bypasses the `SearchService` pipeline entirely for sub-100ms response times.

---

## 8. Live Search Frontend Behavior

The frontend implementation ensures a smooth, responsive user experience without overloading the server.

*   **Debounce Rule**: API calls are delayed by **300ms** after the last keystroke to prevent spamming the backend.
*   **Request Management**: Uses `AbortController` to cancel pending requests if a new one is initiated.
*   **UI Feedback**:
    *   **Dropdown**: Appears automatically when query length >= 2.
    *   **Loading State**: Shows "Searching..." during fetch.
    *   **Empty State**: Displays "No results found" if the suggestion list is empty.
*   **Navigation**:
    *   **Click**: Redirects directly to the song view page (`/song?id=...`).
    *   **Keyboard**: Supports `ArrowUp`/`ArrowDown` to highlight suggestions and `Enter` to select.
    *   **Dismissal**: Dropdown closes on `Esc` key, focus loss (blur), or clicking outside.

---

## 9. Multi-Book Visibility

The search system handles songs from multiple active songbooks simultaneously.

*   **Active Books**:
    1.  `prime_songbook`: The main collection of worship songs.
    2.  `special_marathi`: The Special Marathi song collection (Song numbers 1-21).
*   **Visibility Filter**: All queries in `SongDAO` include a visibility check that filters for `is_active = TRUE` and `book IN ('prime_songbook', 'special_marathi')`.
*   **Ranking**: Book origin does not currently affect ranking. Songs from different books are ranked solely based on match relevance scores.

