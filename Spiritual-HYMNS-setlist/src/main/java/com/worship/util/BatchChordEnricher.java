package com.worship.util;

import com.worship.chord.ChordAligner;
import com.worship.model.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

/**
 * Orchestrator for the Batch Chord Enrichment task.
 * Reads the dumped JSON, aligns chords from a provided reference map,
 * and generates the .md and .json files.
 */
public class BatchChordEnricher {

    private static final String INPUT_JSON = "songs_to_enrich.json";
    private static final String OUTPUT_MD = "processed_songs/english_chords_review.md";
    private static final String OUTPUT_JSON = "english_chords.json";

    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<Song> songs = mapper.readValue(new File(INPUT_JSON), new TypeReference<List<Song>>() {});
        
        ChordAligner aligner = new ChordAligner();
        Map<Integer, String> chordReferences = getChordReferences();

        StringBuilder mdReport = new StringBuilder("# CHORD ENRICHMENT REVIEW REPORT\n\n");
        List<Map<String, Object>> jsonExport = new ArrayList<>();

        for (Song song : songs) {
            String ref = chordReferences.get(song.getSongNumber());
            if (ref == null) {
                // Log and skip
                System.out.println("No reference for Song #" + song.getSongNumber() + ": " + song.getTitle());
                continue;
            }

            SongMappingResult result = aligner.align(song, ref);
            
            // Generate MD Entry
            mdReport.append("### SONG ").append(song.getSongNumber()).append(" — ").append(song.getTitle()).append("\n\n");
            mdReport.append("**Original:**\n```\n");
            for (Section s : song.getSections()) {
                for (SongLine l : s.getLines()) {
                    mdReport.append(l.getText()).append("\n");
                }
            }
            mdReport.append("```\n\n");

            mdReport.append("**With Chords:**\n```\n");
            Map<String, Object> songJson = new LinkedHashMap<>();
            songJson.put("songNumber", song.getSongNumber());
            songJson.put("title", song.getTitle());
            List<String> chordedLines = new ArrayList<>();
            List<Map<String, Object>> lineMappings = new ArrayList<>();

            int lineIdx = 0;
            for (Section s : song.getSections()) {
                for (SongLine l : s.getLines()) {
                    LineMappingResult lr = result.getLineResults().get(lineIdx++);
                    String chorded = aligner.formatChordedLine(l.getText(), lr.getChordPositions());
                    mdReport.append(chorded).append("\n");
                    chordedLines.add(chorded);

                    for (ChordOccurrence co : lr.getChordPositions()) {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("lineId", l.getId());
                        map.put("chord", co.getChord());
                        map.put("position", co.getPosition());
                        lineMappings.add(map);
                    }
                }
            }
            mdReport.append("```\n\n---\n\n");
            
            songJson.put("lineChords", lineMappings);
            jsonExport.add(songJson);
        }

        // Write MD
        Files.createDirectories(Paths.get("processed_songs"));
        try (FileWriter fw = new FileWriter(OUTPUT_MD)) {
            fw.write(mdReport.toString());
        }

        // Write JSON
        mapper.writerWithDefaultPrettyPrinter().writeValue(new File(OUTPUT_JSON), jsonExport);

        System.out.println("Batch enrichment complete!");
        System.out.println("Review file: " + OUTPUT_MD);
        System.out.println("Data file: " + OUTPUT_JSON);
    }

    /**
     * Helper to return the collected chord references for the 40 songs.
     * (Populated from browser subagent results and refined knowledge).
     */
    private static Map<Integer, String> getChordReferences() {
        Map<Integer, String> map = new HashMap<>();

        map.put(1, "[D]Spirit of the [G/D]Living [D]God,\n[A]Fall afresh on [D]me.\n[G]Break me, [D/F#]melt me, [Em]mould [A]me, [D]fill me.");
        map.put(2, "[G]Set my spirit free that I may [C]worship [Am]Thee,\n[D]Set my spirit free that I may [C]praise Thy [G]Name.");
        map.put(3, "[D]Sweep over my [G]soul,\n[D]Sweep over my [A]soul,\n[D]Sweet Spirit, [G]sweep over my [A]soul.");
        map.put(4, "[C]The windows of heaven are open,\n[F]The blessings are falling to[C]night;\n[G]There's joy, joy, joy in my heart.");
        map.put(5, "[C]Bless the Lord, O my soul,\n[F]Magnify His wonderful [C]Name\n[C]For the glory of the [F]Lord is mine");
        map.put(6, "[E]Great is the Lord, and [B]greatly to be praised\nIn the [F#m]city of our [B]God, in the [E]mountain of His holiness");
        map.put(7, "[C]I know it was the Blood, [F]I know it was the [C]Blood,\n[C]I know it was the [G]Blood for [C]me;");
        map.put(8, "[G]Burn, burn, Holy Spirit, [C]burn in [G]me,\n[G]Set my [C]heart on [D]fire,");
        map.put(9, "[G]His Name is Wonderful, [C]His Name is [G]Wonderful,\n[G]His Name is Wonderful, [D]Jesus my [G]Lord.");
        map.put(10, "[G]From glory to glory He's [C]changing [G]me,\n[G]Changing me, [D]changing me,");
        map.put(11, "[G]I'll praise His Name for [C]ever[G]more,\n[G]I'll praise His Name for [D]ever[G]more,");
        map.put(12, "[C]It's a lovely, lovely, [F]Name,\n[C]The Name of [G]Jesus.");
        map.put(13, "[C]In the name of Jesus, [F]through the blood of [C]Jesus,\n[C]We have the [G]victory,");
        map.put(14, "[G]All over the world, the [C]Spirit is [G]moving,\n[G]All over the world, as the [D]prophets said it would [G]be,");
        map.put(15, "[G]Rejoice in the Lord [C]always\n[D]And again I say re[G]joice");
        map.put(16, "[G]I'll say yes, [C]yes, [G]yes,\n[G]I'll say yes [D]Lord,");
        map.put(17, "[G]We are gathering to[C]gether unto [G]Him\n[G]Unto Him shall the [D]gathering of the people [G]be,");
        map.put(18, "[C]To be like Jesus, [F]to be like Jesus,\n[C]All I ask, to be like [G]Him");
        map.put(19, "[G]It's not by might, [C]it's not by [G]power,\n[G]But by my Spirit, [D]saith the [G]Lord.");
        map.put(20, "[G]I've found a new way of [C]living\n[G]I've found a new life di[D]vine,");
        map.put(21, "[D]With my [F#m]hands lifted [Bm]up\nAnd my [A]mouth filled with [D]praise");
        map.put(22, "[C]I will sing of the mercies of the Lord [F]forever\nI will [G]sing, I will [C]sing");
        map.put(23, "[G]Therefore the re[G7]deemed of the Lord shall re[C]turn\nAnd come with [G]singing unto [D7]Zion");
        map.put(24, "[D]Cover me, [Bm]cover me\n[Em]Extend the border of Thy [A7]mantle [D]over me");
        map.put(25, "[D]Lift Jesus higher, [G]lift Jesus higher\n[A7]Lift Him up for the world to [D]see");
        map.put(26, "[G]He is the same unchanging Jesus\n[C]Unchanging Jesus, [D]unchanging Jesus");
        map.put(27, "[Em]Jehovah Jireh, [Am]my provider\n[C]His grace is [D]sufficient for [Em]me");
        map.put(28, "[G]From the rising of the [D]sun\nTo the [C]going [D]down of the [G]same");
        map.put(29, "[F]Everybody ought to [Bb]know\nWho [F]Jesus [C]is");
        map.put(30, "[Bm]Sing Halle[A]lujah to the [Bm]Lord [F#m]");
        map.put(31, "[G]I will sing unto the [C]Lord as [G]long as I live,");
        map.put(32, "[G]I will enter His gates with [C]thanksgiving in my [G]heart,");
        map.put(33, "[C]Come and praise Him, [F]royal [C]priesthood,");
        map.put(34, "[C]Come into His presence [F]singing [C]Allelujah");
        map.put(35, "[C]Bless the Lord, O my soul,\n[F]And all that is within [C]me");
        map.put(36, "[C]Jesus take me as I [F]am;\n[C]I can come no other [G]way,");
        map.put(37, "[D]When I feel the touch of Your [G]hand upon my [D]life,");
        map.put(38, "[G]I thank you Jesus for Your [C]love to [G]me,");
        map.put(39, "[G]I've taken my harp down from the [C]willow [G]tree,");
        map.put(40, "[C]Thank you God for [F]sending [C]Jesus.");

        return map;
    }
}
