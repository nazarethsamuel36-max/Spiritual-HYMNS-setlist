package com.worship.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SpellingCorrectnessTest {

    @Test
    void testLocalBiasAndAuto() {
        // G#m + 2 -> A#m (Manual test indicates +2 is needed for A#m result)
        // G# (8) + 2 = 10 (A#). Ambiguous. Original # -> A#
        assertEquals("A#m", ChordTransposer.transposeChord("G#m", 2, ChordTransposer.EnharmonicPref.AUTO, false));
        
        // C# + 2 -> D# (Local bias sharp)
        assertEquals("D#", ChordTransposer.transposeChord("C#", 2, ChordTransposer.EnharmonicPref.AUTO, false));
        
        // Db + 2 -> Eb (Local bias flat)
        assertEquals("Eb", ChordTransposer.transposeChord("Db", 2, ChordTransposer.EnharmonicPref.AUTO, false));
    }

    @Test
    void testIdentityAndNaturals() {
        // E# + 0 -> E# (Identity protection)
        assertEquals("E#", ChordTransposer.transposeChord("E#", 0));
        
        // B# - 1 -> B (Natural note shortcut)
        assertEquals("B", ChordTransposer.transposeChord("B#", -1));
        
        // G#m + 1 -> Am (Natural note shortcut)
        assertEquals("Am", ChordTransposer.transposeChord("G#m", 1));
    }

    @Test
    void testMixedSongHandling() {
        String song = "[C#] [Bb]";
        // Shift + 2:
        // C# (index 1) + 2 = index 3. Ambiguous. Original # -> D#
        // Bb (index 10) + 2 = index 0. Natural -> C
        // Result: [D#] [C]
        assertEquals("[D#] [C]", ChordTransposer.transposeSong(song, 2));
    }

    @Test
    void testExplicitOverrides() {
        // Force Sharp
        assertEquals("C#", ChordTransposer.transposeChord("C", 1, ChordTransposer.EnharmonicPref.FORCE_SHARP, false));
        
        // Force Flat
        assertEquals("Db", ChordTransposer.transposeChord("C", 1, ChordTransposer.EnharmonicPref.FORCE_FLAT, false));
        
        // Preserve Input Style
        assertEquals("Eb", ChordTransposer.transposeChord("Db", 2, ChordTransposer.EnharmonicPref.PRESERVE_INPUT_STYLE, false));
    }

    @Test
    void testNaturalToSharp() {
        // F + 1 -> F# (Natural to sharp allowed via AUTO ascending bias)
        assertEquals("F#", ChordTransposer.transposeChord("F", 1));
        
        // C + 1 -> C# (Ascending preference for index 1)
        assertEquals("C#", ChordTransposer.transposeChord("C", 1));
    }

    @Test
    void testDirectionalBias() {
        // D - 1 (Descending) -> Db (Flat scale index 1)
        assertEquals("Db", ChordTransposer.transposeChord("D", -1));
        
        // G - 1 (Descending) -> Gb (Flat scale index 6)
        assertEquals("Gb", ChordTransposer.transposeChord("G", -1));
        
        // G + 1 (Ascending) -> G# (Sharp scale index 8)
        assertEquals("G#", ChordTransposer.transposeChord("G", 1));
    }

    @Test
    void testOptionalSlashCleanup() {
        // C/C shift 2 with cleaning
        assertEquals("D", ChordTransposer.transposeChord("C/C", 2, ChordTransposer.EnharmonicPref.AUTO, true));
        
        // C/C shift 2 without cleaning (forced preservation)
        assertEquals("D/D", ChordTransposer.transposeChord("C/C", 2, ChordTransposer.EnharmonicPref.AUTO, false));
    }
}
