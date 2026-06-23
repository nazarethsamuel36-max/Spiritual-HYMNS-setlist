package com.worship.servlet;

import com.worship.dao.UserSongDAO;
import com.worship.model.User;
import com.worship.util.SessionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Servlet for saving personal song annotations to user_songs.
 */
@WebServlet(name = "AnnotationServlet", urlPatterns = {"/song/annotate"})
public class AnnotationServlet extends HttpServlet {

    private UserSongDAO userSongDAO = new UserSongDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        Map<String, Object> result = new HashMap<>();

        User user = SessionUtil.getCurrentUser(request.getSession(false));
        if (user == null) {
            result.put("success", false);
            result.put("error", "You must be logged in to save notes.");
            objectMapper.writeValue(response.getWriter(), result);
            return;
        }

        try {
            int songId = Integer.parseInt(request.getParameter("songId"));
            String note = request.getParameter("note");

            if (note == null) note = "";
            note = note.trim();

            boolean success = userSongDAO.savePersonalNote(user.getId(), songId, note);
            
            if (success) {
                result.put("success", true);
                result.put("message", "Note saved successfully.");
            } else {
                result.put("success", false);
                result.put("error", "Database error occurred while saving.");
            }

        } catch (NumberFormatException e) {
            result.put("success", false);
            result.put("error", "Invalid song ID format.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "An unexpected error occurred.");
            e.printStackTrace();
        }

        objectMapper.writeValue(response.getWriter(), result);
    }
}
