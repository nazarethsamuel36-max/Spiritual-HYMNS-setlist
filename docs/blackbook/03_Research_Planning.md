# Chapter 3: Research and Planning

## 3.1 Introduction to Research
The domain of digital song libraries and chord management systems sits at the intersection of musical notation, linguistics, and software engineering. In real-world environments, particularly within church and worship contexts, musicians and singers require rapid access to extensive repertoires of songs. These songs are not static; they must be dynamically adaptable. A worship leader might need to change a song's key immediately before a service to accommodate a different vocal range, or a bilingual congregation might require simultaneous access to original script and transliterated lyrics.

Historically, this problem was solved using physical binders, which were cumbersome, difficult to update, and static in key and language. The transition to digital systems brought convenience but introduced new technical challenges, primarily revolving around the robust display of "Chord-over-Lyric" formatting on responsive web and mobile interfaces. The core research of this project focuses on analyzing existing methodologies for digital sheet music and developing a superior paradigm for structured storage, responsive rendering, and dynamic manipulation of musical chords integrated with multi-language text.

## 3.2 Literature Review
To design an effective solution, a thorough analysis of current industry standards and popular applications was conducted. The analysis focused on three primary paradigms: community-driven web platforms, professional mobile applications, and traditional static formats.

### 3.1 Ultimate Guitar (UG)
Ultimate Guitar represents the largest community-driven chord database in the world. 
Strengths:
- Extensive Database: Hosts millions of user-contributed tabs and chords.
- Familiar Format: Utilizes the standard two-line format (chords on top, lyrics below) which is universally understood by amateur musicians.
- Transposition Feature: Offers automated transposition based on extracting chords from text blocks.

Limitations:
- Text-Based Alignment Dependency: UG relies entirely on `<pre>` tags and monospaced fonts to align chords over lyrics using space characters. This creates a brittle visual structure.
- Mobile Responsiveness Failures: On narrow mobile screens, when a long line of lyrics wraps to the next line, the chord line above it does not wrap synchronously. This results in "Chord Drift," where chords intended for the end of a sentence appear arbitrarily over the beginning of the next, rendering the music unreadable.
- Unstructured Storage: Songs are stored as large, monolithic text blobs rather than structured entities (sections, lines, occurrences), making granular data manipulation difficult.

### 3.2 OnSong and Professional Church Apps
OnSong is a premium, industry-standard application heavily utilized in church environments.
Strengths:
- Performance Focused: Excels at setlist management, foot-pedal integration, and stage display routing.
- Robust Transposition: Handles complex transposition rules effectively.
- Format Flexibility: Supports proprietary formats like OnSong and ChordPro, which use bracketed anchors (e.g., `[G]`) to bind chords to specific words.

Limitations:
- Closed Ecosystem: It is a proprietary, paid application restricted primarily to the Apple (iOS/iPadOS) ecosystem, limiting accessibility for users on Windows or Android devices.
- Customization Constraints: Adapting the application to support niche requirements, such as dual-script rendering for Indian languages (Devanagari and Roman transliteration), is extremely limited or unsupported.
- Cost Barrier: The subscription-based model presents a financial hurdle for smaller congregations or individual musicians in developing regions.

### 3.3 Traditional Systems (PDF and Text Documents)
Many organizations still rely on digitally stored but fundamentally static formats, such as exported PDFs or Word documents.
Strengths:
- Absolute Visual Fidelity: A PDF guarantees that what the author created is exactly what the user sees, completely immune to responsive layout breaking.
- Universal Accessibility: PDFs can be opened on any device without specialized software.

Limitations:
- Static Format: Zero flexibility. A song written in G Major cannot be transposed to D Major without manually rewriting the document.
- Search Inefficiency: While text-searchable, they lack semantic search capabilities (e.g., searching by specific metadata like "Theme" or "Original Key").
- Maintenance Nightmare: Updating a single spelling error in a song requires editing the source document, re-exporting the PDF, and distributing the new version to all musicians.

## 3.3 Comparative Analysis

| Feature | Ultimate Guitar (UG) | OnSong | Traditional (PDF/Txt) | Proposed System (Worship Song Library) |
| :--- | :--- | :--- | :--- | :--- |
| Chord Alignment Mechanism | Space-based padding | Bracketed anchors (Proprietary) | Fixed layout | Character-index anchoring |
| Mobile Responsiveness | Poor (Breaks on text wrap) | Excellent (Native UI rendering) | None (Requires zooming) | Excellent (Dynamic Virtual Wrapping) |
| Real-time Transposition | Yes (Regex based) | Yes (Engine based) | No | Yes (Chromatic mapping) |
| Multi-Language/Script Support | Limited (Latin script focus) | Limited | Static | First-class support (Dynamic toggling) |
| Data Storage Model | Monolithic text blob | Proprietary flat files | Unstructured files | Highly normalized Relational Database |
| Search Capability | Broad text search | Title/Content search | File-level search only | Semantic multi-dimensional search |
| Platform Availability | Web, iOS, Android | iOS/iPadOS primarily | Universal | Universal Web App |

## 3.4 Problem Identification
Based on the analysis of existing solutions, the following critical problems were identified as requiring resolution in the proposed system:
1. The Mobile Misalignment Problem: Relying on space characters and `<pre>` tags for chord alignment is fundamentally incompatible with responsive web design.
2. Lack of Structured Chord Storage: Storing songs as single text blobs prevents intelligent querying and manipulation. Without structure, an application cannot easily say, "Give me all chords used in Verse 1."
3. Inadequate Multi-Language Handling: Existing platforms treat non-Latin scripts as edge cases. There is a lack of systems that seamlessly map complex musical notation to languages requiring Unicode rendering and transliteration support.
4. Platform Restriction: Professional-grade tools are often locked behind expensive, hardware-specific ecosystems.

## 3.5 Justification of Proposed Approach
To address the identified problems, the Worship Song Library implements several specific engineering approaches.

### 3.1 Position-Based Chord Mapping
Approach: Instead of storing chords as a separate text line, chords are stored relationally with an exact `char_index` pointing to the corresponding lyric line.
Justification: This solves the Mobile Misalignment Problem. By treating the chord not as visual text, but as metadata attached to a specific character index, the rendering engine can mathematically calculate where the chord belongs, even if the browser forcibly wraps the text onto a new line.

### 3.2 Highly Normalized Relational Database
Approach: Songs are broken down into Sections (Verse, Chorus), which are broken down into Lines, which possess Chord Occurrences.
Justification: This solves the Unstructured Storage problem. A relational structure allows the application to query data efficiently. It enables features like dynamic setlist generation, targeted transposition (e.g., only transposing the bridge), and precise data validation.

### 3.3 Dynamic Rendering Engine (Virtual Wrapping)
Approach: A custom JavaScript algorithm that intercepts browser text wrapping, calculates available viewport width, and intelligently splits lyric lines while recalculating relative chord positions.
Justification: This guarantees that the visual representation of the music remains completely accurate across all devices, from a 4K projector to a 320px wide smartphone screen, outperforming both UG's brittle text blocks and traditional static PDFs.

## 3.6 Design Decisions and Trade-offs

### 3.1 Architecture: Java Servlets (Jakarta EE)
Decision: Core backend logic is handled by raw Java Servlets rather than a heavy framework like Spring Boot.
Reasoning: Given the focused scope of the application, Servlets provide maximum performance, complete control over the HTTP request lifecycle, and zero "magic" overhead. It ensures a deep understanding of the underlying web protocols.
Trade-off: Requires more boilerplate code for routing and dependency injection compared to a modern framework.

### 3.2 Database: MySQL
Decision: Utilization of a traditional RDBMS.
Reasoning: The data model (Songs -> Sections -> Lines -> Chords) is inherently relational. MySQL provides ACID compliance, strong data integrity, and excellent performance for complex joins required during song retrieval.
Trade-off: Schema migrations are more rigid compared to NoSQL document stores (like MongoDB), requiring careful upfront data modeling.

### 3.3 Frontend: JSP and Vanilla JavaScript
Decision: Server-side rendering with JSP, enhanced by Vanilla JS, instead of a SPA framework like React or Angular.
Reasoning: Search Engine Optimization (SEO) and initial load times are critical. Server-side rendering guarantees that the song content is immediately available in the initial HTML payload. Vanilla JS was chosen for the rendering engine to avoid the overhead of a Virtual DOM when manipulating hundreds of precise pixel alignments for chords.
Trade-off: State management on the client side is more complex without a framework's reactivity system.

### 3.4 Parsing Strategy: Regex Tokenization
Decision: Parsing the `[C]` format using Regular Expressions rather than a formal Abstract Syntax Tree (AST) parser.
Reasoning: The grammar of the chord format is relatively simple. Regex provides a high-speed, lightweight mechanism for extracting chord tokens and calculating their relative indices during the database import phase.
Trade-off: Regex can become difficult to maintain if the chord syntax grammar expands significantly in the future.

## 3.7 Conclusion of Research
The research phase clearly demonstrated that while digital sheet music is widespread, existing solutions force users to choose between cross-platform accessibility (Ultimate Guitar) and robust formatting/transposition (OnSong). Furthermore, neither paradigm adequately supports complex multi-lingual environments.

The proposed Worship Song Library addresses these gaps directly. By abandoning text-based visual formatting in favor of a mathematically anchored, relationally stored data model, the system achieves the robustness of premium native applications while maintaining the accessibility and flexibility of an open web platform. This system is not merely a digital songbook; it is a structured musical database engine designed to eliminate the technical friction of live musical performance.

The findings from this literature review directly informed the subsequent problem analysis. As discussed in the next chapter, the limitations of existing systemsâ€”specifically visual-bound alignment and unstructured storageâ€”are mathematically deconstructed to justify the technical architecture of the Worship Song Library.

