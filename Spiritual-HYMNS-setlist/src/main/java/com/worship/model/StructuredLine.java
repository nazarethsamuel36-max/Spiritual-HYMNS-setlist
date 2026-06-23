package com.worship.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single line of a song containing the lyrics and a list of chords
 * anchored at specific character positions.
 */
public class StructuredLine {
    private String lyrics;
    private List<ChordOccurrence> chords = new ArrayList<>();

    public StructuredLine() {}

    public StructuredLine(String lyrics) {
        this.lyrics = lyrics;
    }

    public String getLyrics() {
        return lyrics;
    }

    public void setLyrics(String lyrics) {
        this.lyrics = lyrics;
    }

    public List<ChordOccurrence> getChords() {
        return chords;
    }

    public void setChords(List<ChordOccurrence> chords) {
        this.chords = chords;
    }

    public void addChord(String chord, int position) {
        this.chords.add(new ChordOccurrence(chord, position));
    }
}
