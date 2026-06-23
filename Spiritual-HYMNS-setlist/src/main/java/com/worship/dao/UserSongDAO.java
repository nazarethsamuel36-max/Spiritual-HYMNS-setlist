package com.worship.dao;

import com.worship.model.UserSong;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for the user_songs table.
 * Manages personal user versions of songs.
 * User edits go here — never to the master songs table.
 */
public class UserSongDAO {

    /**
     * Get a user's personal version of a specific song.
     * Returns null if no personal version exists.
     */
    public UserSong getUserVersion(int userId, int songId) {
        String sql = "SELECT us.*, s.title as song_title FROM user_songs us "
                + "INNER JOIN songs s ON us.song_id = s.id "
                + "WHERE us.user_id = ? AND us.song_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, songId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUserSong(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Save a user's personal version (INSERT or UPDATE via ON DUPLICATE KEY).
     * Bug #32 fix: Replaced deprecated VALUES(col) syntax with AS new_row alias.
     * Compatible with MySQL 8.0.20+.
     */
    public boolean saveUserVersion(UserSong us) {
        String sql = "INSERT INTO user_songs (user_id, song_id, custom_key, custom_chords, "
                + "custom_lyrics, custom_notes, personal_note) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?) AS new_row "
                + "ON DUPLICATE KEY UPDATE "
                + "custom_key = new_row.custom_key, "
                + "custom_chords = new_row.custom_chords, "
                + "custom_lyrics = new_row.custom_lyrics, "
                + "custom_notes = new_row.custom_notes, "
                + "personal_note = new_row.personal_note, "
                + "updated_at = CURRENT_TIMESTAMP";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, us.getUserId());
            ps.setInt(2, us.getSongId());
            ps.setString(3, us.getCustomKey());
            ps.setString(4, us.getCustomChords());
            ps.setString(5, us.getCustomLyrics());
            ps.setString(6, us.getCustomNotes());
            ps.setString(7, us.getPersonalNote());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Save only a user's personal annotation (note) for a song.
     * Bug #32 fix: Replaced deprecated VALUES(col) syntax with AS new_row alias.
     */
    public boolean savePersonalNote(int userId, int songId, String note) {
        String sql = "INSERT INTO user_songs (user_id, song_id, personal_note) "
                + "VALUES (?, ?, ?) AS new_row "
                + "ON DUPLICATE KEY UPDATE "
                + "personal_note = new_row.personal_note, "
                + "updated_at = CURRENT_TIMESTAMP";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, songId);
            ps.setString(3, note);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Delete a user's personal version of a song (reset to original).
     */
    public boolean deleteUserVersion(int userId, int songId) {
        String sql = "DELETE FROM user_songs WHERE user_id = ? AND song_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, songId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Get all personal song versions for a user.
     */
    public List<UserSong> getAllUserVersions(int userId) {
        List<UserSong> versions = new ArrayList<>();
        String sql = "SELECT us.*, s.title as song_title FROM user_songs us "
                + "INNER JOIN songs s ON us.song_id = s.id "
                + "WHERE us.user_id = ? ORDER BY us.updated_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    versions.add(mapResultSetToUserSong(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return versions;
    }

    /**
     * Map a ResultSet row to a UserSong object.
     */
    private UserSong mapResultSetToUserSong(ResultSet rs) throws SQLException {
        UserSong us = new UserSong();
        us.setId(rs.getInt("id"));
        us.setUserId(rs.getInt("user_id"));
        us.setSongId(rs.getInt("song_id"));
        us.setCustomKey(rs.getString("custom_key"));
        us.setCustomChords(rs.getString("custom_chords"));
        us.setCustomLyrics(rs.getString("custom_lyrics"));
        us.setCustomNotes(rs.getString("custom_notes"));
        us.setPersonalNote(rs.getString("personal_note"));
        us.setUpdatedAt(rs.getTimestamp("updated_at"));

        try {
            us.setSongTitle(rs.getString("song_title"));
        } catch (SQLException e) { /* column may not exist */ }

        return us;
    }
}
