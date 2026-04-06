package com.worship.servlet;

import com.worship.dao.SetlistDAO;
import com.worship.model.Setlist;
import com.worship.model.SetlistSong;
import com.worship.model.User;
import com.worship.util.ChordParser;
import com.worship.util.ChordTransposer;
import com.worship.util.SessionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * Handles setlist management and sharing.
 * Bug #8 fix: No longer hijacks position field for transposition offset.
 * Bug #18 fix: Fixed content-type mismatch on delete redirect.
 * Bug #30 fix: Added XSS protection/HTML escaping for shared view.
 * Bug #31 fix: Added safe integer parsing for setlist operations.
 */
@WebServlet(name = "SetlistServlet", urlPatterns = {"/setlist/*"})
public class SetlistServlet extends HttpServlet {

    private SetlistDAO setlistDAO = new SetlistDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    // Enharmonic mapping for offset calculation (matches ChordTransposer modern scale)
    private static final String[] CHORD_ORDER = { "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B" };
    private static final Map<String, Integer> NAME_TO_INDEX = new HashMap<>();
    static {
        NAME_TO_INDEX.put("C", 0);  NAME_TO_INDEX.put("B#", 0);
        NAME_TO_INDEX.put("C#", 1); NAME_TO_INDEX.put("Db", 1);
        NAME_TO_INDEX.put("D", 2);
        NAME_TO_INDEX.put("D#", 3); NAME_TO_INDEX.put("Eb", 3);
        NAME_TO_INDEX.put("E", 4);  NAME_TO_INDEX.put("Fb", 4);
        NAME_TO_INDEX.put("F", 5);  NAME_TO_INDEX.put("E#", 5);
        NAME_TO_INDEX.put("F#", 6); NAME_TO_INDEX.put("Gb", 6);
        NAME_TO_INDEX.put("G", 7);
        NAME_TO_INDEX.put("G#", 8); NAME_TO_INDEX.put("Ab", 8);
        NAME_TO_INDEX.put("A", 9);
        NAME_TO_INDEX.put("A#", 10); NAME_TO_INDEX.put("Bb", 10);
        NAME_TO_INDEX.put("B", 11);  NAME_TO_INDEX.put("Cb", 11);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getPathInfo();
        if (path == null) path = "/my";

        if (path.startsWith("/shared/")) {
            handleSharedView(request, response, path);
            return;
        }

        User user = SessionUtil.getCurrentUser(request.getSession(false));
        if (user == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        if ("/my".equals(path)) {
            List<Setlist> list = setlistDAO.getSetlistsByUser(user.getId());
            request.setAttribute("setlists", list);
            request.getRequestDispatcher("/jsp/setlist/mySetlists.jsp").forward(request, response);
        } else if ("/new".equals(path)) {
            request.getRequestDispatcher("/jsp/setlist/createSetlist.jsp").forward(request, response);
        } else {
            int id = getIntFromPath(path);
            if (id > 0) {
                Setlist s = setlistDAO.getSetlistById(id);
                if (s == null || s.getUserId() != user.getId()) {
                    response.sendRedirect(request.getContextPath() + "/setlist/my");
                    return;
                }
                List<SetlistSong> songs = setlistDAO.getSongsInSetlist(id);
                s.setSongs(songs);
                request.setAttribute("setlist", s);
                request.getRequestDispatcher("/jsp/setlist/setlistView.jsp").forward(request, response);
            } else {
                response.sendRedirect(request.getContextPath() + "/setlist/my");
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User user = SessionUtil.getCurrentUser(request.getSession(false));
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String path = request.getPathInfo();
        if ("/new".equals(path)) {
            String title = request.getParameter("title");
            String occasion = request.getParameter("occasion");
            int id = setlistDAO.createSetlist(user.getId(), title, occasion);
            response.sendRedirect(request.getContextPath() + "/setlist/" + id);
            return;
        }

        String[] parts = path.split("/");
        if (parts.length < 3) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        int setlistId = safeParseInt(parts[1], 0);
        Setlist s = setlistDAO.getSetlistById(setlistId);
        if (s == null || s.getUserId() != user.getId()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        String action = parts[2];

        // Bug #18 fix: Delay setting content-type if we might redirect
        if ("delete".equals(action)) {
            setlistDAO.deleteSetlist(setlistId, user.getId());
            response.sendRedirect(request.getContextPath() + "/setlist/my");
            return;
        }

        response.setContentType("application/json");
        Map<String, Object> res = new HashMap<>();
        try {
            switch (action) {
                case "add":
                    // Bug #31 fix: Safe parsing for integers
                    int addSongId = safeParseInt(request.getParameter("songId"), 0);
                    int pos = safeParseInt(request.getParameter("position"), 0);
                    String creatorKey = request.getParameter("creatorKey");
                    int creatorCapo = safeParseInt(request.getParameter("creatorCapo"), 0);
                    boolean added = (addSongId > 0) && setlistDAO.addSongToSetlist(setlistId, addSongId, pos, creatorKey, creatorCapo);
                    res.put("success", added);
                    break;
                case "remove":
                    int remSongId = safeParseInt(request.getParameter("songId"), 0);
                    boolean removed = (remSongId > 0) && setlistDAO.removeSongFromSetlist(setlistId, remSongId);
                    res.put("success", removed);
                    break;
                case "reorder":
                    List<Integer> orderedIds = objectMapper.readValue(request.getInputStream(), List.class);
                    boolean reordered = setlistDAO.reorderSongs(setlistId, orderedIds);
                    res.put("success", reordered);
                    break;
                case "key":
                    int keySongId = safeParseInt(request.getParameter("songId"), 0);
                    String activeKey = request.getParameter("key");
                    int activeCapo = safeParseInt(request.getParameter("capo"), 0);
                    boolean keyed = (keySongId > 0) && setlistDAO.updateSongKey(setlistId, keySongId, activeKey, activeCapo);
                    res.put("success", keyed);
                    break;
                case "share":
                    String token = setlistDAO.generateShareToken(setlistId);
                    if (token != null) {
                        res.put("success", true);
                        res.put("url", getBaseUrl(request) + "/setlist/shared/" + token);
                    } else {
                        res.put("success", false);
                    }
                    break;
                default:
                    res.put("success", false);
                    res.put("error", "Unknown action");
            }
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", e.getMessage());
        }

        objectMapper.writeValue(response.getWriter(), res);
    }

    private void handleSharedView(HttpServletRequest request, HttpServletResponse response, String path) throws ServletException, IOException {
        String token = path.substring("/shared/".length());
        Setlist s = setlistDAO.getSetlistByToken(token);
        if (s == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Setlist not found or not public.");
            return;
        }

        List<SetlistSong> songs = setlistDAO.getSongsInSetlist(s.getId());
        for (SetlistSong ss : songs) {
            int offset = calculateSemitoneOffset(ss.getOriginalKey(), ss.getCreatorKey());
            
            if (ss.getLyricsChords() != null && !ss.getLyricsChords().isEmpty()) {
                String transposedRaw = ChordTransposer.transposeSong(ss.getLyricsChords(), offset);
                List<String[]> parsed = ChordParser.parseFullSong(transposedRaw);
                // Bug #30 fix: renderHtmlFromParsedLines now escapes HTML
                String htmlPayload = renderHtmlFromParsedLines(parsed);
                ss.setLyricsChords(htmlPayload);
                
                // Bug #8 fix: Use dedicated field instead of hijacking position
                ss.setTranspositionOffset(offset);
            }
        }
        s.setSongs(songs);
        request.setAttribute("setlist", s);
        request.getRequestDispatcher("/jsp/setlist/sharedSetlistView.jsp").forward(request, response);
    }

    private int calculateSemitoneOffset(String fromKey, String toKey) {
        if (fromKey == null || toKey == null) return 0;
        String rootFrom = fromKey.replaceAll("[^A-G#b]", "");
        String rootTo = toKey.replaceAll("[^A-G#b]", "");
        
        Integer idxFrom = NAME_TO_INDEX.get(rootFrom);
        Integer idxTo = NAME_TO_INDEX.get(rootTo);
        
        if (idxFrom == null || idxTo == null) return 0;
        return (idxTo - idxFrom + 12) % 12;
    }

    private String renderHtmlFromParsedLines(List<String[]> parsed) {
        StringBuilder sb = new StringBuilder();
        for (String[] pair : parsed) {
            // Bug #30 fix: Escape HTML to prevent XSS
            String chords = escapeHtml(pair[0]);
            String lyrics = escapeHtml(pair[1]);
            
            sb.append("<div class=\"song-line leading-tight whitespace-pre-wrap break-words\">\n");
            if (chords != null && !chords.trim().isEmpty()) {
                sb.append("  <div class=\"chord font-bold text-primary dark:text-blue-400 mt-2 font-mono\">").append(chords).append("</div>\n");
            }
            if (lyrics != null && !lyrics.isEmpty()) {
                sb.append("  <div class=\"lyric text-on-surface dark:text-slate-200 mt-0.5\">").append(lyrics).append("</div>\n");
            }
            sb.append("</div>\n");
        }
        return sb.toString();
    }

    private String escapeHtml(String input) {
        if (input == null) return null;
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }

    private int getIntFromPath(String path) {
        if (path == null || path.length() < 2) return 0;
        return safeParseInt(path.substring(1), 0);
    }

    private int safeParseInt(String val, int defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }

    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();
        if (serverPort == 80 || serverPort == 443) {
            return scheme + "://" + serverName + contextPath;
        }
        return scheme + "://" + serverName + ":" + serverPort + contextPath;
    }
}
