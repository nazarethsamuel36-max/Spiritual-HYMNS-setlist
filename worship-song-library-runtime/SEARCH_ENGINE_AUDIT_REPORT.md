# Search Engine Audit Report

## Executive Summary

**CRITICAL DATA INTEGRITY ISSUE FOUND**: The search engine is using `Search_1.0.json` as the source of truth for search documents, but this file has **empty title fields for 97.5% of Hindi songs** (268 out of 275). This means the search engine cannot match against Devanagari (Hindi script) titles - it can only match against transliterated titles.

## Data Source Analysis

### Search_1.0.json (Used by SearchDocumentBuilder.ts)
- **Total documents**: 722
- **English documents**: 414 (all have proper titles)
- **Hindi documents**: 275
  - **With empty titles**: 268 (97.5%)
  - **With actual titles**: 2 (0.7%)
  - **With dash titles**: 5 (1.8%)
- **Marathi documents**: 25
  - **With empty titles**: 15 (60%)
  - **With actual titles**: 9 (36%)
- **Konkani documents**: 8 (all have proper titles)

### hindi_search_documents.json (NOT used by search engine)
- **Total documents**: 275
- **All documents have proper Devanagari titles**: ✅
- **Sample structure**:
  ```json
  {
    "id": 1,
    "title": "आज का दिन यहोवा ने बनाया है",
    "artist": null,
    "songNumber": 1,
    "language": "hindi",
    "transliteratedTitle": "Aaj ka din Yahova ne banaya hai",
    "artistSearch": ""
  }
  ```

## Search Engine Implementation Analysis

### SearchDocumentBuilder.ts (Lines 187-208)
```typescript
export function buildSearchDocument(song: SongIndex): SearchDocument {
  let normalizedTitle: string | undefined;
  let transliteratedTitle: string | undefined;
  
  const key = `${getLanguageKey(song.language)}_${song.songNumber}`;
  const searchDoc = searchDocumentsMap.get(key);
  if (searchDoc) {
    normalizedTitle = searchDoc.title; // ❌ EMPTY for most Hindi songs
    transliteratedTitle = searchDoc.transliteratedTitle;
  }
  
  return {
    id: song.id,
    title: normalizedTitle || song.title, // Falls back to song.title if empty
    // ...
  };
}
```

**Issue**: The code falls back to `song.title` when `normalizedTitle` is empty, but this relies on the original database having Devanagari titles. The search engine should be using `hindi_search_documents.json` which has proper titles.

### SearchEngine.ts Ranking Logic

The ranking system uses a 3-tier approach:
1. **Tier 1 (10,000,000+)**: Title starts with query phrase
2. **Tier 2 (1,000,000+)**: Word inside title starts with query phrase  
3. **Tier 3 (100,000+)**: Query appears as substring in title
4. **Tier 4 (<100,000)**: Pure MiniSearch score

**Critical Flaw**: Since Hindi titles from Search_1.0.json are empty, the ranking system cannot perform Tier 1-3 matching against Devanagari titles. It can only match against:
- Transliterated titles (if available)
- Original song.title (if database has Devanagari)

## Search Matching Analysis

### Fields Indexed by MiniSearch
```typescript
fields: ['transliteratedTitle', 'artistSearch', 'songNumber']
```

**Observation**: The original `title` field is NOT indexed by MiniSearch. Only `transliteratedTitle` is indexed. This means:
- Devanagari title matching depends entirely on the fallback to `song.title` in SearchDocumentBuilder
- If the database doesn't have Devanagari titles, Hindi search will fail completely

### Synonym Normalization
The engine has a worship-word synonym system that normalizes variants like:
- `yeshu`, `yesu`, `yeshoo` → `yeshu`
- `yahova`, `yehova`, `jehova` → `yahova`
- `prabhu`, `prabu`, `prabhoo` → `prabhu`

This is applied to the user query before searching, which is correct.

## Impact Assessment

### Current Search Behavior for Hindi Songs
1. **User searches in Devanagari**: ❌ Will NOT work (title field is empty in Search_1.0.json)
2. **User searches in transliterated Hindi**: ✅ Will work (transliteratedTitle field is populated)
3. **User searches with synonyms**: ✅ Will work for transliterated queries
4. **Ranking by title prefix**: ❌ Will NOT work for Devanagari (empty titles)

### Missing Results
- Any Hindi song that should be found by Devanagari title search will be missing
- Ranking will be incorrect because the tier system cannot evaluate Devanagari titles

## Root Cause

The search engine was designed to use `Search_1.0.json` as the canonical source, but this file was not properly populated with Devanagari titles for Hindi songs. The file `hindi_search_documents.json` exists with proper titles but is not used by the search engine.

## Recommendations

### Immediate Fix Required
1. **Update SearchDocumentBuilder.ts** to use `hindi_search_documents.json` for Hindi songs instead of relying on the empty titles in `Search_1.0.json`
2. **Populate Search_1.0.json** with proper Devanagari titles from `hindi_search_documents.json`
3. **Add validation** to ensure all search documents have non-empty titles before indexing

### Long-term Improvements
1. **Consolidate data sources** - Use a single canonical source for search documents
2. **Add data integrity checks** - Validate search document structure at build time
3. **Add search tests** - Create automated tests for Devanagari search queries
4. **Document data flow** - Clearly document which JSON file is the source of truth

## Testing Recommendations

Before implementing the alternate-word dictionary, the following must be verified:
1. ✅ Devanagari title search works (currently BROKEN)
2. ✅ Transliterated title search works (currently WORKS)
3. ✅ Synonym normalization works (currently WORKS)
4. ✅ Ranking tiers work correctly (currently BROKEN for Devanagari)
5. ✅ Phrase matching works (currently BROKEN for Devanagari)

## Post-Fix Audit Results (July 16, 2026)

### Data Integrity Status: ✅ FIXED
- **All 722 documents now have non-empty titles**
- Hindi: 275/275 with Devanagari titles
- Marathi: 25/25 with Devanagari titles
- English: 414/414 with titles
- Konkani: 8/8 with titles

### Search Functionality Status

**Working Correctly:**
- ✅ Devanagari title search (Hindi: "यीशु" finds 69 matches, Marathi: "ख्रिस्त" finds 3 matches)
- ✅ Transliterated title search ("yeshu" finds 75 matches)
- ✅ Ranking tiers (Tier 1: title starts with query, Tier 2: word starts with query, Tier 3: substring match)
- ✅ Cross-language search capability

**Issues Identified:**

### 1. Synonym Normalization Not Working as Expected

The audit revealed that the synonym normalization system in `SearchEngine.ts` is **not producing the expected results**:

| Canonical | Expected Matches | Variant | Actual Matches | Status |
|-----------|-----------------|---------|---------------|--------|
| yeshu | 75 | yesu | 10 | ❌ Should be 75 |
| yeshu | 75 | yeshoo | 0 | ❌ Should be 75 |
| yeshu | 75 | yeesu | 0 | ❌ Should be 75 |
| yeshu | 75 | yesh | 75 | ✅ Works |
| yahova | 9 | yehova | 0 | ❌ Should be 9 |
| yahova | 9 | jehova | 5 | ❌ Should be 9 |
| yahova | 9 | yahveh | 0 | ❌ Should be 9 |
| prabhu | 40 | prabu | 0 | ❌ Should be 40 |
| prabhu | 40 | prabhoo | 0 | ❌ Should be 40 |
| prabhu | 40 | prbhu | 0 | ❌ Should be 40 |

**Root Cause:** The synonym normalization in `SearchEngine.ts` (lines 46-58) normalizes the user's query before passing to MiniSearch, but the transliterated titles in `Search_1.0.json` may not contain the variant spellings. The normalization only works if the user types a variant, but the data itself doesn't contain these variants.

**Example:** When a user searches for "yesu", it gets normalized to "yeshu" and finds 75 matches. However, when searching for "yesu" directly in the data (without normalization), it only finds 10 matches because only 10 songs actually contain "yesu" in their transliterated titles.

### 2. Data Inconsistency in Transliterated Titles

The transliterated titles in `Search_1.0.json` are not standardized:
- Some use "yeshu", some use "yesu", some use "yeshoo"
- This inconsistency prevents the synonym normalization from working effectively
- The data should be standardized to use canonical forms only

### Recommendations

**Before implementing alternate-word dictionary:**

1. **Standardize transliterated titles** in `Search_1.0.json` to use canonical forms only
2. **Remove variant spellings** from the data (keep only canonical: yeshu, yahova, prabhu, etc.)
3. **Verify synonym normalization** works after standardization
4. **Add automated tests** for synonym normalization

**Alternate-word dictionary approach:**

The current synonym normalization approach (normalizing user query) is correct, but it requires the data to be standardized. The alternate-word dictionary should:
1. Map variant spellings to canonical forms in the DATA (not just the query)
2. Ensure all transliterated titles use canonical forms
3. Apply normalization during data ingestion, not just at query time

## Conclusion

The critical data integrity issue has been **fixed** - all documents now have proper Devanagari titles. However, the **synonym normalization system is not working effectively** due to inconsistent transliterated titles in the data. The data should be standardized to use canonical forms before implementing an alternate-word dictionary layer.
