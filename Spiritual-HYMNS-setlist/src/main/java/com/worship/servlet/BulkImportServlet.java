package com.worship.servlet;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.dao.SongDAO;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;
import com.worship.model.User;
import com.worship.util.SessionUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Admin Servlet for Bulk JSON Extraction/Import into DB.
 */
@WebServlet(name = "BulkImportServlet", urlPatterns = {"/admin/bulk-import"})
public class BulkImportServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        if (!isAdmin(request)) {
            response.sendRedirect(request.getContextPath() + "/songs");
            return;
        }

        request.getRequestDispatcher("/jsp/admin/bulkImport.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        if (!isAdmin(request)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Admin access required.");
            return;
        }

        String action = request.getParameter("action");
        String jsonInput = request.getParameter("jsonInput");

        if (jsonInput == null || jsonInput.trim().isEmpty()) {
            request.setAttribute("errorMsg", "JSON input cannot be empty.");
            request.getRequestDispatcher("/jsp/admin/bulkImport.jsp").forward(request, response);
            return;
        }

        try {
            // 1. Parse and Validate
            List<Map<String, Object>> rawData = mapper.readValue(jsonInput, new TypeReference<List<Map<String, Object>>>() {});
            List<Song> parsedSongs = new ArrayList<>();
            List<String> validationErrors = new ArrayList<>();

            int index = 1;
            for (Map<String, Object> data : rawData) {
                try {
                    Song song = new Song();
                    
                    // Optional field safely parsed
                    if (data.get("number") != null) {
                        song.setSongNumber((Integer) data.get("number"));
                    } else {
                        song.setSongNumber(0);
                    }

                    if (data.get("title") == null || ((String) data.get("title")).trim().isEmpty()) {
                        throw new Exception("Title is missing or empty.");
                    }
                    song.setTitle((String) data.get("title"));

                    String lang = (String) data.get("language");
                    song.setLanguage(lang != null ? lang.toLowerCase() : "english");
                    song.setBook("prime_songbook"); // Enforcement layer logic
                    
                    User adminUser = SessionUtil.getCurrentUser(request.getSession(false));
                    song.setCreatedBy(adminUser != null ? adminUser.getId() : 1);

                    List<Map<String, Object>> sectionsData = (List<Map<String, Object>>) data.get("sections");
                    if (sectionsData == null || sectionsData.isEmpty()) {
                        throw new Exception("No sections found for song.");
                    }

                    List<Section> sections = new ArrayList<>();
                    for (Map<String, Object> secMap : sectionsData) {
                        Section section = new Section();
                        section.setType((String) secMap.get("type"));
                        section.setLabel((String) secMap.get("label"));

                        List<String> linesText = (List<String>) secMap.get("lines");
                        if (linesText == null) linesText = new ArrayList<>();
                        
                        List<SongLine> lines = new ArrayList<>();
                        for (int i = 0; i < linesText.size(); i++) {
                            lines.add(new SongLine(linesText.get(i), i + 1));
                        }
                        section.setLines(lines);
                        sections.add(section);
                    }
                    song.setSections(sections);
                    parsedSongs.add(song);

                } catch (Exception e) {
                    validationErrors.add("Error in item #" + index + ": " + e.getMessage());
                }
                index++;
            }

            // 2. Action Routing
            if (!validationErrors.isEmpty()) {
                request.setAttribute("validationErrors", validationErrors);
                request.setAttribute("jsonInput", jsonInput);
                request.getRequestDispatcher("/jsp/admin/bulkImport.jsp").forward(request, response);
                return;
            }

            if ("preview".equals(action)) {
                request.setAttribute("parsedSongs", parsedSongs);
                request.setAttribute("jsonInput", jsonInput);
                request.setAttribute("previewMode", true);
                request.getRequestDispatcher("/jsp/admin/bulkImport.jsp").forward(request, response);

            } else if ("commit".equals(action)) {
                int successCount = 0;
                for (Song song : parsedSongs) {
                    if (songDAO.addSongWithStructure(song)) {
                        successCount++;
                    }
                }
                request.setAttribute("successMsg", "Successfully imported " + successCount + " out of " + parsedSongs.size() + " songs into the prime_songbook.");
                request.getRequestDispatcher("/jsp/admin/bulkImport.jsp").forward(request, response);
            }

        } catch (Exception e) {
            request.setAttribute("errorMsg", "Invalid JSON syntax: " + e.getMessage());
            request.setAttribute("jsonInput", jsonInput);
            request.getRequestDispatcher("/jsp/admin/bulkImport.jsp").forward(request, response);
        }
    }

    private boolean isAdmin(HttpServletRequest request) {
        User user = SessionUtil.getCurrentUser(request.getSession(false));
        return user != null && "admin".equalsIgnoreCase(user.getRole());
    }
}
