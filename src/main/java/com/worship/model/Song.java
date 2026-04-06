package com.worship.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Song model representing the songs master table.
 * Only admins can modify master song data.
 * Chord data stored in bracket format: [G]Amazing [Em]grace
 */
public class Song {

    private int id;
    private int songNumber;
    private String title;
    private String artist;
    private String composer;
    private String copyright;
    private String language; // english, hindi, marathi, bengali, other
    private String lyricsOriginal;
    private String lyricsRoman;
    private String chords;
    private String notes;
    private String originalKey;
    private int capo;
    private int bpm;
    private String timeSignature;
    private String structure;
    private String audioUrl;
    private int createdBy;
    private Timestamp createdAt;
    private boolean isActive;
    private List<String> hashtags;

    public Song() {
        this.capo = 0;
        this.timeSignature = "4/4";
        this.isActive = true;
        this.hashtags = new ArrayList<>();
    }

    // Getters and Setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSongNumber() { return songNumber; }
    public void setSongNumber(int songNumber) { this.songNumber = songNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getComposer() { return composer; }
    public void setComposer(String composer) { this.composer = composer; }

    public String getCopyright() { return copyright; }
    public void setCopyright(String copyright) { this.copyright = copyright; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getLyricsOriginal() { return lyricsOriginal; }
    public void setLyricsOriginal(String lyricsOriginal) { this.lyricsOriginal = lyricsOriginal; }

    public String getLyricsRoman() { return lyricsRoman; }
    public void setLyricsRoman(String lyricsRoman) { this.lyricsRoman = lyricsRoman; }

    public String getChords() { return chords; }
    public void setChords(String chords) { this.chords = chords; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getOriginalKey() { return originalKey; }
    public void setOriginalKey(String originalKey) { this.originalKey = originalKey; }

    public int getCapo() { return capo; }
    public void setCapo(int capo) { this.capo = capo; }

    public int getBpm() { return bpm; }
    public void setBpm(int bpm) { this.bpm = bpm; }

    public String getTimeSignature() { return timeSignature; }
    public void setTimeSignature(String timeSignature) { this.timeSignature = timeSignature; }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public List<String> getHashtags() { return hashtags; }
    public void setHashtags(List<String> hashtags) { this.hashtags = hashtags; }

    /**
     * Bug #40: Added hashCode and equals for reliable set/collection usage.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Song song = (Song) o;
        return id == song.id;
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id);
    }
}
