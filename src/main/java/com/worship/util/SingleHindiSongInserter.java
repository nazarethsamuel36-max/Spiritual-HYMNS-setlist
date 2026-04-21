package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

/**
 * Utility to insert a single Hindi song from JSON into the database.
 * Validates structure and ensures uniqueness before insertion.
 */
public class SingleHindiSongInserter {

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final SongDAO songDAO = new SongDAO();

    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Error: JSON string required as argument");
            System.exit(1);
        }

        String json = args[0];
        try {
            JsonNode root = mapper.readTree(json);

            // Validate required fields
            if (!root.has("number") || !root.has("title") || !root.has("language") || !root.has("book") || !root.has("sections")) {
                System.err.println("Error: JSON must contain number, title, language, book, and sections");
                System.exit(1);
            }

            int number = root.get("number").asInt();
            String title = root.get("title").asText();
            String language = root.get("language").asText();
            String book = root.get("book").asText();
            JsonNode sectionsNode = root.get("sections");

            // Validate language and book
            if (!"hindi".equals(language)) {
                System.err.println("Error: language must be 'hindi'");
                System.exit(1);
            }

            if (!"prime_songbook".equals(book)) {
                System.err.println("Error: book must be 'prime_songbook'");
                System.exit(1);
            }

            // Validate sections
            if (!sectionsNode.isArray() || sectionsNode.size() == 0) {
                System.err.println("Error: sections must be a non-empty array");
                System.exit(1);
            }

            // Check uniqueness
            if (songDAO.songExists(number, language, book)) {
                System.err.println("Error: Song with number " + number + ", language '" + language + "', book '" + book + "' already exists");
                System.exit(1);
            }

            // Build Song object
            Song song = new Song();
            song.setSongNumber(number);
            song.setTitle(title);
            song.setLanguage(language);
            song.setBook(book);
            song.setCreatedBy(1); // Admin user
            song.setActive(true);

            List<Section> sections = new ArrayList<>();
            for (JsonNode secNode : sectionsNode) {
                if (!secNode.has("type") || !secNode.has("label") || !secNode.has("lines")) {
                    System.err.println("Error: Each section must have type, label, and lines");
                    System.exit(1);
                }

                String type = secNode.get("type").asText();
                String label = secNode.get("label").asText();
                JsonNode linesNode = secNode.get("lines");

                if (!linesNode.isArray() || linesNode.size() == 0) {
                    System.err.println("Error: Each section must have non-empty lines array");
                    System.exit(1);
                }

                Section section = new Section();
                section.setType(type);
                section.setLabel(label);

                List<SongLine> lines = new ArrayList<>();
                for (JsonNode lineNode : linesNode) {
                    SongLine line = new SongLine();
                    line.setText(lineNode.asText()); // Do not modify lyrics text
                    lines.add(line);
                }
                section.setLines(lines);
                sections.add(section);
            }
            song.setSections(sections);

            // Insert
            if (songDAO.addSongWithStructure(song)) {
                System.out.println("Success: Song " + number + " ('" + title + "') inserted successfully for language '" + language + "'");
            } else {
                System.err.println("Error: Failed to insert song");
                System.exit(1);
            }

        } catch (Exception e) {
            System.err.println("Error: Invalid JSON or processing error: " + e.getMessage());
            System.exit(1);
        }
    }
}