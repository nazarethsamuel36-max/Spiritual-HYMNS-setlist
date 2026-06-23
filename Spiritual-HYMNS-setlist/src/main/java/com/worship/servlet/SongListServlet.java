package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.worship.service.SearchService;
import com.worship.service.SearchService.SearchServiceException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Servlet for listing and filtering songs.
 * Supports search, hashtag, language, and key filtering.
 */
@WebServlet(name = "SongListServlet", urlPatterns = {"/songs"})
public class SongListServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private SearchService searchService = new SearchService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String query = request.getParameter("q");
        String hashtag = request.getParameter("hashtag");
        String language = request.getParameter("language");
        String key = request.getParameter("key");

        String filter = request.getParameter("filter");
        String sortBy = request.getParameter("sortBy");

        List<Song> songs;
        com.worship.model.User user = com.worship.util.SessionUtil.getUser(request);

        if (query != null && !query.trim().isEmpty()) {
            try {
                Map<String, Object> result = searchService.search(query.trim(), 1, 100);
                songs = (List<Song>) result.get("results");
            } catch (SearchServiceException e) {
                throw new ServletException("Unable to search songs", e);
            }
            request.setAttribute("searchQuery", query.trim());
        } else if ("personal".equals(filter) && user != null) {
            songs = songDAO.getSongsByUser(user.getId());
            request.setAttribute("filter", "personal");
        } else if (hashtag != null && !hashtag.trim().isEmpty()) {
            songs = songDAO.getSongsByHashtag(hashtag.trim());
            request.setAttribute("filterHashtag", hashtag.trim());
        } else if (language != null && !language.trim().isEmpty()) {
            songs = songDAO.getSongsByLanguage(language.trim());
            request.setAttribute("filterLanguage", language.trim());
        } else if (key != null && !key.trim().isEmpty()) {
            songs = songDAO.getSongsByKey(key.trim());
            request.setAttribute("filterKey", key.trim());
        } else if ("popular".equals(sortBy)) {
            songs = songDAO.getSongsSortedByViews();
            request.setAttribute("sortBy", "popular");
        } else {
            songs = songDAO.getAllSongs();
        }

        request.setAttribute("songs", songs);
        request.getRequestDispatcher("/jsp/songList.jsp").forward(request, response);
    }
}
