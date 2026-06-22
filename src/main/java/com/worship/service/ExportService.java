package com.worship.service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.worship.dao.LineChordDAO;
import com.worship.dao.SongDAO;
import com.worship.model.ChordOccurrence;
import com.worship.model.Section;
import com.worship.model.Song;
import com.worship.model.SongLine;
import com.ibm.icu.text.Transliterator;
import java.text.Normalizer;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

public class ExportService {

    private final SongDAO songDAO;
    private final LineChordDAO lineChordDAO;
    private final SearchService searchService;
    private final ObjectMapper mapper;

    private static final Transliterator latinToDevanagari = Transliterator.getInstance("Latin-Devanagari");
    private static final Transliterator devanagariToLatin = Transliterator.getInstance("Devanagari-Latin");

    private String convertHindiTitleToDevanagari(String title) {
        if (title == null || title.isEmpty()) return title;
        return latinToDevanagari.transliterate(title.toLowerCase());
    }

    private String stripDiacritics(String str) {
        if (str == null) return null;
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }

    private String cleanFirstLineAsTitle(String firstLine) {
        if (firstLine == null || firstLine.trim().isEmpty()) return "";
        String clean = firstLine.trim();
        clean = clean.replaceAll("\\s*\\([0-9\\u0966-\\u096F]+\\)\\s*$", "");
        clean = clean.replaceAll("\\s*\\[[0-9\\u0966-\\u096F]+\\]\\s*$", "");
        clean = clean.replaceAll("[,.!?;:|!\\\"\\'\\(\\)\\[\\]\\{\\}—\\-\\–\\—\\s]+$", "");
        return clean.trim();
    }

    public ExportService() {
        this.songDAO = new SongDAO();
        this.lineChordDAO = new LineChordDAO();
        this.searchService = new SearchService();
        this.mapper = new ObjectMapper();
        this.mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        this.mapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    public static class ManifestDto {
        public String version = "v1";
        public String generatedAt;
        public int songCount;
        public Map<String, LanguageStats> languages = new HashMap<>();
        public String exportedBy = "ExportService v1.0";
    }

    public static class LanguageStats {
        public int count;
        public String range;
        public LanguageStats(int count, String range) {
            this.count = count;
            this.range = range;
        }
    }

    public static class IndexDto {
        public String version = "v1";
        public List<IndexSongDto> songs = new ArrayList<>();
    }

    public static class IndexSongDto {
        public int id;
        public int songNumber;
        public String title;
        public String artist;
        public String language;
        public String originalKey;
        public List<String> hashtags;
        public String searchTokens;
        public String romanTitle;
    }

    public static class FullSongDto {
        public int id;
        public int songNumber;
        public String title;
        public String artist;
        public String composer;
        public String language;
        public String originalKey;
        public int capo;
        public int bpm;
        public String timeSignature;
        public List<String> hashtags;
        public List<SectionDto> sections = new ArrayList<>();
    }

    public static class SectionDto {
        public String type;
        public String label;
        public List<LineDto> lines = new ArrayList<>();
    }

    public static class LineDto {
        public String text;
        public List<ChordDto> chords;
    }

    public static class ChordDto {
        public String chord;
        public int position;
    }

    public void exportFull(String outputDirPath) {
        System.out.println("Starting full export to " + outputDirPath + "...");
        File outDir = new File(outputDirPath);
        File songsDir = new File(outDir, "songs");
        outDir.mkdirs();
        songsDir.mkdirs();

        List<Song> allSongs = songDAO.getAllSongs();
        
        // --- HARDENING: Data Integrity Validation ---
        Set<Integer> seenIds = new HashSet<>();
        Map<String, Set<Integer>> seenNumbersByLang = new HashMap<>();
        
        for (Song s : allSongs) {
            if (s.getId() <= 0) throw new RuntimeException("CRITICAL: Invalid ID detected for song: " + s.getTitle());
            if (!seenIds.add(s.getId())) throw new RuntimeException("CRITICAL: Duplicate ID detected: " + s.getId());
            
            String lang = s.getLanguage() != null ? s.getLanguage().toLowerCase() : "unknown";
            seenNumbersByLang.computeIfAbsent(lang, k -> new HashSet<>());
            if (!seenNumbersByLang.get(lang).add(s.getSongNumber())) {
                throw new RuntimeException("CRITICAL: Number collision in " + lang + ": #" + s.getSongNumber() + " (" + s.getTitle() + ")");
            }
            
            if (s.getTitle() == null || s.getTitle().trim().isEmpty()) {
                throw new RuntimeException("CRITICAL: Missing title for song ID: " + s.getId());
            }
        }
        System.out.println("Data integrity check PASSED. Proceeding to export...");

        ManifestDto manifest = new ManifestDto();
        manifest.generatedAt = Instant.now().toString();
        manifest.songCount = allSongs.size();

        int engCount = 0, hinCount = 0, marCount = 0;
        IndexDto index = new IndexDto();

        int processed = 0;
        for (Song s : allSongs) {
            if ("english".equalsIgnoreCase(s.getLanguage())) engCount++;
            else if ("hindi".equalsIgnoreCase(s.getLanguage())) hinCount++;
            else if ("marathi".equalsIgnoreCase(s.getLanguage())) marCount++;

            // Load full song entity to get sections
            Song fullSongEntity = songDAO.getSongById(s.getId());
            if (fullSongEntity == null) continue; // Should not happen
            
            List<Section> sections = fullSongEntity.getSections();
            Map<Integer, List<ChordOccurrence>> chordMap = lineChordDAO.getChordsForSong(s.getId());

            // --- HARDENING: Legacy Fallback Pipeline ---
            // If the song has no entries in the sections table, we transcode from flat text fields
            if (sections == null || sections.isEmpty()) {
                String flatText = fullSongEntity.getChords();
                if (flatText == null || flatText.trim().isEmpty()) {
                    flatText = fullSongEntity.getLyricsOriginal();
                }

                if (flatText != null && !flatText.trim().isEmpty()) {
                    // 1. Normalize "Chords Above" format if detected
                    if (com.worship.util.SongFormatDetector.detect(flatText) == com.worship.util.SongFormatDetector.Format.CHORDS_ABOVE) {
                        flatText = com.worship.util.ChordLineMerger.convertToInline(flatText);
                    }

                    // 2. Parse into structured coordinates
                    List<com.worship.model.StructuredLine> structuredLines = com.worship.util.ChordParser.parseStructuredSong(flatText);
                    
                    // 3. Construct synthetic section to satisfy DTO model
                    Section syntheticSection = new Section();
                    syntheticSection.setLabel("Verse 1");
                    syntheticSection.setType("verse");
                    List<SongLine> syntheticLines = new ArrayList<>();
                    
                    for (int i = 0; i < structuredLines.size(); i++) {
                        com.worship.model.StructuredLine sl = structuredLines.get(i);
                        SongLine line = new SongLine();
                        line.setText(sl.getLyrics());
                        // Use negative temporary IDs to avoid collision with DB IDs in chordMap
                        int tempLineId = -(i + 1);
                        line.setId(tempLineId);
                        syntheticLines.add(line);
                        
                        if (sl.getChords() != null && !sl.getChords().isEmpty()) {
                            chordMap.put(tempLineId, sl.getChords());
                        }
                    }
                    syntheticSection.setLines(syntheticLines);
                    sections = Collections.singletonList(syntheticSection);
                }
            }

            // Build search tokens (normalized title + artist + first lyric line)
            String firstLine = "";
            if (sections != null && !sections.isEmpty()) {
                Section firstSec = sections.get(0);
                if (firstSec.getLines() != null && !firstSec.getLines().isEmpty()) {
                    firstLine = firstSec.getLines().get(0).getText();
                }
            }

            String displayTitle = s.getTitle();
            if ("hindi".equalsIgnoreCase(s.getLanguage())) {
                String cleanedFirstLine = cleanFirstLineAsTitle(firstLine);
                if (cleanedFirstLine != null && !cleanedFirstLine.isEmpty()) {
                    displayTitle = cleanedFirstLine;
                } else {
                    displayTitle = convertHindiTitleToDevanagari(s.getTitle());
                }
            }
            
            String artistPart = (s.getArtist() != null) ? s.getArtist() : "";
            
            StringBuilder rawTokensBuilder = new StringBuilder();
            rawTokensBuilder.append(s.getSongNumber()).append(" ");
            rawTokensBuilder.append(displayTitle).append(" ");
            
            if ("hindi".equalsIgnoreCase(s.getLanguage())) {
                // Include original DB title (may be Latin transliteration already)
                rawTokensBuilder.append(s.getTitle()).append(" ");
                // Include Devanagari first line
                if (firstLine != null && !firstLine.isEmpty()) {
                    rawTokensBuilder.append(firstLine).append(" ");
                    // Transliterate first line to Latin for English keyboard search
                    try {
                        String romanFirstLine = stripDiacritics(devanagariToLatin.transliterate(firstLine))
                            .toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
                        rawTokensBuilder.append(romanFirstLine).append(" ");
                    } catch (Exception e) {}
                }
                // Also transliterate the display title for Hindi so users can search "yehova" etc.
                try {
                    String romanDisplayTitle = stripDiacritics(devanagariToLatin.transliterate(displayTitle))
                        .toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
                    rawTokensBuilder.append(romanDisplayTitle).append(" ");
                } catch (Exception e) {}
            } else if ("marathi".equalsIgnoreCase(s.getLanguage())) {
                // Always append Devanagari first line
                if (firstLine != null && !firstLine.isEmpty()) {
                    rawTokensBuilder.append(firstLine).append(" ");
                }
                // Transliterate BEFORE calling normalizeQuery (which would strip diacritics)
                // Append Latin (Roman) forms of both title and first line for English keyboard search
                try {
                    String romanTitle = stripDiacritics(devanagariToLatin.transliterate(displayTitle))
                        .toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
                    rawTokensBuilder.append(romanTitle).append(" ");
                } catch (Exception e) {}
                if (firstLine != null && !firstLine.isEmpty()) {
                    try {
                        String romanFirstLine = stripDiacritics(devanagariToLatin.transliterate(firstLine))
                            .toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
                        rawTokensBuilder.append(romanFirstLine).append(" ");
                    } catch (Exception e) {}
                }
            } else {
                if (firstLine != null && !firstLine.isEmpty()) {
                    rawTokensBuilder.append(firstLine).append(" ");
                }
            }
            rawTokensBuilder.append(artistPart);
            
            String searchTokens = searchService.normalizeQuery(rawTokensBuilder.toString());
            String romanTitle = "";
            if ("english".equalsIgnoreCase(s.getLanguage())) {
                romanTitle = displayTitle.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
            } else {
                try {
                    romanTitle = stripDiacritics(devanagariToLatin.transliterate(displayTitle))
                        .toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
                } catch (Exception e) {
                    romanTitle = displayTitle.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
                }
            }

            // Index Entry
            IndexSongDto idxSong = new IndexSongDto();
            idxSong.id = s.getId();
            idxSong.songNumber = s.getSongNumber();
            idxSong.title = displayTitle;
            idxSong.artist = s.getArtist();
            idxSong.language = s.getLanguage();
            idxSong.originalKey = s.getOriginalKey();
            idxSong.hashtags = s.getHashtags() != null ? s.getHashtags() : new ArrayList<>();
            idxSong.searchTokens = searchTokens;
            idxSong.romanTitle = romanTitle;
            index.songs.add(idxSong);

            // Full Song Entry
            FullSongDto fullSong = new FullSongDto();
            fullSong.id = s.getId();
            fullSong.songNumber = s.getSongNumber();
            fullSong.title = displayTitle;
            fullSong.artist = s.getArtist();
            fullSong.composer = s.getComposer();
            fullSong.language = s.getLanguage();
            fullSong.originalKey = s.getOriginalKey();
            fullSong.capo = s.getCapo();
            fullSong.bpm = s.getBpm();
            fullSong.timeSignature = s.getTimeSignature();
            fullSong.hashtags = idxSong.hashtags;

            if (sections != null) {
                for (Section sec : sections) {
                    SectionDto secDto = new SectionDto();
                    secDto.type = sec.getType() != null ? sec.getType().toLowerCase() : "verse";
                    secDto.label = sec.getLabel() != null ? sec.getLabel() : "Verse 1";
                    if (sec.getLines() != null) {
                        for (SongLine sl : sec.getLines()) {
                            LineDto lineDto = new LineDto();
                            lineDto.text = sl.getText() != null ? sl.getText() : "";
                            
                            List<ChordOccurrence> chords = chordMap.get(sl.getId());
                            if (chords != null && !chords.isEmpty()) {
                                lineDto.chords = new ArrayList<>();
                                for (ChordOccurrence co : chords) {
                                    ChordDto cDto = new ChordDto();
                                    cDto.chord = co.getChord();
                                    // Rule: position must be <= text length
                                    cDto.position = Math.min(Math.max(0, co.getPosition()), lineDto.text.length());
                                    lineDto.chords.add(cDto);
                                }
                                // Rule: chords sorted by position
                                lineDto.chords.sort(Comparator.comparingInt(c -> c.position));
                            }
                            secDto.lines.add(lineDto);
                        }
                    }
                    fullSong.sections.add(secDto);
                }
            }

            // Write individual song JSON — use unique DB id as filename
            File songFile = new File(songsDir, s.getId() + ".json");
            try {
                mapper.writeValue(songFile, fullSong);
            } catch (IOException e) {
                System.err.println("Error writing song " + s.getId() + ": " + e.getMessage());
            }

            processed++;
            if (processed % 100 == 0) {
                System.out.println("Exported " + processed + " songs...");
            }
        }

        manifest.languages.put("english", new LanguageStats(engCount, "1-999"));
        manifest.languages.put("hindi", new LanguageStats(hinCount, "1001-1999"));
        manifest.languages.put("marathi", new LanguageStats(marCount, "2001-2999"));

        try {
            System.out.println("Writing manifest.json and index.json...");
            mapper.writeValue(new File(outDir, "manifest.json"), manifest);
            mapper.writeValue(new File(outDir, "index.json"), index);
            System.out.println("Export completed successfully! Total songs: " + processed);
        } catch (IOException e) {
            System.err.println("Error writing manifest/index: " + e.getMessage());
        }
    }
}
