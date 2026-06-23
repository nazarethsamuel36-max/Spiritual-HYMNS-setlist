package com.worship.util;

import com.worship.dao.UserSongDAO;
import com.worship.model.User;
import com.worship.model.UserSong;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * Session management utility for guest, user, and admin role checks.
 * Guest edits stored in HttpSession as Map<Integer, Map<String, String>>.
 * Key = songId, Value = map of customChords, customLyrics, customKey, customNotes.
 */
public class SessionUtil {

    private static final String USER_KEY = "currentUser";
    private static final String GUEST_EDITS_KEY = "guestEdits";

    /**
     * Check if the current session belongs to a guest (no user logged in).
     */
    public static boolean isGuest(HttpSession session) {
        return session == null || session.getAttribute(USER_KEY) == null;
    }

    /**
     * Shorthand to get the User from request session.
     */
    public static User getUser(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) return null;
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute(USER_KEY);
    }

    /**
     * Check if the current session belongs to a logged-in user.
     */
    public static boolean isUser(HttpSession session) {
        if (session == null) return false;
        User user = (User) session.getAttribute(USER_KEY);
        return user != null && "user".equals(user.getRole());
    }

    /**
     * Check if the current session belongs to an admin.
     */
    public static boolean isAdmin(HttpSession session) {
        if (session == null) return false;
        User user = (User) session.getAttribute(USER_KEY);
        return user != null && "admin".equals(user.getRole());
    }

    /**
     * Get the current logged-in user from session, or null if guest.
     */
    public static User getCurrentUser(HttpSession session) {
        if (session == null) return null;
        return (User) session.getAttribute(USER_KEY);
    }

    /**
     * Save guest edits to session. Never touches the database.
     * Bug #14 fix: Added customNotes to capture guest annotations.
     */
    @SuppressWarnings("unchecked")
    public static void saveGuestEdits(HttpSession session, int songId,
                                       String customChords, String customLyrics, 
                                       String customKey, String customNotes) {
        if (session == null) return;

        Map<Integer, Map<String, String>> guestEdits =
                (Map<Integer, Map<String, String>>) session.getAttribute(GUEST_EDITS_KEY);

        if (guestEdits == null) {
            guestEdits = new HashMap<>();
        }

        Map<String, String> songEdits = new HashMap<>();
        songEdits.put("customChords", customChords);
        songEdits.put("customLyrics", customLyrics);
        songEdits.put("customKey", customKey);
        songEdits.put("customNotes", customNotes);

        guestEdits.put(songId, songEdits);
        session.setAttribute(GUEST_EDITS_KEY, guestEdits);
    }

    /**
     * Get guest edits for a specific song from session.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, String> getGuestEdits(HttpSession session, int songId) {
        if (session == null) return null;

        Map<Integer, Map<String, String>> guestEdits =
                (Map<Integer, Map<String, String>>) session.getAttribute(GUEST_EDITS_KEY);

        if (guestEdits == null) return null;
        return guestEdits.get(songId);
    }

    /**
     * Get all guest edits from session.
     */
    @SuppressWarnings("unchecked")
    public static Map<Integer, Map<String, String>> getAllGuestEdits(HttpSession session) {
        if (session == null) return null;
        return (Map<Integer, Map<String, String>>) session.getAttribute(GUEST_EDITS_KEY);
    }

    /**
     * Migrate all guest session edits to the user_songs table.
     * Called after a guest registers — transfers session edits to their new account.
     * After migration, clears guest edits from session.
     */
    @SuppressWarnings("unchecked")
    public static void migrateGuestEditsToAccount(HttpSession session, int userId, UserSongDAO userSongDAO) {
        if (session == null) return;

        Map<Integer, Map<String, String>> guestEdits =
                (Map<Integer, Map<String, String>>) session.getAttribute(GUEST_EDITS_KEY);

        if (guestEdits == null || guestEdits.isEmpty()) return;

        for (Map.Entry<Integer, Map<String, String>> entry : guestEdits.entrySet()) {
            int songId = entry.getKey();
            Map<String, String> edits = entry.getValue();

            UserSong us = new UserSong();
            us.setUserId(userId);
            us.setSongId(songId);
            us.setCustomKey(edits.get("customKey"));
            us.setCustomChords(edits.get("customChords"));
            us.setCustomLyrics(edits.get("customLyrics"));
            us.setCustomNotes(edits.get("customNotes"));

            userSongDAO.saveUserVersion(us);
        }

        // Clear guest edits from session after migration
        clearGuestEdits(session);
    }

    /**
     * Clear all guest edits from session.
     */
    public static void clearGuestEdits(HttpSession session) {
        if (session != null) {
            session.removeAttribute(GUEST_EDITS_KEY);
        }
    }

    /**
     * Store transpose offset in session when navigating from setlist to song view.
     * This allows the setlist to pass transposition state to the song view.
     * @param session HttpSession to store in
     * @param songId Song ID being transposed
     * @param semitones Number of semitones to transpose (can be negative)
     */
    public static void setSetlistTranspose(HttpSession session, int songId, int semitones) {
        if (session == null) return;
        String key = "setlist_transpose_" + songId;
        session.setAttribute(key, semitones);
    }

    /**
     * Retrieve transpose offset from session for a song coming from setlist.
     * @param session HttpSession to read from
     * @param songId Song ID to check
     * @return semitones to transpose, or 0 if not set
     */
    public static int getSetlistTranspose(HttpSession session, int songId) {
        if (session == null) return 0;
        String key = "setlist_transpose_" + songId;
        Object value = session.getAttribute(key);
        if (value instanceof Integer) {
            return (Integer) value;
        }
        return 0;
    }

    /**
     * Clear transpose state for a song (after viewing).
     * @param session HttpSession to clear from
     * @param songId Song ID to clear transpose for
     */
    public static void clearSetlistTranspose(HttpSession session, int songId) {
        if (session == null) return;
        String key = "setlist_transpose_" + songId;
        session.removeAttribute(key);
    }
}
