# IMPLEMENTATION BLUEPRINT

**Document Version:** 1.0  
**Last Updated:** April 10, 2026  
**Status:** Design Specification  
**Audience:** Developers, Code Reviewers, AI Assistants

---

## PREAMBLE

This document defines the **structural and logical architecture** of the Worship Song Library system. It is NOT code; it is a specification of:

- How components connect
- How data flows
- How logic executes step-by-step
- How to test each step independently

**Goal:** After reading this, implementation should feel like mechanical translation, not architectural thinking.

---

## PART 1: GLOBAL RULES

### Rule 1.1: Three-Layer Mandatory Architecture

Every feature MUST follow this structure:

```
Request
   ↓
[CONTROLLER LAYER] — Handle HTTP request/response
   ↓
[SERVICE LAYER] — Apply business logic
   ↓
[DAO/REPOSITORY LAYER] — Database operations only
   ↓
Response
```

**Non-negotiable:** Logic CANNOT skip layers.

### Rule 1.2: Single Pipeline for Each Feature

Each feature follows ONE explicit pipeline:
- Input → Transform → Output
- Each step has defined input/output
- No hidden steps
- No conditional branching (except error handling)

### Rule 1.3: Layer Responsibilities

**CONTROLLER LAYER:**
- Receive HTTP request
- Validate input format and presence
- Call service method
- Return HTTP response
- **Cannot:** Execute business logic, access database directly

**SERVICE LAYER:**
- Execute business logic
- Combine multiple operations
- Apply ranking, filtering, transformation
- Call DAO methods
- **Cannot:** Handle HTTP, access database directly

**DAO/REPOSITORY LAYER:**
- Execute database queries ONLY
- Return raw data
- No business logic
- Follow batch query rules (max 2 queries per operation)
- **Cannot:** Perform transformation, execute business rules

### Rule 1.4: No Mixed Responsibilities

**❌ FORBIDDEN:**
```
SearchServlet {
  doGet() {
    query = request.getParameter("q");
    // Load songs from DB directly
    songs = db.query("SELECT * FROM songs WHERE title LIKE ...");
    // Apply ranking
    ranked = songs.sort(...);
    // Return response
  }
}
```

**✅ REQUIRED:**
```
SearchServlet {
  doGet(request, response) {
    query = request.getParameter("q");                    // Receive
    validateNotEmpty(query);                              // Validate
    results = searchService.search(query);                // Delegate to service
    response.json(results);                               // Return
  }
}

SearchService {
  search(query) {
    normalized = normalizeQuery(query);                   // Normalize
    candidates = songDAO.searchSongs(normalized);         // Fetch candidates
    ranked = rankResults(candidates, normalized);         // Rank
    return ranked;
  }
}

SongDAO {
  searchSongs(query) {
    return db.query(                                       // Query DB only
      "SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? ..."
    );
  }
}
```

### Rule 1.5: No Circular Dependencies

Flow MUST be ONE DIRECTION:

```
Controller → Service → DAO (allowed)
DAO → Service → Controller (NOT allowed)
DAO → Controller (NOT allowed)
```

---

## PART 2: SYSTEM LAYERS IN DETAIL

### Layer 1: CONTROLLER

**Responsibilities:**
1. Parse HTTP request parameters
2. Validate input presence and format
3. Convert request to service parameters
4. Call appropriate service method
5. Handle service exceptions
6. Format response (JSON/HTML)
7. Set HTTP headers

**Template:**
```
Controller.methodName(request, response) {
  Step 1: PARSE & VALIDATE
    - Extract parameters from request
    - Validate presence (required fields)
    - Validate format (numbers, strings)
    - Trim whitespace
  
  Step 2: CALL SERVICE
    - Pass validated data to service
    - Catch service exceptions
  
  Step 3: FORMAT RESPONSE
    - Convert result to JSON/HTML
    - Set content-type
    - Set status code
    - Return to client
}
```

**Error Handling:**
- Invalid input → HTTP 400 (Bad Request)
- Not found → HTTP 404 (Not Found)
- Unauthorized → HTTP 401 (Unauthorized)
- Forbidden → HTTP 403 (Forbidden)
- Server error → HTTP 500 (Internal Server Error)

---

### Layer 2: SERVICE

**Responsibilities:**
1. Execute business logic
2. Call DAO methods to fetch/store data
3. Transform data according to rules
4. Apply filtering, ranking, validation
5. Combine multiple operations
6. Return structured result

**Template:**
```
Service.operationName(parameters) {
  Step 1: INPUT VALIDATION
    - Check preconditions
    - Verify business rules
  
  Step 2: DATA FETCHING
    - Call DAO methods
    - Collect data (batch operations preferred)
  
  Step 3: TRANSFORMATION
    - Apply business logic
    - Filter/rank/transform data
  
  Step 4: OUTPUT ASSEMBLY
    - Combine results
    - Package for controller
    - Return structured result
}
```

**Rules:**
- One service method = One feature operation
- May call multiple DAO methods, but follow batch rules
- All business logic lives HERE, not in controller or DAO
- Transaction management happens here

---

### Layer 3: DAO/REPOSITORY

**Responsibilities:**
1. Execute SQL queries
2. Map ResultSet to objects
3. Return raw data
4. Follow batch query rules

**Template:**
```
DAO.operationName(parameters) {
  Step 1: BUILD QUERY
    - Construct SQL (with parameters)
    - Add WHERE, ORDER BY, LIMIT, OFFSET as needed
  
  Step 2: EXECUTE QUERY
    - Create PreparedStatement
    - Set parameters (prevent SQL injection)
    - Execute query
  
  Step 3: MAP RESULTS
    - Iterate ResultSet
    - Create objects from rows
    - Collect in List/Map
  
  Step 4: RETURN DATA
    - Return raw collection (List/Map)
    - No transformation
}
```

**Rules:**
- NO business logic (no filtering, ranking, transformation)
- NO composition of multiple queries (use batch methods)
- Max 2 database queries per operation
- Always use PreparedStatement (prevent SQL injection)
- No loops with DB calls inside

---

## PART 3: FEATURE IMPLEMENTATION PIPELINES

---

## FEATURE 1: SONG SEARCH

### Functional Goal
User enters search text → System returns ranked song results with pagination.

---

### Input Contract
- Query string: non-empty, up to 100 chars
- Page number: integer >= 1
- Page size: integer, 1-100 (default: 20)

### Output Contract
- List of Song objects
- Each song contains: id, title, artist, language, matchedLine
- Results ordered by relevance (title > artist > lyrics)
- Paginated (max pageSize results)

---

### PIPELINE: Controller Layer

```
SearchController.doGet(request, response) {
  
  STEP 1: PARSE INPUT
    query = request.getParameter("q")
    pageNum = request.getParameter("page", default=1)
    pageSize = request.getParameter("size", default=20)
  
  STEP 2: VALIDATE INPUT
    IF query == null OR query.trim().isEmpty()
      RETURN error("Search query required") with HTTP 400
    
    IF pageNum < 1
      RETURN error("Page must be >= 1") with HTTP 400
    
    IF pageSize < 1 OR pageSize > 100
      RETURN error("Page size must be 1-100") with HTTP 400
  
  STEP 3: CALL SERVICE
    TRY
      results = searchService.search(
        query=query.trim(),
        pageNum=pageNum,
        pageSize=pageSize
      )
    CATCH SearchException e
      RETURN error(e.message) with HTTP 400
    CATCH Exception e
      RETURN error("Internal error") with HTTP 500
  
  STEP 4: FORMAT RESPONSE
    response.setHeader("Content-Type", "application/json")
    response.setStatus(200)
    response.write(JSON.stringify(results))
}
```

---

### PIPELINE: Service Layer (Exact Matching & Ranking)

**CRITICAL: This pipeline implements SEARCH_LOGIC_SPEC.md exactly. Any deviation is a bug.**

```
SearchService.search(query, pageNum, pageSize) {
  
  STEP 1: VALIDATE INPUT
    IF query == null OR query.trim().isEmpty()
      THROW SearchException("Query required")
    
    IF pageNum < 1 OR pageSize < 1 OR pageSize > 100
      THROW SearchException("Invalid pagination")
  
  STEP 2: NORMALIZE QUERY (per SEARCH_LOGIC_SPEC Section A)
    normalized = normalizeQuery(query)
    tokens = normalized.split(" ")
    tokens = filter(tokens, t -> !t.isEmpty())
    
    IF tokens.isEmpty()
      THROW SearchException("Query empty after normalization")
  
  STEP 3: GENERATE VARIANTS (per SEARCH_LOGIC_SPEC Section C)
    FOR each token in tokens
      variants[token] = generateVariants(token)  // Max 3 per token
  
  STEP 4: FETCH BROAD CANDIDATES FROM DAO
    candidates = songDAO.searchSongs(normalized)
    
    IF candidates.isEmpty()
      RETURN empty list
  
  STEP 5: APPLY MULTI-WORD AND LOGIC (per SEARCH_LOGIC_SPEC Section E)
    filtered = new ArrayList()
    FOR each song in candidates
      validForAllTokens = TRUE
      FOR each token in tokens
        tokenFound = FALSE
        FOR each field in [title, artist, lyrics_roman, lyrics_original]
          IF matchType(song[field], token, variants[token]) != NONE
            tokenFound = TRUE
            break
        
        IF NOT tokenFound
          validForAllTokens = FALSE
          break
      
      IF validForAllTokens
        filtered.add(song)
  
  STEP 6: APPLY MATCHING RULES & SCORE (per SEARCH_LOGIC_SPEC Sections B & D)
    FOR each song in filtered
      FOR each field in [title, artist, lyrics_roman, lyrics_original]
        bestMatchScore = 0
        FOR each token in tokens
          FOR each variant in variants[token]
            matchType = determineMatchType(song[field], variant)
            score = getScoreFromMatchType(matchType, levenshteinDistance(song[field], variant))
            bestMatchScore = max(bestMatchScore, score)
        
        fieldScores[field] = bestMatchScore
      
      APPLY PHRASE BONUS IF query tokens consecutive in any field:
        IF field contains all tokens in order
          fieldScores[field] += 20
      
      APPLY FIELD WEIGHTS (per SEARCH_LOGIC_SPEC Section D):
        weightedTitle = fieldScores[title] * 1.0
        weightedArtist = fieldScores[artist] * 0.7
        weightedLyricsRoman = fieldScores[lyrics_roman] * 0.4
        weightedLyricsOriginal = fieldScores[lyrics_original] * 0.4
      
      finalScore = max(weightedTitle, weightedArtist, weightedLyricsRoman, weightedLyricsOriginal)
      
      APPLY THRESHOLD (per SEARCH_LOGIC_SPEC Section F):
      IF finalScore < 50
        REMOVE song, do not score
      ELSE
        song.finalScore = finalScore
  
  STEP 7: SORT & TIEBREAK (per SEARCH_LOGIC_SPEC Section G)
    SORT filtered BY [finalScore DESC, matchTypePriority DESC, fieldPriority DESC, playCount DESC, recency DESC, title ASC, songId ASC]
    
    NOTE: Use stable sort with Comparator implementing all 6 tiebreaker levels
  
  STEP 8: APPLY PAGINATION
    startIndex = (pageNum - 1) * pageSize
    endIndex = startIndex + pageSize
    paginated = filtered[startIndex:endIndex]
  
  STEP 9: RETURN RESULTS
    RETURN {
      results: paginated,
      pageNum: pageNum,
      pageSize: pageSize,
      totalCount: filtered.size()  // Count after filtering, not from DB
    }
}

HELPER FUNCTION: normalizeQuery(query)
  // Implement exactly per SEARCH_LOGIC_SPEC Section A
  return implementNormalizationPipeline(query)

HELPER FUNCTION: generateVariants(token)
  // Implement exactly per SEARCH_LOGIC_SPEC Section C
  return implementVariantGeneration(token)

HELPER FUNCTION: matchType(fieldValue, token, variants)
  // Return match type from SEARCH_LOGIC_SPEC Section B:
  // EXACT, PREFIX, NORMALIZED, VARIANT, FUZZY, or NONE

HELPER FUNCTION: getScoreFromMatchType(matchType, distance)
  // Return score from SEARCH_LOGIC_SPEC Section B.2:
  // EXACT→100, PREFIX→95, NORMALIZED→90, VARIANT→85, FUZZY(d=1)→75, FUZZY(d=2)→50, else→0
```

**EXECUTION ORDER (MANDATORY):**
1. Normalize query
2. Tokenize into multi-word tokens
3. Generate variants
4. Fetch broad candidates from DAO
5. Apply AND logic (all tokens required)
6. Apply match type rules (exact/prefix/fuzzy)
7. Score per field
8. Apply field weights
9. Filter by threshold
10. Tiebreak sort
11. Paginate
12. Return

**NO REORDERING ALLOWED.** Steps must execute in this exact sequence.

---

### PIPELINE: DAO Layer (Candidate Retrieval Only)

**CRITICAL RULE: DAO fetches broad candidates; Service applies exact matching logic**

```
SongDAO.searchSongs(query) {
  
  STEP 1: BUILD SQL QUERY (BROAD CANDIDATE RETRIEVAL)
    RULE: Use LIKE queries to fetch candidates BROADLY
    Reason: Final matching logic (prefix, fuzzy, variant) is in Service layer
    
    sql = """
      SELECT * FROM songs
      WHERE is_active = TRUE AND (
        LOWER(title) LIKE CONCAT('%', ?, '%')
        OR LOWER(artist) LIKE CONCAT('%', ?, '%')
        OR LOWER(lyrics_roman) LIKE CONCAT('%', ?, '%')
        OR LOWER(lyrics_original) LIKE CONCAT('%', ?, '%')
      )
      LIMIT 1000
    """
    
    NOTE: LIMIT 1000 retrieves all potential matches (no pagination here)
    Pagination happens in Service after filtering
  
  STEP 2: EXECUTE QUERY
    connection = DBConnection.getConnection()
    preparedStatement = connection.prepareStatement(sql)
    preparedStatement.setString(1, query.toLowerCase())
    preparedStatement.setString(2, query.toLowerCase())
    preparedStatement.setString(3, query.toLowerCase())
    preparedStatement.setString(4, query.toLowerCase())
    
    resultSet = preparedStatement.executeQuery()
  
  STEP 3: MAP RESULTS
    candidates = new ArrayList()  // Use "candidates" name to reflect incomplete nature
    WHILE resultSet.next()
      song = new Song()
      song.setId(resultSet.getInt("id"))
      song.setTitle(resultSet.getString("title"))
      song.setArtist(resultSet.getString("artist"))
      song.setLanguage(resultSet.getString("language"))
      song.setLyricsRoman(resultSet.getString("lyrics_roman"))
      song.setLyricsOriginal(resultSet.getString("lyrics_original"))
      candidates.add(song)
    
    close(resultSet, preparedStatement, connection)
  
  STEP 4: RETURN RAW CANDIDATES
    RETURN candidates  // Raw candidates, not final matches
}

CRITICAL: DAO does NOT filter by match type (exact/prefix/fuzzy).
CRITICAL: DAO does NOT apply scoring.
CRITICAL: Service layer applies matching rules from SEARCH_LOGIC_SPEC.md.

SongDAO.countSearchResults(query) {
  
  STEP 1: BUILD COUNT QUERY
    sql = """
      SELECT COUNT(*) FROM songs
      WHERE is_active = TRUE AND (
        title LIKE CONCAT('%', ?, '%')
        OR artist LIKE CONCAT('%', ?, '%')
        OR lyrics_original LIKE CONCAT('%', ?, '%')
        OR lyrics_roman LIKE CONCAT('%', ?, '%')
      )
    """
  
  STEP 2: EXECUTE AND RETURN
    count = executeCountQuery(sql, query)
    RETURN count
}
```

---

## FEATURE 2: SONG VIEW + TRANSPOSITION

### Functional Goal
User views song → Can transpose chords in real-time without reloading.

---

### Input Contract (View)
- songId: integer > 0

### Output Contract (View)
- Song object with all fields populated

### Input Contract (Transpose)
- songId: integer > 0
- semitones: integer (-11 to +11)

### Output Contract (Transpose)
- Transposed chords and lyrics (line-by-line pairs)
- New key
- Capo suggestion

---

### PIPELINE: Controller Layer (VIEW)

```
SongViewController.doGet(request, response) {
  
  STEP 1: PARSE INPUT
    songIdStr = request.getParameter("id")
  
  STEP 2: VALIDATE INPUT
    IF songIdStr == null
      RETURN error("Song ID required") with HTTP 400
    
    TRY
      songId = Integer.parseInt(songIdStr)
    CATCH NumberFormatException
      RETURN error("Invalid song ID") with HTTP 400
    
    IF songId <= 0
      RETURN error("Song ID must be positive") with HTTP 400
  
  STEP 3: CALL SERVICE
    TRY
      song = songService.getSongById(songId)
    CATCH SongNotFoundException e
      RETURN error("Song not found") with HTTP 404
    CATCH Exception e
      RETURN error("Internal error") with HTTP 500
  
  STEP 4: FORMAT RESPONSE
    request.setAttribute("song", song)
    request.getRequestDispatcher("/jsp/songView.jsp")
      .forward(request, response)
}
```

---

### PIPELINE: Controller Layer (TRANSPOSE)

```
TransposeController.doPost(request, response) {
  
  STEP 1: PARSE INPUT
    songIdStr = request.getParameter("songId")
    semitonesStr = request.getParameter("semitones")
  
  STEP 2: VALIDATE INPUT
    IF songIdStr == null OR semitonesStr == null
      RETURN error("songId and semitones required") with HTTP 400
    
    TRY
      songId = Integer.parseInt(songIdStr)
      semitones = Integer.parseInt(semitonesStr)
    CATCH NumberFormatException
      RETURN error("Invalid parameters") with HTTP 400
    
    IF semitones < -11 OR semitones > 11
      RETURN error("Semitones must be -11 to 11") with HTTP 400
  
  STEP 3: CALL SERVICE
    TRY
      result = transposeService.transposeSong(songId, semitones)
    CATCH SongNotFoundException e
      RETURN error("Song not found") with HTTP 404
    CATCH Exception e
      RETURN error("Internal error") with HTTP 500
  
  STEP 4: FORMAT RESPONSE
    response.setHeader("Content-Type", "application/json")
    response.setStatus(200)
    response.write(JSON.stringify(result))
}
```

---

### PIPELINE: Service Layer

```
SongService.getSongById(songId) {
  
  STEP 1: FETCH SONG
    song = songDAO.getSongById(songId)
    
    IF song == null
      THROW SongNotFoundException()
  
  STEP 2: FETCH METADATA
    hashtags = songDAO.getHashtagsForSong(songId)
    song.setHashtags(hashtags)
  
  STEP 3: RETURN
    RETURN song
}

TransposeService.transposeSong(songId, semitones) {
  
  STEP 1: FETCH SONG
    song = songDAO.getSongById(songId)
    
    IF song == null
      THROW SongNotFoundException()
  
  STEP 2: TRANSPOSE CHORDS
    transposedChords = ChordTransposer.transposeSong(
      song.getChords(),
      semitones
    )
  
  STEP 3: PARSE CHORDS LINES
    parsedLines = ChordParser.parseFullSong(transposedChords)
    
    chordLines = new ArrayList()
    lyricLines = new ArrayList()
    FOR pair IN parsedLines
      chordLines.add(pair[0])
      lyricLines.add(pair[1])
  
  STEP 4: TRANSPOSE NOTES (IF PRESENT)
    noteLines = new ArrayList()
    IF song.getNotes() != null
      transposedNotes = NoteTransposer.transposeSongNotes(
        song.getNotes(),
        semitones
      )
      noteLines = split(transposedNotes, "\n")
  
  STEP 5: CALCULATE NEW KEY
    newKey = ChordTransposer.getKeyAfterTranspose(
      song.getOriginalKey(),
      semitones
    )
  
  STEP 6: CALCULATE CAPO
    capo = ChordTransposer.getCapoSuggestion(semitones)
  
  STEP 7: RETURN RESULT
    RETURN {
      chordLines: chordLines,
      lyricLines: lyricLines,
      noteLines: noteLines,
      key: newKey,
      capo: capo,
      semitones: semitones
    }
}
```

---

### PIPELINE: DAO Layer

```
SongDAO.getSongById(songId) {
  
  STEP 1: BUILD QUERY
    sql = """
      SELECT * FROM songs
      WHERE id = ? AND is_active = TRUE
    """
  
  STEP 2: EXECUTE QUERY
    connection = DBConnection.getConnection()
    preparedStatement = connection.prepareStatement(sql)
    preparedStatement.setInt(1, songId)
    
    resultSet = preparedStatement.executeQuery()
  
  STEP 3: MAP RESULT
    IF resultSet.next()
      song = mapResultSetToSong(resultSet)
    ELSE
      song = null
    
    close(resultSet, preparedStatement, connection)
  
  STEP 4: RETURN
    RETURN song
}

SongDAO.getHashtagsForSong(songId) {
  
  STEP 1: BUILD QUERY
    sql = """
      SELECT h.name FROM hashtags h
      INNER JOIN song_hashtags sh ON h.id = sh.hashtag_id
      WHERE sh.song_id = ?
    """
  
  STEP 2: EXECUTE QUERY
    connection = DBConnection.getConnection()
    preparedStatement = connection.prepareStatement(sql)
    preparedStatement.setInt(1, songId)
    
    resultSet = preparedStatement.executeQuery()
  
  STEP 3: COLLECT RESULTS
    hashtags = new ArrayList()
    WHILE resultSet.next()
      hashtags.add(resultSet.getString("name"))
    
    close(resultSet, preparedStatement, connection)
  
  STEP 4: RETURN
    RETURN hashtags
}
```

---

## FEATURE 3: LANGUAGE TOGGLE

### Functional Goal
User can switch between Roman (transliteration) and Original script display instantly.

---

### Input Contract
- songId: integer > 0
- language: enum [roman, original]

### Output Contract
- Song object with selected lyrics field populated

---

### PIPELINE: Service Layer

```
SongService.getSongWithLanguage(songId, language) {
  
  STEP 1: FETCH SONG
    song = songDAO.getSongById(songId)
    
    IF song == null
      THROW SongNotFoundException()
  
  STEP 2: SELECT LYRICS
    IF language == "roman"
      lyrics = song.getLyricsRoman()
    ELSE IF language == "original"
      lyrics = song.getLyricsOriginal()
    ELSE
      THROW InvalidLanguageException()
  
  STEP 3: POPULATE SELECTED LYRICS
    song.setDisplayLyrics(lyrics)
  
  STEP 4: RETURN
    RETURN song
}
```

**RULE:** In chord mode, ALWAYS use roman lyrics regardless of toggle setting.

---

## FEATURE 4: SETLIST SYSTEM

### Functional Goal
User creates ordered list of songs with optional section headers.

---

### Data Structure

```
Setlist {
  id: integer
  userId: integer
  title: string
  items: List<SetlistItem>
  createdAt: timestamp
}

SetlistItem {
  id: integer
  setlistId: integer
  position: integer
  type: enum [SONG, SECTION]
  songId: integer (null if type=SECTION)
  headerText: string (null if type=SONG)
}
```

---

### PIPELINE: Service Layer (CREATE)

```
SetlistService.createSetlist(userId, title) {
  
  STEP 1: VALIDATE INPUT
    IF userId <= 0
      THROW ValidationException("Invalid user ID")
    
    IF title == null OR title.trim().isEmpty()
      THROW ValidationException("Title required")
  
  STEP 2: CREATE SETLIST
    setlist = new Setlist()
    setlist.userId = userId
    setlist.title = title.trim()
    setlist.items = new ArrayList()
  
  STEP 3: PERSIST
    setlistId = setlistDAO.createSetlist(setlist)
    setlist.id = setlistId
  
  STEP 4: RETURN
    RETURN setlist
}
```

### PIPELINE: Service Layer (ADD SONG)

```
SetlistService.addSongToSetlist(setlistId, songId, position) {
  
  STEP 1: VALIDATE
    setlist = setlistDAO.getSetlistById(setlistId)
    IF setlist == null
      THROW SetlistNotFoundException()
    
    song = songDAO.getSongById(songId)
    IF song == null
      THROW SongNotFoundException()
  
  STEP 2: INSERT
    setlistDAO.addSongToSetlist(setlistId, songId, position)
  
  STEP 3: INVALIDATE CACHE (IF USED)
    cache.invalidate(setlistId)
  
  STEP 4: RETURN SUCCESS
    RETURN {success: true}
}
```

### PIPELINE: DAO Layer

```
SetlistDAO.createSetlist(setlist) {
  
  STEP 1: BUILD INSERT QUERY
    sql = """
      INSERT INTO setlists (user_id, title, created_at)
      VALUES (?, ?, NOW())
    """
  
  STEP 2: EXECUTE INSERT
    connection = DBConnection.getConnection()
    preparedStatement = connection.prepareStatement(sql, RETURN_GENERATED_KEYS)
    preparedStatement.setInt(1, setlist.userId)
    preparedStatement.setString(2, setlist.title)
    
    preparedStatement.executeUpdate()
  
  STEP 3: GET GENERATED ID
    generatedKeys = preparedStatement.generatedKeys
    IF generatedKeys.next()
      setlistId = generatedKeys.getInt(1)
    ELSE
      THROW DatabaseException("Failed to get generated ID")
  
  STEP 4: RETURN ID
    RETURN setlistId
}
```

---

## PART 4: CRITICAL CONNECTION RULES

### Rule 4.1: NO Direct Controller-to-DAO Communication

**❌ FORBIDDEN:**
```
Controller.doGet(request, response) {
  songs = songDAO.getAllSongs();  // WRONG
  response.write(JSON(songs));
}
```

**✅ REQUIRED:**
```
Controller.doGet(request, response) {
  songs = songService.getAllSongs();
  response.write(JSON(songs));
}
```

### Rule 4.2: Service Must Orchestrate All Operations

**❌ FORBIDDEN:**
```
Service.search(query) {
  if (query.contains("@")) {
    return null;  // Partial logic in service
  }
  return dao.search(query);
}
// Validation continues in DAO or Controller
```

**✅ REQUIRED:**
```
Service.search(query) {
  validateQuery(query);           // All validation here
  normalized = normalizeQuery(query);
  results = dao.search(normalized);
  ranked = rankResults(results);
  return ranked;
}
```

### Rule 4.3: DAO Does NOT Transform Data

**❌ FORBIDDEN:**
```
DAO.searchSongs(query) {
  results = db.query(...);
  // DON'T filter or rank here
  filtered = results.filter(s -> s.isActive);
  return filtered;
}
```

**✅ REQUIRED:**
```
DAO.searchSongs(query) {
  sql = ... WHERE is_active = TRUE ...
  // Apply WHERE clause, not filtering in Java
  return db.query(sql);
}
```

---

## PART 5: ERROR TRACEABILITY

Every error must be traceable to its origin.

### Tracing Framework

```
IF search result is wrong:
  
  TRACE 1: Output check
    Is result set empty?
    Is result set correct type?
  
  TRACE 2: Service check
    Did service.search() return correct type?
    Did ranking algorithm apply?
    Did normalization change input unexpectedly?
  
  TRACE 3: DAO check
    Did DAO.searchSongs() execute correct SQL?
    Did query include all search fields?
    Did result mapping assign fields correctly?
  
  TRACE 4: Database check
    Do songs exist in database?
    Can manual SQL query find them?
    Are indexes present?
```

### Unit Test Requirement

Each layer must have independent tests:

```
TestSearchController {
  test_validInput_callsService()
  test_invalidInput_returns400()
  test_serviceException_returns500()
}

TestSearchService {
  test_normalizeQuery_lowercase()
  test_calculateScore_titleHighest()
  test_rankResults_correctOrder()
}

TestSongDAO {
  test_searchSongs_returnsCorrectSQL()
  test_resultMapping_allFieldsPopulated()
}
```

---

## PART 6: PERFORMANCE INTEGRATION

### Rule 6.1: Batch in DAO

**❌ BAD:**
```
Service.getSongs(songIds) {
  FOR id IN songIds
    song = dao.getSongById(id);  // Loop with queries
    songs.add(song);
}
```

**✅ GOOD:**
```
Service.getSongs(songIds) {
  songs = dao.getSongsByIds(songIds);  // Single batch query
}

DAO.getSongsByIds(ids) {
  sql = SELECT * FROM songs WHERE id IN (?, ?, ?)
  // Single query for all IDs
}
```

### Rule 6.2: Service Validates Query Plan

**Requirement:** Service must log or validate query count before returning.

```
Service.getSongs(songIds) {
  IF songIds.size > 1000
    THROW ValidationException("Too many songs requested")
  
  songs = dao.getSongsByIds(songIds)
  
  // Expected: 1 query for songs + 1 query for hashtags
  // If more queries, there's an N+1 bug
  
  RETURN songs
}
```

---

## PART 7: IMPLEMENTATION CHECKLIST

Before implementing ANY feature, follow this:

### Pre-Implementation

- [ ] Define controller endpoint (input/output contract)
- [ ] Define service method signature
- [ ] Define DAO queries
- [ ] Identify all transformations (which layer?)
- [ ] Design error cases and HTTP status codes

### Implementation

- [ ] Code controller (parse, validate, delegate)
- [ ] Code service (transform, orchestrate)
- [ ] Code DAO (query data, map objects)
- [ ] Write unit tests (1 per layer)
- [ ] Test end-to-end

### Validation

- [ ] No business logic in controller or DAO
- [ ] No database calls in service (only DAO calls)
- [ ] All queries use PreparedStatement
- [ ] Query count is 2 or less per operation
- [ ] Error handling covers all cases
- [ ] Traceability: errors point to layer

---

## PART 8: FINAL RULES

### The Golden Rule

> **Each layer has ONE job. If it does more, split it.**

### The Testability Rule

> **If code cannot be tested independently, it violates the blueprint.**

### The Traceability Rule

> **A developer must be able to trace any bug to its origin layer without guessing.**

---

## APPENDIX: QUICK REFERENCE

| Layer | Input | Output | Database | Logic |
|-------|-------|--------|----------|-------|
| **Controller** | HTTP request | HTTP response | No | No |
| **Service** | Raw args | Transformed result | No | Yes |
| **DAO** | Parameters | Raw objects | Yes | No |

**Flow:** Request → Controller → Service → DAO → DB → DAO → Service → Controller → Response

---

## DOCUMENT APPROVAL & USAGE

This blueprint is **non-negotiable**. All code reviews must verify:

1. Three-layer structure is present
2. Responsibilities are separated correctly
3. No circular dependencies
4. Errors are traceable
5. Performance rules followed

---

## CHANGE LOG

### Version 1.0 (April 10, 2026)
- Initial implementation blueprint
- Defined three-layer architecture
- Created feature implementation pipelines
- Established global rules
- Defined error traceability framework
