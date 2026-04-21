package com.worship.dao;

import com.worship.model.ChordOccurrence;
import com.worship.model.LineMappingResult;
import com.worship.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Data Access Object for the line_chords table.
 * Stores and retrieves position-based chord mappings for structured song lines.
 *
 * Storage schema:
 *   line_chords(id, line_id, chord, char_index, confidence, flag)
 */
public class LineChordDAO {

    /**
     * Save chord positions for a single line, replacing any existing mappings.
     * This is idempotent — calling it twice with the same data produces the same result.
     */
    public boolean saveChordPositions(int lineId, List<ChordOccurrence> chords, double confidence, String flag) {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // Delete existing chords for this line
            try (PreparedStatement del = conn.prepareStatement(
                    "DELETE FROM line_chords WHERE line_id = ?")) {
                del.setInt(1, lineId);
                del.executeUpdate();
            }

            // Insert new chords
            try (PreparedStatement ins = conn.prepareStatement(
                    "INSERT INTO line_chords (line_id, chord, char_index, confidence, flag) VALUES (?, ?, ?, ?, ?)")) {
                for (ChordOccurrence co : chords) {
                    ins.setInt(1, lineId);
                    ins.setString(2, co.getChord());
                    ins.setInt(3, co.getPosition());
                    ins.setDouble(4, confidence);
                    ins.setString(5, flag);
                    ins.addBatch();
                }
                ins.executeBatch();
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
     * Save all accepted line results from a SongMappingResult in one transaction.
     * Returns the count of lines saved.
     */
    public int saveSongMapping(int songId, List<LineMappingResult> lineResults) {
        Connection conn = null;
        int saved = 0;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // First, delete all existing chords for this song's lines
            try (PreparedStatement del = conn.prepareStatement(
                    "DELETE lc FROM line_chords lc " +
                    "INNER JOIN song_lines sl ON lc.line_id = sl.id " +
                    "INNER JOIN sections s ON sl.section_id = s.id " +
                    "WHERE s.song_id = ?")) {
                del.setInt(1, songId);
                del.executeUpdate();
            }

            // Insert new chords for each accepted line
            try (PreparedStatement ins = conn.prepareStatement(
                    "INSERT INTO line_chords (line_id, chord, char_index, confidence, flag) VALUES (?, ?, ?, ?, ?)")) {

                for (LineMappingResult lr : lineResults) {
                    if (!lr.isAccepted() || lr.getChordPositions().isEmpty()) continue;

                    String flag = lr.hasFlag("LOW_CONFIDENCE") ? "LOW_CONFIDENCE" : null;

                    for (ChordOccurrence co : lr.getChordPositions()) {
                        ins.setInt(1, lr.getLineId());
                        ins.setString(2, co.getChord());
                        ins.setInt(3, co.getPosition());
                        ins.setDouble(4, lr.getConfidence());
                        if (flag != null) ins.setString(5, flag);
                        else ins.setNull(5, Types.VARCHAR);
                        ins.addBatch();
                    }
                    saved++;
                }
                ins.executeBatch();
            }

            conn.commit();
            return saved;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            }
            e.printStackTrace();
            return 0;
        } finally {
            if (conn != null) {
                try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
    }

    /**
     * Get all chord positions for a specific line.
     */
    public List<ChordOccurrence> getChordsForLine(int lineId) {
        List<ChordOccurrence> chords = new ArrayList<>();
        String sql = "SELECT chord, char_index FROM line_chords WHERE line_id = ? ORDER BY char_index";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, lineId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    chords.add(new ChordOccurrence(rs.getString("chord"), rs.getInt("char_index")));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return chords;
    }

    /**
     * Get all chord positions for all lines in a song.
     * Returns Map<lineId, List<ChordOccurrence>> — avoids N+1 queries.
     */
    public Map<Integer, List<ChordOccurrence>> getChordsForSong(int songId) {
        Map<Integer, List<ChordOccurrence>> chordMap = new LinkedHashMap<>();
        String sql = "SELECT lc.line_id, lc.chord, lc.char_index " +
                     "FROM line_chords lc " +
                     "INNER JOIN song_lines sl ON lc.line_id = sl.id " +
                     "INNER JOIN sections s ON sl.section_id = s.id " +
                     "WHERE s.song_id = ? " +
                     "ORDER BY sl.id, lc.char_index";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int lineId = rs.getInt("line_id");
                    ChordOccurrence co = new ChordOccurrence(rs.getString("chord"), rs.getInt("char_index"));
                    chordMap.computeIfAbsent(lineId, k -> new ArrayList<>()).add(co);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return chordMap;
    }

    /**
     * Check if a song has any mapped chords.
     */
    public boolean hasChordsForSong(int songId) {
        String sql = "SELECT COUNT(*) FROM line_chords lc " +
                     "INNER JOIN song_lines sl ON lc.line_id = sl.id " +
                     "INNER JOIN sections s ON sl.section_id = s.id " +
                     "WHERE s.song_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Delete all chord mappings for a song. Used before re-import.
     */
    public int deleteForSong(int songId) {
        String sql = "DELETE lc FROM line_chords lc " +
                     "INNER JOIN song_lines sl ON lc.line_id = sl.id " +
                     "INNER JOIN sections s ON sl.section_id = s.id " +
                     "WHERE s.song_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, songId);
            return ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }
}
