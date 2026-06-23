package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.worship.model.Section;
import com.worship.model.SongLine;
import java.util.List;

public class DbDiagnostic {
    public static void main(String[] args) {
        SongDAO dao = new SongDAO();
        // Check a few songs, e.g., ID 1, 2, 3
        int[] ids = {1, 2, 3};
        for (int id : ids) {
            Song song = dao.getSongById(id);
            if (song == null) {
                System.out.println("Song ID " + id + " not found.");
                continue;
            }
            System.out.println("--- SONG ID: " + id + " (" + song.getTitle() + ") ---");
            System.out.println("CHORDS COLUMN: " + (song.getChords() != null ? "'" + song.getChords() + "'" : "NULL"));
            System.out.println("SECTIONS COUNT: " + (song.getSections() != null ? song.getSections().size() : 0));
            if (song.getSections() != null) {
                for (Section s : song.getSections()) {
                    System.out.println("  Section: " + s.getLabel());
                    for (SongLine l : s.getLines()) {
                        System.out.println("    Line: " + l.getText());
                    }
                }
            }
            System.out.println();
        }
    }
}
