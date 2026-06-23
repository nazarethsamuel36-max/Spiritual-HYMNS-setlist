package com.worship.service;

import com.worship.dao.SongDAO;
import com.worship.model.Song;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for exact numeric lookup for Live Search.
 */
public class NumberSearchService {

    private SongDAO songDAO = new SongDAO();

    public Map<String, Object> search(String numberQuery, String language) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            int songNumber = Integer.parseInt(numberQuery.trim());
            List<Song> numberResults;
            
            if (language != null && !language.isEmpty() && !language.equalsIgnoreCase("All")) {
                numberResults = songDAO.getSongsByNumberAndLanguage(songNumber, language);
            } else {
                numberResults = songDAO.getSongsByNumber(songNumber);
            }

            result.put("results", numberResults);
            result.put("pageNum", 1);
            result.put("pageSize", numberResults.size());
            result.put("totalCount", numberResults.size());
            result.put("hasMore", false);
        } catch (NumberFormatException e) {
            result.put("results", java.util.Collections.emptyList());
            result.put("pageNum", 1);
            result.put("pageSize", 0);
            result.put("totalCount", 0);
            result.put("hasMore", false);
        }
        return result;
    }
}
