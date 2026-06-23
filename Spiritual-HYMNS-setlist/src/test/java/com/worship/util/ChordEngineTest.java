package com.worship.util;

import com.worship.model.ChordToken;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ChordEngineTest {

    @Test
    public void testComplexChordParsingAndTransposition() {
        // Cmaj7#11b9/Gb
        ChordToken t = ChordParser.parseChordToken("Cmaj7#11b9/Gb");
        assertTrue(t.isValid());
        assertEquals("C", t.getRoot());
        assertEquals("Gb", t.getBass());
        assertTrue(t.getExtensions().contains("maj7"));
        assertTrue(t.getAlterations().contains("#11"));
        assertTrue(t.getAlterations().contains("b9"));

        // Rebuild should be deterministic
        assertEquals("Cmaj7#11b9/Gb", ChordParser.rebuild(t));

        // Transpose +2
        assertEquals("Dmaj7#11b9/Ab", ChordTransposer.transposeChord("Cmaj7#11b9/Gb", 2));
    }

    @Test
    public void testSusNormalization() {
        // Gsus -> sus maps to sus4
        ChordToken t = ChordParser.parseChordToken("Gsus");
        assertTrue(t.isValid());
        assertEquals("sus4", t.getQuality());
        
        // Transpose +2
        assertEquals("Asus4", ChordTransposer.transposeChord("Gsus", 2));
    }

    @Test
    public void testAdd9Mapping() {
        // D2 -> 2 maps to add9
        ChordToken t = ChordParser.parseChordToken("D2");
        assertTrue(t.isValid());
        assertTrue(t.getAdditions().contains("add9"));
        
        // Transpose +2
        assertEquals("Eadd9", ChordTransposer.transposeChord("D2", 2));
    }

    @Test
    public void testParenthesesHandling() {
        // C(maj7#11)
        ChordToken t = ChordParser.parseChordToken("C(maj7#11)");
        assertTrue(t.isValid());
        assertTrue(t.getExtensions().contains("maj7"));
        assertTrue(t.getAlterations().contains("#11"));
        assertEquals("Cmaj7#11", ChordParser.rebuild(t));
    }

    @Test
    public void testFailureSafety() {
        // Cxyz -> invalid, return original
        ChordToken t = ChordParser.parseChordToken("Cxyz");
        assertFalse(t.isValid());
        assertEquals("Cxyz", ChordParser.rebuild(t));
        assertEquals("Cxyz", ChordTransposer.transposeChord("Cxyz", 2));
    }

    @Test
    public void testEnharmonicAuto() {
        // F# + 1 -> G
        assertEquals("G", ChordTransposer.transposeChord("F#", 1));
        // G + 1 -> G# (Ascending bias prefers sharp)
        assertEquals("G#", ChordTransposer.transposeChord("G", 1));
    }

    @Test
    public void testEdgeCases() {
        // 1. C7maj7 -> conflict resolution (maj7 wins)
        assertEquals("Cmaj7", ChordParser.rebuild(ChordParser.parseChordToken("C7maj7")));

        // 2. C(add9)add9 -> no duplication
        assertEquals("Cadd9", ChordParser.rebuild(ChordParser.parseChordToken("C(add9)add9")));

        // 3. C##7 -> invalid (double sharp root not supported)
        ChordToken t3 = ChordParser.parseChordToken("C##7");
        assertFalse(t3.isValid());
        assertEquals("C##7", ChordParser.rebuild(t3));

        // 4. Multiple slashes -> invalid
        ChordToken t4 = ChordParser.parseChordToken("Cmaj7/Gb/Ab");
        assertFalse(t4.isValid());
        assertEquals("Cmaj7/Gb/Ab", ChordParser.rebuild(t4));

        // 5. Cmmaj7 -> conflicting quality (per rulebook)
        // Note: Cm(maj7) is technically valid in music, but rulebook says treat as invalid
        ChordToken t5 = ChordParser.parseChordToken("Cmmaj7");
        // If the current implementation accepts it, this test will document current behavior 
        // until implementation is adjusted to match rulebook strictness.
        // Rulebook says: Return original.
        // Given "Do NOT modify implementation", we assert against requested behavior.
        assertFalse(t5.isValid(), "Cmmaj7 should be invalid per rulebook");

        // 6. Both alterations preserved (Sorted # before b)
        ChordToken t6 = ChordParser.parseChordToken("C(b9)(#9)");
        assertTrue(t6.isValid());
        assertEquals("C#9b9", ChordParser.rebuild(t6));

        // 7. Recursive parentheses normalization
        assertEquals("Cmaj7", ChordParser.rebuild(ChordParser.parseChordToken("C((((maj7))))")));

        // 8. Empty string -> invalid
        assertFalse(ChordParser.parseChordToken("").isValid());
        assertFalse(ChordParser.parseChordToken("   ").isValid());

        // 9. Single letter C -> valid
        ChordToken t9 = ChordParser.parseChordToken("C");
        assertTrue(t9.isValid());
        assertEquals("C", ChordParser.rebuild(t9));

        // 10. Lowercase normalization (Root and Modifiers)
        assertEquals("Cmaj7", ChordParser.rebuild(ChordParser.parseChordToken("cmaj7")));
        assertEquals("C#maj7#11", ChordParser.rebuild(ChordParser.parseChordToken("c#Maj7#11")));

        // 11. Multi-parentheses data preservation
        ChordToken t11 = ChordParser.parseChordToken("C(add9)(no3)");
        assertTrue(t11.isValid());
        assertEquals("Cadd9no3", ChordParser.rebuild(t11));

        // 12. Aggressive deduplication
        assertEquals("Cmaj7", ChordParser.rebuild(ChordParser.parseChordToken("Cmaj77")));
        assertEquals("Cmaj7", ChordParser.rebuild(ChordParser.parseChordToken("C(maj7)7")));

        // 13. Double uppercase root (Invalid)
        ChordToken t13 = ChordParser.parseChordToken("CCmaj7");
        assertFalse(t13.isValid());
        assertEquals("CCmaj7", ChordParser.rebuild(t13));
    }
}
