package com.worship.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Structured representation of a chord.
 * Used as the data carrier through the Chord Engine pipeline.
 */
public class ChordToken {
    private String root;
    private String quality;
    private List<String> extensions = new ArrayList<>();
    private List<String> alterations = new ArrayList<>();
    private List<String> additions = new ArrayList<>();
    private String bass;
    private String originalInput;
    private boolean valid;

    public ChordToken(String originalInput) {
        this.originalInput = originalInput;
        this.valid = false;
    }

    // Getters and Setters
    public String getRoot() { return root; }
    public void setRoot(String root) { this.root = root; }

    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }

    public List<String> getExtensions() { return extensions; }
    public void setExtensions(List<String> extensions) { this.extensions = extensions; }

    public List<String> getAlterations() { return alterations; }
    public void setAlterations(List<String> alterations) { this.alterations = alterations; }

    public List<String> getAdditions() { return additions; }
    public void setAdditions(List<String> additions) { this.additions = additions; }

    public String getBass() { return bass; }
    public void setBass(String bass) { this.bass = bass; }

    public String getOriginalInput() { return originalInput; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
}
