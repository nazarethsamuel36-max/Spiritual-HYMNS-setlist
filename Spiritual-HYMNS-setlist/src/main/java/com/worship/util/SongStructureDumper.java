package com.worship.util;

import com.worship.dao.SongDAO;
import com.worship.model.Song;
import com.worship.model.Section;
import com.worship.model.SongLine;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

public class SongStructureDumper {
    public static void main(String[] args) {
        SongDAO songDAO = new SongDAO();
        List<Song> songsToProcess = new ArrayList<>();
        
        for (int i = 1; i <= 40; i++) {
            List<Song> songs = songDAO.getSongsByNumber(i);
            if (!songs.isEmpty()) {
                songsToProcess.add(songs.get(0));
            }
        }
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File("songs_to_enrich.json"), songsToProcess);
            System.out.println("Dumped " + songsToProcess.size() + " songs to songs_to_enrich.json");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
