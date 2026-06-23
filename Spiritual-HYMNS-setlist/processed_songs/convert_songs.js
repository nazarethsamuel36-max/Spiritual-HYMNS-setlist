const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'english_songs.md');
const outputFile = path.join(__dirname, 'english_songs.json');

let content = fs.readFileSync(inputFile, 'utf-8');

// Remove UTF-8 BOM if present
if (content.startsWith('\ufeff')) {
    content = content.slice(1);
}

const lines = content.split(/\r?\n/);

const songs = [];
let currentSong = null;
let currentSection = null;

// Regex for different song/section patterns
const SONG_HEADER_REGEX = /^###\s+(?:SONG\s+)?(\d+)\s+(.+)/;
const SECTION_FORMAT_1 = /^\[(?:SECTION:\s+)?(.+)\]/; // e.g. [VERSE 1]
const SECTION_FORMAT_2_VERSE = /^(\d+)\.\s+(.*)/;      // e.g. 1. Lyric line
const SECTION_FORMAT_2_CHORUS = /^(Chorus|CHORUS)\b(?::)?\s*(.*)/; // e.g. Chorus: Lyric line

for (const line of lines) {
    const songMatch = line.match(SONG_HEADER_REGEX);
    if (songMatch) {
        const number = parseInt(songMatch[1], 10);
        const titleRaw = songMatch[2].trim();
        const title = titleRaw.replace(/^[^a-zA-Z0-9'"]+/, '').trim();
        
        currentSong = {
            number,
            title,
            language: "english",
            book: "prime_songbook",
            sections: []
        };
        songs.push(currentSong);
        currentSection = null;
        continue;
    }

    if (currentSong) {
        // Try Format 1: [VERSE 1]
        const match1 = line.match(SECTION_FORMAT_1);
        if (match1) {
            const label = match1[1].trim();
            const type = label.toUpperCase().includes("CHORUS") ? "chorus" : "verse";
            currentSection = { type, label, lines: [] };
            currentSong.sections.push(currentSection);
            continue;
        }

        // Try Format 2: 1. Lyric
        const match2 = line.match(SECTION_FORMAT_2_VERSE);
        if (match2) {
            const num = match2[1];
            const firstLine = match2[2].trim();
            currentSection = { type: "verse", label: `VERSE ${num}`, lines: [] };
            currentSong.sections.push(currentSection);
            if (firstLine) {
                currentSection.lines.push(firstLine);
            }
            continue;
        }

        // Try Format 2: Chorus
        const match3 = line.match(SECTION_FORMAT_2_CHORUS);
        if (match3) {
            const firstLine = match3[2].trim();
            currentSection = { type: "chorus", label: "CHORUS", lines: [] };
            currentSong.sections.push(currentSection);
            if (firstLine) {
                currentSection.lines.push(firstLine);
            }
            continue;
        }

        // If we have content but no section yet, and we are in a song
        // it might be header-less lyrics. Infer a section if it's non-empty.
        if (!currentSection && line.trim() !== "") {
            currentSection = { type: "verse", label: "VERSE 1", lines: [] };
            currentSong.sections.push(currentSection);
            // Fall through to add the line
        }

        if (currentSection) {
            // Trim leading blank lines for a section, but keep internal ones
            if (line.trim() === "" && currentSection.lines.length === 0) {
                continue;
            }
            currentSection.lines.push(line);
        }
    }
}

// Post-processing to trim trailing blank lines from each section
songs.forEach(song => {
    song.sections.forEach(section => {
        while (section.lines.length > 0 && section.lines[section.lines.length - 1].trim() === "") {
            section.lines.pop();
        }
    });
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`Successfully converted ${songs.length} songs`);
