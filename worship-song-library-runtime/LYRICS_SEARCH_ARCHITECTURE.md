# Lyrics Search Architecture

## Overview

The lyrics search feature enables users to search for songs not only by title but also by the content of their lyrics. This is implemented as a completely separate search index that works alongside the existing title search, providing a unified search experience through a single search bar.

## Architecture Principles

1. **Separation of Concerns**: Title search and lyrics search are independent indexes
2. **No Data Duplication**: Source of truth remains IndexedDB; lyrics documents are temporary search artifacts
3. **Performance**: All searching occurs against in-memory MiniSearch indexes, never directly against IndexedDB
4. **User Experience**: Single search bar searches both indexes seamlessly
5. **Ranking Priority**: Title matches always rank above lyric-only matches

## Components

### 1. LyricsDocumentBuilder (`src/utils/LyricsDocumentBuilder.ts`)

**Responsibilities:**
- Extract plain lyrics from song data (removes chords, formatting, markers)
- Normalize lyrics for search (lowercase, whitespace normalization)
- Generate lightweight `LyricsDocument` objects for indexing
- Extract lyrics snippets around search terms for display

**Key Functions:**
- `buildLyricsDocument(song: SongDetail)`: Creates a searchable lyrics document from a song
- `buildLyricsDocuments(songs: SongDetail[])`: Batch processes multiple songs
- `extractLyricsSnippet(lyricsSearch: string, query: string)`: Extracts context around a match

**LyricsDocument Structure:**
```typescript
{
  id: number;
  songNumber: number;
  title: string;
  language?: string;
  lyricsSearch: string; // Cleaned, normalized lyrics text
}
```

**Cleaning Process:**
1. Remove chord markers: `[G]`, `[Am]`, etc.
2. Remove section markers: `[Verse]`, `[Chorus]`, etc.
3. Remove formatting: `{brackets}`, `<html>`, `(parentheses)`
4. Normalize whitespace: collapse multiple spaces/newlines
5. Lowercase for search
6. Filter out songs with < 10 characters of lyrics

### 2. SearchEngine Updates (`src/utils/SearchEngine.ts`)

**Changes:**
- Added second MiniSearch instance: `lyricsMiniSearch`
- Added `indexLyrics(songs: SongDetail[])` method
- Updated `searchWithLimit()` to query both indexes
- Returns results with `matchType` and `lyricsSnippet` metadata

**Two Independent Indexes:**

**Title Index (existing):**
```typescript
titleMiniSearch = new MiniSearch<SearchDocument>({
  fields: ['transliteratedTitle', 'artistSearch', 'songNumber'],
  storeFields: ['id', 'title', 'artist', 'songNumber', 'language', 'transliteratedTitle'],
  searchOptions: {
    boost: { transliteratedTitle: 3, songNumber: 5, artistSearch: 1.2 },
    fuzzy: 0.2,
    prefix: true
  }
})
```

**Lyrics Index (new):**
```typescript
lyricsMiniSearch = new MiniSearch<LyricsDocument>({
  fields: ['lyricsSearch', 'title'],
  storeFields: ['id', 'songNumber', 'title', 'language'],
  searchOptions: {
    boost: { lyricsSearch: 1, title: 0.5 },
    fuzzy: 0.2,
    prefix: true
  }
})
```

**Search Pipeline:**
```
User Query
↓
Normalize Query (synonym expansion)
↓
Title MiniSearch (parallel)
↓
Lyrics MiniSearch (parallel)
↓
Merge Results
↓
SearchRanker (title matches above lyric-only)
↓
Return with matchType and lyricsSnippet
```

### 3. SearchRanker Updates (`src/utils/SearchRanker.ts`)

**Changes:**
- Updated `rankCandidates()` to accept both title and lyrics candidates
- Implements merging logic with priority rules
- Extracts lyrics snippets for lyric-only matches
- Returns `matchType` and `lyricsSnippet` in results

**Merging Rules:**
1. **Title matches always rank above lyric-only matches**
2. **No duplicate songs**: If a song matches both title and lyrics, show only once as title match
3. **Title matches** use existing tier system (Tiers 1-4)
4. **Lyrics-only matches** get Tier 4 with base score of 50000 (below all title tiers)

**RankedResult Structure:**
```typescript
{
  id: number;
  score: number;
  tier: number;
  reason: string;
  matchType: 'title' | 'lyrics' | 'both';
  lyricsSnippet?: string; // Only for lyric-only matches
}
```

### 4. DataService Updates (`src/services/DataService.ts`)

**Changes:**
- `batchDownloadSongs()`: Calls `SearchEngine.indexLyrics()` after downloading
- `wakeUpSync()`: Calls `SearchEngine.indexLyrics()` when songs change

**Initialization Flow:**
```
App Start
↓
AppInitializer.initialize()
↓
DataService.wakeUpSync()
↓
If songs changed:
  - SearchEngine.indexSongs() (title index)
  - SearchEngine.indexLyrics() (lyrics index)
```

### 5. UI Updates

**SongRow (`src/components/shared/SongRow.tsx`):**
- Accepts `matchType` and `lyricsSnippet` props
- Displays "Lyrics Match" badge for lyric-only matches
- Shows lyrics snippet below song title

**SearchOverlay (`src/components/shared/SearchOverlay.tsx`):**
- Displays "Searching titles and lyrics" indicator when lyric matches exist
- Passes match metadata to SongRow components

**SearchBar Placeholder:**
- Updated to "Search songs, numbers, lyrics..." to indicate lyrics search capability

## Performance Considerations

### Index Building Cost

The lyrics index is built from IndexedDB during initialization:
- **Read songs from IndexedDB**: ~50-200ms (depending on device)
- **Generate lyrics documents**: ~100-500ms (722 songs)
- **Build MiniSearch index**: ~200-800ms
- **Total**: ~350-1500ms typically

**Decision**: IndexedDB-based approach is performant enough. No need for pre-generated `lyrics_search.json` unless profiling shows issues on target devices.

### Search Performance

- **Title search**: ~1-5ms per query
- **Lyrics search**: ~1-5ms per query
- **Total search time**: ~2-10ms (both indexes queried in parallel)
- **No IndexedDB queries during search**: All searches are in-memory

### Memory Usage

- **Title index cache**: ~1-2MB (722 songs)
- **Lyrics index cache**: ~2-5MB (722 songs with lyrics)
- **Total additional memory**: ~3-7MB

## Usage Example

### User Experience

```
User types: "how sweet the sound"

↓

Results:
1. Amazing Grace (#101)
   Key: G • English
   "...how sweet the sound that saved a wretch..."
   [Lyrics Match badge]

2. Amazing Grace (My Chains Are Gone) (#450)
   Key: G • English
   "...how sweet the sound..."
   [Lyrics Match badge]
```

### Code Example

```typescript
// Search automatically queries both indexes
const results = SearchEngine.searchWithLimit(songs, "how sweet the sound", 10);

// Results include matchType and lyricsSnippet
results.forEach(result => {
  console.log(result.title);
  console.log(result.matchType); // 'title' | 'lyrics' | 'both'
  console.log(result.lyricsSnippet); // "...how sweet the sound..."
});
```

## Future Enhancements

### Potential Improvements

1. **Phrase Search**: Support exact phrase matching in lyrics
2. **Proximity Search**: Find words near each other in lyrics
3. **Section-Aware Search**: Search specific sections (verse, chorus)
4. **Language-Specific Lyrics**: Separate indexes per language
5. **Fuzzy Matching**: Adjust fuzzy tolerance for lyrics vs titles
6. **Relevance Scoring**: Improve ranking for lyric matches based on match frequency

### Performance Optimizations

1. **Lazy Loading**: Build lyrics index only when user performs a lyrics search
2. **Web Workers**: Offload index building to background thread
3. **Incremental Updates**: Update only changed songs in lyrics index
4. **Index Compression**: Use compressed index format if memory becomes an issue

## Testing

### Test Cases

1. **Title-only search**: Query matches song title but not lyrics
2. **Lyrics-only search**: Query matches lyrics but not title
3. **Both match**: Query matches both title and lyrics (should show as title match)
4. **No matches**: Query matches neither title nor lyrics
5. **Partial matches**: Query matches part of a word in lyrics
6. **Multiple songs**: Same lyric phrase appears in multiple songs
7. **Snippet extraction**: Verify snippet shows context around match
8. **Ranking priority**: Title matches rank above lyric-only matches
9. **Performance**: Search remains responsive with 700+ songs
10. **Empty lyrics**: Songs without lyrics are filtered out

### Manual Testing

Open the app and try these queries:
- "grace" (should find songs with "grace" in title or lyrics)
- "how sweet" (should find Amazing Grace via lyrics)
- "yeshu" (should find songs with "yeshu" in lyrics)
- "101" (numeric search still works)
- "praise the lord" (phrase search in lyrics)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                    (Single Search Bar)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SearchEngine                            │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   Title MiniSearch  │  │    Lyrics MiniSearch        │  │
│  │   (existing)        │  │    (new)                    │  │
│  └──────────┬──────────┘  └──────────────┬──────────────┘  │
│             │                            │                   │
│             └────────────┬───────────────┘                   │
│                          ▼                                   │
│                   SearchRanker                               │
│          (merge results, apply ranking)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Search Results                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Song Title + matchType + lyricsSnippet              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   IndexedDB         │  │    LyricsDocumentBuilder   │  │
│  │   (songs table)     │  │    (temporary docs)        │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Summary

The lyrics search architecture successfully implements a dual-index search system that:

1. **Maintains separation** between title and lyrics search indexes
2. **Provides unified experience** through a single search bar
3. **Prioritizes title matches** above lyric-only matches
4. **Remains performant** with in-memory MiniSearch indexes
5. **Avoids data duplication** by using temporary search documents
6. **Provides visual feedback** through match badges and lyrics snippets

The architecture is designed to be extensible for future enhancements while maintaining the existing title search functionality unchanged.
