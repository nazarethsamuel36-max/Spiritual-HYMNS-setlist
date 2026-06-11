package com.worship.util;

import com.worship.model.StructuredLine;
import com.worship.model.ChordOccurrence;
import java.util.List;

public class ChordParserDiagnostic {
    public static void main(String[] args) {
        String sampleLine = "[G]Amazing [D]grace [Em]how sweet the [C]sound";
        StructuredLine parsed = ChordParser.parseStructuredLine(sampleLine);
        
        System.out.println("RAW LINE: " + sampleLine);
        System.out.println("PARSED LYRICS: '" + parsed.getLyrics() + "'");
        System.out.println("PARSED CHORDS:");
        for (ChordOccurrence occ : parsed.getChords()) {
            System.out.println(" - " + occ.getChord() + " at position " + occ.getPosition());
        }
    }
}
