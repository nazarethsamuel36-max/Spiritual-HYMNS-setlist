package com.worship.servlet;

import com.worship.dao.ReportDAO;
import com.worship.model.ChordReport;
import com.worship.util.SessionUtil;
import com.worship.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Handles chord accuracy report submissions.
 * Works for both guest (userId null) and logged-in users.
 * Bug #17 fix: Added try-catch for songId parsing to prevent 500 error on invalid input.
 */
@WebServlet(name = "ReportServlet", urlPatterns = {"/song/report"})
public class ReportServlet extends HttpServlet {

    private ReportDAO reportDAO = new ReportDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String songIdStr = request.getParameter("songId");
        String reason = request.getParameter("reason");
        String suggestion = request.getParameter("suggestion");

        response.setContentType("application/json;charset=UTF-8");

        if (songIdStr == null || reason == null || reason.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"songId and reason are required\"}");
            return;
        }

        int songId;
        try {
            songId = Integer.parseInt(songIdStr.trim());
        } catch (NumberFormatException e) {
            // Bug #17 fix: Return 400 Bad Request instead of crashing with 500
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"success\":false,\"error\":\"Invalid songId format\"}");
            return;
        }

        ChordReport report = new ChordReport();
        report.setSongId(songId);
        report.setReason(reason.trim());
        report.setSuggestion(suggestion != null ? suggestion.trim() : null);

        // Set userId if logged in, null for guests
        User user = SessionUtil.getCurrentUser(request.getSession(false));
        if (user != null) {
            report.setUserId(user.getId());
        }

        boolean success = reportDAO.submitReport(report);

        if (success) {
            response.getWriter().write("{\"success\":true,\"message\":\"Thank you, admin has been notified\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false,\"error\":\"Failed to submit report\"}");
        }
    }
}
