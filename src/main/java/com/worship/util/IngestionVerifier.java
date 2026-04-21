package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import java.util.List;

public class IngestionVerifier {
    public static void main(String[] args) {
        SongDAO dao = new SongDAO();
        List<Song> marathiSongs = dao.getSongsByLanguage("marathi");
        
        System.out.println("Verification Report:");
        System.out.println("Total active Marathi songs in DB: " + marathiSongs.size());
        
        for (Song s : marathiSongs) {
            System.out.println("Song " + s.getSongNumber() + ": " + s.getTitle());
        }
    }
}
