package com.worship.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Leaflet model representing a printable song leaflet for an occasion.
 * Contains header data as JSON string for occasion-specific fields.
 */
public class Leaflet {

    private int id;
    private int userId;
    private int occasionId;
    private String occasionName;
    private String title;
    private String headerData; // JSON string with occasion-specific fields
    private String printType; // lyrics_only, chords, both
    private Timestamp createdAt;
    private List<LeafletSong> songs;

    public Leaflet() {
        this.printType = "both";
        this.songs = new ArrayList<>();
    }

    // Getters and Setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getOccasionId() { return occasionId; }
    public void setOccasionId(int occasionId) { this.occasionId = occasionId; }

    public String getOccasionName() { return occasionName; }
    public void setOccasionName(String occasionName) { this.occasionName = occasionName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getHeaderData() { return headerData; }
    public void setHeaderData(String headerData) { this.headerData = headerData; }

    public String getPrintType() { return printType; }
    public void setPrintType(String printType) { this.printType = printType; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<LeafletSong> getSongs() { return songs; }
    public void setSongs(List<LeafletSong> songs) { this.songs = songs; }
}
