package com.worship.model;

public class SetlistSong {
    private int id;
    private int setlistId;
    private int songId;
    
    // Basic representation fields joined from the 'songs' outer table
    private String songTitle;
    private String songArtist;
    private String lyricsChords; // Storage for the transposed bracketed chord formatting
    
    private int position;
    private String creatorKey;
    private int creatorCapo;
    private int transpositionOffset; // Bug #8 fix: Dedicated field for UI transposition math

    // Additional original key for mathematical diffing
    private String originalKey;

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSetlistId() { return setlistId; }
    public void setSetlistId(int setlistId) { this.setlistId = setlistId; }

    public int getSongId() { return songId; }
    public void setSongId(int songId) { this.songId = songId; }

    public String getSongTitle() { return songTitle; }
    public void setSongTitle(String songTitle) { this.songTitle = songTitle; }

    public String getSongArtist() { return songArtist; }
    public void setSongArtist(String songArtist) { this.songArtist = songArtist; }

    public String getLyricsChords() { return lyricsChords; }
    public void setLyricsChords(String lyricsChords) { this.lyricsChords = lyricsChords; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public String getCreatorKey() { return creatorKey; }
    public void setCreatorKey(String creatorKey) { this.creatorKey = creatorKey; }

    public int getCreatorCapo() { return creatorCapo; }
    public void setCreatorCapo(int creatorCapo) { this.creatorCapo = creatorCapo; }

    public String getOriginalKey() { return originalKey; }
    public void setOriginalKey(String originalKey) { this.originalKey = originalKey; }

    public int getTranspositionOffset() { return transpositionOffset; }
    public void setTranspositionOffset(int transpositionOffset) { this.transpositionOffset = transpositionOffset; }
}
