package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.worship.model.StructuredLine;
import com.worship.util.ChordParser;
import com.worship.util.ChordTransposer;
import com.worship.util.NoteTransposer;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * Transpose servlet — accepts songId and semitones, returns transposed JSON.
 * Handles both Western chord transposition and Indian solfege note transposition.
 * JavaScript on songView.jsp calls this endpoint for live transposition.
 */
@WebServlet(name = "TransposeServlet", urlPatterns = {"/transpose"})
public class TransposeServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");

        String songIdStr = request.getParameter("songId");
        String semitonesStr = request.getParameter("semitones");

        if (songIdStr == null || semitonesStr == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "songId and semitones are required");
            objectMapper.writeValue(response.getWriter(), error);
            return;
        }

        try {
            int songId = Integer.parseInt(songIdStr);
            int semitones = Integer.parseInt(semitonesStr);

            Song song = songDAO.getSongById(songId);
            if (song == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Song not found");
                objectMapper.writeValue(response.getWriter(), error);
                return;
            }

            // Transpose the raw bracket chord-lyric text
            String transposedChords = ChordTransposer.transposeSong(song.getChords(), semitones);

            // Parse into authoritative structured format
            List<StructuredLine> structuredLines = ChordParser.parseStructuredSong(song.getChords());
            
            // Transpose the structured lines
            com.worship.util.ChordTransposer.EnharmonicPref style = com.worship.util.ChordTransposer.detectStructuredStyle(structuredLines);
            for (StructuredLine line : structuredLines) {
                ChordTransposer.transposeStructuredLine(line, semitones, style, false);
            }

            // Transpose notes (Sa Re Ga) if present
            List<String> noteLines = new ArrayList<>();
            if (song.getNotes() != null && !song.getNotes().isEmpty()) {
                String transposedNotes = NoteTransposer.transposeSongNotes(song.getNotes(), semitones);
                String[] noteLinesArr = transposedNotes.split("\\r?\\n");
                noteLines = Arrays.asList(noteLinesArr);
            }

            // Build response
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("structuredLines", structuredLines);
            result.put("noteLines", noteLines);
            result.put("key", ChordTransposer.getKeyAfterTranspose(song.getOriginalKey(), semitones));
            result.put("capo", ChordTransposer.getCapoSuggestion(semitones));
            result.put("semitones", semitones);

            objectMapper.writeValue(response.getWriter(), result);

        } catch (NumberFormatException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid songId or semitones");
            objectMapper.writeValue(response.getWriter(), error);
        }
    }
}
