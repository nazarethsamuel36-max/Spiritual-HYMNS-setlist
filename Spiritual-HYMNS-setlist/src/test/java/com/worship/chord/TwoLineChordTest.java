package com.worship.chord;

import com.worship.model.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TwoLineChordTest {

    private ChordAligner aligner;

    @BeforeEach
    void setUp() {
        aligner = new ChordAligner();
    }

    @Test
    void testParseExternal_twoLineFormat() {
        String ext = "[Verse 1]\n" +
                     "C           G\n" +
                     "Worship the Lord\n" +
                     "F           C\n" +
                     "In His holiness";
        
        List<ChordAligner.ExtSection> sections = aligner.parseExternal(ext);

        assertEquals(1, sections.size());
        assertEquals("verse", sections.get(0).type);
        assertEquals(2, sections.get(0).lines.size());

        StructuredLine line1 = sections.get(0).lines.get(0);
        assertEquals("Worship the Lord", line1.getLyrics());
        assertEquals(2, line1.getChords().size());
        assertEquals("C", line1.getChords().get(0).getChord());
        assertEquals(0, line1.getChords().get(0).getPosition());
        assertEquals("G", line1.getChords().get(1).getChord());
        assertEquals(12, line1.getChords().get(1).getPosition());

        StructuredLine line2 = sections.get(0).lines.get(1);
        assertEquals("In His holiness", line2.getLyrics());
        assertEquals(2, line2.getChords().size());
        assertEquals("F", line2.getChords().get(0).getChord());
        assertEquals(0, line2.getChords().get(0).getPosition());
        assertEquals("C", line2.getChords().get(1).getChord());
        assertEquals(12, line2.getChords().get(1).getPosition());
    }

    @Test
    void testParseExternal_mixedFormat() {
        String ext = "[Verse 1]\n" +
                     "C           G\n" +
                     "Worship the Lord\n" +
                     "[F]In His [C]holiness";
        
        List<ChordAligner.ExtSection> sections = aligner.parseExternal(ext);

        assertEquals(1, sections.size());
        assertEquals(2, sections.get(0).lines.size());

        StructuredLine line1 = sections.get(0).lines.get(0);
        assertEquals("Worship the Lord", line1.getLyrics());
        assertEquals(2, line1.getChords().size());

        StructuredLine line2 = sections.get(0).lines.get(1);
        assertEquals("In His holiness", line2.getLyrics());
        assertEquals(2, line2.getChords().size());
    }
}
