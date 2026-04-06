package com.worship.dao;

import com.worship.model.Song;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Data Access Object for the songs master table.
 * Handles all CRUD operations, search, filtering, and hashtag associations.
 */
public class SongDAO {

    /**
     * Get all active songs from the database (Default Sort).
     */
    public List<Song> getAllSongs() {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE is_active = TRUE ORDER BY song_number, title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Song song = mapResultSetToSong(rs);
                song.setHashtags(getHashtagsForSong(song.getId()));
                songs.add(song);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get all active songs from the database, sorted by most views.
     */
    public List<Song> getSongsSortedByViews() {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT s.* FROM songs s "
                + "LEFT JOIN (SELECT song_id, COUNT(*) as view_count FROM song_views GROUP BY song_id) v "
                + "ON s.id = v.song_id "
                + "WHERE s.is_active = TRUE "
                + "ORDER BY COALESCE(v.view_count, 0) DESC, s.title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Song song = mapResultSetToSong(rs);
                song.setHashtags(getHashtagsForSong(song.getId()));
                songs.add(song);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get a single song by its ID.
     */
    public Song getSongById(int id) {
        String sql = "SELECT * FROM songs WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    return song;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Search songs by title, artist, lyrics_original, or lyrics_roman using LIKE.
     */
    public List<Song> searchSongs(String query) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE is_active = TRUE AND ("
                + "title LIKE CONCAT('%', ?, '%') "
                + "OR artist LIKE CONCAT('%', ?, '%') "
                + "OR lyrics_original LIKE CONCAT('%', ?, '%') "
                + "OR lyrics_roman LIKE CONCAT('%', ?, '%')"
                + ") ORDER BY title LIMIT 20";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, query);
            ps.setString(2, query);
            ps.setString(3, query);
            ps.setString(4, query);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get songs that have a specific hashtag.
     */
    public List<Song> getSongsByHashtag(String hashtag) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT s.* FROM songs s "
                + "INNER JOIN song_hashtags sh ON s.id = sh.song_id "
                + "INNER JOIN hashtags h ON sh.hashtag_id = h.id "
                + "WHERE s.is_active = TRUE AND h.name = ? "
                + "ORDER BY s.title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, hashtag);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get songs filtered by language.
     */
    public List<Song> getSongsByLanguage(String language) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE is_active = TRUE AND language = ? ORDER BY title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, language);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get songs filtered by original key.
     */
    public List<Song> getSongsByKey(String key) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE is_active = TRUE AND original_key = ? ORDER BY title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, key);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get songs ranked by number of matching hashtags from an occasion.
     */
    public List<Song> getSongsByOccasion(List<String> hashtags) {
        List<Song> songs = new ArrayList<>();
        if (hashtags == null || hashtags.isEmpty()) return songs;

        StringBuilder placeholders = new StringBuilder();
        for (int i = 0; i < hashtags.size(); i++) {
            if (i > 0) placeholders.append(",");
            placeholders.append("?");
        }

        String sql = "SELECT s.*, COUNT(sh.hashtag_id) as match_count FROM songs s "
                + "INNER JOIN song_hashtags sh ON s.id = sh.song_id "
                + "INNER JOIN hashtags h ON sh.hashtag_id = h.id "
                + "WHERE s.is_active = TRUE AND h.name IN (" + placeholders + ") "
                + "GROUP BY s.id ORDER BY match_count DESC, s.title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < hashtags.size(); i++) {
                ps.setString(i + 1, hashtags.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Add a new song to the database.
     */
    public boolean addSong(Song song) {
        String sql = "INSERT INTO songs (song_number, title, artist, composer, copyright, language, "
                + "lyrics_original, lyrics_roman, chords, notes, original_key, capo, bpm, "
                + "time_signature, structure, audio_url, created_by) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, song.getSongNumber());
            ps.setString(2, song.getTitle());
            ps.setString(3, song.getArtist());
            ps.setString(4, song.getComposer());
            ps.setString(5, song.getCopyright());
            ps.setString(6, song.getLanguage());
            ps.setString(7, song.getLyricsOriginal());
            ps.setString(8, song.getLyricsRoman());
            ps.setString(9, song.getChords());
            ps.setString(10, song.getNotes());
            ps.setString(11, song.getOriginalKey());
            ps.setInt(12, song.getCapo());
            ps.setInt(13, song.getBpm());
            ps.setString(14, song.getTimeSignature());
            ps.setString(15, song.getStructure());
            ps.setString(16, song.getAudioUrl());
            ps.setInt(17, song.getCreatedBy());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        song.setId(keys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Update an existing song.
     */
    public boolean updateSong(Song song) {
        String sql = "UPDATE songs SET song_number=?, title=?, artist=?, composer=?, copyright=?, "
                + "language=?, lyrics_original=?, lyrics_roman=?, chords=?, notes=?, "
                + "original_key=?, capo=?, bpm=?, time_signature=?, structure=?, audio_url=? "
                + "WHERE id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, song.getSongNumber());
            ps.setString(2, song.getTitle());
            ps.setString(3, song.getArtist());
            ps.setString(4, song.getComposer());
            ps.setString(5, song.getCopyright());
            ps.setString(6, song.getLanguage());
            ps.setString(7, song.getLyricsOriginal());
            ps.setString(8, song.getLyricsRoman());
            ps.setString(9, song.getChords());
            ps.setString(10, song.getNotes());
            ps.setString(11, song.getOriginalKey());
            ps.setInt(12, song.getCapo());
            ps.setInt(13, song.getBpm());
            ps.setString(14, song.getTimeSignature());
            ps.setString(15, song.getStructure());
            ps.setString(16, song.getAudioUrl());
            ps.setInt(17, song.getId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Soft delete a song (sets is_active = false).
     */
    public boolean deleteSong(int id) {
        String sql = "UPDATE songs SET is_active = FALSE WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Get all hashtags associated with a song.
     */
    public List<String> getHashtagsForSong(int songId) {
        List<String> hashtags = new ArrayList<>();
        String sql = "SELECT h.name FROM hashtags h "
                + "INNER JOIN song_hashtags sh ON h.id = sh.hashtag_id "
                + "WHERE sh.song_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    hashtags.add(rs.getString("name"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return hashtags;
    }

    /**
     * Associate a hashtag with a song.
     */
    public boolean addHashtagToSong(int songId, int hashtagId) {
        String sql = "INSERT IGNORE INTO song_hashtags (song_id, hashtag_id) VALUES (?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            ps.setInt(2, hashtagId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Increment the view count for a song.
     */
    public void incrementViewCount(int songId, Integer userId) {
        String sql = "INSERT INTO song_views (song_id, user_id) VALUES (?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            if (userId != null) {
                ps.setInt(2, userId);
            } else {
                ps.setNull(2, Types.INTEGER);
            }
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Get total count of active songs.
     */
    public int getTotalSongCount() {
        String sql = "SELECT COUNT(*) FROM songs WHERE is_active = TRUE";

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
     * Get all unique song titles for efficient duplicate checking.
     * Bug #24 fix: Used for O(1) lookups during bulk import.
     */
    public Set<String> getAllSongTitles() {
        Set<String> titles = new HashSet<>();
        String sql = "SELECT title FROM songs";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                titles.add(rs.getString("title").toLowerCase());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return titles;
    }

    /**
     * Map a ResultSet row to a Song object.
     */
    private Song mapResultSetToSong(ResultSet rs) throws SQLException {
        Song song = new Song();
        song.setId(rs.getInt("id"));
        song.setSongNumber(rs.getInt("song_number"));
        song.setTitle(rs.getString("title"));
        song.setArtist(rs.getString("artist"));
        song.setComposer(rs.getString("composer"));
        song.setCopyright(rs.getString("copyright"));
        song.setLanguage(rs.getString("language"));
        song.setLyricsOriginal(rs.getString("lyrics_original"));
        song.setLyricsRoman(rs.getString("lyrics_roman"));
        song.setChords(rs.getString("chords"));
        song.setNotes(rs.getString("notes"));
        song.setOriginalKey(rs.getString("original_key"));
        song.setCapo(rs.getInt("capo"));
        song.setBpm(rs.getInt("bpm"));
        song.setTimeSignature(rs.getString("time_signature"));
        song.setStructure(rs.getString("structure"));
        song.setAudioUrl(rs.getString("audio_url"));
        song.setCreatedBy(rs.getInt("created_by"));
        song.setCreatedAt(rs.getTimestamp("created_at"));
        song.setActive(rs.getBoolean("is_active"));
        return song;
    }
}
