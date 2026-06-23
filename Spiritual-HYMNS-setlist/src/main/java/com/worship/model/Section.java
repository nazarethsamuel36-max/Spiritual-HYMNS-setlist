package com.worship.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a logical section of a song (e.g., Verse 1, Chorus).
 */
public class Section {
    private int id;
    private int songId;
    private String type; // verse, chorus, bridge
    private String label; // e.g., "VERSE 1"
    private int sectionOrder;
    private List<SongLine> lines;

    public Section() {
        this.lines = new ArrayList<>();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSongId() { return songId; }
    public void setSongId(int songId) { this.songId = songId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public int getSectionOrder() { return sectionOrder; }
    public void setSectionOrder(int sectionOrder) { this.sectionOrder = sectionOrder; }

    public List<SongLine> getLines() { return lines; }
    public void setLines(List<SongLine> lines) { this.lines = lines; }

    public void addLine(SongLine line) {
        this.lines.add(line);
    }
}
