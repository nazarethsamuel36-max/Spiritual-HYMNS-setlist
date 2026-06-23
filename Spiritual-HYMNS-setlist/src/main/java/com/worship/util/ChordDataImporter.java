package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.dao.LineChordDAO;
import com.worship.model.ChordOccurrence;
import java.io.File;
import java.util.*;

/**
 * Utility to import the enriched chord data into the database.
 * Matches line IDs and persists chord batches.
 */
public class ChordDataImporter {

    public static void main(String[] args) throws Exception {
        File inputFile = new File("english_chords.json");
        if (!inputFile.exists()) {
            System.err.println("Error: english_chords.json not found!");
            return;
        }

        System.out.println("Starting chord import from " + inputFile.getAbsolutePath());

        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> songList = mapper.readValue(inputFile, new TypeReference<List<Map<String, Object>>>() {});

        LineChordDAO dao = new LineChordDAO();
        int totalChords = 0;
        int totalSongs = 0;

        for (Map<String, Object> song : songList) {
            List<Map<String, Object>> lineChords = (List<Map<String, Object>>) song.get("lineChords");
            if (lineChords == null || lineChords.isEmpty()) continue;

            int songNumber = (int) song.get("songNumber");
            System.out.println("Importing Song #" + songNumber + " (" + song.get("title") + ")");

            // Group by lineId
            Map<Integer, List<ChordOccurrence>> byLine = new LinkedHashMap<>();
            for (Map<String, Object> entry : lineChords) {
                int lineId = (int) entry.get("lineId");
                String chord = (String) entry.get("chord");
                int position = (int) entry.get("position");

                byLine.computeIfAbsent(lineId, k -> new ArrayList<>())
                      .add(new ChordOccurrence(chord, position));
                totalChords++;
            }

            // Save batches
            for (Map.Entry<Integer, List<ChordOccurrence>> entry : byLine.entrySet()) {
                dao.saveChordPositions(entry.getKey(), entry.getValue(), 1.0, null);
            }
            totalSongs++;
        }

        System.out.println("Import complete!");
        System.out.println("Processed " + totalSongs + " songs.");
        System.out.println("Inserted " + totalChords + " individual chord mappings.");
    }
}
