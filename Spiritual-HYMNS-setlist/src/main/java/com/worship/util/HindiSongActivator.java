package com.worship.util;

import com.worship.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * Utility to reactivate existing Hindi songs.
 */
public class HindiSongActivator {

    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection()) {
            String activateSql = "UPDATE songs SET is_active = TRUE WHERE language = 'hindi' AND book = 'prime_songbook'";
            try (PreparedStatement ps = conn.prepareStatement(activateSql)) {
                int count = ps.executeUpdate();
                System.out.println("Activated " + count + " Hindi songs");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}