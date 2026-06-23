package com.worship.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Transposes Indian solfege notes (Sa Re Ga Ma Pa Dha Ni).
 * Maps chromatic scale positions to Indian solfege equivalents.
 * Handles komal (flat) and tivra (sharp) variants.
 */
public class NoteTransposer {

    private static final String[] SWAR_CHROMATIC = {
        "Sa", "Re♭", "Re", "Ga♭", "Ga", "Ma", "Ma♯",
        "Pa", "Dha♭", "Dha", "Ni♭", "Ni"
    };

    private static final String[][] SWAR_PATTERNS = {
        {"Ma♯", "6"}, {"Re♭", "1"}, {"Ga♭", "3"}, {"Dha♭", "8"}, {"Ni♭", "10"},
        {"Sa", "0"}, {"Re", "2"}, {"Ga", "4"}, {"Ma", "5"}, {"Pa", "7"}, {"Dha", "9"}, {"Ni", "11"}
    };

    /**
     * Bug #25 fix: Added negative lookarounds (?<![a-zA-Z]) and (?![a-zA-Z]) 
     * to ensure swar names are matched as whole words only. 
     * This prevents mangling words like "Sagar" or "Pani".
     */
    private static final Pattern SWAR_PATTERN = Pattern.compile(
        "(?<![a-zA-Z])(Ma♯|Re♭|Ga♭|Dha♭|Ni♭|Sa|Re|Ga|Ma|Pa|Dha|Ni)(?![a-zA-Z])"
    );

    public static String transposeNotes(String noteLine, int semitones) {
        if (noteLine == null || noteLine.isEmpty() || semitones == 0) {
            return noteLine;
        }

        Matcher matcher = SWAR_PATTERN.matcher(noteLine);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String swar = matcher.group(1);
            int chromaticIndex = swarToChromaticIndex(swar);
            if (chromaticIndex >= 0) {
                int newIndex = ((chromaticIndex + semitones) % 12 + 12) % 12;
                String newSwar = SWAR_CHROMATIC[newIndex];
                matcher.appendReplacement(result, Matcher.quoteReplacement(newSwar));
            }
        }
        matcher.appendTail(result);

        return result.toString();
    }

    private static int swarToChromaticIndex(String swar) {
        for (String[] pattern : SWAR_PATTERNS) {
            if (pattern[0].equals(swar)) {
                return Integer.parseInt(pattern[1]);
            }
        }
        return -1;
    }

    public static String transposeSongNotes(String fullNotes, int semitones) {
        if (fullNotes == null || fullNotes.isEmpty() || semitones == 0) {
            return fullNotes;
        }

        String[] lines = fullNotes.split("\\r?\\n");
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < lines.length; i++) {
            if (i > 0) result.append("\n");
            result.append(transposeNotes(lines[i], semitones));
        }

        return result.toString();
    }
}
