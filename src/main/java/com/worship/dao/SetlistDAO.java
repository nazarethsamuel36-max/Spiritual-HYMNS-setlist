package com.worship.dao;

import com.worship.model.Setlist;
import com.worship.model.SetlistSong;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SetlistDAO {

    public int createSetlist(int userId, String title, String occasion) {
        String sql = "INSERT INTO setlists (user_id, title, occasion) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            ps.setInt(1, userId);
            ps.setString(2, title);
            ps.setString(3, occasion);
            int affectedRows = ps.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public List<Setlist> getSetlistsByUser(int userId) {
        List<Setlist> list = new ArrayList<>();
        String sql = "SELECT s.*, (SELECT count(*) FROM setlist_songs ss WHERE ss.setlist_id = s.id) as song_count "
                   + "FROM setlists s WHERE s.user_id = ? ORDER BY s.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Setlist s = new Setlist();
                    s.setId(rs.getInt("id"));
                    s.setUserId(rs.getInt("user_id"));
                    s.setTitle(rs.getString("title"));
                    s.setOccasion(rs.getString("occasion"));
                    s.setShareToken(rs.getString("share_token"));
                    s.setShared(rs.getBoolean("is_public"));
                    s.setCreatedAt(rs.getTimestamp("created_at"));
                    s.setUpdatedAt(rs.getTimestamp("updated_at"));
                    s.setSongCount(rs.getInt("song_count"));
                    list.add(s);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Setlist getSetlistById(int setlistId) {
        String sql = "SELECT * FROM setlists WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, setlistId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Setlist s = new Setlist();
                    s.setId(rs.getInt("id"));
                    s.setUserId(rs.getInt("user_id"));
                    s.setTitle(rs.getString("title"));
                    s.setOccasion(rs.getString("occasion"));
                    s.setShareToken(rs.getString("share_token"));
                    s.setShared(rs.getBoolean("is_public"));
                    s.setCreatedAt(rs.getTimestamp("created_at"));
                    s.setUpdatedAt(rs.getTimestamp("updated_at"));
                    return s;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Setlist getSetlistByToken(String token) {
        if (token == null || token.isEmpty()) return null;
        String sql = "SELECT * FROM setlists WHERE share_token = ? AND is_public = TRUE";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, token);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Setlist s = new Setlist();
                    s.setId(rs.getInt("id"));
                    s.setUserId(rs.getInt("user_id"));
                    s.setTitle(rs.getString("title"));
                    s.setOccasion(rs.getString("occasion"));
                    s.setShareToken(rs.getString("share_token"));
                    s.setShared(rs.getBoolean("is_public"));
                    s.setCreatedAt(rs.getTimestamp("created_at"));
                    s.setUpdatedAt(rs.getTimestamp("updated_at"));
                    return s;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteSetlist(int setlistId, int userId) {
        String sql = "DELETE FROM setlists WHERE id = ? AND user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, setlistId);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public String generateShareToken(int setlistId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        String sql = "UPDATE setlists SET share_token = ?, is_public = TRUE WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, token);
            ps.setInt(2, setlistId);
            if (ps.executeUpdate() > 0) {
                return token;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean addSongToSetlist(int setlistId, int songId, int position, String creatorKey, int creatorCapo) {
        String sql = "INSERT INTO setlist_songs (setlist_id, song_id, position, creator_key, creator_capo) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, setlistId);
            ps.setInt(2, songId);
            ps.setInt(3, position);
            ps.setString(4, creatorKey);
            ps.setInt(5, creatorCapo);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean addHeaderToSetlist(int setlistId, String text, int position) {
        String sql = "INSERT INTO setlist_songs (setlist_id, is_header, header_text, position) VALUES (?, TRUE, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, setlistId);
            ps.setString(2, text);
            ps.setInt(3, position);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean removeSongFromSetlist(int id) {
        String sql = "DELETE FROM setlist_songs WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean reorderSongs(int setlistId, List<Integer> orderedIds) {
        String sql = "UPDATE setlist_songs SET position = ? WHERE id = ? AND setlist_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            int position = 1;
            for (Integer id : orderedIds) {
                ps.setInt(1, position++);
                ps.setInt(2, id);
                ps.setInt(3, setlistId);
                ps.addBatch();
            }
            int[] results = ps.executeBatch();
            return results.length == orderedIds.size();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateSongKey(int recordId, String key, int capo) {
        String sql = "UPDATE setlist_songs SET creator_key = ?, creator_capo = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, key);
            ps.setInt(2, capo);
            ps.setInt(3, recordId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateHeaderText(int recordId, String text) {
        String sql = "UPDATE setlist_songs SET header_text = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, text);
            ps.setInt(2, recordId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<SetlistSong> getSongsInSetlist(int setlistId) {
        List<SetlistSong> list = new ArrayList<>();
        String sql = "SELECT ss.id, ss.setlist_id, ss.song_id, ss.position, ss.creator_key, ss.creator_capo, ss.is_header, ss.header_text, " +
                     "s.title as song_title, s.artist as song_artist, s.chords, s.original_key " +
                     "FROM setlist_songs ss " +
                     "LEFT JOIN songs s ON ss.song_id = s.id " +
                     "WHERE ss.setlist_id = ? " +
                     "ORDER BY ss.position ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setInt(1, setlistId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    SetlistSong ss = new SetlistSong();
                    ss.setId(rs.getInt("id"));
                    ss.setSetlistId(rs.getInt("setlist_id"));
                    ss.setSongId(rs.getInt("song_id"));
                    ss.setPosition(rs.getInt("position"));
                    ss.setCreatorKey(rs.getString("creator_key"));
                    ss.setCreatorCapo(rs.getInt("creator_capo"));
                    ss.setHeader(rs.getBoolean("is_header"));
                    ss.setHeaderText(rs.getString("header_text"));
                    
                    if (ss.isHeader()) {
                        ss.setSongTitle(ss.getHeaderText());
                    } else {
                        ss.setSongTitle(rs.getString("song_title"));
                        ss.setSongArtist(rs.getString("song_artist"));
                        ss.setOriginalKey(rs.getString("original_key"));
                        ss.setLyricsChords(rs.getString("chords"));
                    }
                    
                    list.add(ss);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}
