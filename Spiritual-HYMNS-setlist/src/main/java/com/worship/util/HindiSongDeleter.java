package com.worship.util;

import com.worship.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * Utility to delete existing Hindi songs before re-import.
 */
public class HindiSongDeleter {

    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection()) {
            String deleteSql = "DELETE FROM songs WHERE language = 'hindi' AND book = 'prime_songbook'";
            try (PreparedStatement ps = conn.prepareStatement(deleteSql)) {
                int count = ps.executeUpdate();
                System.out.println("Deleted " + count + " existing Hindi songs");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}