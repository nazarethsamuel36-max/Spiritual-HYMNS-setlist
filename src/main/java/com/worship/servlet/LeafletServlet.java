package com.worship.servlet;

import com.worship.dao.LeafletDAO;
import com.worship.dao.SongDAO;
import com.worship.model.Leaflet;
import com.worship.model.Song;
import com.worship.util.SessionUtil;
import com.worship.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * Leaflet builder servlet for occasion-based song collections.
 * Bug #16 fix: Added safe parsing for leaflet print and save IDs.
 * Bug #19 fix: Added auth check to handleSave to prevent orphaned data (userId=0).
 * Bug #42 fix: Implemented real occasion fetching.
 */
@WebServlet(name = "LeafletServlet", urlPatterns = {"/leaflet", "/leaflet/*"})
public class LeafletServlet extends HttpServlet {

    private LeafletDAO leafletDAO = new LeafletDAO();
    private SongDAO songDAO = new SongDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/new":
                request.getRequestDispatcher("/jsp/leaflet/leafletBuilder.jsp").forward(request, response);
                break;

            case "/print":
                int printId = getIntParam(request, "id");
                if (printId <= 0) {
                    response.sendRedirect(request.getContextPath() + "/leaflet/new");
                    return;
                }
                Leaflet printLeaflet = leafletDAO.getLeafletById(printId);
                request.setAttribute("leaflet", printLeaflet);
                request.getRequestDispatcher("/jsp/leaflet/leafletPrint.jsp").forward(request, response);
                break;

            case "/my":
                User user = SessionUtil.getCurrentUser(request.getSession(false));
                if (user == null) {
                    response.sendRedirect(request.getContextPath() + "/login");
                    return;
                }
                List<Leaflet> userLeaflets = leafletDAO.getUserLeaflets(user.getId());
                request.setAttribute("leaflets", userLeaflets);
                request.getRequestDispatcher("/jsp/leaflet/myLeaflets.jsp").forward(request, response);
                break;

            case "/occasions":
                // Bug #42 fix: Return real occasions from database
                response.setContentType("application/json;charset=UTF-8");
                List<Map<String, Object>> occasions = leafletDAO.getAllOccasions();
                objectMapper.writeValue(response.getWriter(), occasions);
                break;

            default:
                response.sendRedirect(request.getContextPath() + "/leaflet/new");
                break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/suggestions":
                handleSuggestions(request, response);
                break;

            case "/save":
                handleSave(request, response);
                break;

            default:
                response.sendRedirect(request.getContextPath() + "/leaflet/new");
                break;
        }
    }

    private void handleSuggestions(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String hashtags = request.getParameter("hashtags");
        if (hashtags == null || hashtags.isEmpty()) {
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("[]");
            return;
        }

        List<String> hashtagList = Arrays.asList(hashtags.split(","));
        List<Song> songs = songDAO.getSongsByOccasion(hashtagList);

        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), songs);
    }

    private void handleSave(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        User user = SessionUtil.getCurrentUser(request.getSession(false));
        // Bug #19 fix: Require login to save a leaflet
        if (user == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        int occasionId = getIntParam(request, "occasionId");
        if (occasionId <= 0) {
            response.sendRedirect(request.getContextPath() + "/leaflet/new?error=missing_occasion");
            return;
        }

        Leaflet leaflet = new Leaflet();
        leaflet.setUserId(user.getId());
        leaflet.setOccasionId(occasionId);
        leaflet.setTitle(request.getParameter("title"));
        leaflet.setHeaderData(request.getParameter("headerData"));
        leaflet.setPrintType(request.getParameter("printType"));

        int leafletId = leafletDAO.createLeaflet(leaflet);

        if (leafletId > 0) {
            String[] songIds = request.getParameterValues("songIds");
            String[] isHeaders = request.getParameterValues("isHeader");
            String[] headerTexts = request.getParameterValues("headerText");
            String[] customKeys = request.getParameterValues("customKeys");

            if (songIds != null) {
                for (int i = 0; i < songIds.length; i++) {
                    boolean isHeader = isHeaders != null && i < isHeaders.length && "true".equals(isHeaders[i]);
                    
                    if (isHeader) {
                        String text = (headerTexts != null && i < headerTexts.length) ? headerTexts[i] : "Divider";
                        leafletDAO.addHeaderToLeaflet(leafletId, text, i + 1);
                    } else {
                        int songId = safeParseInt(songIds[i], 0);
                        if (songId > 0) {
                            String key = (customKeys != null && i < customKeys.length) ? customKeys[i] : null;
                            leafletDAO.addSongToLeaflet(leafletId, songId, i + 1, key);
                        }
                    }
                }
            }

            response.sendRedirect(request.getContextPath() + "/leaflet/print?id=" + leafletId);
        } else {
            response.sendRedirect(request.getContextPath() + "/leaflet/new?error=save_failed");
        }
    }

    private int getIntParam(HttpServletRequest request, String name) {
        return safeParseInt(request.getParameter(name), 0);
    }

    private int safeParseInt(String val, int defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}
