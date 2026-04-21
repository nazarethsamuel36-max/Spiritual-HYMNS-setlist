package com.worship.model;

/**
 * Represents a single line of text within a song section.
 */
public class SongLine {
    private int id;
    private int sectionId;
    private String text;
    private int lineOrder;

    public SongLine() {}

    public SongLine(String text, int lineOrder) {
        this.text = text;
        this.lineOrder = lineOrder;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSectionId() { return sectionId; }
    public void setSectionId(int sectionId) { this.sectionId = sectionId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
