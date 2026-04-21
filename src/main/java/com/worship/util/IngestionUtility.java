package com.worship.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.dao.SongDAO;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Utility to ingest songs from JSON into the database.
 */
public class IngestionUtility {

    public static void main(String[] args) {
        String jsonPath = args.length > 0 ? args[0] : "d:/worship-song-library/extracted_songs/all_songs.json";
        SongDAO songDAO = new SongDAO();
        ObjectMapper mapper = new ObjectMapper();

        try {
            List<Map<String, Object>> songData = mapper.readValue(new File(jsonPath), new TypeReference<List<Map<String, Object>>>() {});
            System.out.println("Loaded " + songData.size() + " songs from JSON.");

            for (Map<String, Object> data : songData) {
                Song song = new Song();
                song.setSongNumber((Integer) data.get("number"));
                song.setTitle((String) data.get("title"));
                
                String lang = (String) data.get("language");
                song.setLanguage(lang != null ? lang.toLowerCase() : "english"); 
                
                song.setBook("prime_songbook");
                song.setCreatedBy(1); // Default admin user

                List<Map<String, Object>> sectionsData = (List<Map<String, Object>>) data.get("sections");
                List<Section> sections = new ArrayList<>();

                for (Map<String, Object> secMap : sectionsData) {
                    Section section = new Section();
                    section.setType((String) secMap.get("type"));
                    section.setLabel((String) secMap.get("label"));
                    
                    List<String> linesText = (List<String>) secMap.get("lines");
                    List<SongLine> lines = new ArrayList<>();
                    for (int i = 0; i < linesText.size(); i++) {
                        lines.add(new SongLine(linesText.get(i), i + 1));
                    }
                    section.setLines(lines);
                    sections.add(section);
                }
                song.setSections(sections);

                boolean success = songDAO.addSongWithStructure(song);
                if (success) {
                    System.out.println("Ingested: [" + song.getSongNumber() + "] " + song.getTitle());
                } else {
                    System.err.println("FAILED: [" + song.getSongNumber() + "] " + song.getTitle());
                }
            }
            System.out.println("Ingestion complete.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
