/**
 * chord_splitting.js
 * Logic for splitting lyrics lines with chords based on visual width.
 * (NO UI, LOGIC ONLY)
 */

/**
 * Utility to measure text width using Canvas.
 * @param {string} text - The text to measure.
 * @param {string} font - CSS font string (e.g., "16px Inter").
 * @returns {number} Width in pixels.
 */
function measureTextWidth(text, font) {
    if (!measureTextWidth.canvas) {
        measureTextWidth.canvas = document.createElement("canvas");
    }
    const context = measureTextWidth.canvas.getContext("2d");
    context.font = font || "16px sans-serif";
    return context.measureText(text).width;
}

/**
 * Splits a structured line into multiple segments based on max width.
 * 
 * Input:
 * StructuredLine {
 *   lyrics: string,
 *   chords: [{ chord, position }]
 * }
 * 
 * Output:
 * segments[] where each segment:
 * {
 *   text: string,
 *   chords: [{ chord, position }]
 * }
 * 
 * @param {Object} line - The structured line object.
 * @param {number} maxWidth - Maximum allowed width in pixels.
 * @param {string} font - CSS font string for measurement.
 * @returns {Array} Array of segment objects.
 */
function splitStructuredLine(line, maxWidth, font) {
    const originalLyrics = line.lyrics;
    const originalChords = line.chords || [];

    // Requirement 1: If full line fits -> return single segment
    if (measureTextWidth(originalLyrics, font) <= maxWidth) {
        return [{
            text: originalLyrics,
            chords: originalChords.map(c => ({ ...c })) // Create new chord objects
        }];
    }

    const segments = [];
    let remainingLyrics = originalLyrics;
    let globalOffset = 0;

    while (remainingLyrics.length > 0) {
        // If remaining fits, take it all
        if (measureTextWidth(remainingLyrics, font) <= maxWidth) {
            segments.push({
                text: remainingLyrics,
                chords: mapChordsToSegment(originalChords, globalOffset, globalOffset + remainingLyrics.length, globalOffset, originalLyrics, remainingLyrics)
            });
            break;
        }

        // Find splitIndex at LAST SPACE before overflow
        let overflowIndex = 0;
        // Optimization: iterate character by character to find overflow point
        // Using binary search or something faster would be better, but "DO NOT optimize yet"
        for (let i = 1; i <= remainingLyrics.length; i++) {
            if (measureTextWidth(remainingLyrics.slice(0, i), font) > maxWidth) {
                overflowIndex = i - 1;
                break;
            }
        }

        // Find last space before overflowIndex
        let splitIndex = remainingLyrics.lastIndexOf(' ', overflowIndex);

        // If no space found before overflow, split at overflowIndex
        if (splitIndex === -1) {
            splitIndex = overflowIndex;
        }

        // Special case: if splitIndex is 0 (e.g. first char overflows or space is at start)
        // and we have more text, we must move forward at least one char to avoid infinite loop
        if (splitIndex === 0 && remainingLyrics.length > 0) {
            splitIndex = 1;
        }

        // Requirement 1: Split using slice() (NO string modification)
        const segmentText = remainingLyrics.slice(0, splitIndex);

        // Requirement 3 & 4: Chord Mapping
        const segmentChords = mapChordsToSegment(originalChords, globalOffset, globalOffset + splitIndex, globalOffset, originalLyrics, segmentText);

        // Requirement 6: ALWAYS create new segment objects
        segments.push({
            text: segmentText,
            chords: segmentChords
        });

        // Update remaining
        remainingLyrics = remainingLyrics.slice(splitIndex);
        globalOffset += splitIndex;
    }

    return segments;
}

/**
 * Maps original chords to a segment based on their global positions.
 * 
 * @param {Array} allChords - Original chords array.
 * @param {number} segmentStart - Start index of the segment in original lyrics.
 * @param {number} segmentEnd - End index of the segment in original lyrics.
 * @param {number} globalOffset - The offset used to calculate newPosition.
 * @param {string} originalLyrics - The original lyrics string for validation.
 * @returns {Array} New chord objects for the segment.
 */
function mapChordsToSegment(allChords, segmentStart, segmentEnd, globalOffset, originalLyrics, segmentText) {
    const mappedChords = [];

    allChords.forEach(chordObj => {
        const oldPos = chordObj.position;

        if (oldPos >= segmentStart && oldPos < segmentEnd) {
            const newPos = oldPos - globalOffset;

            const newChord = {
                chord: chordObj.chord,
                position: newPos
            };

            // Requirement 5: Validation (Fix: Using segmentText)
            const originalChar = originalLyrics[oldPos];
            const segmentChar = segmentText[newPos]; 

            if (segmentChar !== originalChar) {
                console.warn(`[ChordMapping] Integrity Warning: Character mismatch at newPosition ${newPos}. ` +
                    `Original['${oldPos}']='${originalChar}', Segment['${newPos}']='${segmentChar}'`);
            }

            mappedChords.push(newChord);
        }
    });

    return mappedChords;
}

// Export for use in other scripts if needed (though browser env usually uses global)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { splitStructuredLine, measureTextWidth };
}

/**
 * TEST FUNCTION
 * Run this in the browser console to verify logic.
 * Example: testChordSplitting();
 */
function testChordSplitting() {
    const testLine = {
        lyrics: "Amazing grace how sweet the sound that saved a wretch like me",
        chords: [
            { chord: "G", position: 0 },    // 'A'
            { chord: "C", position: 8 },    // 'g'
            { chord: "G", position: 14 },   // 'h'
            { chord: "D7", position: 24 },  // 's'
            { chord: "G", position: 34 }    // 's'
        ]
    };

    // Use a common font
    const font = "16px sans-serif";
    // Narrow width to force multiple splits
    const maxWidth = 120;

    console.log("%c--- CHORD SPLITTING TEST ---", "color: #2ecc71; font-weight: bold;");
    console.log("Original Lyrics:", testLine.lyrics);
    console.log("Max Width:", maxWidth);

    try {
        const segments = splitStructuredLine(testLine, maxWidth, font);

        console.log("Resulting Segments:");
        segments.forEach((seg, i) => {
            console.log(`%cSegment ${i + 1}:`, "font-weight: bold;", `"${seg.text}"`);
            console.log(`  Chords:`, seg.chords);

            // Internal verification
            seg.chords.forEach(c => {
                const char = seg.text[c.position];
                const isValid = char !== undefined;
                console.log(`    - Chord [${c.chord}] at index ${c.position} aligns with: '${char}' ${isValid ? '✅' : '❌'}`);
            });
        });
    } catch (e) {
        console.error("Test failed:", e);
    }
}
