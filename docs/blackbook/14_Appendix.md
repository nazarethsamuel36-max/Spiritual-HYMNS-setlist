# Chapter 14: Appendix

## Appendix A: Sample Data

### A.1 Sample Song (English)
Title: Amazing Grace
Format: Raw Input Format (Before processing)
```text
[Verse 1]
[G]Amazing grace how [C]sweet the [G]sound
That saved a wretch like [D]me
I [G]once was lost but [C]now am [G]found
Was [Em]blind but [D]now I [G]see
```

### A.2 Sample Song (Hindi / Dual Script)
Title: Aarati Ho Aarati
Format: Relational Storage Example (Conceptual)

`songs` table entry:
- `id`: 45
- `lyrics_original`: "आरती हो आरती"
- `lyrics_roman`: "Aarati Ho Aarati"

`line_chords` table entries (mapped to line 1):
- `chord`: "C", `char_index`: 0
- `chord`: "F", `char_index`: 6

---

## Appendix B: Core Code Snippets

### B.1 Chord Extraction Logic (Java Regex)
This critical snippet demonstrates how the system transitions from unstructured text to structured relational data by locating the `[` and `]` anchors.

```java
public static StructuredLine parseLine(String rawLine) {
    StructuredLine line = new StructuredLine();
    List<ChordOccurrence> chords = new ArrayList<>();
    
    // Pattern matches anything between brackets, e.g. [G], [C#m7]
    Pattern pattern = Pattern.compile("\\[(.+?)\\]");
    Matcher matcher = pattern.matcher(rawLine);
    
    StringBuffer lyricsBuffer = new StringBuffer();
    int offset = 0;
    
    while (matcher.find()) {
        String chordSymbol = matcher.group(1);
        // The position is where the chord was found, minus the length 
        // of all previously stripped bracket tags
        int position = matcher.start() - offset;
        chords.add(new ChordOccurrence(chordSymbol, position));
        
        matcher.appendReplacement(lyricsBuffer, "");
        offset += matcher.group().length();
    }
    matcher.appendTail(lyricsBuffer);
    
    line.setLyrics(lyricsBuffer.toString().trim());
    line.setChords(chords);
    return line;
}
```

### B.2 Transposition Logic (Chromatic Shifting)
The mathematical core of the transposition utility.

```java
private static final String[] SCALE = {"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"};

public static String transposeChord(String chord, int steps) {
    if (chord == null || chord.isEmpty()) return chord;
    
    // Logic to separate root note (e.g., "C") from suffix (e.g., "maj7")
    String root = extractRoot(chord);
    String suffix = chord.substring(root.length());
    
    int currentIndex = Arrays.asList(SCALE).indexOf(root);
    if (currentIndex == -1) return chord; // Unknown root, return as is
    
    // Calculate new index with positive modulo wrap-around
    int newIndex = (currentIndex + steps) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return SCALE[newIndex] + suffix;
}
```

---

## Appendix C: System Configuration

### C.1 Software Stack
- Programming Language: Java 17+
- Enterprise Framework: Jakarta EE (Servlets 6.0, JSP 3.1)
- Database: MySQL 8.0+
- Application Server: Apache Tomcat 10.1+ / Jetty 11
- Build Tool: Apache Maven 3.9+
- Frontend: HTML5, CSS3 (CSS Grid/Flexbox), Vanilla ES6 JavaScript

### C.2 Database Environment Setup
The database schema utilizes standard UTF-8 encoding to support multi-script requirements.
```sql
CREATE DATABASE worship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Appendix D: Glossary of Terms

- Chord: A group of (typically three or more) notes sounded together, forming the harmonic basis of the song (e.g., G Major, C minor).
- Transposition: The process of shifting a piece of music up or down in pitch by a constant interval (measured in semitones).
- DAO (Data Access Object): A structural design pattern that isolates the application/business layer from the persistence layer (usually a relational database) using an API.
- Servlet: A Java programming language class used to extend the capabilities of servers that host applications accessed by means of a request-response programming model (handling HTTP requests).
- Rendering: The process of a web browser reading HTML/CSS/JavaScript and drawing the visual interface on the screen.
- Index Mapping: The technique of storing the position of a musical chord as a mathematical integer representing a specific character in a string of lyrics, rather than relying on visual space padding.

