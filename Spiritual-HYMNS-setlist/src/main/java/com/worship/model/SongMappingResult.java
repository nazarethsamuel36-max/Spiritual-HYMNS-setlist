package com.worship.model;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Full song result from the chord alignment pipeline.
 * Contains per-line results and global flags.
 */
public class SongMappingResult {

    private int songId;
    private List<LineMappingResult> lineResults;
    private Set<String> globalFlags;
    private double overallConfidence;
    private String sourceInfo; // "manual" or candidate description (not stored in DB)

    public SongMappingResult() {
        this.lineResults = new ArrayList<>();
        this.globalFlags = new LinkedHashSet<>();
    }

    public SongMappingResult(int songId) {
        this();
        this.songId = songId;
    }

    public int getSongId() { return songId; }
    public void setSongId(int songId) { this.songId = songId; }

    public List<LineMappingResult> getLineResults() { return lineResults; }
    public void addLineResult(LineMappingResult result) { this.lineResults.add(result); }

    public Set<String> getGlobalFlags() { return globalFlags; }
    public void addGlobalFlag(String flag) { this.globalFlags.add(flag); }
    public boolean hasGlobalFlag(String flag) { return this.globalFlags.contains(flag); }

    public String getSourceInfo() { return sourceInfo; }
    public void setSourceInfo(String sourceInfo) { this.sourceInfo = sourceInfo; }

    public double getOverallConfidence() { return overallConfidence; }

    /**
     * Computes overall confidence as the average of all accepted line confidences.
     */
    public void computeOverallConfidence() {
        if (lineResults.isEmpty()) {
            this.overallConfidence = 0.0;
            return;
        }
        double sum = 0;
        int count = 0;
        for (LineMappingResult lr : lineResults) {
            if (lr.isAccepted()) {
                sum += lr.getConfidence();
                count++;
            }
        }
        this.overallConfidence = count > 0 ? sum / count : 0.0;
    }

    public int getAcceptedCount() {
        return (int) lineResults.stream().filter(LineMappingResult::isAccepted).count();
    }

    public int getRejectedCount() {
        return (int) lineResults.stream().filter(lr -> !lr.isAccepted()).count();
    }
}
