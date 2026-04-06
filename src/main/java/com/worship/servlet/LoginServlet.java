package com.worship.servlet;

import com.worship.dao.UserDAO;
import com.worship.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import org.apache.commons.codec.digest.DigestUtils;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Handles user login and authentication.
 * Bug #2 fix: Upgraded to BCrypt password hashing with SHA-256 fallback for migration.
 */
@WebServlet(name = "LoginServlet", urlPatterns = {"/login"})
public class LoginServlet extends HttpServlet {

    private UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/jsp/login.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if (username == null || password == null ||
                username.trim().isEmpty() || password.trim().isEmpty()) {
            request.setAttribute("error", "Username and password are required.");
            request.getRequestDispatcher("/jsp/login.jsp").forward(request, response);
            return;
        }

        User user = userDAO.findByUsername(username.trim());

        if (user == null) {
            request.setAttribute("error", "Invalid username or password.");
            request.getRequestDispatcher("/jsp/login.jsp").forward(request, response);
            return;
        }

        boolean authenticated = false;
        String storedHash = user.getPassword();

        // 1. Try modern BCrypt
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$")) {
            try {
                authenticated = BCrypt.checkpw(password, storedHash);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
        
        // 2. Bug #2 migration: Fallback to SHA-256 if not a BCrypt hash
        if (!authenticated && storedHash.length() == 64) {
            String sha256Hash = DigestUtils.sha256Hex(password);
            if (sha256Hash.equals(storedHash)) {
                authenticated = true;
                // Upgrade to BCrypt immediately for next time
                String newBCryptHash = BCrypt.hashpw(password, BCrypt.gensalt(12));
                userDAO.updatePassword(user.getId(), newBCryptHash);
            }
        }

        if (!authenticated) {
            request.setAttribute("error", "Invalid username or password.");
            request.getRequestDispatcher("/jsp/login.jsp").forward(request, response);
            return;
        }

        // Set session attributes
        HttpSession session = request.getSession(true);
        session.setAttribute("currentUser", user);
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());

        response.sendRedirect(request.getContextPath() + "/songs");
    }
}
