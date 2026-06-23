package com.worship.model;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents a single candidate chord sheet fetched from the internet.
 * Used by CandidateFilter to score and select the best source.
 */
public class CandidateResult {

    private String sourceUrl;
    private String rawText;
    private String extractedTitle;
    private double selectionScore;
    private String rejectionReason;
    private Map<String, Double> scoreBreakdown;

    public CandidateResult() {
        this.scoreBreakdown = new HashMap<>();
    }

    public CandidateResult(String sourceUrl, String rawText) {
        this();
        this.sourceUrl = sourceUrl;
        this.rawText = rawText;
    }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getExtractedTitle() { return extractedTitle; }
    public void setExtractedTitle(String extractedTitle) { this.extractedTitle = extractedTitle; }

    public double getSelectionScore() { return selectionScore; }
    public void setSelectionScore(double selectionScore) { this.selectionScore = selectionScore; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Map<String, Double> getScoreBreakdown() { return scoreBreakdown; }
    public void setScoreBreakdown(Map<String, Double> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

    public boolean isAccepted() { return selectionScore >= 0.50; }
    public boolean isHighConfidence() { return selectionScore >= 0.70; }
}
