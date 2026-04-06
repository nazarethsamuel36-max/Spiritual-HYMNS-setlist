package com.worship.model;

import java.sql.Timestamp;

/**
 * UserSong model representing a personal user version of a song.
 * Stored in user_songs table — never modifies the master songs table.
 */
public class UserSong {

    private int id;
    private int userId;
    private int songId;
    private String customKey;
    private String customChords;
    private String customLyrics;
    private String customNotes;
    private String personalNote;
    private Timestamp updatedAt;

    // Denormalized fields for display
    private String songTitle;

    public UserSong() {}

    // Getters and Setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getSongId() { return songId; }
    public void setSongId(int songId) { this.songId = songId; }

    public String getCustomKey() { return customKey; }
    public void setCustomKey(String customKey) { this.customKey = customKey; }

    public String getCustomChords() { return customChords; }
    public void setCustomChords(String customChords) { this.customChords = customChords; }

    public String getCustomLyrics() { return customLyrics; }
    public void setCustomLyrics(String customLyrics) { this.customLyrics = customLyrics; }

    public String getCustomNotes() { return customNotes; }
    public void setCustomNotes(String customNotes) { this.customNotes = customNotes; }

    public String getPersonalNote() { return personalNote; }
    public void setPersonalNote(String personalNote) { this.personalNote = personalNote; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getSongTitle() { return songTitle; }
    public void setSongTitle(String songTitle) { this.songTitle = songTitle; }
}
