package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.dao.UserSongDAO;
import com.worship.model.Song;
import com.worship.model.UserSong;
import com.worship.util.ChordParser;
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
 * Checks for personal user versions (logged-in: user_songs table, guest: session).
 * Increments view count on each load.
 */
@WebServlet(name = "SongViewServlet", urlPatterns = {"/song"})
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

            // Parse into authoritative structured format
            if (song.getChords() != null && !song.getChords().isEmpty()) {
                java.util.List<com.worship.model.StructuredLine> structuredLines = ChordParser.parseStructuredSong(song.getChords());
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
