package com.worship.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReferenceChordAlignmentRunnerTest {

    @Test
    void calculatesIntervalBetweenMajorKeys() {
        assertEquals(7, ReferenceChordAlignmentRunner.calculateSemitoneInterval("C", "G"));
    }

    @Test
    void calculatesIntervalBetweenRelativeMinorKeys() {
        assertEquals(7, ReferenceChordAlignmentRunner.calculateSemitoneInterval("Am", "Em"));
    }

    @Test
    void normalizesReferenceTitlesForMatching() {
        assertEquals("ITS A LOVELY LOVELY NAME", ReferenceChordAlignmentRunner.normalizeReferenceTitle("12. IT'S A LOVELY LOVELY NAME"));
    }

    @Test
    void detectsKeyFromReferenceChordText() {
        String chordText = "[F]Spirit of [Fmaj7]the [F7]liv[Gm]ing [F]God,\n"
                + "[F]Fall a[Bb]fresh [C7]on [F]me.";

        assertEquals("F", ReferenceChordAlignmentRunner.detectReferenceKey(chordText));
    }
}
