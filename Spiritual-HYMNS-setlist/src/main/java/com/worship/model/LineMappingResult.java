package com.worship.model;

/**
 * Per-line result from the chord alignment pipeline.
 * Contains the mapped chord positions, confidence score, and any flags.
 */
public class LineMappingResult {

    private int lineId;
    private String dbText;
    private java.util.List<ChordOccurrence> chordPositions;
    private double confidence;
    private java.util.Set<String> flags;

    public LineMappingResult() {
        this.chordPositions = new java.util.ArrayList<>();
        this.flags = new java.util.LinkedHashSet<>();
    }

    public LineMappingResult(int lineId, String dbText) {
        this();
        this.lineId = lineId;
        this.dbText = dbText;
    }

    public int getLineId() { return lineId; }
    public void setLineId(int lineId) { this.lineId = lineId; }

    public String getDbText() { return dbText; }
    public void setDbText(String dbText) { this.dbText = dbText; }

    public java.util.List<ChordOccurrence> getChordPositions() { return chordPositions; }
    public void setChordPositions(java.util.List<ChordOccurrence> chordPositions) { this.chordPositions = chordPositions; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public java.util.Set<String> getFlags() { return flags; }
    public void addFlag(String flag) { this.flags.add(flag); }
    public boolean hasFlag(String flag) { return this.flags.contains(flag); }

    public boolean isAccepted() { return confidence >= 0.50; }
    public boolean isAutoAccepted() { return confidence >= 0.75; }
}
