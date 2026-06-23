package com.worship.model;

import java.sql.Timestamp;
import java.util.List;

public class Setlist {
    private int id;
    private int userId;
    private String title;
    private String occasion;
    private String shareToken;
    private boolean isShared;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Aggregation of mapped songs
    private List<SetlistSong> songs;
    
    // Total count for list views
    private int songCount;

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOccasion() { return occasion; }
    public void setOccasion(String occasion) { this.occasion = occasion; }

    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }

    public boolean isShared() { return isShared; }
    public void setShared(boolean isShared) { this.isShared = isShared; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public List<SetlistSong> getSongs() { return songs; }
    public void setSongs(List<SetlistSong> songs) { this.songs = songs; }

    public int getSongCount() { return songCount; }
    public void setSongCount(int songCount) { this.songCount = songCount; }
}
