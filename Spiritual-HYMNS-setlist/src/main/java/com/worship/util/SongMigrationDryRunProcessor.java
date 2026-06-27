package com.worship.util;

import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.model.ChordOccurrence;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SongMigrationDryRunProcessor {

    private static final String REFERENCE_CSV = "reference_song_index.csv";
    private static final Pattern REFERENCE_PATTERN = Pattern.compile("^(English|Hindi|Marathi|Konkani),(\\d+),([^\"]*),([^\"]*),([^,]*)$");
    private static final String DEFAULT_LANGUAGE = "english";
    private static final int DEFAULT_SONG_NUMBER = 17;

    public static void main(String[] args) throws Exception {
        String language = DEFAULT_LANGUAGE;
        int songNumber = DEFAULT_SONG_NUMBER;

        if (args.length >= 1) {
            language = args[0].trim().toLowerCase(Locale.ROOT);
        }
        if (args.length >= 2) {
            try {
                songNumber = Integer.parseInt(args[1].trim());
            } catch (NumberFormatException e) {
                System.err.println("Invalid song number: " + args[1]);
                return;
            }
        }

        SongMigrationDryRunProcessor processor = new SongMigrationDryRunProcessor();
        processor.runDryRun(language, songNumber);
    }

    private void runDryRun(String language, int songNumber) throws Exception {
        Map<String, ReferenceEntry> referenceIndex = loadReferenceIndex();
        String lookupKey = buildLookupKey(language, songNumber);

        if (!referenceIndex.containsKey(lookupKey)) {
            System.out.println("Reference Not Found");
            return;
        }

        ReferenceEntry reference = referenceIndex.get(lookupKey);
        SongDAO songDAO = new SongDAO();
        List<Song> matchedSongs = songDAO.getSongsByNumberAndLanguage(songNumber, language);

        if (matchedSongs.isEmpty()) {
            System.out.println("Database song not found for " + language + " #" + songNumber);
            return;
        }
        if (matchedSongs.size() > 1) {
            System.out.println("Multiple database songs found for " + language + " #" + songNumber + "; using first match.");
        }

        Song song = matchedSongs.get(0);
        String dbKey = song.getOriginalKey() != null ? song.getOriginalKey().trim() : "";
        String refKey = reference.referenceKey != null ? reference.referenceKey.trim() : "";

        if (dbKey.isEmpty() || refKey.isEmpty()) {
            System.out.println("Database key or reference key missing.");
            System.out.println("Database Key\n\n" + dbKey + "\n\nReference Key\n\n" + refKey);
            return;
        }

        int interval = calculateInterval(dbKey, refKey);
        List<SectionPreview> preview = buildSongPreview(song);
        int chordCount = countChords(preview);

        printReport(song, dbKey, refKey, interval, chordCount, preview);
    }

    private Map<String, ReferenceEntry> loadReferenceIndex() throws IOException {
        Path csvPath = Paths.get(REFERENCE_CSV);
        if (!Files.exists(csvPath)) {
            throw new IOException("Reference CSV not found: " + csvPath.toAbsolutePath());
        }
        Map<String, ReferenceEntry> referenceIndex = new HashMap<>();
        List<String> lines = Files.readAllLines(csvPath, StandardCharsets.UTF_8);
        boolean headerSkipped = false;
        for (String rawLine : lines) {
            if (!headerSkipped) {
                headerSkipped = true;
                continue;
            }
            if (rawLine.isBlank()) continue;
            String[] parts = splitCsvLine(rawLine);
            if (parts.length < 5) continue;
            String lang = parts[0].trim().toLowerCase(Locale.ROOT);
            int number = Integer.parseInt(parts[1].trim());
            String title = parts[2].trim();
            String refKey = parts[4].trim();
            referenceIndex.put(buildLookupKey(lang, number), new ReferenceEntry(lang, number, title, refKey));
        }
        return referenceIndex;
    }

    private String[] splitCsvLine(String rawLine) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < rawLine.length(); i++) {
            char c = rawLine.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
                continue;
            }
            current.append(c);
        }
        values.add(current.toString());
        return values.toArray(new String[0]);
    }

    private int calculateInterval(String dbKey, String refKey) {
        String normalizedDbKey = normalizeKey(dbKey);
        String normalizedRefKey = normalizeKey(refKey);
        if (normalizedDbKey.isEmpty() || normalizedRefKey.isEmpty()) {
            return 0;
        }
        int dbIndex = ChordTransposer.getKeyIndex(normalizedDbKey);
        int refIndex = ChordTransposer.getKeyIndex(normalizedRefKey);
        if (dbIndex < 0 || refIndex < 0) {
            return 0;
        }
        int interval = refIndex - dbIndex;
        if (interval > 6) interval -= 12;
        if (interval < -6) interval += 12;
        return interval;
    }

    private String normalizeKey(String key) {
        if (key == null) return "";
        String normalized = Normalizer.normalize(key, Normalizer.Form.NFKC).trim();
        normalized = normalized.replace("♭", "b").replace("♯", "#");
        normalized = normalized.replaceAll("(?i)maj(or)?$", "");
        normalized = normalized.replaceAll("(?i)m(inor)?$", "m");
        normalized = normalized.replaceAll("[^A-Ga-g#bm]+", "");
        if (normalized.isEmpty()) return "";

        char root = Character.toUpperCase(normalized.charAt(0));
        String suffix = normalized.length() > 1 ? normalized.substring(1) : "";
        normalized = root + suffix;

        if (normalized.endsWith("m") || normalized.endsWith("M")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private List<SectionPreview> buildSongPreview(Song song) {
        List<SectionPreview> songPreview = new ArrayList<>();
        LineChordDAO lineChordDAO = new LineChordDAO();
        Map<Integer, List<ChordOccurrence>> chordMap = lineChordDAO.getChordsForSong(song.getId());

        for (Section section : song.getSections()) {
            SectionPreview sectionPreview = new SectionPreview(section.getLabel());
            for (SongLine line : section.getLines()) {
                String lyricText = line.getText() != null ? line.getText() : "";
                List<ChordOccurrence> chords = chordMap.getOrDefault(line.getId(), new ArrayList<>());
                sectionPreview.lines.add(new LinePreview(lyricText, chords));
            }
            songPreview.add(sectionPreview);
        }
        return songPreview;
    }

    private int countChords(List<SectionPreview> preview) {
        int count = 0;
        for (SectionPreview section : preview) {
            for (LinePreview line : section.lines) {
                count += line.chords.size();
            }
        }
        return count;
    }

    private void printReport(Song song, String dbKey, String refKey, int interval, int chordCount, List<SectionPreview> preview) {
        System.out.println("========================================");
        System.out.println();
        System.out.println("Migration Dry Run");
        System.out.println();
        System.out.println("========================================");
        System.out.println();
        System.out.println("Song");
        System.out.println();
        System.out.println(capitalize(song.getLanguage()) + " #" + song.getSongNumber());
        System.out.println();
        System.out.println(song.getTitle());
        System.out.println();
        System.out.println("Database Key");
        System.out.println();
        System.out.println(dbKey);
        System.out.println();
        System.out.println("Reference Key");
        System.out.println();
        System.out.println(refKey);
        System.out.println();
        System.out.println("Interval");
        System.out.println();
        System.out.println((interval >= 0 ? "+" : "") + interval + " semitones");
        System.out.println();
        System.out.println("Transposed");
        System.out.println();
        System.out.println(interval != 0 ? "YES" : "NO");
        System.out.println();
        System.out.println("Chord Count");
        System.out.println();
        System.out.println(chordCount);
        System.out.println();
        System.out.println("Preview");
        System.out.println();
        System.out.println("Before");
        System.out.println();

        int previewLines = 0;
        for (SectionPreview section : preview) {
            for (LinePreview line : section.lines) {
                if (line.chords.isEmpty()) continue;
                if (previewLines >= 8) break;
                System.out.println(renderLineWithChords(line.lyrics, line.chords));
                previewLines++;
            }
            if (previewLines >= 8) break;
        }

        System.out.println();
        System.out.println("After");
        System.out.println();

        previewLines = 0;
        for (SectionPreview section : preview) {
            for (LinePreview line : section.lines) {
                if (line.chords.isEmpty()) continue;
                if (previewLines >= 8) break;
                System.out.println(renderLineWithTransposedChords(line.lyrics, line.chords, interval));
                previewLines++;
            }
            if (previewLines >= 8) break;
        }

        System.out.println();
        System.out.println("Database");
        System.out.println();
        System.out.println("No changes made.");
        System.out.println();
        System.out.println("Dry Run = TRUE");
        System.out.println();
        System.out.println("========================================");
    }

    private String renderLineWithChords(String lyrics, List<ChordOccurrence> chords) {
        StringBuilder line = new StringBuilder(lyrics);
        return renderLine(lyrics, chords, null);
    }

    private String renderLineWithTransposedChords(String lyrics, List<ChordOccurrence> chords, int interval) {
        return renderLine(lyrics, chords, interval);
    }

    private String renderLine(String lyrics, List<ChordOccurrence> chords, Integer interval) {
        if (chords.isEmpty()) {
            return lyrics;
        }
        StringBuilder builder = new StringBuilder();
        int cursor = 0;
        for (ChordOccurrence chord : chords) {
            int pos = Math.max(0, Math.min(chord.getPosition(), lyrics.length()));
            while (cursor < pos) {
                builder.append(lyrics.charAt(cursor));
                cursor++;
            }
            String chordText = chord.getChord();
            if (interval != null) {
                chordText = ChordTransposer.transposeChord(chordText, interval);
            }
            builder.append("[").append(chordText).append("]");
        }
        builder.append(lyrics.substring(cursor));
        return builder.toString();
    }

    private String buildLookupKey(String language, int songNumber) {
        return language.trim().toLowerCase(Locale.ROOT) + "#" + songNumber;
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) return value;
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
    }

    private static class ReferenceEntry {
        final String language;
        final int songNumber;
        final String title;
        final String referenceKey;

        ReferenceEntry(String language, int songNumber, String title, String referenceKey) {
            this.language = language;
            this.songNumber = songNumber;
            this.title = title;
            this.referenceKey = referenceKey;
        }
    }

    private static class SectionPreview {
        final String label;
        final List<LinePreview> lines = new ArrayList<>();

        SectionPreview(String label) {
            this.label = label;
        }
    }

    private static class LinePreview {
        final String lyrics;
        final List<ChordOccurrence> chords;

        LinePreview(String lyrics, List<ChordOccurrence> chords) {
            this.lyrics = lyrics;
            this.chords = chords;
        }
    }
}

