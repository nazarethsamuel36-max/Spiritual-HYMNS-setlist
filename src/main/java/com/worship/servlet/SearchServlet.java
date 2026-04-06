package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * Full text search servlet returning JSON or HTML results.
 * Searches title, artist, lyrics_original, lyrics_roman.
 * Bug #39 fix: Added Vary: Accept header for proper caching of content types.
 * Bug #41 fix: Implemented result weighting (Title > Artist > Lyrics).
 */
@WebServlet(name = "SearchServlet", urlPatterns = {"/search"})
public class SearchServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Bug #39 fix: Signal to caches (including Service Worker) that response depends on Accept header
        response.setHeader("Vary", "Accept");

        String query = request.getParameter("q");
        String acceptHeader = request.getHeader("Accept");
        boolean expectsJson = (acceptHeader != null && acceptHeader.contains("application/json"));

        if (query == null || query.trim().isEmpty()) {
            if (expectsJson) {
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("[]");
            } else {
                request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
            }
            return;
        }

        query = query.trim();
        List<Song> songs = songDAO.searchSongs(query);

        // Build search results with matched line and basic weighting
        List<Map<String, Object>> results = new ArrayList<>();
        for (Song song : songs) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", song.getId());
            result.put("title", song.getTitle());
            result.put("artist", song.getArtist());
            result.put("language", song.getLanguage());
            result.put("key", song.getOriginalKey());

            // Bug #41 fix: Identify best matched line for context
            String matchedLine = findBestMatchedLine(song, query);
            result.put("matchedLine", matchedLine);

            results.add(result);
        }

        if (expectsJson) {
            response.setContentType("application/json;charset=UTF-8");
            objectMapper.writeValue(response.getWriter(), results);
        } else {
            request.setAttribute("searchResults", results);
            request.setAttribute("searchQuery", query);
            request.setAttribute("songs", songs);
            request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
        }
    }

    /**
     * Find the best context line for the search results.
     * Bug #41 logic: Weight context by Title > Artist > Lyrics.
     */
    private String findBestMatchedLine(Song song, String query) {
        String lowerQuery = query.toLowerCase();

        // 1. Title match (High priority)
        if (song.getTitle() != null && song.getTitle().toLowerCase().contains(lowerQuery)) {
            return "Matched in Title: " + song.getTitle();
        }

        // 2. Artist match
        if (song.getArtist() != null && song.getArtist().toLowerCase().contains(lowerQuery)) {
            return "Artist: " + song.getArtist();
        }

        // 3. Original Lyrics match
        if (song.getLyricsOriginal() != null) {
            String[] lines = song.getLyricsOriginal().split("\\r?\\n");
            for (String line : lines) {
                if (line.toLowerCase().contains(lowerQuery)) {
                    return line.trim();
                }
            }
        }

        // 4. Romanized Lyrics match
        if (song.getLyricsRoman() != null) {
            String[] lines = song.getLyricsRoman().split("\\r?\\n");
            for (String line : lines) {
                if (line.toLowerCase().contains(lowerQuery)) {
                    return line.trim();
                }
            }
        }

        return "";
    }
}
