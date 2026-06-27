package com.worship.util;

import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.model.ChordOccurrence;
import com.worship.model.ChordToken;
import com.worship.model.Song;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SongKeyDetectionPilot {

    private static final int LIMIT = 50;
    private static final String REPORT_TXT = "key_detection_report_first_50.txt";
    private static final String REPORT_CSV = "key_detection_report_first_50.csv";

    public static void main(String[] args) throws Exception {
        SongDAO songDAO = new SongDAO();
        LineChordDAO lineChordDAO = new LineChordDAO();

        List<Song> songs = songDAO.getAllSongs()
                .stream()
                .filter(s -> s != null && s.getLanguage() != null)
                .filter(s -> s.getLanguage().equalsIgnoreCase("english"))
                .filter(s -> s.getSongNumber() > 0)
                .sorted(Comparator.comparingInt(Song::getSongNumber).thenComparing(Song::getTitle, String.CASE_INSENSITIVE_ORDER))
                .limit(LIMIT)
                .collect(Collectors.toList());

        List<DetectionOutcome> outcomes = new ArrayList<>();
        for (Song song : songs) {
            List<String> chords = collectChordTokens(song, lineChordDAO);
            WeightedDiatonicKeyDetector.Result result = WeightedDiatonicKeyDetector.detect(chords);
            WeightedDiatonicKeyDetector.KeyScore best = result.getBestKey();
            outcomes.add(new DetectionOutcome(song, chords.size(), best));
        }

        Path reportPath = Paths.get(REPORT_TXT);
        Path csvPath = Paths.get(REPORT_CSV);
        Files.writeString(reportPath, buildTextReport(outcomes), StandardCharsets.UTF_8);
        Files.writeString(csvPath, buildCsvReport(outcomes), StandardCharsets.UTF_8);

        System.out.println("Wrote report to " + reportPath.toAbsolutePath());
        System.out.println("Wrote CSV to " + csvPath.toAbsolutePath());
        for (DetectionOutcome outcome : outcomes) {
            System.out.println(outcome.toConsoleString());
        }
    }

    private static List<String> collectChordTokens(Song song, LineChordDAO lineChordDAO) {
        List<String> chords = new ArrayList<>();

        Map<Integer, List<ChordOccurrence>> chordMap = lineChordDAO.getChordsForSong(song.getId());
        for (List<ChordOccurrence> occurrences : chordMap.values()) {
            for (ChordOccurrence occurrence : occurrences) {
                String chord = normalizeChordToken(occurrence.getChord());
                if (chord != null && !chord.isBlank()) {
                    chords.add(chord);
                }
            }
        }

        if (!chords.isEmpty()) {
            return chords;
        }

        if (song.getChords() != null && !song.getChords().isBlank()) {
            for (String chord : ChordParser.extractChords(song.getChords())) {
                String normalized = normalizeChordToken(chord);
                if (normalized != null && !normalized.isBlank()) {
                    chords.add(normalized);
                }
            }
        }

        return chords;
    }

    private static String normalizeChordToken(String rawChord) {
        if (rawChord == null || rawChord.isBlank()) {
            return null;
        }

        ChordToken token = ChordParser.parseChordToken(rawChord);
        String rebuilt = ChordParser.rebuild(token);
        if (rebuilt == null || rebuilt.isBlank()) {
            return null;
        }

        if (rebuilt.contains("/")) {
            rebuilt = rebuilt.substring(0, rebuilt.indexOf('/'));
        }

        rebuilt = rebuilt.replace("♭", "b").replace("♯", "#");
        rebuilt = rebuilt.replaceAll("[^A-G#bm]", "");
        if (rebuilt.isBlank()) {
            return null;
        }
        return rebuilt;
    }

    private static String buildTextReport(List<DetectionOutcome> outcomes) {
        StringBuilder sb = new StringBuilder();
        sb.append("Weighted Diatonic Key Detection Report - First 50 English Songs\n");
        sb.append("Generated from database-backed chord data (read-only)\n");
        sb.append("===============================================================\n");

        for (DetectionOutcome outcome : outcomes) {
            sb.append(String.format("#%d | %s | %s | best=%s/%s | score=%d | confidence=%s | chordCount=%d\n",
                    outcome.song.getSongNumber(),
                    outcome.song.getTitle(),
                    outcome.song.getArtist() == null ? "" : outcome.song.getArtist(),
                    outcome.best.getRoot(),
                    outcome.best.getMode(),
                    outcome.best.getScore(),
                    outcome.best.getConfidence(),
                    outcome.chordCount));
        }
        return sb.toString();
    }

    private static String buildCsvReport(List<DetectionOutcome> outcomes) {
        StringBuilder sb = new StringBuilder();
        sb.append("song_number,title,artist,detected_root,mode,score,confidence,chord_count\n");
        for (DetectionOutcome outcome : outcomes) {
            sb.append(String.format("%d,%s,%s,%s,%s,%d,%s,%d\n",
                    outcome.song.getSongNumber(),
                    csvEscape(outcome.song.getTitle()),
                    csvEscape(outcome.song.getArtist()),
                    outcome.best.getRoot(),
                    outcome.best.getMode(),
                    outcome.best.getScore(),
                    outcome.best.getConfidence(),
                    outcome.chordCount));
        }
        return sb.toString();
    }

    private static String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private static class DetectionOutcome {
        private final Song song;
        private final int chordCount;
        private final WeightedDiatonicKeyDetector.KeyScore best;

        private DetectionOutcome(Song song, int chordCount, WeightedDiatonicKeyDetector.KeyScore best) {
            this.song = song;
            this.chordCount = chordCount;
            this.best = best;
        }

        private String toConsoleString() {
            return String.format("%d | %s | %s/%s | score=%d | confidence=%s | chords=%d",
                    song.getSongNumber(),
                    song.getTitle(),
                    best.getRoot(),
                    best.getMode(),
                    best.getScore(),
                    best.getConfidence(),
                    chordCount);
        }
    }
}
