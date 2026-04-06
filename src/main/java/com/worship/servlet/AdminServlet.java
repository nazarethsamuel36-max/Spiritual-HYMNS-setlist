package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.dao.UserDAO;
import com.worship.dao.ReportDAO;
import com.worship.model.Song;
import com.worship.model.User;
import com.worship.model.ChordReport;
import com.worship.util.SessionUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Admin panel servlet — requires admin role for access.
 * Manages songs, users, and chord reports.
 * Bug #15 fix: Added safe parsing to prevent NumberFormatException on missing/invalid IDs.
 * Bug #33 fix: Role validation is enforced via UserDAO.
 */
@WebServlet(name = "AdminServlet", urlPatterns = {"/admin", "/admin/*"})
public class AdminServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();
    private UserDAO userDAO = new UserDAO();
    private ReportDAO reportDAO = new ReportDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Admin role check
        if (!SessionUtil.isAdmin(request.getSession(false))) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/songs":
                List<Song> songs = songDAO.getAllSongs();
                request.setAttribute("songs", songs);
                request.getRequestDispatcher("/jsp/admin/adminSongs.jsp").forward(request, response);
                break;

            case "/add":
                request.getRequestDispatcher("/jsp/admin/adminAddSong.jsp").forward(request, response);
                break;

            case "/edit":
                int editId = getIntParam(request, "id");
                if (editId <= 0) {
                    response.sendRedirect(request.getContextPath() + "/admin/songs");
                    return;
                }
                Song editSong = songDAO.getSongById(editId);
                request.setAttribute("song", editSong);
                request.getRequestDispatcher("/jsp/admin/adminAddSong.jsp").forward(request, response);
                break;

            case "/users":
                List<User> users = userDAO.getAllUsers();
                request.setAttribute("users", users);
                request.getRequestDispatcher("/jsp/admin/adminUsers.jsp").forward(request, response);
                break;

            case "/reports":
                List<ChordReport> reports = reportDAO.getAllOpenReports();
                request.setAttribute("reports", reports);
                request.getRequestDispatcher("/jsp/admin/adminReports.jsp").forward(request, response);
                break;

            default:
                // Dashboard
                request.setAttribute("totalSongs", songDAO.getTotalSongCount());
                request.setAttribute("totalUsers", userDAO.getTotalUserCount());
                request.setAttribute("openReports", reportDAO.getOpenReportCount());
                request.getRequestDispatcher("/jsp/admin/adminDashboard.jsp").forward(request, response);
                break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Admin role check
        if (!SessionUtil.isAdmin(request.getSession(false))) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        switch (pathInfo) {
            case "/add":
                handleAddSong(request, response);
                break;

            case "/edit":
                handleEditSong(request, response);
                break;

            case "/delete":
                int deleteId = getIntParam(request, "id");
                if (deleteId > 0) {
                    songDAO.deleteSong(deleteId);
                }
                response.sendRedirect(request.getContextPath() + "/admin/songs");
                break;

            case "/role":
                int userId = getIntParam(request, "userId");
                String role = request.getParameter("role");
                if (userId > 0 && role != null) {
                    userDAO.updateRole(userId, role);
                }
                response.sendRedirect(request.getContextPath() + "/admin/users");
                break;

            case "/report/resolve":
                int reportId = getIntParam(request, "id");
                String status = request.getParameter("status");
                if (reportId > 0 && status != null) {
                    reportDAO.updateReportStatus(reportId, status);
                }
                response.sendRedirect(request.getContextPath() + "/admin/reports");
                break;

            default:
                response.sendRedirect(request.getContextPath() + "/admin");
                break;
        }
    }

    private void handleAddSong(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        Song song = buildSongFromRequest(request);
        User admin = SessionUtil.getCurrentUser(request.getSession(false));
        if (admin != null) {
            song.setCreatedBy(admin.getId());
        }

        songDAO.addSong(song);
        response.sendRedirect(request.getContextPath() + "/admin/songs");
    }

    private void handleEditSong(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        int id = getIntParam(request, "id");
        if (id <= 0) {
            response.sendRedirect(request.getContextPath() + "/admin/songs");
            return;
        }
        
        Song song = buildSongFromRequest(request);
        song.setId(id);

        songDAO.updateSong(song);
        response.sendRedirect(request.getContextPath() + "/admin/songs");
    }

    private Song buildSongFromRequest(HttpServletRequest request) {
        Song song = new Song();
        song.setTitle(request.getParameter("title"));
        song.setArtist(request.getParameter("artist"));
        song.setComposer(request.getParameter("composer"));
        song.setCopyright(request.getParameter("copyright"));
        song.setLanguage(request.getParameter("language"));
        song.setLyricsOriginal(request.getParameter("lyricsOriginal"));
        song.setLyricsRoman(request.getParameter("lyricsRoman"));
        song.setChords(request.getParameter("chords"));
        song.setNotes(request.getParameter("notes"));
        song.setOriginalKey(request.getParameter("originalKey"));
        song.setStructure(request.getParameter("structure"));

        song.setCapo(getIntParam(request, "capo"));
        song.setBpm(getIntParam(request, "bpm"));
        song.setSongNumber(getIntParam(request, "songNumber"));

        song.setTimeSignature(request.getParameter("timeSignature"));
        song.setAudioUrl(request.getParameter("audioUrl"));

        return song;
    }

    /**
     * Helper to safely parse integer parameters.
     * Bug #15 fix: Prevents 500 errors on invalid/missing numbers.
     */
    private int getIntParam(HttpServletRequest request, String name) {
        String val = request.getParameter(name);
        if (val == null || val.trim().isEmpty()) return 0;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
