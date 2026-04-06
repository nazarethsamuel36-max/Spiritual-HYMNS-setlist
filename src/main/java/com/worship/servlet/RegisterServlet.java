package com.worship.servlet;

import com.worship.dao.UserDAO;
import com.worship.dao.UserSongDAO;
import com.worship.model.User;
import com.worship.util.SessionUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Handles new user registration.
 * Bug #3 fix: Upgraded to BCrypt password hashing for secure storage.
 * On successful registration: migrates guest session edits to the new account.
 */
@WebServlet(name = "RegisterServlet", urlPatterns = {"/register"})
public class RegisterServlet extends HttpServlet {

    private UserDAO userDAO = new UserDAO();
    private UserSongDAO userSongDAO = new UserSongDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/jsp/register.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String churchName = request.getParameter("churchName");

        // Validate inputs
        if (username == null || email == null || password == null ||
                username.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty()) {
            request.setAttribute("error", "Username, email, and password are required.");
            request.getRequestDispatcher("/jsp/register.jsp").forward(request, response);
            return;
        }

        if (password.length() < 6) {
            request.setAttribute("error", "Password must be at least 6 characters.");
            request.getRequestDispatcher("/jsp/register.jsp").forward(request, response);
            return;
        }

        // Check if username already exists
        if (userDAO.findByUsername(username.trim()) != null) {
            request.setAttribute("error", "Username already taken.");
            request.getRequestDispatcher("/jsp/register.jsp").forward(request, response);
            return;
        }

        // Check if email already exists
        if (userDAO.findByEmail(email.trim()) != null) {
            request.setAttribute("error", "Email already registered.");
            request.getRequestDispatcher("/jsp/register.jsp").forward(request, response);
            return;
        }

        // Create user with BCrypt hashed password (Bug #3 fix)
        User user = new User();
        user.setUsername(username.trim());
        user.setEmail(email.trim());
        
        // BCrypt salt + hash
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(12));
        user.setPassword(hashedPassword);
        
        user.setRole("user");
        user.setChurchName(churchName != null ? churchName.trim() : null);

        boolean created = userDAO.createUser(user);

        if (created) {
            // Get the session (preserves guest edits)
            HttpSession session = request.getSession(true);

            // Migrate guest edits to the new user's account
            SessionUtil.migrateGuestEditsToAccount(session, user.getId(), userSongDAO);

            // Set session attributes for auto-login
            session.setAttribute("currentUser", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("role", user.getRole());

            response.sendRedirect(request.getContextPath() + "/songs");
        } else {
            request.setAttribute("error", "Registration failed. Please try again.");
            request.getRequestDispatcher("/jsp/register.jsp").forward(request, response);
        }
    }
}
