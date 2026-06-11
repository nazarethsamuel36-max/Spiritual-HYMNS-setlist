package com.worship.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worship.service.NumberSearchService;
import com.worship.service.SearchService;
import com.worship.service.SearchService.SearchServiceException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "LiveSearchServlet", urlPatterns = {"/api/live-search", "/live-search"})
public class LiveSearchServlet extends HttpServlet {

    private SearchService searchService = new SearchService();
    private NumberSearchService numberSearchService = new NumberSearchService();
    private com.worship.dao.SongDAO songDAO = new com.worship.dao.SongDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * STABILIZATION: New optimized GET path for Live Search Suggestions.
     * Path: GET /live-search?q=...
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setContentType("application/json;charset=UTF-8");

        String query = request.getParameter("q");
        if (query == null || query.trim().length() < 2) {
            objectMapper.writeValue(response.getWriter(), createEmptyResponse(null));
            return;
        }

        String trimmedQuery = query.trim();
        Map<String, Object> result;

        // 1. Query Classification (Numeric vs Text)
        if (trimmedQuery.matches("^\\d+$")) {
            result = numberSearchService.search(trimmedQuery, "All");
        } else {
            // 2. Live Search Matching (Prefix-based, lightweight)
            List<com.worship.model.Song> suggestions = songDAO.searchLiveSuggestions(trimmedQuery, 10);
            result = new HashMap<>();
            result.put("results", suggestions);
            result.put("totalCount", suggestions.size());
        }

        objectMapper.writeValue(response.getWriter(), result);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setContentType("application/json;charset=UTF-8");

        try {
            JsonNode root = objectMapper.readTree(request.getInputStream());
            String query = root.has("query") ? root.get("query").asText() : "";
            String type = root.has("type") ? root.get("type").asText() : "text";
            String language = root.has("language") ? root.get("language").asText() : null;
            
            // Unique request ID handling (usually handled client side by ignoring old responses)
            String requestId = root.has("requestId") ? root.get("requestId").asText() : null;

            // STABILIZATION: Block queries < 2 chars to prevent noisy results
            if (query == null || query.trim().isEmpty() || query.trim().length() < 2) {
                objectMapper.writeValue(response.getWriter(), createEmptyResponse(requestId));
                return;
            }

            Map<String, Object> serviceResult;
            String trimmedQuery = query.trim();
            
            // STEP 4: QUERY CLASSIFICATION (Numeric vs Text)
            if ("number".equals(type) || trimmedQuery.matches("^\\d+$")) {
                serviceResult = numberSearchService.search(trimmedQuery, language);
            } else {
                serviceResult = searchService.search(trimmedQuery, 1, 20);
            }
            
            if (requestId != null) {
                serviceResult.put("requestId", requestId);
            }

            response.setStatus(HttpServletResponse.SC_OK);
            objectMapper.writeValue(response.getWriter(), serviceResult);

        } catch (SearchServiceException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            objectMapper.writeValue(response.getWriter(), error);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            objectMapper.writeValue(response.getWriter(), error);
            e.printStackTrace();
        }
    }

    private Map<String, Object> createEmptyResponse(String requestId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("results", java.util.Collections.emptyList());
        payload.put("totalCount", 0);
        if (requestId != null) {
            payload.put("requestId", requestId);
        }
        return payload;
    }
}
