package com.worship.dao;

import com.worship.model.Song;
import com.worship.model.Section;
import com.worship.model.SongLine;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Data Access Object for the songs master table.
 * Handles all CRUD operations, search, filtering, and hashtag associations.
 */
public class SongDAO {
    private static final String ACTIVE_BOOK = "prime_songbook";

    private String getVisibilityFilter() {
        return " book != 'raw_songbook' AND is_active = TRUE AND song_number > 0 ";
    }

    /**
     * Get all active songs from the database (Default Sort).
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> getAllSongs() {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE " + getVisibilityFilter() + " ORDER BY song_number, title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Song song = mapResultSetToSong(rs);
                songs.add(song);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * Get all active songs from the database, sorted by most views.
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> getSongsSortedByViews() {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT s.* FROM songs s "
                + "LEFT JOIN (SELECT song_id, COUNT(*) as view_count FROM song_views GROUP BY song_id) v "
                + "ON s.id = v.song_id "
                + "WHERE s." + getVisibilityFilter()
                + " ORDER BY COALESCE(v.view_count, 0) DESC, s.title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Song song = mapResultSetToSong(rs);
                songs.add(song);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * Get a single song by its ID.
     */
    public Song getSongById(int id) {
        String sql = "SELECT * FROM songs WHERE id = ? AND " + getVisibilityFilter();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    song.setSections(getSectionsForSong(song.getId()));
                    return song;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Get songs by their song number.
     * Returns a List to maintain consistency with search interface.
     */
    public List<Song> getSongsByNumber(int songNumber) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE song_number = ? AND " + getVisibilityFilter();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songNumber);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    song.setSections(getSectionsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get songs by their song number and language (exact match).
     * Used for number search layer.
     */
    public List<Song> getSongsByNumberAndLanguage(int songNumber, String language) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE song_number = ? AND language = ? AND " + getVisibilityFilter();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songNumber);
            ps.setString(2, language);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    song.setHashtags(getHashtagsForSong(song.getId()));
                    song.setSections(getSectionsForSong(song.getId()));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Search songs by title, artist, lyrics_original, or lyrics_roman using LIKE.
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> searchSongs(String query) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE " + getVisibilityFilter() + " AND ("
                + "title LIKE CONCAT('%', ?, '%') "
                + "OR artist LIKE CONCAT('%', ?, '%') "
                + "OR lyrics_original LIKE CONCAT('%', ?, '%') "
                + "OR lyrics_roman LIKE CONCAT('%', ?, '%')"
                + ") ORDER BY song_number, title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, query);
            ps.setString(2, query);
            ps.setString(3, query);
            ps.setString(4, query);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * STABILIZATION: Lightweight search for candidate retrieval.
     * 1. Joins with hashtags for unified matching.
     * 2. Limits candidates to 100 rows to prevent memory pressure.
     * 3. Fetches only essential fields (Two-Stage Retrieval Stage 1).
     * 4. Enforces strict AND logic across tokens.
     */
    public List<Song> searchSongsLightweight(List<String> tokens, java.util.Map<String, List<String>> variantMap) {
        List<Song> songs = new ArrayList<>();
        if (tokens == null || tokens.isEmpty()) return songs;

        StringBuilder sql = new StringBuilder();
        // GROUP_CONCAT for hashtags integration
        sql.append("SELECT s.id, s.song_number, s.title, s.artist, s.lyrics_original, s.lyrics_roman, ")
           .append("s.original_key, s.language, ")
           .append("GROUP_CONCAT(h.name, ' ') as aggregated_hashtags ")
           .append("FROM songs s ")
           .append("LEFT JOIN song_hashtags sh ON s.id = sh.song_id ")
           .append("LEFT JOIN hashtags h ON sh.hashtag_id = h.id ")
           .append("WHERE ").append(getVisibilityFilter().replace("book =", "s.book =").replace("is_active =", "s.is_active ="));

        List<Object> params = new ArrayList<>();

        for (String token : tokens) {
            sql.append(" AND (");
            
            List<String> variants = variantMap.getOrDefault(token, java.util.Collections.singletonList(token));
            
            for (int i = 0; i < variants.size(); i++) {
                if (i > 0) sql.append(" OR ");
                String variant = variants.get(i);
                sql.append("s.title LIKE ? OR ");
                sql.append("s.artist LIKE ? OR ");
                sql.append("s.lyrics_original LIKE ? OR ");
                sql.append("s.lyrics_roman LIKE ? OR ");
                sql.append("h.name LIKE ?"); // Hashtag matching
                
                String likeParam = "%" + variant + "%";
                params.add(likeParam);
                params.add(likeParam);
                params.add(likeParam);
                params.add(likeParam);
                params.add(likeParam);
            }
            
            sql.append(")");
        }
        
        sql.append(" GROUP BY s.id ");
        sql.append(" ORDER BY s.song_number, s.title ");
        sql.append(" LIMIT 100"); // STABILIZATION: Limit candidates

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
             
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = new Song();
                    song.setId(rs.getInt("id"));
                    song.setSongNumber(rs.getInt("song_number"));
                    song.setTitle(rs.getString("title"));
                    song.setArtist(rs.getString("artist"));
                    song.setLyricsOriginal(rs.getString("lyrics_original"));
                    song.setLyricsRoman(rs.getString("lyrics_roman"));
                    song.setOriginalKey(rs.getString("original_key"));
                    song.setLanguage(rs.getString("language"));
                    
                    // Store hashtags temporarily in a transient list or field if available
                    String tagString = rs.getString("aggregated_hashtags");
                    if (tagString != null) {
                        song.setHashtags(java.util.Arrays.asList(tagString.split(" ")));
                    }
                    
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
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> getSongsByHashtag(String hashtag) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT s.* FROM songs s "
                + "INNER JOIN song_hashtags sh ON s.id = sh.song_id "
                + "INNER JOIN hashtags h ON sh.hashtag_id = h.id "
                + "WHERE s." + getVisibilityFilter() + " AND h.name = ? "
                + "ORDER BY s.title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, hashtag);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * LIVE SEARCH: Fast prefix-based suggestions.
     * - Only matches title or artist starting with the query (prefix).
     * - Returns minimal fields for speed.
     * - Strict limit (max 10) for UI responsiveness.
     */
    public List<Song> searchLiveSuggestions(String query, int limit) {
        List<Song> songs = new ArrayList<>();
        if (query == null || query.isEmpty()) return songs;

        // Optimized query: Prefix match on title or artist
        // Use s.title LIKE 'query%' for index-friendly search
        String sql = "SELECT id, song_number, title FROM songs "
                + "WHERE " + getVisibilityFilter()
                + " AND (title LIKE ? OR artist LIKE ?) "
                + "ORDER BY song_number ASC, title ASC "
                + "LIMIT ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            String prefixParam = query + "%";
            ps.setString(1, prefixParam);
            ps.setString(2, prefixParam);
            ps.setInt(3, limit);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = new Song();
                    song.setId(rs.getInt("id"));
                    song.setSongNumber(rs.getInt("song_number"));
                    song.setTitle(rs.getString("title"));
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return songs;
    }

    /**
     * Get songs added by a specific user (Personal Library).
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> getSongsByUser(int userId) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE " + getVisibilityFilter() + " AND created_by = ? ORDER BY title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * Get songs filtered by language.
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> getSongsByLanguage(String language) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE " + getVisibilityFilter() + " AND language = ? ORDER BY title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, language);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * Get songs filtered by original key.
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
     */
    public List<Song> getSongsByKey(String key) {
        List<Song> songs = new ArrayList<>();
        String sql = "SELECT * FROM songs WHERE " + getVisibilityFilter() + " AND original_key = ? ORDER BY title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, key);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * Get songs ranked by number of matching hashtags from an occasion.
     * FIXED: Uses batch hashtag retrieval (CHANGE 2.1 - eliminates N+1 queries).
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
                + "WHERE s." + getVisibilityFilter() + " AND h.name IN (" + placeholders + ") "
                + "GROUP BY s.id ORDER BY match_count DESC, s.title";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < hashtags.size(); i++) {
                ps.setString(i + 1, hashtags.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Song song = mapResultSetToSong(rs);
                    songs.add(song);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // BATCH: Fetch all hashtags in single query
        if (!songs.isEmpty()) {
            List<Integer> songIds = new ArrayList<>();
            songs.forEach(s -> songIds.add(s.getId()));
            Map<Integer, List<String>> hashtagMap = getHashtagsForSongs(songIds);
            songs.forEach(s -> s.setHashtags(hashtagMap.getOrDefault(s.getId(), new ArrayList<>())));
        }

        return songs;
    }

    /**
     * Add a new song to the database.
     */
    public boolean addSong(Song song) {
        String sql = "INSERT INTO songs (song_number, title, artist, composer, copyright, language, "
                + "lyrics_original, lyrics_roman, chords, notes, original_key, capo, bpm, "
                + "time_signature, structure, audio_url, created_by, is_active, book) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)";

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
            ps.setString(18, song.getBook());

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
                + "original_key=?, capo=?, bpm=?, time_signature=?, structure=?, audio_url=?, book=? "
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
            ps.setString(17, song.getBook());
            ps.setInt(18, song.getId());

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
     * Get sections for a specific song, ordered by their sequence.
     */
    public List<Section> getSectionsForSong(int songId) {
        List<Section> sections = new ArrayList<>();
        String sql = "SELECT * FROM sections WHERE song_id = ? ORDER BY section_order";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Section section = new Section();
                    section.setId(rs.getInt("id"));
                    section.setSongId(rs.getInt("song_id"));
                    section.setType(rs.getString("type"));
                    section.setLabel(rs.getString("label"));
                    section.setSectionOrder(rs.getInt("section_order"));
                    section.setLines(getLinesForSection(section.getId()));
                    sections.add(section);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sections;
    }

    /**
     * Get lines for a specific section, ordered by their sequence.
     */
    public List<SongLine> getLinesForSection(int sectionId) {
        List<SongLine> lines = new ArrayList<>();
        String sql = "SELECT * FROM song_lines WHERE section_id = ? ORDER BY line_order";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, sectionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    SongLine line = new SongLine();
                    line.setId(rs.getInt("id"));
                    line.setSectionId(rs.getInt("section_id"));
                    line.setText(rs.getString("line_text"));
                    line.setLineOrder(rs.getInt("line_order"));
                    lines.add(line);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lines;
    }

    /**
     * Check if a song exists with the given song_number, language, and book.
     */
    public boolean songExists(int songNumber, String language, String book) {
        String sql = "SELECT COUNT(*) FROM songs WHERE song_number = ? AND language = ? AND book = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, songNumber);
            ps.setString(2, language);
            ps.setString(3, book);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Advanced Add: Inserts a song and all its sections/lines in one transaction.
     */
    public boolean addSongWithStructure(Song song) {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Insert Song
            String songSql = "INSERT INTO songs (song_number, title, language, created_by, is_active, book) "
                    + "VALUES (?, ?, ?, ?, TRUE, ?)";
            try (PreparedStatement ps = conn.prepareStatement(songSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, song.getSongNumber());
                ps.setString(2, song.getTitle());
                ps.setString(3, song.getLanguage());
                ps.setInt(4, song.getCreatedBy());
                ps.setString(5, song.getBook());

                if (ps.executeUpdate() == 0) throw new SQLException("Failed to insert song");
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) song.setId(keys.getInt(1));
                    else throw new SQLException("No ID generated for song");
                }
            }

            // 2. Insert Sections
            String secSql = "INSERT INTO sections (song_id, type, label, section_order) VALUES (?, ?, ?, ?)";
            String lineSql = "INSERT INTO song_lines (section_id, line_text, line_order) VALUES (?, ?, ?)";
            String chordSql = "INSERT INTO line_chords (line_id, chord, char_index, confidence) VALUES (?, ?, ?, 1.0)";

            try (PreparedStatement secPs = conn.prepareStatement(secSql, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement linePs = conn.prepareStatement(lineSql, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement chordPs = conn.prepareStatement(chordSql)) {

                for (int i = 0; i < song.getSections().size(); i++) {
                    Section sec = song.getSections().get(i);
                    secPs.setInt(1, song.getId());
                    secPs.setString(2, sec.getType());
                    secPs.setString(3, sec.getLabel());
                    secPs.setInt(4, i + 1);
                    secPs.executeUpdate();

                    int sectionId;
                    try (ResultSet secKeys = secPs.getGeneratedKeys()) {
                        if (secKeys.next()) sectionId = secKeys.getInt(1);
                        else throw new SQLException("No ID generated for section");
                    }

                    for (int j = 0; j < sec.getLines().size(); j++) {
                        SongLine line = sec.getLines().get(j);
                        linePs.setInt(1, sectionId);
                        linePs.setString(2, line.getText());
                        linePs.setInt(3, j + 1);
                        linePs.executeUpdate(); // Insert line one by one to get its ID
                        
                        int lineId;
                        try (ResultSet lineKeys = linePs.getGeneratedKeys()) {
                            if (lineKeys.next()) lineId = lineKeys.getInt(1);
                            else throw new SQLException("No ID generated for song_line");
                        }
                        
                        // Insert chords for this line if any
                        if (line.getChords() != null && !line.getChords().isEmpty()) {
                            for (com.worship.model.ChordOccurrence co : line.getChords()) {
                                chordPs.setInt(1, lineId);
                                chordPs.setString(2, co.getChord());
                                chordPs.setInt(3, co.getPosition());
                                chordPs.addBatch();
                            }
                        }
                    }
                }
                chordPs.executeBatch();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
                try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
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
     * BATCH METHOD: Get hashtags for multiple songs in a single query.
     * Fixes N+1 query problem. Returns Map<songId, List<hashtags>>.
     * Use this instead of looping getHashtagsForSong().
     */
    public Map<Integer, List<String>> getHashtagsForSongs(List<Integer> songIds) {
        Map<Integer, List<String>> result = new HashMap<>();
        if (songIds == null || songIds.isEmpty()) return result;

        // Initialize empty lists for all song IDs
        songIds.forEach(id -> result.put(id, new ArrayList<>()));

        StringBuilder placeholders = new StringBuilder();
        for (int i = 0; i < songIds.size(); i++) {
            if (i > 0) placeholders.append(",");
            placeholders.append("?");
        }

        String sql = "SELECT sh.song_id, h.name FROM hashtags h "
                + "INNER JOIN song_hashtags sh ON h.id = sh.hashtag_id "
                + "WHERE sh.song_id IN (" + placeholders + ")";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (int i = 0; i < songIds.size(); i++) {
                ps.setInt(i + 1, songIds.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int songId = rs.getInt("song_id");
                    String hashtag = rs.getString("name");
                    result.get(songId).add(hashtag);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return result;
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
        String sql = "SELECT COUNT(*) FROM songs WHERE " + getVisibilityFilter();

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
        String sql = "SELECT title FROM songs WHERE " + getVisibilityFilter();

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
        song.setBook(rs.getString("book"));
        return song;
    }
}
