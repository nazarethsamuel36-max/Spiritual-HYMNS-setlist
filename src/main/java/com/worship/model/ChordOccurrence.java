package com.worship.model;

import java.util.Objects;

/**
 * Represents a chord and its character index position relative to a cleaned lyrics string.
 */
public class ChordOccurrence implements Comparable<ChordOccurrence> {
    private String chord;
    private int position;

    public ChordOccurrence() {}

    public ChordOccurrence(String chord, int position) {
        this.chord = chord;
        this.position = position;
    }

    public String getChord() {
        return chord;
    }

    public void setChord(String chord) {
        this.chord = chord;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    @Override
    public int compareTo(ChordOccurrence o) {
        // Primary sort by position ASC
        return Integer.compare(this.position, o.position);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChordOccurrence that = (ChordOccurrence) o;
        return position == that.position && Objects.equals(chord, that.chord);
    }

    @Override
    public int hashCode() {
        return Objects.hash(chord, position);
    }
}
