# PERFORMANCE GUIDELINES

**Document Version:** 1.0  
**Last Updated:** April 10, 2026  
**Status:** Active

This document defines performance rules and constraints that developers MUST follow to prevent degradation as the system scales.

---

## 1. DATABASE ACCESS RULES

### 1.1 NEVER Query Inside Loops

**❌ FORBIDDEN:**
```java
List<Song> songs = getAllSongs();  // Query 1
for (Song song : songs) {
    song.setHashtags(getHashtagsForSong(song.getId()));  // Query 2...N+1
}
```

**✅ REQUIRED:**
```java
// Query 1: Get all songs
List<Song> songs = getAllSongs();

// Query 2: Batch load all hashtags at once
Map<Integer, List<String>> hashtagsBySong = getAllHashtagsForSongs(songs);

// Combine in application (O(1) lookup)
songs.forEach(s -> s.setHashtags(hashtagsBySong.getOrDefault(s.getId(), new ArrayList<>())));
```

**Why:** 100 songs = 101 queries vs 2 queries. At 10K songs, the first approach causes timeout.

---

### 1.2 Follow the "2-Query Maximum" Rule

**Rule:** Any data retrieval operation must use at most 2 database queries before combining results in application code.

**Example violations:**
- ❌ `getAllSongs()` + `getHashtags()` per song = N+1 queries
- ❌ `getSongsByHashtag()` + `getOccasionData()` per result = N+1 queries
- ❌ Filtering results in application loop that calls DB = N+1 queries

**Exception:** Pagination with cursor-based queries (allowed for streaming large datasets)

---

### 1.3 Prefer JOIN/Aggregation in SQL Over Application Code

**❌ BAD (N+1):**
```java
List<Song> songs = SELECT s.* FROM songs;

for (Song song : songs) {
    int viewCount = SELECT COUNT(*) FROM song_views WHERE song_id = ?;
    song.setViewCount(viewCount);
}
```

**✅ GOOD (single query with JOIN):**
```sql
SELECT s.*, COUNT(v.id) as view_count 
FROM songs s 
LEFT JOIN song_views v ON s.id = v.song_id
GROUP BY s.id
```

---

### 1.4 Design for Batch Operations from the Start

**New DAO methods must follow this pattern:**

```java
// Interface segregation: Single-song and batch methods
public Song getSongById(int id);                    // Single query
public List<Song> getSongsByIds(List<Integer> ids); // Batch query

// Batch query should return all needed data
@Query("SELECT s FROM Song s LEFT JOIN FETCH s.hashtags WHERE s.id IN (?1)")
List<Song> getSongsByIds(List<Integer> ids);
```

**Rule:** If you create a `getSingle*()` method, always create a corresponding `getBatch*()` method.

---

### 1.5 Validate Query Count in Code Reviews

**Each PR must include query count analysis:**

```
Feature: Display song list
- Before: 1 + N queries (getAllSongs + getHashtags per song)
- After: 2 queries (getAllSongs + batch getHashtags)
- Improvement: 50x fewer queries at 100 songs
```

---

## 2. SEARCH PERFORMANCE

### 2.1 Search Must Complete in < 200ms

**Target:** Search results returned within 200 milliseconds.

**Why:** User perceives latency >200ms as "slow" on web. >500ms feels broken.

### 2.2 Avoid Full Table Scans

**❌ BAD (full table scan):**
```sql
SELECT * FROM songs WHERE title LIKE '%query%'  -- Cannot use index on LIKE '%...'
```

**✅ GOOD (indexed search):**
```sql
-- Option 1: Full-Text Index
SELECT * FROM songs WHERE MATCH(title) AGAINST('query' IN BOOLEAN MODE)

-- Option 2: Prefix search (uses index)
SELECT * FROM songs WHERE title LIKE 'query%'

-- Option 3: Index on language + key (for filtered search)
SELECT * FROM songs WHERE language = 'hindi' AND original_key = 'G'
```

### 2.3 Index Strategy

**Mandatory indexes:**
```sql
CREATE FULLTEXT INDEX idx_title ON songs(title);
CREATE FULLTEXT INDEX idx_lyrics ON songs(lyrics_roman);
CREATE INDEX idx_language ON songs(language);
CREATE INDEX idx_is_active ON songs(is_active);
CREATE INDEX idx_original_key ON songs(original_key);
```

**Before adding feature that searches a field, add the index first.**

---

### 2.4 Implement Pagination

**❌ BAD (loads all results):**
```java
List<Song> results = searchSongs("hallelujah");  // Returns 500 results
```

**✅ GOOD (limited result set):**
```java
List<Song> results = searchSongs("hallelujah", pageNum=1, pageSize=20);
// SQL: SELECT * FROM songs WHERE ... LIMIT 20 OFFSET 0
```

**Rule:** Search results must be paginated. Never return more than 50 results without pagination.

---

### 2.5 Ranking Must Be Deterministic

**Search ranking priority (fixed):**
1. Title match (highest priority)
2. Artist match
3. Lyrics match (lowest priority)

**Rule:** Ranking is applied in SQL, not in Java code.

**Example:**
```sql
SELECT s.* FROM songs s
WHERE MATCH(s.title, s.artist, s.lyrics_roman) AGAINST('query')
ORDER BY 
  CASE WHEN s.title LIKE 'query%' THEN 1
       WHEN s.artist LIKE 'query%' THEN 2
       ELSE 3 END
```

---

## 3. STRING PROCESSING

### 3.1 Never Parse the Same Content Twice

**Current violation:** Song lyrics parsed by:
- ChordParser in TransposeServlet
- ChordParser in JSP rendering
- ChordParser in setlist preview

**✅ REQUIRED:** Cache parsed results.

```java
public class LyricsParseCache {
    private static Map<String, List<String[]>> cache = new LinkedHashMap<>();
    
    public static List<String[]> parseAndCache(String rawLyrics) {
        if (cache.containsKey(rawLyrics)) {
            return cache.get(rawLyrics);
        }
        List<String[]> parsed = ChordParser.parseFullSong(rawLyrics);
        cache.put(rawLyrics, parsed);
        return parsed;
    }
}
```

**Cache invalidation:** 5-minute TTL (songs rarely change during session)

---

### 3.2 Regex Patterns Must Be Compiled Static

**❌ BAD (recompiles every call):**
```java
public void processChords(String input) {
    Pattern p = Pattern.compile("\\[([A-G][#b]?.+?)\\]");  // Compiled every call!
    Matcher m = p.matcher(input);
}
```

**✅ GOOD (compiled once):**
```java
private static final Pattern CHORD_PATTERN = Pattern.compile("\\[([A-G][#b]?.+?)\\]");

public void processChords(String input) {
    Matcher m = CHORD_PATTERN.matcher(input);
}
```

**Rule:** All static regex patterns must be declared `private static final`.

---

### 3.3 Avoid Repeated String Splits

**❌ BAD (splits 3 times):**
```java
String[] parts = lyrics.split("\\r?\\n");
// Use parts here

// ... later in same method ...
String[] parts2 = lyrics.split("\\r?\\n");  // Split again!
// Use parts2 here
```

**✅ GOOD (split once):**
```java
String[] lines = lyrics.split("\\r?\\n");
processLines(lines);
displayLines(lines);
```

---

## 4. RESPONSE TIME TARGETS

### 4.1 Song Search

**Target:** < 200ms  
**Acceptable:** 100-200ms  
**Unacceptable:** > 200ms

**Measurement:** From HTTP request received to response sent.

---

### 4.2 Chord Transposition

**Target:** < 10ms per transpose  
**Acceptable:** 5-10ms  
**Unacceptable:** > 10ms

**Measurement:** Time for `ChordTransposer.transposeSong()` to complete.

**Profile points:**
- Regex matching: ~1-2ms
- String building: ~1-2ms
- Hashtag lookup: <1ms

---

### 4.3 Song Load (View Single Song)

**Target:** < 100ms  
**Acceptable:** 50-100ms  
**Unacceptable:** > 100ms

**Includes:** DB query + rendering (JSP template)

---

### 4.4 Song List Load (Default List)

**Target:** < 150ms for 20 songs  
**Acceptable:** 100-150ms  
**Unacceptable:** > 150ms

**Scaling:** Linear with pagination size (20 songs = 150ms, 100 songs = 750ms, therefore paginate at 20-50 per page)

---

## 5. SCALING CONSTRAINTS

### 5.1 Must Handle 10,000 Songs

**Hard constraint:** System must work with 10,000 songs without:
- Timeouts
- Out of memory errors
- Perceptible slowdown (vs 1K songs)

**Measurement:** Response time at 10K songs ≤ 1.5x response time at 1K songs.

### 5.2 Maximum Query Count at Scale

| Operation | Songs | Max Queries | Actual |
|-----------|-------|---|---|
| List all songs | 10K | 2 | Must be ≤ 2 |
| Search | 10K | 1-2 | Must be ≤ 2 |
| Get single song | 10K | 2 | Must be ≤ 2 |
| List by hashtag | 10K | 2 | Must be ≤ 2 |
| Transpose | any | 0 | Must be 0 (memory only) |

### 5.3 Memory Constraints

**Single song object:** ≤ 1MB (including lyrics, chords, notes)

**Full list of 10K songs:** ≤ 100MB (when fetched in single batch operation)

**Cache (lyrics parse results):** ≤ 50MB (with TTL eviction)

### 5.4 Concurrent User Load

**System must handle:**
- 50 concurrent users without timeout
- 10 users doing transposition simultaneously without >50% latency increase

---

## 6. COMMON PERFORMANCE ANTI-PATTERNS (FORBIDDEN)

### 6.1 ❌ Database Call in Loop

```java
for (Song s : songs) {
    getRelatedData(s.id);  // FORBIDDEN
}
```

---

### 6.2 ❌ Multiple Regex Compiles

```java
for (String line : lines) {
    Pattern p = Pattern.compile(...);  // FORBIDDEN
    Matcher m = p.matcher(line);
}
```

---

### 6.3 ❌ String Concatenation in Loop

```java
String result = "";
for (String part : parts) {
    result += part;  // FORBIDDEN - use StringBuilder
}

// Correct:
StringBuilder result = new StringBuilder();
for (String part : parts) {
    result.append(part);
}
```

---

### 6.4 ❌ Repeated Parsing

```java
// Called twice on same data
parseChords(song.getChords());
// ... code ...
parseChords(song.getChords());  // FORBIDDEN
```

---

### 6.5 ❌ Loading All Data When Only Some Needed

```java
// Loads ALL 10K songs to get top 20
List<Song> all = getAllSongs();
return all.stream().limit(20).collect(toList());  // FORBIDDEN

// Correct:
return getSongsWithLimit(20);  // SQL: LIMIT 20
```

---

## 7. CODE REVIEW CHECKLIST

Before merging code that touches database, search, or string processing:

- [ ] **Query count:** How many DB queries will this execute? Maximum 2 allowed.
- [ ] **Loop test:** Are there any database calls inside loops?
- [ ] **Regex:** Are patterns defined as `static final`?
- [ ] **Parsing:** Is the same content parsed twice?
- [ ] **Memory:** Could this load 10K songs into memory at once?
- [ ] **Latency:** Will this meet response time targets?
- [ ] **Scaling:** Add 10 zeros to data size—will it still work?

---

## 8. MONITORING & ALERTING

### 8.1 Query Count Logging

Every DAO method must log query count:
```java
logger.info("SongDAO.getAllSongs executed {} queries", queryCount);
```

### 8.2 Response Time Tracking

Every servlet endpoint must track latency:
```java
long startTime = System.currentTimeMillis();
// ... do work ...
long elapsed = System.currentTimeMillis() - startTime;
logger.info("SearchServlet.doGet completed in {}ms", elapsed);
```

### 8.3 Alerts

Alert if:
- Search takes > 500ms
- Single song load takes > 300ms
- Transpose takes > 50ms
- Query count exceeds expected (e.g., expected 2, got 10)

---

## 9. REFERENCES

- [SongDAO.java](src/main/java/com/worship/dao/SongDAO.java) — Example of N+1 issues (must be refactored)
- [SearchServlet.java](src/main/java/com/worship/servlet/SearchServlet.java) — Example of search optimization needed
- [TransposeServlet.java](src/main/java/com/worship/servlet/TransposeServlet.java) — Example of transposition code
- [ChordParser.java](src/main/java/com/worship/util/ChordParser.java) — Regex pattern definitions

---

## 10. CHANGE LOG

### Version 1.0 (April 10, 2026)
- Initial performance guidelines
- Database access rules (N+1 prevention)
- Search performance constraints
- String processing guidelines
- Response time and scaling targets
