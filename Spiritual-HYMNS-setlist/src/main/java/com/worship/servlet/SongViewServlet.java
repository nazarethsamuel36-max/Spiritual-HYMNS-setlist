package com.worship.servlet;

import com.worship.chord.ChordAligner;
import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.dao.UserSongDAO;
import com.worship.model.Song;
import com.worship.model.UserSong;
import com.worship.util.ChordParser;
import com.worship.util.SongFormatDetector;
import com.worship.util.ChordLineMerger;
import com.worship.util.SessionUtil;
import com.worship.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Servlet for viewing a single song with parsed chord/lyric alignment.
 * Checks for personal user versions (logged-in: user_songs table, guest:
 * session).
 * Increments view count on each load.
 */
@WebServlet(name = "SongViewServlet", urlPatterns = { "/song" })
public class SongViewServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private UserSongDAO userSongDAO = new UserSongDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isEmpty()) {
            response.sendRedirect(request.getContextPath() + "/songs");
            return;
        }

        // Handle reset to original
        String reset = request.getParameter("reset");

        try {
            int songId = Integer.parseInt(idParam);
            Song song = songDAO.getSongById(songId);

            if (song == null || !song.isActive()) {
                response.sendRedirect(request.getContextPath() + "/songs");
                return;
            }

            boolean isPersonalVersion = false;
            User currentUser = SessionUtil.getCurrentUser(request.getSession(false));

            if (currentUser != null) {
                // === LOGGED-IN USER: check user_songs table ===
                if ("true".equals(reset)) {
                    // Reset: delete personal version
                    userSongDAO.deleteUserVersion(currentUser.getId(), songId);
                } else {
                    UserSong userVersion = userSongDAO.getUserVersion(currentUser.getId(), songId);
                    if (userVersion != null) {
                        // Override master song fields with user's personal version
                        if (userVersion.getCustomChords() != null && !userVersion.getCustomChords().isEmpty()) {
                            song.setChords(userVersion.getCustomChords());
                        }
                        if (userVersion.getCustomLyrics() != null && !userVersion.getCustomLyrics().isEmpty()) {
                            song.setLyricsOriginal(userVersion.getCustomLyrics());
                        }
                        if (userVersion.getCustomKey() != null && !userVersion.getCustomKey().isEmpty()) {
                            song.setOriginalKey(userVersion.getCustomKey());
                        }
                        if (userVersion.getCustomNotes() != null && !userVersion.getCustomNotes().isEmpty()) {
                            song.setNotes(userVersion.getCustomNotes());
                        }
                        isPersonalVersion = true;
                        request.setAttribute("personalNote", userVersion.getPersonalNote());
                    }
                }
            } else {
                // === GUEST: check session edits ===
                Map<String, String> guestEdits = SessionUtil.getGuestEdits(
                        request.getSession(false), songId);
                if (guestEdits != null) {
                    if (guestEdits.get("customChords") != null) {
                        song.setChords(guestEdits.get("customChords"));
                    }
                    if (guestEdits.get("customKey") != null) {
                        song.setOriginalKey(guestEdits.get("customKey"));
                    }
                    isPersonalVersion = true;
                }
            }

            // UNIFIED: Parse into authoritative structured format from relational schema
            java.util.List<com.worship.model.StructuredLine> structuredLines = null;

            // Check if user has custom chord overrides (personal version)
            if (song.getChords() != null && !song.getChords().isEmpty()) {
                // User-edited chords stored as flat text in user_songs.custom_chords
                String chordText = song.getChords();
                if (SongFormatDetector.detect(chordText) == SongFormatDetector.Format.CHORDS_ABOVE) {
                    chordText = ChordLineMerger.convertToInline(chordText);
                }
                structuredLines = ChordParser.parseStructuredSong(chordText);
            } else if (song.getSections() != null && !song.getSections().isEmpty()) {
                // PRIMARY PATH: Relational schema (sections → song_lines → line_chords)
                LineChordDAO lineChordDAO = new LineChordDAO();
                java.util.Map<Integer, java.util.List<com.worship.model.ChordOccurrence>> chordMap = lineChordDAO
                        .getChordsForSong(songId);
                structuredLines = ChordAligner.buildStructuredLines(song.getSections(), chordMap);
            }

            // SETLIST TRANSPOSE: Apply transpose from setlist navigation
            int setlistTranspose = SessionUtil.getSetlistTranspose(request.getSession(false), songId);
            if (setlistTranspose != 0 && structuredLines != null) {
                // Transpose all chords in structured lines
                for (com.worship.model.StructuredLine line : structuredLines) {
                    if (line.getChords() != null) {
                        for (com.worship.model.ChordOccurrence occ : line.getChords()) {
                            if (occ.getChord() != null && !occ.getChord().isEmpty()) {
                                occ.setChord(com.worship.util.ChordTransposer.transposeChord(occ.getChord(), setlistTranspose));
                            }
                        }
                    }
                }
                // Clear transpose from session after applying
                SessionUtil.clearSetlistTranspose(request.getSession(false), songId);
            }

            // NEW: Transliteration Injection Point & Session Preference
            String scriptFormat = request.getParameter("script");
            if (scriptFormat != null) {
                // If explicitly requested, save to session
                request.getSession().setAttribute("preferredScript", scriptFormat);
            } else {
                // Otherwise retrieve from session
                scriptFormat = (String) request.getSession().getAttribute("preferredScript");
            }
            // Set flag for JSP to use
            request.setAttribute("isRomanScript", "roman".equalsIgnoreCase(scriptFormat));

            boolean isRomanScript = "roman".equalsIgnoreCase(scriptFormat);
            String lang = song.getLanguage() != null ? song.getLanguage().trim() : "";
            boolean isMarathi = "marathi".equalsIgnoreCase(lang) || "mr".equalsIgnoreCase(lang);

            if (isRomanScript && isMarathi) {
                com.worship.service.TransliterationService transliteService = new com.worship.service.TransliterationService();

                // 1. Transliterate structured parsing
                if (structuredLines != null) {
                    structuredLines = transliteService.transliterateStructuredLines(structuredLines);
                }

                // 2. Transliterate fallback lyrics if present
                if (song.getLyricsOriginal() != null && !song.getLyricsOriginal().isEmpty()) {
                    song.setLyricsOriginal(transliteService.transliterateToEnglish(song.getLyricsOriginal()));
                }
            }

            if (structuredLines != null) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    String json = mapper.writeValueAsString(structuredLines);
                    request.setAttribute("structuredLinesJson", json);
                } catch (Exception ex) {
                    request.setAttribute("structuredLinesJson", "[]");
                }
            }

            // Increment view count
            Integer userId = currentUser != null ? currentUser.getId() : null;
            songDAO.incrementViewCount(songId, userId);

            request.setAttribute("song", song);
            request.setAttribute("isPersonalVersion", isPersonalVersion);
            request.getRequestDispatcher("/jsp/songView.jsp").forward(request, response);

        } catch (NumberFormatException e) {
            response.sendRedirect(request.getContextPath() + "/songs");
        }
    }
}
