package com.worship.util;

import java.util.*;
import java.util.stream.Collectors;

public class WeightedDiatonicKeyDetector {

    private static final List<String> MAJOR_KEYS = Arrays.asList(
            "C", "G", "D", "A", "E", "B", "F#", "C#",
            "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb",
            "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m"
    );

    private static final Map<String, List<String>> DIATONIC_CHORDS = new LinkedHashMap<>();

    static {
        DIATONIC_CHORDS.put("C", Arrays.asList("C", "Dm", "Em", "F", "G", "Am", "Bdim"));
        DIATONIC_CHORDS.put("G", Arrays.asList("G", "Am", "Bm", "C", "D", "Em", "F#dim"));
        DIATONIC_CHORDS.put("D", Arrays.asList("D", "Em", "F#m", "G", "A", "Bm", "C#dim"));
        DIATONIC_CHORDS.put("A", Arrays.asList("A", "Bm", "C#m", "D", "E", "F#m", "G#dim"));
        DIATONIC_CHORDS.put("E", Arrays.asList("E", "F#m", "G#m", "A", "B", "C#m", "D#dim"));
        DIATONIC_CHORDS.put("B", Arrays.asList("B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"));
        DIATONIC_CHORDS.put("F#", Arrays.asList("F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"));
        DIATONIC_CHORDS.put("C#", Arrays.asList("C#", "D#m", "E#m", "F#", "G#", "A#m", "B#dim"));
        DIATONIC_CHORDS.put("F", Arrays.asList("F", "Gm", "Am", "Bb", "C", "Dm", "Edim"));
        DIATONIC_CHORDS.put("Bb", Arrays.asList("Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"));
        DIATONIC_CHORDS.put("Eb", Arrays.asList("Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"));
        DIATONIC_CHORDS.put("Ab", Arrays.asList("Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"));
        DIATONIC_CHORDS.put("Db", Arrays.asList("Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"));
        DIATONIC_CHORDS.put("Gb", Arrays.asList("Gb", "Abm", "Bbm", "Cb", "Db", "Ebm", "Fdim"));
        DIATONIC_CHORDS.put("Cb", Arrays.asList("Cb", "Dbm", "Ebm", "Fb", "Gb", "Abm", "Bbdim"));
        DIATONIC_CHORDS.put("Am", Arrays.asList("Am", "Bm", "C", "Dm", "Em", "F", "G"));
        DIATONIC_CHORDS.put("Em", Arrays.asList("Em", "F#m", "G", "Am", "Bm", "C", "D"));
        DIATONIC_CHORDS.put("Bm", Arrays.asList("Bm", "C#m", "D", "Em", "F#m", "G", "A"));
        DIATONIC_CHORDS.put("F#m", Arrays.asList("F#m", "G#m", "A", "Bm", "C#m", "D", "E"));
        DIATONIC_CHORDS.put("C#m", Arrays.asList("C#m", "D#m", "E", "F#m", "G#m", "A", "B"));
        DIATONIC_CHORDS.put("G#m", Arrays.asList("G#m", "A#m", "B", "C#m", "D#m", "E", "F#"));
        DIATONIC_CHORDS.put("D#m", Arrays.asList("D#m", "E#m", "F#", "G#m", "A#m", "B", "C#"));
        DIATONIC_CHORDS.put("A#m", Arrays.asList("A#m", "B#m", "C#", "D#m", "E#m", "F#", "G#"));
    }

    public static Result detect(List<String> chords) {
        if (chords == null || chords.isEmpty()) {
            return new Result(Collections.emptyList(), new KeyScore("C", "major", 0, 0, 0, "low"));
        }

        List<String> normalized = chords.stream()
                .filter(Objects::nonNull)
                .map(WeightedDiatonicKeyDetector::normalizeChord)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (normalized.isEmpty()) {
            return new Result(Collections.emptyList(), new KeyScore("C", "major", 0, 0, 0, "low"));
        }

        List<KeyScore> scores = new ArrayList<>();
        for (String key : DIATONIC_CHORDS.keySet()) {
            int score = 0;
            for (String chord : normalized) {
                if (DIATONIC_CHORDS.get(key).contains(chord)) {
                    score += 2;
                } else if (chord.startsWith("B") && chord.endsWith("dim") && key.equals("C")) {
                    score += 1;
                }
            }
            scores.add(new KeyScore(key, key.endsWith("m") ? "minor" : "major", score, 0, 0, "low"));
        }

        scores.sort(Comparator.comparingInt(KeyScore::getScore).reversed());
        KeyScore best = scores.get(0);
        best.setRank(1);
        best.setConfidence(best.getScore() > 0 ? "high" : "low");
        best.setMargin(0);

        return new Result(scores, best);
    }

    private static String normalizeChord(String input) {
        if (input == null) return null;
        String cleaned = input.trim();
        if (cleaned.isEmpty()) return null;
        if (cleaned.contains("/")) {
            cleaned = cleaned.substring(0, cleaned.indexOf('/'));
        }
        cleaned = cleaned.replace("♭", "b").replace("♯", "#");
        cleaned = cleaned.replaceAll("[^A-G#bm]", "");
        if (cleaned.length() == 1) {
            return cleaned.toUpperCase(Locale.ROOT);
        }
        if (cleaned.startsWith("B") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Bm";
        }
        if (cleaned.startsWith("C") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Cm";
        }
        if (cleaned.startsWith("D") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Dm";
        }
        if (cleaned.startsWith("E") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Em";
        }
        if (cleaned.startsWith("F") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Fm";
        }
        if (cleaned.startsWith("G") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Gm";
        }
        if (cleaned.startsWith("A") && cleaned.length() == 2 && cleaned.charAt(1) == 'm') {
            return "Am";
        }
        if (cleaned.equals("F#")) return "F#";
        if (cleaned.equals("C#")) return "C#";
        if (cleaned.equals("G#")) return "G#";
        if (cleaned.equals("D#")) return "D#";
        if (cleaned.equals("A#")) return "A#";
        if (cleaned.equals("E#")) return "E#";
        if (cleaned.equals("B#")) return "B#";
        return cleaned;
    }

    public static class Result {
        private final List<KeyScore> candidates;
        private final KeyScore bestKey;

        public Result(List<KeyScore> candidates, KeyScore bestKey) {
            this.candidates = candidates;
            this.bestKey = bestKey;
        }

        public List<KeyScore> getCandidates() { return candidates; }
        public KeyScore getBestKey() { return bestKey; }
    }

    public static class KeyScore {
        private final String root;
        private final String mode;
        private int score;
        private int rank;
        private int margin;
        private String confidence;

        public KeyScore(String root, String mode, int score, int rank, int margin, String confidence) {
            this.root = root;
            this.mode = mode;
            this.score = score;
            this.rank = rank;
            this.margin = margin;
            this.confidence = confidence;
        }

        public String getRoot() { return root; }
        public String getMode() { return mode; }
        public int getScore() { return score; }
        public int getRank() { return rank; }
        public int getMargin() { return margin; }
        public String getConfidence() { return confidence; }

        public void setScore(int score) { this.score = score; }
        public void setRank(int rank) { this.rank = rank; }
        public void setMargin(int margin) { this.margin = margin; }
        public void setConfidence(String confidence) { this.confidence = confidence; }
    }
}
