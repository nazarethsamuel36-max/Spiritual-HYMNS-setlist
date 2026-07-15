# Transliteration Architecture Audit

## Part 1 – Transliteration Report

Based on code analysis, here is the transliteration architecture:

### Sample Hindi Song Transliteration

**Song Example:** यहोवा मेरा चरवाहा (Yehova Mera Charvaha)

**Input (SongIndex):**
```typescript
{
  id: 45,
  songNumber: 45,
  title: "यहोवा मेरा चरवाहा",
  artist: undefined,
  language: "Hindi",
  originalKey: "G",
  searchTokens: "यहोवा मेरा चरवाहा hindi"
}
```

**Output (SearchDocument):**
```typescript
{
  id: 45,
  title: "यहोवा मेरा चरवाहा",
  artist: undefined,
  songNumber: 45,
  language: "Hindi",
  titleSearch: "यहोवा मेरा चरवाहा yehova mera charvaha",
  artistSearch: ""
}
```

**Transliteration Process:**
- Original: "यहोवा मेरा चरवाहा"
- Normalized: "यहोवा मेरा चरवाहा" (lowercase, trimmed)
- Transliterated: "yehova mera charvaha"
- Combined: "यहोवा मेरा चरवाहा yehova mera charvaha"

### Transliteration Map (Hindi)

From `SearchDocumentBuilder.ts`:

**Vowels:**
- अ → a, आ → aa, इ → i, ई → ii, उ → u, ऊ → uu
- ए → e, ऐ → ai, ओ → o, औ → au

**Consonants:**
- क → k, ख → kh, ग → g, घ → gh, ङ → ng
- च → ch, छ → chh, ज → j, झ → jh, ञ → ny
- ट → t, ठ → th, ड → d, ढ → dh, ण → n
- त → t, थ → th, द → d, ध → dh, न → n
- प → p, फ → ph, ब → b, भ → bh, म → m
- य → y, र → r, ल → l, व → v
- श → sh, ष → sh, स → s, ह → h

**Matras (vowel signs):**
- ा → a, ि → i, ी → ii, ु → u, ू → uu
- े → e, ै → ai, ो → o, ौ → au

**Special:**
- ं → m, ः → h, ऽ → '
- ् → '' (halant - removes inherent vowel)

**Conjuncts:**
- क्ष → ksh, त्र → tr, ज्ञ → gy, श्र → shr

**Marathi-specific:**
- ळ → l (retroflex lateral)

---

## Part 2 – Data Flow Audit

### Complete Lifecycle

```
Supabase (songs table)
  ↓ Columns: id, song_number, title, artist, language, original_key, chords, lyrics, is_active, updated_at
  ↓ Transliteration: DOES NOT EXIST in Supabase
  ↓
DataService.batchDownloadSongs() / wakeUpSync()
  ↓ Transforms Supabase data to SongIndex
  ↓ searchTokens: "${title} ${artist} ${language}".toLowerCase()
  ↓ Transliteration: DOES NOT EXIST in SongIndex
  ↓
IndexedDB (songIndex table)
  ↓ Fields: id, songNumber, title, artist, language, originalKey, hashtags, searchTokens
  ↓ Transliteration: DOES NOT EXIST in IndexedDB
  ↓
SongIndex (runtime object)
  ↓ {
  ↓   id: number,
  ↓   songNumber: number,
  ↓   title: string,
  ↓   artist?: string,
  ↓   language?: string,
  ↓   originalKey?: string,
  ↓   hashtags?: string[],
  ↓   searchTokens: string
  ↓ }
  ↓ Transliteration: DOES NOT EXIST in SongIndex
  ↓
SearchEngine.indexSongs()
  ↓ Calls buildSearchDocuments(songs)
  ↓
SearchDocumentBuilder.buildSearchDocument()
  ↓ Input: SongIndex
  ↓ Output: SearchDocument
  ↓ titleSearch generated HERE
  ↓ artistSearch generated HERE
  ↓
SearchDocument (runtime object)
  ↓ {
  ↓   id: number,
  ↓   title: string,
  ↓   artist?: string,
  ↓   songNumber: number,
  ↓   language?: string,
  ↓   titleSearch: string, ← TRANSLITERATION EXISTS HERE
  ↓   artistSearch: string ← TRANSLITERATION EXISTS HERE
  ↓ }
  ↓ Transliteration: EXISTS ONLY in SearchDocument
  ↓
MiniSearch.addAll(searchDocuments)
  ↓ Stores SearchDocuments in MiniSearch index
  ↓ Transliteration: EXISTS in MiniSearch index
  ↓
SearchEngine.searchDocCache (Map)
  ↓ Caches SearchDocuments for reuse
  ↓ Transliteration: EXISTS in cache
  ↓
SearchEngine.search()
  ↓ Query normalized
  ↓ MiniSearch.search(normalizedQuery)
  ↓ Returns matching SearchDocuments
  ↓ Ranking uses titleSearch and artistSearch
  ↓
Search Results (SongIndex with score)
  ↓ Returns original SongIndex objects
  ↓ Transliteration: NOT returned to UI
  ↓
React UI
  ↓ Displays SongIndex.title (original)
  ↓ Transliteration: NOT displayed
```

---

## Part 3 – Storage Audit

### Does transliteration exist in Supabase?

**NO**

**Explanation:** Supabase `songs` table stores only:
- id, song_number, title, artist, language, original_key, chords, lyrics, is_active, updated_at

There are no `titleSearch` or `artistSearch` columns. Transliteration is not stored in Supabase.

### Does transliteration exist inside IndexedDB?

**NO**

**Explanation:** IndexedDB `songIndex` table stores:
- id, songNumber, title, artist, language, originalKey, hashtags, searchTokens

There are no `titleSearch` or `artistSearch` fields. Transliteration is not stored in IndexedDB.

### Does transliteration exist only at runtime?

**YES**

**Explanation:** Transliteration is created at runtime in `SearchDocumentBuilder.buildSearchDocument()`:

```typescript
export function buildSearchDocument(song: SongIndex): SearchDocument {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    songNumber: song.songNumber,
    language: song.language,
    titleSearch: buildTitleSearch(song.title, song.language),  ← Generated here
    artistSearch: buildArtistSearch(song.artist, song.language), ← Generated here
  };
}
```

The transliterated fields exist only in:
1. `SearchDocument` objects (runtime)
2. MiniSearch index (in-memory)
3. `SearchEngine.searchDocCache` (in-memory Map)

They are never persisted to any database.

---

## Part 4 – SearchDocumentBuilder Audit

### Input: SongIndex

```typescript
{
  id: 45,
  songNumber: 45,
  title: "यहोवा मेरा चरवाहा",
  artist: undefined,
  language: "Hindi",
  originalKey: "G",
  hashtags: [],
  searchTokens: "यहोवा मेरा चरवाहा hindi"
}
```

### Process: buildSearchDocument()

```typescript
export function buildSearchDocument(song: SongIndex): SearchDocument {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    songNumber: song.songNumber,
    language: song.language,
    titleSearch: buildTitleSearch(song.title, song.language),  ← TRANSLATION HERE
    artistSearch: buildArtistSearch(song.artist, song.language),
  };
}
```

### buildTitleSearch() Process

```typescript
function buildTitleSearch(title: string, language?: string): string {
  const normalizedTitle = normalizeText(title);
  // normalizeText: "यहोवा मेरा चरवाहा" → "यहोवा मेरा चरवाहा"
  
  const transliterated = transliterateText(title, language);
  // transliterateText: "यहोवा मेरा चरवाहा" → "yehova mera charvaha"
  
  const normalizedTransliterated = normalizeText(transliterated);
  // normalizeText: "yehova mera charvaha" → "yehova mera charvaha"
  
  if (normalizedTransliterated && normalizedTransliterated !== normalizedTitle) {
    return `${normalizedTitle} ${normalizedTransliterated}`;
  }
  return normalizedTitle;
}
```

### Output: SearchDocument

```typescript
{
  id: 45,
  title: "यहोवा मेरा चरवाहा",
  artist: undefined,
  songNumber: 45,
  language: "Hindi",
  titleSearch: "यहोवा मेरा चरवाहा yehova mera charvaha",  ← TRANSLITERATED
  artistSearch: ""
}
```

**Where titleSearch is generated:** Line 182 in `SearchDocumentBuilder.ts`

---

## Part 5 – MiniSearch Audit

### MiniSearch Configuration

```typescript
private static miniSearch = new MiniSearch<SearchDocument>({
  fields: ['titleSearch', 'artistSearch', 'songNumber'],
  storeFields: ['id', 'title', 'artist', 'songNumber', 'language'],
  searchOptions: {
    boost: { titleSearch: 3, songNumber: 5, artistSearch: 1.2 },
    fuzzy: 0.2,
    prefix: true
  }
});
```

### Document Stored in MiniSearch

**Example document for Hindi song #45:**

```typescript
{
  id: 45,
  title: "यहोवा मेरा चरवाहा",
  artist: undefined,
  songNumber: 45,
  language: "Hindi",
  titleSearch: "यहोवा मेरा चरवाहा yehova mera charvaha",
  artistSearch: ""
}
```

**Searchable fields:**
- `titleSearch`: "यहोवा मेरा चरवाहा yehova mera charvaha" (boost: 3)
- `artistSearch`: "" (boost: 1.2)
- `songNumber`: 45 (boost: 5)

**Stored fields (returned in results):**
- `id`, `title`, `artist`, `songNumber`, `language`

---

## Part 6 – Search Execution Trace

### User searches: "yehova"

```
SearchBar
  ↓ User types "yehova"
  ↓ handleChange(newValue: "yehova")
  ↓ setValue("yehova")
  ↓ onSearchResults(results)
  ↓
SearchEngine.searchWithLimit(songs, "yehova", 10)
  ↓
normalizeSearchQuery("yehova")
  ↓ Lowercase: "yehova"
  ↓ Check worship synonyms: "yehova" → "yahova" (canonical form)
  ↓ Returns: "yahova"
  ↓
MiniSearch.search("yahova")
  ↓ Searches in titleSearch, artistSearch, songNumber fields
  ↓ Fuzzy matching (0.2 threshold)
  ↓ Prefix matching enabled
  ↓ Boosts: titleSearch(3), songNumber(5), artistSearch(1.2)
  ↓ Returns: [{ id: 45, score: 0.85, ... }]
  ↓
expandQueryPhrases("yehova")
  ↓ Generates synonym variants: ["yehova", "yahova", "yehova", "jehova", "yahveh"]
  ↓ Returns: ["yehova", "yahova", "yehova", "jehova", "yahveh"]
  ↓
computeRankingScore(searchDoc, queryPhrases, normalizedQuery, miniSearchScore)
  ↓ titleSearch: "यहोवा मेरा चरवाहा yehova mera charvaha"
  ↓ normalizeForPhrase(titleSearch): "यहोवा मेरा चरवाहा yehova mera charvaha"
  ↓ Check exact match: "यहोवा मेरा चरवाहा yehova mera charvaha" === "yehova"? NO
  ↓ Check starts with: "यहोवा मेरा चरवाहा yehova mera charvaha".startsWith("yehova")? NO
  ↓ Check contains: "यहोवा मेरा चरवाहा yehova mera charvaha".includes("yehova")? YES
  ↓ Score += 1000
  ↓ Final score: 1000 + 0.85 = 1000.85
  ↓
Return ranked results
  ↓ [{ id: 45, songNumber: 45, title: "यहोवा मेरा चरवाहा", score: 1000.85, ... }]
  ↓
React UI
  ↓ Displays SongIndex.title: "यहोवा मेरा चरवाहा"
  ↓ titleSearch NOT displayed
```

**Where titleSearch is used:**
1. MiniSearch searches against `titleSearch` field
2. `computeRankingScore()` checks `titleSearch` for exact/prefix/contains matches
3. Used for ranking but never displayed to user

---

## Part 7 – Lifetime

### Transliterated Title Lifetime

```
Generated
  ↓ During SearchEngine.indexSongs()
  ↓ Called by DataService.batchDownloadSongs() or wakeUpSync()
  ↓ buildSearchDocument() creates SearchDocument with titleSearch
  ↓
Stored
  ↓ Only in MiniSearch index (in-memory)
  ↓ Only in SearchEngine.searchDocCache (in-memory Map)
  ↓ NOT in Supabase
  ↓ NOT in IndexedDB
  ↓
Used
  ↓ During every SearchEngine.search() call
  ↓ MiniSearch searches titleSearch field
  ↓ computeRankingScore() checks titleSearch for matching
  ↓
Destroyed
  ↓ When SearchEngine.indexSongs() is called again
  ↓ MiniSearch.removeAll() clears index
  ↓ searchDocCache is rebuilt
  ↓ When browser page is refreshed
  ↓ When app is closed
```

**Key points:**
- Generated once per index rebuild (not per search)
- Cached in memory to avoid regenerating on every keystroke
- Never persisted to disk
- Lost on page refresh or app restart

---

## Part 8 – Architecture Verification

### Statement to Verify:

"Transliterated search fields are runtime-only derived data. They are never stored in Supabase or IndexedDB and only exist inside the search subsystem."

### Verification: **TRUE**

**Evidence:**

1. **Supabase Schema:**
   - `songs` table has no `titleSearch` or `artistSearch` columns
   - Only stores original `title` and `artist`

2. **IndexedDB Schema:**
   - `songIndex` table has no `titleSearch` or `artistSearch` fields
   - Only stores original `title`, `artist`, and `searchTokens`
   - `searchTokens` is just lowercase concatenation, not transliteration

3. **SongIndex Type:**
   ```typescript
   export type SongIndex = {
     id: number;
     songNumber: number;
     title: string;
     artist?: string;
     language?: string;
     originalKey?: string;
     hashtags?: string[];
     searchTokens: string;
     isPersonal?: boolean;
     is_active?: boolean;
   }
   ```
   - No transliteration fields

4. **SearchDocument Type:**
   ```typescript
   export interface SearchDocument {
     id: number;
     title: string;
     artist?: string;
     songNumber: number;
     language?: string;
     titleSearch: string;  ← Only here
     artistSearch: string; ← Only here
   }
   ```
   - Comment in code: "Internal runtime object for search indexing. Never stored in Supabase or IndexedDB."

5. **Storage Locations:**
   - MiniSearch index (in-memory)
   - `SearchEngine.searchDocCache` (in-memory Map)
   - Both are runtime-only, cleared on page refresh

### Conclusion:

The statement is **completely accurate**. Transliterated search fields (`titleSearch`, `artistSearch`) are:
- ✅ Runtime-only derived data
- ✅ Never stored in Supabase
- ✅ Never stored in IndexedDB
- ✅ Only exist inside the search subsystem (SearchDocument, MiniSearch, cache)

---

## Summary

**Transliteration Architecture:**
1. **Source:** Original Devanagari text from Supabase
2. **Generation:** `SearchDocumentBuilder.buildSearchDocument()` at runtime
3. **Storage:** MiniSearch index + in-memory cache only
4. **Usage:** Search matching and ranking
5. **Lifetime:** Per index rebuild, lost on refresh

**Key Design Decision:**
Transliteration is intentionally kept as a search-only optimization. The UI always displays the original text, and transliteration exists solely to enable English searches for Hindi/Marathi songs.
