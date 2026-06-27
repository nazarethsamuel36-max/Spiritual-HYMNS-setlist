package com.worship.util;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WeightedDiatonicKeyDetectorTest {

    @Test
    void detectsCMajorFromCommonDiatonicProgression() {
        List<String> chords = Arrays.asList("C", "Dm", "Em", "F", "G", "Am", "Bdim");

        WeightedDiatonicKeyDetector.Result result = WeightedDiatonicKeyDetector.detect(chords);

        assertEquals("C", result.getBestKey().getRoot());
        assertEquals("major", result.getBestKey().getMode());
        assertEquals(1, result.getBestKey().getRank());
    }

    @Test
    void detectsGMajorFromTypicalProgression() {
        List<String> chords = Arrays.asList("G", "D", "Em", "C");

        WeightedDiatonicKeyDetector.Result result = WeightedDiatonicKeyDetector.detect(chords);

        assertEquals("G", result.getBestKey().getRoot());
        assertEquals("major", result.getBestKey().getMode());
    }
}
