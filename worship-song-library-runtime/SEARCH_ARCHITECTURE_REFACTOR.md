# Search Architecture Refactor Documentation

## Overview

The search engine has been refactored to separate **candidate retrieval** (MiniSearch) from **ranking logic** (SearchRanker). This creates a modular architecture where future enhancements like dictionary normalization and Levenshtein correction can be added cleanly without tightly coupling them to MiniSearch.

## Architecture Flow

```
User Types Query
      ↓
Normalize Query (synonym normalization)
      ↓
MiniSearch (candidate retrieval only)
      ↓
Candidate Songs with MiniSearch scores
      ↓
SearchRanker (ranking pipeline)
      ↓
Ranked Results with tier scores
      ↓
SearchOverlay (final display)
```

## Module Responsibilities

### SearchDocumentBuilder
- **Purpose**: Build searchable data structures from SongIndex
- **Input**: SongIndex array
- **Output**: SearchDocument array
- **Responsibilities**:
  - Load canonical titles from Search_1.0.json
  - Build transliterated titles
  - Create artistSearch fields
  - Cache SearchDocuments for search performance

### SearchEngine
- **Purpose**: Orchestrate search flow and handle candidate retrieval
- **Input**: SongIndex array, user query
- **Output**: Ranked SongIndex array with scores
- **Responsibilities**:
  - Manage MiniSearch index
  - Normalize user queries (synonym normalization)
  - Handle numeric search bypass
  - Retrieve candidate songs via MiniSearch
  - Delegate ranking to SearchRanker
  - Map ranked results back to SongIndex objects
- **What it does NOT do**:
  - Worship-specific ranking
  - Prefix prioritization
  - Dictionary logic
  - Levenshtein correction

### SearchRanker
- **Purpose**: Apply deterministic ranking rules to candidate songs
- **Input**: Candidate songs with MiniSearch scores, query, normalized query
- **Output**: Ranked candidates with tier scores
- **Responsibilities**:
  - Apply tier-based ranking (Tier 1-4)
  - Handle primary vs secondary rank separation
  - Expand query phrases for synonym matching
  - Compute ranking scores based on title matching
- **Current Ranking Stages**:
  - **Tier 1** (10,000,000+): Title starts with query
  - **Tier 2** (1,000,000+): Word starts with query
  - **Tier 3** (100,000+): Substring match
  - **Tier 4** (<100,000): MiniSearch score only

## Future Pipeline Stages

The modular architecture allows these stages to be added:

### Stage 5: Dictionary-Normalized Matches
- **Location**: Before MiniSearch (query normalization) or in SearchRanker
- **Purpose**: Normalize alternate spellings to canonical forms
- **Example**: "yesu" → "yeshu", "prabu" → "prabhu"

### Stage 6: Levenshtein Typo Correction
- **Location**: After MiniSearch, in SearchRanker
- **Purpose**: Correct typos using edit distance
- **Example**: "yeshu" → "yeshu" (1 char difference)

## Data Flow

### 1. Indexing Phase
```
SongIndex[] → SearchDocumentBuilder → SearchDocument[]
SearchDocument[] → MiniSearch.addAll()
SearchDocument[] → SearchEngine.searchDocCache
```

### 2. Search Phase
```
User Query → normalizeSearchQuery() → Normalized Query
Normalized Query → MiniSearch.search() → MiniSearch Results
MiniSearch Results → Filter valid IDs → Candidates
Candidates + Query → SearchRanker.rankCandidates() → Ranked Candidates
Ranked Candidates → Map to SongIndex → Final Results
```

## Key Design Decisions

### 1. Separation of Concerns
- **MiniSearch**: Pure candidate retrieval, no worship-specific logic
- **SearchRanker**: Pure ranking logic, no index management
- **SearchEngine**: Orchestration layer, coordinates the flow

### 2. Synonym Normalization Location
- **Current**: Applied to user query before MiniSearch (in SearchEngine)
- **Future**: Could also be applied to data during ingestion for better matching

### 3. Primary vs Secondary Rank
- **Primary Rank** (Tier 1-2): NO LIMIT - shows all word-starting matches
- **Secondary Rank** (Tier 3-4): Limited by user-specified limit
- **Rationale**: Users expect to see all exact prefix matches before seeing partial matches

### 4. Tier-Based Scoring
- **Absolute score ranges**: Cannot be overridden by MiniSearch scores
- **Tier 1**: 10,000,000+ (title starts with query)
- **Tier 2**: 1,000,000+ (word starts with query)
- **Tier 3**: 100,000+ (substring match)
- **Tier 4**: <100,000 (MiniSearch score only)

## Testing Strategy

### Functional Equivalence
The refactor maintains identical search behavior:
- Same ranking algorithm
- Same tier boundaries
- Same primary/secondary rank separation
- Same synonym normalization
- Same numeric search bypass

### Verification
- Build succeeds without errors
- Search results are functionally identical
- Performance is maintained
- Debug logging is preserved

## Migration Notes

### Breaking Changes
None - the public API remains identical:
- `SearchEngine.search(songs, query)` - unchanged
- `SearchEngine.searchWithLimit(songs, query, limit)` - unchanged
- `SearchEngine.indexSongs(songs)` - unchanged

### Internal Changes
- Ranking logic moved from SearchEngine to SearchRanker
- MiniSearch now purely for candidate retrieval
- Query normalization remains in SearchEngine (could move to future Dictionary module)

## Benefits of This Architecture

### 1. Modularity
- Each module has a single, clear responsibility
- Easy to test individual components
- Easy to replace or enhance specific stages

### 2. Extensibility
- New ranking stages can be added without touching MiniSearch
- Dictionary normalization can be inserted at appropriate points
- Levenshtein correction can be added as a separate stage

### 3. Maintainability
- Clear separation makes code easier to understand
- Changes to ranking don't affect candidate retrieval
- Changes to indexing don't affect search flow

### 4. Performance
- SearchDocument caching reduces repeated work
- MiniSearch remains fast for candidate retrieval
- Ranking pipeline is deterministic and predictable

## Future Enhancements

### 1. Dictionary Module
- Normalize alternate spellings in data during ingestion
- Provide canonical forms for all worship words
- Could be used in both indexing and search phases

### 2. Levenshtein Module
- Add typo correction as Stage 6
- Configurable edit distance threshold
- Could be optional based on query length

### 3. Performance Optimization
- Cache ranking results for common queries
- Debounce rapid successive searches
- Pre-compute ranking for popular terms

### 4. Analytics
- Track which ranking stages produce results
- Measure effectiveness of each stage
- Identify opportunities for algorithm improvement

## Conclusion

This refactor establishes a clean separation between candidate retrieval and ranking, creating a foundation for future enhancements while maintaining functional equivalence with the existing search behavior. The modular architecture allows dictionary normalization, Levenshtein correction, and other features to be added as independent stages without tightly coupling them to MiniSearch.
