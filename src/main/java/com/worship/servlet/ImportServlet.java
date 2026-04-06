package com.worship.servlet;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.worship.util.SessionUtil;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Handles CSV and paste-based song import (admin only).
 * Bug #24 fix: Replaced query-per-song duplicate checking with a Set-based lookup.
 * Added safe parsing for BPM and Capo fields.
 */
@WebServlet(name = "ImportServlet", urlPatterns = {"/admin/import", "/admin/import/*"})
@MultipartConfig(maxFileSize = 1024 * 1024 * 10) // 10MB max
public class ImportServlet extends HttpServlet {

    private SongDAO songDAO = new SongDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!SessionUtil.isAdmin(request.getSession(false))) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        request.getRequestDispatcher("/jsp/admin/adminImport.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!SessionUtil.isAdmin(request.getSession(false))) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        String pathInfo = request.getPathInfo();
        if ("/csv".equals(pathInfo)) {
            handleCsvImport(request, response);
        } else if ("/paste".equals(pathInfo)) {
            handlePasteImport(request, response);
        } else {
            response.sendRedirect(request.getContextPath() + "/admin/import");
        }
    }

    private void handleCsvImport(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        Part filePart = request.getPart("csvFile");
        if (filePart == null || filePart.getSize() == 0) {
            request.setAttribute("error", "No file uploaded.");
            request.getRequestDispatcher("/jsp/admin/adminImport.jsp").forward(request, response);
            return;
        }

        int successCount = 0;
        int errorCount = 0;
        int skipCount = 0;
        List<String> errors = new ArrayList<>();

        // Bug #24: Fetch all titles once to avoid N database queries
        Set<String> existingTitles = songDAO.getAllSongTitles();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(filePart.getInputStream(), "UTF-8"));
             CSVReader csvReader = new CSVReader(reader)) {

            csvReader.readNext(); // Skip header row
            String[] row;
            int lineNum = 1;

            while ((row = csvReader.readNext()) != null) {
                lineNum++;
                try {
                    if (row.length < 8) {
                        errors.add("Line " + lineNum + ": insufficient columns");
                        errorCount++;
                        continue;
                    }

                    String title = row[0].trim();
                    if (title.isEmpty()) continue;

                    // Bug #24 fix: O(1) duplicate check
                    if (existingTitles.contains(title.toLowerCase())) {
                        errors.add("Line " + lineNum + ": '" + title + "' already exists — skipped");
                        skipCount++;
                        continue;
                    }

                    Song song = new Song();
                    song.setTitle(title);
                    song.setArtist(row.length > 1 ? row[1].trim() : "");
                    song.setLanguage(row.length > 2 ? row[2].trim() : "english");
                    song.setLyricsOriginal(row.length > 3 ? row[3].trim() : "");
                    song.setLyricsRoman(row.length > 4 ? row[4].trim() : "");
                    song.setChords(row.length > 5 ? row[5].trim() : "");
                    song.setNotes(row.length > 6 ? row[6].trim() : "");
                    song.setOriginalKey(row.length > 7 ? row[7].trim() : "C");

                    // Safe parsing for numeric fields
                    if (row.length > 8 && !row[8].trim().isEmpty()) {
                        song.setBpm(safeParseInt(row[8].trim(), 0));
                    }
                    if (row.length > 9 && !row[9].trim().isEmpty()) {
                        song.setCapo(safeParseInt(row[9].trim(), 0));
                    }

                    song.setCreatedBy(SessionUtil.getCurrentUser(request.getSession(false)).getId());

                    if (songDAO.addSong(song)) {
                        successCount++;
                        existingTitles.add(title.toLowerCase()); // Protect against dupes in the same CSV
                    } else {
                        errors.add("Line " + lineNum + ": failed to save '" + title + "'");
                        errorCount++;
                    }
                } catch (Exception e) {
                    errors.add("Line " + lineNum + ": " + e.getMessage());
                    errorCount++;
                }
            }
        } catch (CsvValidationException e) {
            errors.add("CSV parsing error: " + e.getMessage());
            errorCount++;
        }

        request.setAttribute("successCount", successCount);
        request.setAttribute("errorCount", errorCount);
        request.setAttribute("skipCount", skipCount);
        request.setAttribute("importErrors", errors);
        request.getRequestDispatcher("/jsp/admin/adminImport.jsp").forward(request, response);
    }

    private void handlePasteImport(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String title = request.getParameter("title");
        if (title == null || title.trim().isEmpty()) {
            request.setAttribute("error", "Song title is required.");
            request.getRequestDispatcher("/jsp/admin/adminImport.jsp").forward(request, response);
            return;
        }

        title = title.trim();

        // One-off dupe check is fine here
        Set<String> titles = songDAO.getAllSongTitles();
        if (titles.contains(title.toLowerCase())) {
            request.setAttribute("error", "A song with that title already exists.");
            request.getRequestDispatcher("/jsp/admin/adminImport.jsp").forward(request, response);
            return;
        }

        Song song = new Song();
        song.setTitle(title);
        song.setArtist(getParam(request, "artist"));
        song.setLanguage(getParam(request, "language") != null ? getParam(request, "language") : "english");
        song.setChords(getParam(request, "chords"));
        song.setLyricsOriginal(getParam(request, "lyricsOriginal"));
        song.setOriginalKey(getParam(request, "originalKey"));
        song.setCreatedBy(SessionUtil.getCurrentUser(request.getSession(false)).getId());

        boolean saved = songDAO.addSong(song);
        if (saved) {
            request.setAttribute("successCount", 1);
            request.setAttribute("skipCount", 0);
            request.setAttribute("errorCount", 0);
        } else {
            request.setAttribute("error", "Failed to save song. Check the server logs.");
        }
        request.getRequestDispatcher("/jsp/admin/adminImport.jsp").forward(request, response);
    }

    private String getParam(HttpServletRequest request, String name) {
        String val = request.getParameter(name);
        return (val != null && !val.trim().isEmpty()) ? val.trim() : null;
    }

    private int safeParseInt(String val, int defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}
