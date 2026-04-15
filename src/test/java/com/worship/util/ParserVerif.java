package com.worship.util;

import com.worship.model.ChordOccurrence;
import com.worship.model.StructuredLine;
import com.worship.util.ChordParser;
import java.util.List;

/**
 * Verification script for the Position-Based Chord Parser.
 */
public class ParserVerif {
    public static void main(String[] args) {
        test("[C]Word", 0, "Word");
        test("Word [G]", 5, "Word ");
        test("A[Am]mazing", 1, "Amazing");
        test("[C][G]Word", 0, "Word");
        test("[C][G]", 0, "");
    }

    private static void test(String input, int expectedPos, String expectedLyrics) {
        StructuredLine line = ChordParser.parseStructuredLine(input);
        System.out.println("Input: " + input);
        System.out.println("Lyrics: '" + line.getLyrics() + "' (Expected: '" + expectedLyrics + "')");
        for (ChordOccurrence occ : line.getChords()) {
            System.out.println("Chord: " + occ.getChord() + " at Pos: " + occ.getPosition());
        }
        System.out.println("---");
    }
}
