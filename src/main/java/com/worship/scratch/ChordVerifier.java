package com.worship.scratch;

import com.worship.util.ChordParser;
import com.worship.model.StructuredLine;
import com.worship.model.ChordOccurrence;
import java.util.List;

public class ChordVerifier {
    public static void main(String[] args) {
        String[] songs = {
            "{Verse 1}\n[G]Amazing grace how [C]sweet the [G]sound\nThat [G]saved a [Em]wretch like [D]me\nI [G]once was lost but [C]now am [G]found\nWas [G]blind but [D]now I [G]see",
            "{Chorus}\nThen [G]sings my soul my [C]Saviour God to [G]Thee\nHow [Am]great Thou [D7]art how [G]great Thou art"
        };

        for (String songText : songs) {
            System.out.println("--- Parsing Song Snippet ---");
            List<StructuredLine> lines = ChordParser.parseStructuredSong(songText);
            for (StructuredLine line : lines) {
                System.out.println("Lyrics: [" + line.getLyrics() + "]");
                for (ChordOccurrence co : line.getChords()) {
                    System.out.println("  Chord: [" + co.getChord() + "] at Position: " + co.getPosition());
                }
            }
        }
    }
}
