package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.File;
import java.util.*;

public class JsonRefinementUtility {

    public static void main(String[] args) throws Exception {
        File jsonFile = new File("D:/worship-song-library/extracted_songs/marathi_songs.json");
        if (!jsonFile.exists()) {
            System.err.println("JSON file not found.");
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> songs = mapper.readValue(jsonFile, new TypeReference<List<Map<String, Object>>>() {});

        Set<Integer> seenNumbers = new HashSet<>();
        List<Map<String, Object>> refinedSongs = new ArrayList<>();

        for (Map<String, Object> song : songs) {
            // 1. Language Standardization
            song.put("language", "marathi");

            // 2. Data Integrity
            Integer num = (Integer) song.get("number");
            if (num != null) {
                if (seenNumbers.contains(num)) {
                    System.err.println("WARNING: Duplicate song number: " + num);
                }
                seenNumbers.add(num);
            }

            // Title Refinement
            String title = (String) song.get("title");
            if (title != null) {
                title = refineText(title);
                // Remove trailing punctuation from titles
                title = title.replaceAll("[,.;]$ ", "");
                title = title.replaceAll("[,.;]$", "");
                song.put("title", title);
            }

            // Section Cleanup
            List<Map<String, Object>> sections = (List<Map<String, Object>>) song.get("sections");
            List<Map<String, Object>> validSections = new ArrayList<>();
            if (sections != null) {
                for (Map<String, Object> section : sections) {
                    // Normalize Label
                    String label = (String) section.get("label");
                    if (label != null) {
                        section.put("label", label.toUpperCase().trim());
                    }

                    // Normalize Type
                    String type = (String) section.get("type");
                    if (type == null || !Arrays.asList("verse", "chorus", "bridge", "other").contains(type.toLowerCase())) {
                        section.put("type", "verse");
                    } else {
                        section.put("type", type.toLowerCase());
                    }

                    // Trim and Refine Lines
                    List<String> lines = (List<String>) section.get("lines");
                    List<String> refinedLines = new ArrayList<>();
                    if (lines != null) {
                        for (String line : lines) {
                            if (line != null && !line.trim().isEmpty()) {
                                refinedLines.add(refineText(line));
                            }
                        }
                    }
                    if (!refinedLines.isEmpty()) {
                        section.put("lines", refinedLines);
                        validSections.add(section);
                    }
                }
            }
            song.put("sections", validSections);
            refinedSongs.add(song);
        }

        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        mapper.writeValue(jsonFile, refinedSongs);

        System.out.println("JSON OCR Cleanup Utility complete. Processed " + refinedSongs.size() + " songs.");
    }

    private static String refineText(String text) {
        if (text == null) return null;

        // 1. Mandatory Specific Fixes
        text = text.replace("क्रुसाास", "क्रुसास");
        text = text.replace("पी्रय", "प्रिय");
        text = text.replace("तूझा", "तुझा");
        
        // Fix "रक्ते" - handling potential ZWJ or half-form issues by normalization
        // This targets the k-ta combination common in "rakte"
        text = text.replace("रक्ते", "रक्ते");
        text = text.replace("रक्‍ते", "रक्ते"); // ZWJ variant

        // 2. Duplicated Matras Cleanup
        text = text.replace("ाा", "ा");
        text = text.replace("ीी", "ी");
        text = text.replace("ूू", "ू");

        // 3. Broken Ligatures / proper word formations
        text = text.replace("पी्र", "प्रिय");

        // 4. Spacing Fixes
        text = text.trim().replaceAll("\\s+", " ");

        return text;
    }
}
