package com.worship.scratch;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility to extract plain lyrics and chord positions from embedded chord format.
 * 
 * Input format: "[G]Pyara sanga[C]than [G]pyara sanga[D]than"
 * Output: 
 *   - Plain lyrics: "Pyara sangathan pyara sangathan"
 *   - Chord positions: List of {chord: "G", position: 0}, {chord: "C", position: 11}, etc.
 */
public class ChordLyricsExtractor {
    
    // Pattern to match chord markers like [G], [Am], [F#m7], etc.
    private static final Pattern CHORD_PATTERN = Pattern.compile("\\[([A-G][#b]?m?(?:7|9|11|13|dim|aug|sus|add)?[A-G]?)\\]");
    
    /**
     * Extract plain lyrics by removing all chord markers from embedded text.
     * 
     * @param embeddedText Text with embedded chords like "[G]Pyara sanga[C]than"
     * @return Plain lyrics without chord markers
     */
    public static String extractPlainLyrics(String embeddedText) {
        if (embeddedText == null || embeddedText.isEmpty()) {
            return "";
        }
        
        // Remove all chord markers
        return CHORD_PATTERN.matcher(embeddedText).replaceAll("");
    }
    
    /**
     * Extract chord positions from embedded text.
     * Returns a list of chord occurrences with their character positions in the plain text.
     * 
     * @param embeddedText Text with embedded chords like "[G]Pyara sanga[C]than"
     * @return List of ChordPosition objects
     */
    public static List<ChordPosition> extractChordPositions(String embeddedText) {
        List<ChordPosition> positions = new ArrayList<>();
        if (embeddedText == null || embeddedText.isEmpty()) {
            return positions;
        }
        
        Matcher matcher = CHORD_PATTERN.matcher(embeddedText);
        int plainTextPosition = 0;
        int lastEnd = 0;
        
        while (matcher.find()) {
            String chord = matcher.group(1);
            int chordStart = matcher.start();
            int chordEnd = matcher.end();
            
            // Calculate position in plain text (text before this chord marker)
            String textBefore = embeddedText.substring(lastEnd, chordStart);
            // Remove any chord markers from the text before to get accurate position
            String plainTextBefore = CHORD_PATTERN.matcher(textBefore).replaceAll("");
            plainTextPosition = plainTextBefore.length();
            
            positions.add(new ChordPosition(chord, plainTextPosition));
            lastEnd = chordEnd;
        }
        
        return positions;
    }
    
    /**
     * Extract both plain lyrics and chord positions in one pass.
     * 
     * @param embeddedText Text with embedded chords
     * @return ExtractionResult containing both plain lyrics and chord positions
     */
    public static ExtractionResult extractAll(String embeddedText) {
        String plainLyrics = extractPlainLyrics(embeddedText);
        List<ChordPosition> chordPositions = extractChordPositions(embeddedText);
        return new ExtractionResult(plainLyrics, chordPositions);
    }
    
    /**
     * Reconstruct embedded text from plain lyrics and chord positions.
     * Useful for validation or round-trip conversion.
     * 
     * @param plainLyrics Plain lyrics without chords
     * @param chordPositions List of chord positions
     * @return Reconstructed embedded text
     */
    public static String reconstructEmbeddedText(String plainLyrics, List<ChordPosition> chordPositions) {
        if (plainLyrics == null || plainLyrics.isEmpty()) {
            return "";
        }
        
        StringBuilder result = new StringBuilder();
        int lastPosition = 0;
        
        for (ChordPosition cp : chordPositions) {
            int position = cp.getPosition();
            if (position > lastPosition && position <= plainLyrics.length()) {
                // Add text before this chord
                result.append(plainLyrics.substring(lastPosition, position));
                // Add chord marker
                result.append("[").append(cp.getChord()).append("]");
                lastPosition = position;
            }
        }
        
        // Add remaining text
        if (lastPosition < plainLyrics.length()) {
            result.append(plainLyrics.substring(lastPosition));
        }
        
        return result.toString();
    }
    
    /**
     * Inner class to represent a chord position.
     */
    public static class ChordPosition {
        private final String chord;
        private final int position;
        
        public ChordPosition(String chord, int position) {
            this.chord = chord;
            this.position = position;
        }
        
        public String getChord() {
            return chord;
        }
        
        public int getPosition() {
            return position;
        }
        
        @Override
        public String toString() {
            return "{" + chord + " @ " + position + "}";
        }
    }
    
    /**
     * Result class containing both plain lyrics and chord positions.
     */
    public static class ExtractionResult {
        private final String plainLyrics;
        private final List<ChordPosition> chordPositions;
        
        public ExtractionResult(String plainLyrics, List<ChordPosition> chordPositions) {
            this.plainLyrics = plainLyrics;
            this.chordPositions = chordPositions;
        }
        
        public String getPlainLyrics() {
            return plainLyrics;
        }
        
        public List<ChordPosition> getChordPositions() {
            return chordPositions;
        }
    }
    
    /**
     * Test the extraction logic.
     */
    public static void main(String[] args) {
        System.out.println("=== Chord/Lyrics Extraction Test ===\n");
        
        // Test with Hindi song sample
        String hindiSample = "[G]Pyara sanga[C]than [G]pyara sanga[D]than\n[G]Jo mujhe is [C]dukh ki [G]duniya [D]se";
        
        System.out.println("Original embedded text:");
        System.out.println(hindiSample);
        System.out.println();
        
        ExtractionResult result = extractAll(hindiSample);
        
        System.out.println("Extracted plain lyrics:");
        System.out.println(result.getPlainLyrics());
        System.out.println();
        
        System.out.println("Extracted chord positions:");
        for (ChordPosition cp : result.getChordPositions()) {
            System.out.println(cp);
        }
        System.out.println();
        
        // Test reconstruction
        String reconstructed = reconstructEmbeddedText(result.getPlainLyrics(), result.getChordPositions());
        System.out.println("Reconstructed embedded text:");
        System.out.println(reconstructed);
        System.out.println();
        
        System.out.println("Match: " + reconstructed.equals(hindiSample));
    }
}
