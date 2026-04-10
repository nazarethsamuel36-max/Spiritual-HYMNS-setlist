package com.worship.model;

/**
 * LeafletSong model representing a song entry within a leaflet.
 * Tracks position for drag-and-drop reordering and optional custom key.
 * Also carries denormalized song content (chords, lyrics) for print rendering.
 */
public class LeafletSong {

    private int id;
    private int leafletId;
    private Integer songId;   // Changed to Integer because headers don't have song IDs
    private String songTitle;
    private String songArtist;
    private String songChords;       // full bracket-format chord string
    private String songLyrics;       // plain lyrics (no chords)
    private String songOriginalKey;  // master key
    private int position;
    private String customKey;        // leaflet-specific key override
    private boolean isHeader;        // New: Support for dividers
    private String headerText;       // New: Text for dividers ("Opening Prayer")

    public LeafletSong() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getLeafletId() { return leafletId; }
    public void setLeafletId(int leafletId) { this.leafletId = leafletId; }

    public Integer getSongId() { return songId; }
    public void setSongId(Integer songId) { this.songId = songId; }

    public String getSongTitle() { return songTitle; }
    public void setSongTitle(String songTitle) { this.songTitle = songTitle; }

    public String getSongArtist() { return songArtist; }
    public void setSongArtist(String songArtist) { this.songArtist = songArtist; }

    public String getSongChords() { return songChords; }
    public void setSongChords(String songChords) { this.songChords = songChords; }

    public String getSongLyrics() { return songLyrics; }
    public void setSongLyrics(String songLyrics) { this.songLyrics = songLyrics; }

    public String getSongOriginalKey() { return songOriginalKey; }
    public void setSongOriginalKey(String songOriginalKey) { this.songOriginalKey = songOriginalKey; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public String getCustomKey() { return customKey; }
    public void setCustomKey(String customKey) { this.customKey = customKey; }

    public boolean isHeader() { return isHeader; }
    public void setHeader(boolean header) { isHeader = header; }

    public String getHeaderText() { return headerText; }
    public void setHeaderText(String headerText) { this.headerText = headerText; }

    /** Returns the effective display key (customKey if set, else songOriginalKey) */
    public String getDisplayKey() {
        if (isHeader) return "";
        return (customKey != null && !customKey.isEmpty()) ? customKey : songOriginalKey;
    }
}
