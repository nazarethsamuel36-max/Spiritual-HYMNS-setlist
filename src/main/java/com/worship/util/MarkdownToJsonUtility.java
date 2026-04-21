package com.worship.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.File;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MarkdownToJsonUtility {

    public static void main(String[] args) throws Exception {
        File inputFile = new File("D:/worship-song-library/extracted_songs/marathi_songs.md");
        File outputFile = new File("D:/worship-song-library/extracted_songs/marathi_songs.json");

        if (!inputFile.exists()) {
            System.err.println("Input file not found: " + inputFile.getAbsolutePath());
            return;
        }

        String content = Files.readString(inputFile.toPath());
        String[] songBlocks = content.split("------");
        List<Map<String, Object>> songsList = new ArrayList<>();

        for (String block : songBlocks) {
            block = block.trim();
            if (block.isEmpty()) continue;

            Map<String, Object> songMap = new LinkedHashMap<>();
            
            // Number
            Pattern numPat = Pattern.compile("NUMBER:\\s*(\\d+)");
            Matcher numMat = numPat.matcher(block);
            if (numMat.find()) {
                songMap.put("number", Integer.parseInt(numMat.group(1)));
            }

            // Title
            Pattern titlePat = Pattern.compile("TITLE:\\s*(.*)");
            Matcher titleMat = titlePat.matcher(block);
            if (titleMat.find()) {
                songMap.put("title", titleMat.group(1).trim());
            }

            songMap.put("language", "marathi");
            songMap.put("book", "prime_songbook");

            // Sections
            List<Map<String, Object>> sectionsList = new ArrayList<>();
            String[] sectionParts = block.split("SECTION:\\s*");
            
            for (int i = 1; i < sectionParts.length; i++) {
                String sectionBlock = sectionParts[i];
                String[] lines = sectionBlock.split("\\R");
                if (lines.length == 0) continue;

                String label = lines[0].trim();
                String type = label.toUpperCase().contains("CHORUS") ? "chorus" : "verse";

                Map<String, Object> sectionMap = new LinkedHashMap<>();
                sectionMap.put("type", type);
                sectionMap.put("label", label);

                // Extract [DEV] content
                int devStart = sectionBlock.indexOf("[DEV]");
                int engStart = sectionBlock.indexOf("[ENG]");
                
                if (devStart != -1) {
                    int end = (engStart != -1) ? engStart : sectionBlock.length();
                    String devContent = sectionBlock.substring(devStart + 5, end).trim();
                    List<String> lineList = new ArrayList<>();
                    for (String l : devContent.split("\\R")) {
                        if (!l.trim().isEmpty()) {
                            lineList.add(l.trim());
                        }
                    }
                    sectionMap.put("lines", lineList);
                }
                sectionsList.add(sectionMap);
            }
            songMap.put("sections", sectionsList);
            songsList.add(songMap);
        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        mapper.writeValue(outputFile, songsList);

        System.out.println("Successfully converted MD to JSON at: " + outputFile.getAbsolutePath());
    }
}
