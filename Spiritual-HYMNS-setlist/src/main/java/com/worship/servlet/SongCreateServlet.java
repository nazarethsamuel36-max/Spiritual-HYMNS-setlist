package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.worship.model.User;
import com.worship.util.SessionUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Handles creation of NEW songs for the user's personal/master library.
 * Accessible to any logged-in user.
 */
@WebServlet(name = "SongCreateServlet", urlPatterns = {"/song/add"})
public class SongCreateServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Ensure user is logged in
        User user = SessionUtil.getUser(request);
        if (user == null) {
            response.sendRedirect(request.getContextPath() + "/login?error=Session expired");
            return;
        }

        request.getRequestDispatcher("/jsp/songCreate.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        User user = SessionUtil.getUser(request);
        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String title = request.getParameter("title");
        String artist = request.getParameter("artist");
        String key = request.getParameter("key");
        String language = request.getParameter("language");
        String chords = request.getParameter("chords");

        if (title == null || title.trim().isEmpty()) {
            request.setAttribute("error", "Title is required");
            request.getRequestDispatcher("/jsp/songCreate.jsp").forward(request, response);
            return;
        }

        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist);
        song.setOriginalKey(key);
        song.setLanguage(language != null ? language : "english");
        song.setChords(chords);
        song.setCreatedBy(user.getId());
        song.setActive(true);

        if (songDAO.addSong(song)) {
            response.sendRedirect(request.getContextPath() + "/song?id=" + song.getId());
        } else {
            request.setAttribute("error", "Failed to save song. Possibly a duplicate title?");
            request.getRequestDispatcher("/jsp/songCreate.jsp").forward(request, response);
        }
    }
}
