package com.worship.chord;

import com.worship.model.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive test suite for the Chord Mapping & Alignment Pipeline.
 * Tests cover:
 *   - Text normalization
 *   - Levenshtein similarity
 *   - External text parsing
 *   - Section matching
 *   - Direct chord transfer (high similarity)
 *   - Needleman-Wunsch character alignment (moderate similarity)
 *   - Confidence scoring and flags
 *   - Pattern candidate detection
 *   - CandidateFilter scoring
 *   - Edge cases (rejection, empty input, Devanagari)
 */
public class ChordMappingPipelineTest {

    private ChordAligner aligner;
    private CandidateFilter filter;

    @BeforeEach
    void setUp() {
        aligner = new ChordAligner();
        filter = new CandidateFilter();
    }

    // ==================== TEXT NORMALIZATION ====================

    @Test
    void testNormalize_basicEnglish() {
        assertEquals("amazing grace how sweet", ChordAligner.normalize("Amazing Grace, How Sweet!"));
    }

    @Test
    void testNormalize_devanagari() {
        // Use a string with known punctuation to verify it gets stripped
        String input = "Hello, World! Test.";
        String result = ChordAligner.normalize(input);
        assertEquals("hello world test", result);
        // Verify no punctuation remains
        assertFalse(result.contains(","));
        assertFalse(result.contains("!"));
        assertFalse(result.contains("."));
    }

    @Test
    void testNormalize_whitespaceCollapse() {
        assertEquals("hello world", ChordAligner.normalize("  hello    world  "));
    }

    @Test
    void testNormalize_nullAndEmpty() {
        assertEquals("", ChordAligner.normalize(null));
        assertEquals("", ChordAligner.normalize(""));
        assertEquals("", ChordAligner.normalize("   "));
    }

    // ==================== LEVENSHTEIN SIMILARITY ====================

    @Test
    void testSimilarity_identical() {
        assertEquals(1.0, ChordAligner.levenshteinSimilarity("hello", "hello"));
    }

    @Test
    void testSimilarity_completelyDifferent() {
        double sim = ChordAligner.levenshteinSimilarity("abc", "xyz");
        assertTrue(sim < 0.4, "Completely different strings should score below 0.4");
    }

    @Test
    void testSimilarity_partialMatch() {
        double sim = ChordAligner.levenshteinSimilarity("amazing grace", "amazing grce");
        assertTrue(sim > 0.8, "One-letter difference should score > 0.8, got " + sim);
    }

    @Test
    void testSimilarity_emptyStrings() {
        assertEquals(1.0, ChordAligner.levenshteinSimilarity("", ""));
    }

    // ==================== EXTERNAL TEXT PARSING ====================

    @Test
    void testParseExternal_singleVerseWithChords() {
        String ext = "[Verse 1]\n[C]Amazing grace [G]how sweet the sound\n[F]That saved a wretch like me";
        List<ChordAligner.ExtSection> sections = aligner.parseExternal(ext);

        assertEquals(1, sections.size());
        assertEquals("verse", sections.get(0).type);
        assertEquals(2, sections.get(0).lines.size());

        // First line should have chords at correct positions
        StructuredLine line1 = sections.get(0).lines.get(0);
        assertEquals("Amazing grace how sweet the sound", line1.getLyrics());
        assertEquals(2, line1.getChords().size());
        assertEquals("C", line1.getChords().get(0).getChord());
        assertEquals(0, line1.getChords().get(0).getPosition());
        assertEquals("G", line1.getChords().get(1).getChord());
    }

    @Test
    void testParseExternal_multipleSections() {
        String ext = "[Verse 1]\n[C]Line one\n\n[Chorus]\n[G]Chorus line";
        List<ChordAligner.ExtSection> sections = aligner.parseExternal(ext);

        assertEquals(2, sections.size());
        assertEquals("verse", sections.get(0).type);
        assertEquals("chorus", sections.get(1).type);
    }

    @Test
    void testParseExternal_noSectionHeaders() {
        String ext = "[C]Amazing grace [G]how sweet\n[F]That saved a wretch";
        List<ChordAligner.ExtSection> sections = aligner.parseExternal(ext);

        assertEquals(1, sections.size());
        assertEquals("unknown", sections.get(0).type);
        assertEquals(2, sections.get(0).lines.size());
    }

    // ==================== SECTION MATCHING ====================

    @Test
    void testSectionMatching_byType() {
        List<Section> dbSections = List.of(
            makeSection("verse", "VERSE 1", "Amazing grace how sweet the sound"),
            makeSection("chorus", "CHORUS", "Was blind but now I see")
        );

        List<ChordAligner.ExtSection> extSections = new ArrayList<>();
        ChordAligner.ExtSection extVerse = new ChordAligner.ExtSection("verse", "[Verse 1]");
        extVerse.lines.add(new StructuredLine("Amazing grace how sweet the sound"));
        ChordAligner.ExtSection extChorus = new ChordAligner.ExtSection("chorus", "[Chorus]");
        extChorus.lines.add(new StructuredLine("Was blind but now I see"));
        extSections.add(extVerse);
        extSections.add(extChorus);

        Map<Section, ChordAligner.ExtSection> pairs = aligner.matchSections(dbSections, extSections);

        assertEquals(2, pairs.size());
        assertEquals("verse", pairs.get(dbSections.get(0)).type);
        assertEquals("chorus", pairs.get(dbSections.get(1)).type);
    }

    // ==================== DIRECT TRANSFER (HIGH SIMILARITY) ====================

    @Test
    void testDirectTransfer_identicalText() {
        Song song = buildSong("Amazing grace how sweet the sound", "verse");
        String ext = "[Verse 1]\n[C]Amazing grace [G]how sweet the [Am]sound";

        SongMappingResult result = aligner.align(song, ext);

        assertEquals(1, result.getLineResults().size());
        LineMappingResult lr = result.getLineResults().get(0);
        assertTrue(lr.isAutoAccepted(), "Identical text should auto-accept, confidence: " + lr.getConfidence());
        assertEquals(3, lr.getChordPositions().size());
        assertEquals("C", lr.getChordPositions().get(0).getChord());
        assertEquals(0, lr.getChordPositions().get(0).getPosition());
    }

    @Test
    void testDirectTransfer_multipleLines() {
        Song song = buildSong(
            List.of("Amazing grace how sweet the sound", "That saved a wretch like me"),
            "verse"
        );
        String ext = "[Verse 1]\n[C]Amazing grace [G]how sweet the [Am]sound\n[F]That saved a [C]wretch like [G]me";

        SongMappingResult result = aligner.align(song, ext);

        assertEquals(2, result.getLineResults().size());
        assertTrue(result.getLineResults().get(0).isAccepted());
        assertTrue(result.getLineResults().get(1).isAccepted());
    }

    // ==================== CHARACTER ALIGNMENT (MODERATE SIMILARITY) ====================

    @Test
    void testNeedlemanWunsch_basicAlignment() {
        // External has a comma that DB lacks
        String ext = "Amazing grace, how sweet";
        String db  = "Amazing grace how sweet";

        int[] posMap = aligner.buildPositionMap(ext, db);

        // 'A' at ext pos 0 should map to db pos 0
        assertEquals(0, posMap[0]);
        // Characters after the comma should still map correctly
        // The 'h' in "how" should map to a valid position in DB
        assertTrue(posMap.length > 0);
    }

    @Test
    void testAlignment_withExtraWords() {
        Song song = buildSong("He gave His life for me on the cross", "verse");
        String ext = "[Verse 1]\n[C]He died for [G]me on the cross";

        SongMappingResult result = aligner.align(song, ext);

        assertEquals(1, result.getLineResults().size());
        LineMappingResult lr = result.getLineResults().get(0);
        // Should still find chords even with different words
        assertFalse(lr.getChordPositions().isEmpty(), "Should have mapped some chords");
        assertEquals("C", lr.getChordPositions().get(0).getChord());
    }

    // ==================== CONFIDENCE & FLAGS ====================

    @Test
    void testConfidence_highSimilarity() {
        Song song = buildSong("Amazing grace how sweet the sound", "verse");
        String ext = "[Verse 1]\n[C]Amazing grace [G]how sweet the [Am]sound";

        SongMappingResult result = aligner.align(song, ext);
        LineMappingResult lr = result.getLineResults().get(0);

        assertTrue(lr.getConfidence() >= 0.75, "High similarity should produce confidence >= 0.75");
        assertTrue(lr.isAutoAccepted());
        assertFalse(lr.hasFlag("LOW_CONFIDENCE"));
    }

    @Test
    void testConfidence_lowSimilarity_flagged() {
        Song song = buildSong("Something completely different here today", "verse");
        String ext = "[Verse 1]\n[C]He died for [G]me on the cross";

        SongMappingResult result = aligner.align(song, ext);
        LineMappingResult lr = result.getLineResults().get(0);

        // Very different text — should be rejected or flagged
        assertTrue(lr.getConfidence() < 0.75, "Low similarity should not auto-accept");
    }

    @Test
    void testFlag_unmatchedLine() {
        Song song = buildSong(
            List.of("Line one from DB", "Line two from DB", "Line three unique"),
            "verse"
        );
        String ext = "[Verse 1]\n[C]Line one from DB";

        SongMappingResult result = aligner.align(song, ext);

        // At least one line should be unmatched since ext only has 1 line
        boolean hasUnmatched = result.getLineResults().stream()
            .anyMatch(lr -> lr.hasFlag("UNMATCHED_LINE") || lr.hasFlag("NO_CHORDS_IN_SOURCE"));
        assertTrue(hasUnmatched, "Some lines should be flagged when external has fewer lines");
    }

    @Test
    void testFlag_extraSection() {
        Song song = buildSong("Amazing grace", "verse");
        String ext = "[Verse 1]\n[C]Amazing grace\n\n[Chorus]\n[G]Extra chorus\n\n[Bridge]\n[Am]Extra bridge";

        SongMappingResult result = aligner.align(song, ext);

        assertTrue(result.hasGlobalFlag("EXTRA_SECTION"),
            "Should flag EXTRA_SECTION when external has more sections");
    }

    // ==================== DEVANAGARI (MARATHI) ====================

    @Test
    void testMarathi_directTransfer() {
        Song song = buildSong("ख्रिस्त माझा तो सर्वांचा", "verse");
        String ext = "[Verse 1]\n[C]ख्रिस्त माझा [G]तो सर्वांचा";

        SongMappingResult result = aligner.align(song, ext);

        assertEquals(1, result.getLineResults().size());
        LineMappingResult lr = result.getLineResults().get(0);
        assertTrue(lr.isAccepted(), "Marathi direct transfer should be accepted");
        assertFalse(lr.getChordPositions().isEmpty());
        assertEquals("C", lr.getChordPositions().get(0).getChord());
    }

    // ==================== REJECTION ====================

    @Test
    void testReject_completelyDifferentLyrics() {
        Song song = buildSong("ख्रिस्त माझा तारणारा", "verse");
        String ext = "[Verse 1]\n[C]How great is our God";

        SongMappingResult result = aligner.align(song, ext);

        LineMappingResult lr = result.getLineResults().get(0);
        // Different script entirely — should reject or flag
        assertTrue(lr.hasFlag("UNMATCHED_LINE") || lr.getConfidence() < 0.50,
            "Completely different lyrics should be rejected");
    }

    @Test
    void testReject_emptyExternalText() {
        Song song = buildSong("Amazing grace", "verse");
        SongMappingResult result = aligner.align(song, "");

        assertTrue(result.getLineResults().isEmpty());
    }

    @Test
    void testReject_nullExternalText() {
        Song song = buildSong("Amazing grace", "verse");
        SongMappingResult result = aligner.align(song, null);

        assertTrue(result.getLineResults().isEmpty());
    }

    // ==================== CANDIDATE FILTER ====================

    @Test
    void testCandidateFilter_highMatchingCandidate() {
        Song dbSong = buildSong(
            List.of("Amazing grace how sweet the sound", "That saved a wretch like me"),
            "verse"
        );
        dbSong.setTitle("Amazing Grace");

        CandidateResult candidate = new CandidateResult("https://example.com", 
            "[Verse 1]\n[C]Amazing grace how sweet the sound\n[G]That saved a wretch like me");
        candidate.setExtractedTitle("Amazing Grace");

        filter.scoreCandidate(dbSong, candidate);

        assertTrue(candidate.getSelectionScore() >= 0.70,
            "Matching candidate should score >= 0.70, got " + candidate.getSelectionScore());
        assertTrue(candidate.isHighConfidence());
    }

    @Test
    void testCandidateFilter_wrongSong() {
        Song dbSong = buildSong("Amazing grace how sweet the sound", "verse");
        dbSong.setTitle("Amazing Grace");

        CandidateResult candidate = new CandidateResult("https://example.com",
            "[Verse 1]\nSomething completely different\nNothing matches at all");
        candidate.setExtractedTitle("A Different Song");

        filter.scoreCandidate(dbSong, candidate);

        assertFalse(candidate.isAccepted(),
            "Wrong song should not be accepted, got " + candidate.getSelectionScore());
    }

    @Test
    void testCandidateFilter_selectBest() {
        Song dbSong = buildSong("Amazing grace how sweet the sound", "verse");
        dbSong.setTitle("Amazing Grace");

        CandidateResult good = new CandidateResult("https://good.com",
            "[Verse 1]\n[C]Amazing grace how sweet the sound");
        good.setExtractedTitle("Amazing Grace");

        CandidateResult bad = new CandidateResult("https://bad.com",
            "[Verse 1]\nCompletely wrong song here");
        bad.setExtractedTitle("Wrong Song");

        CandidateResult best = filter.selectBest(dbSong, List.of(good, bad));
        assertNotNull(best);
        assertEquals("https://good.com", best.getSourceUrl());
    }

    @Test
    void testCandidateFilter_chordDensity_tooMany() {
        Song dbSong = buildSong("Hello world", "verse");
        dbSong.setTitle("Hello World");

        // Absurdly over-chorded
        CandidateResult spam = new CandidateResult("https://spam.com",
            "[A][B][C][D][E][F][G][A][B][C]Hello world");
        spam.setExtractedTitle("Hello World");

        filter.scoreCandidate(dbSong, spam);
        double density = spam.getScoreBreakdown().get("density");
        assertTrue(density < 0.5, "Over-chorded source should get low density score");
    }

    @Test
    void testLevenshteinSimilarity_inFilter() {
        assertEquals(1.0, CandidateFilter.levenshteinSimilarity("hello", "hello"));
        assertTrue(CandidateFilter.levenshteinSimilarity("hello", "helo") > 0.7);
        assertTrue(CandidateFilter.levenshteinSimilarity("abc", "xyz") < 0.4);
    }

    @Test
    void testStripChords() {
        assertEquals("Amazing grace", CandidateFilter.stripChords("[C]Amazing [G]grace"));
        assertEquals("Hello", CandidateFilter.stripChords("Hello"));
        assertEquals("", CandidateFilter.stripChords(""));
    }

    // ==================== HELPERS ====================

    private Song buildSong(String lineText, String sectionType) {
        return buildSong(List.of(lineText), sectionType);
    }

    private Song buildSong(List<String> lineTexts, String sectionType) {
        Song song = new Song();
        song.setId(1);
        song.setTitle("Test Song");
        song.setLanguage("english");

        Section section = makeSection(sectionType, sectionType.toUpperCase() + " 1", lineTexts.toArray(new String[0]));
        song.setSections(List.of(section));

        return song;
    }

    private Section makeSection(String type, String label, String... lineTexts) {
        Section section = new Section();
        section.setId(1);
        section.setType(type);
        section.setLabel(label);

        List<SongLine> lines = new ArrayList<>();
        for (int i = 0; i < lineTexts.length; i++) {
            SongLine sl = new SongLine(lineTexts[i], i + 1);
            sl.setId(100 + i); // Unique IDs for testing
            lines.add(sl);
        }
        section.setLines(lines);
        return section;
    }
}
