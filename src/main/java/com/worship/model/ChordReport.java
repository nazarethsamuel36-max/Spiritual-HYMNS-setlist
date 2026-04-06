package com.worship.model;

import java.sql.Timestamp;

/**
 * ChordReport model for tracking chord accuracy reports from users.
 * Reasons: wrong_chord, wrong_key, lyrics_mismatch, wrong_language, other.
 * Status: open, fixed, rejected.
 */
public class ChordReport {

    private int id;
    private int songId;
    private int userId;
    private String songTitle; // denormalized for display
    private String reporterUsername; // denormalized for display
    private String reason; // wrong_chord, wrong_key, lyrics_mismatch, wrong_language, other
    private String suggestion;
    private String status; // open, fixed, rejected
    private Timestamp createdAt;

    public ChordReport() {
        this.status = "open";
    }

    // Getters and Setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSongId() { return songId; }
    public void setSongId(int songId) { this.songId = songId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getSongTitle() { return songTitle; }
    public void setSongTitle(String songTitle) { this.songTitle = songTitle; }

    public String getReporterUsername() { return reporterUsername; }
    public void setReporterUsername(String reporterUsername) { this.reporterUsername = reporterUsername; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSuggestion() { return suggestion; }
    public void setSuggestion(String suggestion) { this.suggestion = suggestion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
