package com.worship.dao;

import com.worship.model.Leaflet;
import com.worship.model.LeafletSong;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data Access Object for leaflets and leaflet_songs tables.
 * Manages occasion-based song collections for printing.
 */
public class LeafletDAO {

    /**
     * Create a new leaflet and return its generated ID.
     */
    public int createLeaflet(Leaflet leaflet) {
        String sql = "INSERT INTO leaflets (user_id, occasion_id, title, header_data, print_type) "
                + "VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, leaflet.getUserId());
            ps.setInt(2, leaflet.getOccasionId());
            ps.setString(3, leaflet.getTitle());
            ps.setString(4, leaflet.getHeaderData());
            ps.setString(5, leaflet.getPrintType());

            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    /**
     * Add a song to a leaflet at a specific position.
     */
    public boolean addSongToLeaflet(int leafletId, int songId, int position, String customKey) {
        String sql = "INSERT INTO leaflet_songs (leaflet_id, song_id, position, custom_key) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leafletId);
            ps.setInt(2, songId);
            ps.setInt(3, position);
            ps.setString(4, customKey);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Add a marker/header to a leaflet at a specific position.
     */
    public boolean addHeaderToLeaflet(int leafletId, String headerText, int position) {
        String sql = "INSERT INTO leaflet_songs (leaflet_id, is_header, header_text, position) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leafletId);
            ps.setBoolean(2, true);
            ps.setString(3, headerText);
            ps.setInt(4, position);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Get a leaflet by ID with all its songs loaded.
     */
    public Leaflet getLeafletById(int id) {
        String sql = "SELECT l.*, o.name as occasion_name FROM leaflets l "
                + "LEFT JOIN occasions o ON l.occasion_id = o.id WHERE l.id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Leaflet leaflet = mapResultSetToLeaflet(rs);
                    leaflet.setSongs(getLeafletSongs(id));
                    return leaflet;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Get all leaflets for a specific user.
     */
    public List<Leaflet> getUserLeaflets(int userId) {
        List<Leaflet> leaflets = new ArrayList<>();
        String sql = "SELECT l.*, o.name as occasion_name FROM leaflets l "
                + "LEFT JOIN occasions o ON l.occasion_id = o.id "
                + "WHERE l.user_id = ? ORDER BY l.created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    leaflets.add(mapResultSetToLeaflet(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return leaflets;
    }

    /**
     * Delete a leaflet and its associated songs.
     */
    public boolean deleteLeaflet(int id) {
        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);

            try {
                // Delete leaflet songs first
                String deleteSongs = "DELETE FROM leaflet_songs WHERE leaflet_id = ?";
                try (PreparedStatement ps = conn.prepareStatement(deleteSongs)) {
                    ps.setInt(1, id);
                    ps.executeUpdate();
                }

                // Delete leaflet
                String deleteLeaflet = "DELETE FROM leaflets WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(deleteLeaflet)) {
                    ps.setInt(1, id);
                    ps.executeUpdate();
                }

                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                e.printStackTrace();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Update the song order within a leaflet.
     */
    public boolean updateSongOrder(int leafletId, List<Integer> songIds) {
        String sql = "UPDATE leaflet_songs SET position = ? WHERE leaflet_id = ? AND song_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < songIds.size(); i++) {
                ps.setInt(1, i + 1);
                ps.setInt(2, leafletId);
                ps.setInt(3, songIds.get(i));
                ps.addBatch();
            }
            ps.executeBatch();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Get songs belonging to a leaflet, ordered by position.
     */
    private List<LeafletSong> getLeafletSongs(int leafletId) {
        List<LeafletSong> songs = new ArrayList<>();
        String sql = "SELECT ls.*, s.title as song_title, s.chords as song_chords, "
                + "s.artist as song_artist, s.original_key as song_key, "
                + "s.lyrics_original as song_lyrics "
                + "FROM leaflet_songs ls "
                + "LEFT JOIN songs s ON ls.song_id = s.id "
                + "WHERE ls.leaflet_id = ? ORDER BY ls.position";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, leafletId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    LeafletSong ls = new LeafletSong();
                    ls.setId(rs.getInt("id"));
                    ls.setLeafletId(rs.getInt("leaflet_id"));
                    int songId = rs.getInt("song_id");
                    if (!rs.wasNull()) ls.setSongId(songId);
                    
                    ls.setSongTitle(rs.getString("song_title"));
                    ls.setSongArtist(rs.getString("song_artist"));
                    ls.setSongChords(rs.getString("song_chords"));
                    ls.setSongLyrics(rs.getString("song_lyrics"));
                    ls.setSongOriginalKey(rs.getString("song_key"));
                    ls.setPosition(rs.getInt("position"));
                    ls.setCustomKey(rs.getString("custom_key"));
                    
                    ls.setHeader(rs.getBoolean("is_header"));
                    ls.setHeaderText(rs.getString("header_text"));
                    songs.add(ls);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get all available occasions for the leaflet builder.
     * Bug #42 fix: Provides real data from the database.
     */
    public List<Map<String, Object>> getAllOccasions() {
        List<Map<String, Object>> occasions = new ArrayList<>();
        String sql = "SELECT * FROM occasions ORDER BY name ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> occ = new HashMap<>();
                occ.put("id", rs.getInt("id"));
                occ.put("name", rs.getString("name"));
                occ.put("hashtags", rs.getString("hashtags"));
                occasions.add(occ);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return occasions;
    }

    /**
     * Map a ResultSet row to a Leaflet object.
     */
    private Leaflet mapResultSetToLeaflet(ResultSet rs) throws SQLException {
        Leaflet leaflet = new Leaflet();
        leaflet.setId(rs.getInt("id"));
        leaflet.setUserId(rs.getInt("user_id"));
        leaflet.setOccasionId(rs.getInt("occasion_id"));
        leaflet.setTitle(rs.getString("title"));
        leaflet.setHeaderData(rs.getString("header_data"));
        leaflet.setPrintType(rs.getString("print_type"));
        leaflet.setCreatedAt(rs.getTimestamp("created_at"));

        try {
            leaflet.setOccasionName(rs.getString("occasion_name"));
        } catch (SQLException e) {
            // Column may not exist in all queries
        }

        return leaflet;
    }
}
