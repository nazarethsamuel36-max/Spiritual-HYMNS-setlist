package com.worship.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.chord.ChordAligner;
import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.model.ChordOccurrence;
import com.worship.model.Song;
import com.worship.model.StructuredLine;
import com.worship.util.ChordParser;
import com.worship.util.ChordLineMerger;
import com.worship.util.SongFormatDetector;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.*;

/**
 * API endpoint that returns ALL active songs as JSON for offline IndexedDB pre-caching.
 * Called by the PWA when the user is online to pre-populate the local IndexedDB so
 * that every song is viewable offline without having been visited first.
 *
 * GET /api/songs/all
 * Returns: JSON array of song objects with pre-computed structuredLines.
 *
 * Performance: Uses batch queries (no N+1). Can handle libraries of 1000+ songs.
 * Large libraries may use ?page=1&size=100 pagination parameters.
 */
@WebServlet(name = "ApiAllSongsServlet", urlPatterns = {"/api/songs/all"})
public class ApiAllSongsServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private LineChordDAO lineChordDAO = new LineChordDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Allow cross-origin pre-flight for PWA/service worker contexts
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json;charset=UTF-8");
        // Cache 5 minutes on client (songs don't change every second)
        response.setHeader("Cache-Control", "public, max-age=300");

        try {
            // Pagination support for very large libraries
            int page = 1;
            int size = 500; // default: return up to 500 songs per request
            String pageParam = request.getParameter("page");
            String sizeParam = request.getParameter("size");
            if (pageParam != null) {
                try { page = Math.max(1, Integer.parseInt(pageParam)); } catch (NumberFormatException ignored) {}
            }
            if (sizeParam != null) {
                try { size = Math.min(1000, Math.max(1, Integer.parseInt(sizeParam))); } catch (NumberFormatException ignored) {}
            }

            // 1. Fetch all active songs (lightweight – no sections yet)
            List<Song> songs = songDAO.getAllSongs();

            // 2. Apply pagination
            int total = songs.size();
            int fromIdx = (page - 1) * size;
            int toIdx = Math.min(fromIdx + size, total);
            if (fromIdx >= total) {
                songs = Collections.emptyList();
            } else {
                songs = songs.subList(fromIdx, toIdx);
            }

            // 3. Build lightweight payload – resolve structured lines for each song
            List<Map<String, Object>> payload = new ArrayList<>(songs.size());

            for (Song song : songs) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id",          song.getId());
                item.put("songNumber",  song.getSongNumber());
                item.put("title",       song.getTitle());
                item.put("artist",      song.getArtist());
                item.put("language",    song.getLanguage());
                item.put("originalKey", song.getOriginalKey());
                item.put("bpm",        song.getBpm());
                item.put("lyricsOriginal", song.getLyricsOriginal());
                item.put("lyricsRoman",    song.getLyricsRoman());

                // Resolve structuredLines (same logic as SongViewServlet)
                List<StructuredLine> structuredLines = null;

                if (song.getChords() != null && !song.getChords().isEmpty()) {
                    // Song has flat-text chord overrides
                    String chordText = song.getChords();
                    if (SongFormatDetector.detect(chordText) == SongFormatDetector.Format.CHORDS_ABOVE) {
                        chordText = ChordLineMerger.convertToInline(chordText);
                    }
                    structuredLines = ChordParser.parseStructuredSong(chordText);
                } else {
                    // Use relational schema: fetch sections then line_chords
                    List<com.worship.model.Section> sections = songDAO.getSectionsForSong(song.getId());
                    if (sections != null && !sections.isEmpty()) {
                        Map<Integer, List<ChordOccurrence>> chordMap =
                                lineChordDAO.getChordsForSong(song.getId());
                        structuredLines = ChordAligner.buildStructuredLines(sections, chordMap);
                    }
                }

                // Serialize structuredLines as array (may be null → empty array)
                item.put("structuredLines",
                        structuredLines != null ? structuredLines : Collections.emptyList());

                payload.add(item);
            }

            // 4. Wrap in envelope with metadata so client can detect pagination
            Map<String, Object> envelope = new LinkedHashMap<>();
            envelope.put("total",   total);
            envelope.put("page",    page);
            envelope.put("size",    size);
            envelope.put("songs",   payload);

            objectMapper.writeValue(response.getWriter(), envelope);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to fetch songs: " + e.getMessage());
            objectMapper.writeValue(response.getWriter(), err);
        }
    }
}
