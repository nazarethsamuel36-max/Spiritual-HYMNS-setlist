package com.worship.service;

import com.ibm.icu.text.Transliterator;
import com.worship.model.StructuredLine;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for transliterating text between scripts.
 * Built on ICU4J to ensure accurate and robust mapping without database bloat.
 */
public class TransliterationService {

    // Initialize the transliterator once. "Devanagari-Latin" applies standard ISO 15919 transliteration.
    private static final Transliterator devanagariToLatin = Transliterator.getInstance("Devanagari-Latin");

    /**
     * Transliterates a raw Devanagari string to Latin (Roman) script.
     * @param devanagariText The original Marathi/Hindi text
     * @return The transliterated English string
     */
    public String transliterateToEnglish(String devanagariText) {
        if (devanagariText == null || devanagariText.isEmpty()) {
            return devanagariText;
        }
        return devanagariToLatin.transliterate(devanagariText);
    }

    /**
     * Transliterates a list of structured lines, returning a new list to prevent modifying original data.
     * @param originalLines The source structured lines
     * @return A new list of transliterated structured lines
     */
    public List<StructuredLine> transliterateStructuredLines(List<StructuredLine> originalLines) {
        if (originalLines == null) return null;

        List<StructuredLine> transliteratedLines = new ArrayList<>();
        for (StructuredLine originalLine : originalLines) {
            String transliteratedText = transliterateToEnglish(originalLine.getLyrics());
            // Parse chord-containing text using ChordParser to ensure chords are extracted
            StructuredLine newLine = com.worship.util.ChordParser.parseStructuredLine(transliteratedText);
            // If no chords extracted from transliterated text, preserve original chords
            if ((newLine.getChords() == null || newLine.getChords().isEmpty()) && originalLine.getChords() != null) {
                newLine.setChords(new ArrayList<>(originalLine.getChords()));
            }
            transliteratedLines.add(newLine);
        }

        
        return transliteratedLines;
    }
}
