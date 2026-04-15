package com.worship.servlet;

import com.worship.service.SearchService;
import com.worship.service.SearchService.SearchServiceException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

/**
 * SearchServlet - HTTP endpoint for song search.
 * Per IMPLEMENTATION_BLUEPRINT: Controller layer responsibilities:
 * 1. Parse HTTP request parameters
 * 2. Validate input format and presence
 * 3. Delegate to service layer
 * 4. Format HTTP response
 * 5. Set HTTP status codes and headers
 * 
 * CRITICAL: No business logic here. That lives in SearchService.
 * Servlet ONLY handles HTTP concerns.
 */
@WebServlet(name = "SearchServlet", urlPatterns = {"/search"})
public class SearchServlet extends HttpServlet {

    private SearchService searchService = new SearchService();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Prevent caching of search results
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        response.setHeader("Vary", "Accept");

        // STEP 1: PARSE INPUT
        String query = request.getParameter("q");
        String pageParam = request.getParameter("page");
        String sizeParam = request.getParameter("size");
        String acceptHeader = request.getHeader("Accept");
        boolean expectsJson = (acceptHeader != null && acceptHeader.contains("application/json"));

        // STEP 2: VALIDATE INPUT FORMAT
        int pageNum = 1;
        int pageSize = 20;
        
        if (pageParam != null) {
            try {
                pageNum = Integer.parseInt(pageParam);
            } catch (NumberFormatException e) {
                pageNum = 1;
            }
        }
        
        if (sizeParam != null) {
            try {
                pageSize = Integer.parseInt(sizeParam);
                if (pageSize < 1 || pageSize > 100) pageSize = 20;
            } catch (NumberFormatException e) {
                pageSize = 20;
            }
        }

        // STEP 3: HANDLE EMPTY QUERY
        if (query == null || query.trim().isEmpty()) {
            if (expectsJson) {
                response.setContentType("application/json;charset=UTF-8");
                objectMapper.writeValue(response.getWriter(), createEmptyJsonResponse(pageNum, pageSize));
            } else {
                request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
            }
            return;
        }

        // STEP 4: DELEGATE TO SERVICE
        Map<String, Object> serviceResult;
        try {
            serviceResult = searchService.search(query.trim(), pageNum, pageSize);
        } catch (SearchServiceException e) {
            // Service validation error → HTTP 400
            if (expectsJson) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("application/json;charset=UTF-8");
                Map<String, String> error = new HashMap<>();
                error.put("error", e.getMessage());
                objectMapper.writeValue(response.getWriter(), error);
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            }
            return;
        } catch (Exception e) {
            // Unexpected error → HTTP 500
            if (expectsJson) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setContentType("application/json;charset=UTF-8");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Internal server error");
                objectMapper.writeValue(response.getWriter(), error);
            } else {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
            }
            e.printStackTrace();
            return;
        }

        // STEP 5: FORMAT RESPONSE
        if (expectsJson) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json;charset=UTF-8");
            objectMapper.writeValue(response.getWriter(), serviceResult);
        } else {
            request.setAttribute("searchResults", serviceResult.get("results"));
            request.setAttribute("searchQuery", query);
            request.setAttribute("paginationInfo", serviceResult);
            request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
        }
    }

    private Map<String, Object> createEmptyJsonResponse(int pageNum, int pageSize) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("results", Collections.emptyList());
        payload.put("pageNum", pageNum);
        payload.put("pageSize", pageSize);
        payload.put("totalCount", 0);
        payload.put("hasMore", false);
        return payload;
    }
}
