# Chapter 9: Search System

## 9.1 Multi-Dimensional Search
Finding a song in a large library requires more than simple string matching. The Worship Song Library implements a multi-dimensional search service that looks across:
1. Song Number: The primary identifier in traditional songbooks.
2. Title: Full and partial title matches.
3. Artist/Author: Searching for specific composers.
4. Lyrics: Searching for a phrase inside the song.

## 9.2 Intelligent Ranking Logic
Not all search results are equal. The system uses a weighted scoring algorithm to prioritize results:
- Exact Number Match: 100 points (Top Priority).
- Title Match: 80 points.
- Artist Match: 50 points.
- Lyrics Match: 30 points.

### 9.2.1 Search Logic Snippet
The following logic in `SearchService.java` demonstrates how tokens are processed to handle multi-word queries.

```java
public List<Song> search(String query) {
    String normalized = query.toLowerCase().trim();
    List<Song> candidates = songDAO.searchSongs(normalized);
    
    return candidates.stream()
        .sorted((s1, s2) -> {
            int score1 = calculateScore(s1, normalized);
            int score2 = calculateScore(s2, normalized);
            return Integer.compare(score2, score1); // Descending
        })
        .collect(Collectors.toList());
}
```

## 9.3 Handling Phonetic Variations
In bilingual environments, users often search for Hindi songs using Roman characters (e.g., searching "Dhanyawad" for "धन्यवाद"). The search system handles this by:
- Normalizing all inputs to a common phonetic base.
- Searching both `lyrics_original` and `lyrics_roman` fields simultaneously.

## 9.4 User Interface: Search Experience
As shown in Figure 9.1, the search interface is designed for speed, with a live-results preview that updates as the user types.

<div align="center">
  <img src="./images/home_page.png" width="90%" alt="Figure 9.1: Search Interface">
</div>
Figure 9.1: The main landing page featuring the search bar and categorized song browsing.

## 9.5 Advanced Filtering
Users can narrow down search results using specific filters:
- Language Filter: Switch between English, Hindi, and Marathi.
- Hashtag Filter: Filter by theme (e.g., #Praise, #Worship, #Christmas).
- Key Filter: Find songs written in a specific musical key.

## 9.6 Scalability
To maintain high performance as the library grows to thousands of songs, the system uses:
- SQL Indexes: On `song_number`, `title`, and `language` columns.
- Caching: Frequently accessed songs are cached in the application memory.


## 9.7 Limitations
- Limitation (Full-Text Search Cost): Searching through the `lyrics_roman` field across thousands of rows can trigger full table scans if not properly indexed with a specialized full-text search engine (like Elasticsearch or Lucene), which adds architectural overhead.



