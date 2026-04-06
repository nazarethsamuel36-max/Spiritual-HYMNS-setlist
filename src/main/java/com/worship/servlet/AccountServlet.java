package com.worship.servlet;

import com.worship.dao.UserDAO;
import com.worship.dao.UserSongDAO;
import com.worship.model.User;
import com.worship.model.UserSong;
import com.worship.util.SessionUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

/**
 * Handles user account page — profile view, edit, and personal song versions.
 * Bug #22 fix: Replaced unsafe session attribute casts with safe null checks 
 * and used User object identity to prevent NullPointerException on session timeout.
 */
@WebServlet(name = "AccountServlet", urlPatterns = {"/account"})
public class AccountServlet extends HttpServlet {

    private UserDAO userDAO = new UserDAO();
    private UserSongDAO userSongDAO = new UserSongDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        User user = SessionUtil.getCurrentUser(session);
        
        if (user == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        // Bug #22 fix: No longer casting potentially null attribute directly
        int userId = user.getId();
        List<UserSong> userSongs = userSongDAO.getAllUserVersions(userId);

        request.setAttribute("user", user);
        request.setAttribute("userSongs", userSongs);
        request.getRequestDispatcher("/jsp/myAccount.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        User user = SessionUtil.getCurrentUser(session);
        
        if (user == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        // Update profile fields
        String email = request.getParameter("email");
        String churchName = request.getParameter("churchName");
        String instrument = request.getParameter("instrument");
        String defaultKey = request.getParameter("defaultKey");

        if (email != null && !email.trim().isEmpty()) {
            user.setEmail(email.trim());
        }
        user.setChurchName(churchName != null ? churchName.trim() : null);
        user.setInstrument(instrument != null ? instrument.trim() : null);
        user.setDefaultKey(defaultKey != null ? defaultKey.trim() : null);

        boolean updated = userDAO.updateUser(user);

        if (updated) {
            // Refresh session user object
            session.setAttribute("currentUser", user);
            request.setAttribute("success", "Profile updated successfully.");
        } else {
            request.setAttribute("error", "Profile update failed.");
        }

        List<UserSong> userSongs = userSongDAO.getAllUserVersions(user.getId());
        request.setAttribute("user", user);
        request.setAttribute("userSongs", userSongs);
        request.getRequestDispatcher("/jsp/myAccount.jsp").forward(request, response);
    }
}
