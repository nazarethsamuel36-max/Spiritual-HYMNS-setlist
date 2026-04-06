package com.worship.dao;

import com.worship.model.ChordReport;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for the chord_reports table.
 * Handles chord accuracy issue reporting and admin resolution.
 */
public class ReportDAO {

    /**
     * Submit a new chord accuracy report.
     */
    public boolean submitReport(ChordReport report) {
        String sql = "INSERT INTO chord_reports (song_id, user_id, reason, suggestion) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, report.getSongId());
            if (report.getUserId() > 0) {
                ps.setInt(2, report.getUserId());
            } else {
                ps.setNull(2, Types.INTEGER);
            }
            ps.setString(3, report.getReason());
            ps.setString(4, report.getSuggestion());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Get all open (unresolved) chord reports with song titles and reporter names.
     */
    public List<ChordReport> getAllOpenReports() {
        List<ChordReport> reports = new ArrayList<>();
        String sql = "SELECT cr.*, s.title as song_title, u.username as reporter_username "
                + "FROM chord_reports cr "
                + "LEFT JOIN songs s ON cr.song_id = s.id "
                + "LEFT JOIN users u ON cr.user_id = u.id "
                + "WHERE cr.status = 'open' "
                + "ORDER BY cr.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                reports.add(mapResultSetToReport(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reports;
    }

    /**
     * Update the status of a report (fixed or rejected).
     */
    public boolean updateReportStatus(int id, String status) {
        String sql = "UPDATE chord_reports SET status = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Get count of open reports (admin dashboard).
     */
    public int getOpenReportCount() {
        String sql = "SELECT COUNT(*) FROM chord_reports WHERE status = 'open'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    /**
     * Map a ResultSet row to a ChordReport object.
     */
    private ChordReport mapResultSetToReport(ResultSet rs) throws SQLException {
        ChordReport report = new ChordReport();
        report.setId(rs.getInt("id"));
        report.setSongId(rs.getInt("song_id"));
        report.setUserId(rs.getInt("user_id"));
        report.setReason(rs.getString("reason"));
        report.setSuggestion(rs.getString("suggestion"));
        report.setStatus(rs.getString("status"));
        report.setCreatedAt(rs.getTimestamp("created_at"));

        try {
            report.setSongTitle(rs.getString("song_title"));
        } catch (SQLException e) { /* column may not exist */ }

        try {
            report.setReporterUsername(rs.getString("reporter_username"));
        } catch (SQLException e) { /* column may not exist */ }

        return report;
    }
}
