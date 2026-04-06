package com.worship.servlet;

import com.worship.dao.ReportDAO;
import com.worship.dao.SongDAO;
import com.worship.dao.UserSongDAO;
import com.worship.model.ChordReport;
import com.worship.model.Song;
import com.worship.model.User;
import com.worship.model.UserSong;
import com.worship.util.SessionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles personal song version operations.
 * Bug #23 fix: Removed unsafe (int) casts of session attributes.
 * Replaced with safe User object retrieval to prevent NullPointerExceptions.
 */
@WebServlet(name = "UserSongServlet", urlPatterns = {"/song/edit", "/song/save", "/song/reset", "/song/suggest"})
public class UserSongServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private UserSongDAO userSongDAO = new UserSongDAO();
    private ReportDAO reportDAO = new ReportDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");

        String songIdStr = request.getParameter("songId");
        if (songIdStr == null) {
            sendError(response, "songId is required");
            return;
        }

        try {
            int songId = Integer.parseInt(songIdStr);
            HttpSession session = request.getSession(true);
            User user = SessionUtil.getCurrentUser(session);

            Song masterSong = songDAO.getSongById(songId);
            if (masterSong == null) {
                sendError(response, "Song not found");
                return;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("songId", songId);
            result.put("title", masterSong.getTitle());

            // Check for user's personal version
            if (user != null) {
                UserSong userVersion = userSongDAO.getUserVersion(user.getId(), songId);
                if (userVersion != null) {
                    result.put("isPersonalVersion", true);
                    result.put("chords", userVersion.getCustomChords() != null ?
                            userVersion.getCustomChords() : masterSong.getChords());
                    result.put("lyrics", userVersion.getCustomLyrics() != null ?
                            userVersion.getCustomLyrics() : masterSong.getLyricsOriginal());
                    result.put("key", userVersion.getCustomKey() != null ?
                            userVersion.getCustomKey() : masterSong.getOriginalKey());
                    result.put("notes", userVersion.getCustomNotes() != null ?
                            userVersion.getCustomNotes() : masterSong.getNotes());
                } else {
                    result.put("isPersonalVersion", false);
                    result.put("chords", masterSong.getChords());
                    result.put("lyrics", masterSong.getLyricsOriginal());
                    result.put("key", masterSong.getOriginalKey());
                    result.put("notes", masterSong.getNotes());
                }
            } else {
                // Check guest session edits
                Map<String, String> guestEdits = SessionUtil.getGuestEdits(session, songId);
                if (guestEdits != null) {
                    result.put("isPersonalVersion", true);
                    result.put("chords", guestEdits.get("customChords") != null ?
                            guestEdits.get("customChords") : masterSong.getChords());
                    result.put("lyrics", guestEdits.get("customLyrics") != null ?
                            guestEdits.get("customLyrics") : masterSong.getLyricsOriginal());
                    result.put("key", guestEdits.get("customKey") != null ?
                            guestEdits.get("customKey") : masterSong.getOriginalKey());
                } else {
                    result.put("isPersonalVersion", false);
                    result.put("chords", masterSong.getChords());
                    result.put("lyrics", masterSong.getLyricsOriginal());
                    result.put("key", masterSong.getOriginalKey());
                }
                result.put("isGuest", true);
            }

            objectMapper.writeValue(response.getWriter(), result);

        } catch (NumberFormatException e) {
            sendError(response, "Invalid songId");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");
        String path = request.getServletPath();

        switch (path) {
            case "/song/save":
                handleSave(request, response);
                break;
            case "/song/reset":
                handleReset(request, response);
                break;
            case "/song/suggest":
                handleSuggest(request, response);
                break;
            default:
                sendError(response, "Unknown action");
        }
    }

    private void handleSave(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String songIdStr = request.getParameter("songId");
        String customChords = request.getParameter("customChords");
        String customLyrics = request.getParameter("customLyrics");
        String customKey = request.getParameter("customKey");
        String customNotes = request.getParameter("customNotes");

        if (songIdStr == null) {
            sendError(response, "songId is required");
            return;
        }

        try {
            int songId = Integer.parseInt(songIdStr);
            HttpSession session = request.getSession(true);
            User user = SessionUtil.getCurrentUser(session);

            if (user != null) {
                // Logged-in user: save to user_songs table
                UserSong us = new UserSong();
                us.setUserId(user.getId());
                us.setSongId(songId);
                us.setCustomKey(customKey);
                us.setCustomChords(customChords);
                us.setCustomLyrics(customLyrics);
                us.setCustomNotes(customNotes);

                boolean saved = userSongDAO.saveUserVersion(us);
                sendSuccess(response, saved ? "Personal version saved" : "Save failed");
            } else {
                // Guest: save to session only — never database
                SessionUtil.saveGuestEdits(session, songId, customChords, customLyrics, customKey);
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("message", "Saved to session. Sign up to keep your edits permanently.");
                result.put("isGuest", true);
                objectMapper.writeValue(response.getWriter(), result);
            }

        } catch (NumberFormatException e) {
            sendError(response, "Invalid songId");
        }
    }

    private void handleReset(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String songIdStr = request.getParameter("songId");
        if (songIdStr == null) {
            sendError(response, "songId is required");
            return;
        }

        try {
            int songId = Integer.parseInt(songIdStr);
            HttpSession session = request.getSession(true);
            User user = SessionUtil.getCurrentUser(session);

            if (user != null) {
                userSongDAO.deleteUserVersion(user.getId(), songId);
            }
            // For guests, session edits are transient anyway

            sendSuccess(response, "Reset to original version");

        } catch (NumberFormatException e) {
            sendError(response, "Invalid songId");
        }
    }

    private void handleSuggest(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String songIdStr = request.getParameter("songId");
        String suggestion = request.getParameter("suggestion");

        if (songIdStr == null || suggestion == null || suggestion.trim().isEmpty()) {
            sendError(response, "songId and suggestion are required");
            return;
        }

        try {
            int songId = Integer.parseInt(songIdStr);
            HttpSession session = request.getSession(true);
            User user = SessionUtil.getCurrentUser(session);

            ChordReport report = new ChordReport();
            report.setSongId(songId);
            report.setReason("wrong_chord");
            report.setSuggestion(suggestion.trim());

            if (user != null) {
                report.setUserId(user.getId());
            }

            boolean submitted = reportDAO.submitReport(report);
            sendSuccess(response, submitted ?
                    "Thank you! Admin has been notified." : "Submission failed");

        } catch (NumberFormatException e) {
            sendError(response, "Invalid songId");
        }
    }

    private void sendError(HttpServletResponse response, String message) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("error", message);
        objectMapper.writeValue(response.getWriter(), result);
    }

    private void sendSuccess(HttpServletResponse response, String message) throws IOException {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", message);
        objectMapper.writeValue(response.getWriter(), result);
    }
}
