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

            // 1. Get structured lines (handle both legacy column and relational tables)
            List<StructuredLine> structuredLines = new ArrayList<>();
            String lang = song.getLanguage() != null ? song.getLanguage().trim() : "";
            boolean isMarathi = "marathi".equalsIgnoreCase(lang) || "mr".equalsIgnoreCase(lang);

            if (song.getChords() != null && !song.getChords().isEmpty()) {
                // Priority 1: Legacy bracket chords
                String chordText = song.getChords();
                if (com.worship.util.SongFormatDetector.detect(chordText) == com.worship.util.SongFormatDetector.Format.CHORDS_ABOVE) {
                    chordText = com.worship.util.ChordLineMerger.convertToInline(chordText);
                }
                structuredLines = ChordParser.parseStructuredSong(chordText);
            } else if (song.getSections() != null && !song.getSections().isEmpty()) {
                // Priority 2: Relational sections/lines
                com.worship.dao.LineChordDAO lineChordDAO = new com.worship.dao.LineChordDAO();
                Map<Integer, List<com.worship.model.ChordOccurrence>> chordMap = lineChordDAO.getChordsForSong(songId);

                for (com.worship.model.Section section : song.getSections()) {
                    // Include section headers
                    structuredLines.add(new StructuredLine("{" + section.getLabel() + "}"));
                    for (com.worship.model.SongLine line : section.getLines()) {
                        StructuredLine sl = ChordParser.parseStructuredLine(line.getText());
                        List<com.worship.model.ChordOccurrence> lineChords = chordMap.get(line.getId());
                        if (lineChords != null) {
                            sl.setChords(lineChords);
                        }
                        structuredLines.add(sl);
                    }
                }
            }

            // 2. Transpose the structured lines
            if (!structuredLines.isEmpty()) {
                com.worship.util.ChordTransposer.EnharmonicPref style = ChordTransposer.detectStructuredStyle(structuredLines);
                for (StructuredLine line : structuredLines) {
                    // Don't transpose section labels
                    if (line.getLyrics() != null && line.getLyrics().startsWith("{") && line.getLyrics().endsWith("}")) continue;
                    ChordTransposer.transposeStructuredLine(line, semitones, style, false);
                }
            }

            // 3. Handle Transliteration (Roman Script) if active in session
            String scriptFormat = (String) request.getSession().getAttribute("preferredScript");
            if ("roman".equalsIgnoreCase(scriptFormat) && isMarathi) {
                com.worship.service.TransliterationService transliteService = new com.worship.service.TransliterationService();
                structuredLines = transliteService.transliterateStructuredLines(structuredLines);
            }

            // 4. Transpose notes (Sa Re Ga) if present
            List<String> noteLines = new ArrayList<>();
            if (song.getNotes() != null && !song.getNotes().isEmpty()) {
                String transposedNotes = NoteTransposer.transposeSongNotes(song.getNotes(), semitones);
                String[] noteLinesArr = transposedNotes.split("\\r?\\n");
                noteLines = Arrays.asList(noteLinesArr);
            }

            // 5. Build response
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
