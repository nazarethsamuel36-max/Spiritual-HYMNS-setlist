const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'scratch_hindi_1.md');
const outputFile = path.join(__dirname, 'hindi_songs.json');

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
const SONG_HEADER_REGEX = /^###\s+(\d+)\s*-\s*(.+)/;
const SECTION_FORMAT_1 = /^\[(?:SECTION:\s+)?(.+)\]/; // e.g. [VERSE 1]

for (const line of lines) {
    const songMatch = line.match(SONG_HEADER_REGEX);
    if (songMatch) {
        const number = parseInt(songMatch[1], 10);
        const title = songMatch[2].trim();
        
        currentSong = {
            number,
            title,
            language: "hindi",
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

        if (currentSection) {
            // Trim leading blank lines for a section, but keep internal ones
            if (line.trim() === "" && currentSection.lines.length === 0) {
                continue;
            }
            // Remove bold markers if they are there, keep lyrics clean
            let cleanLine = line.trim().replace(/^\*\*(.*)\*\*$/, '$1');
            currentSection.lines.push(cleanLine);
        }
    }
}

// Post-processing to trim trailing blank lines and remove empty sections
songs.forEach(song => {
    song.sections = song.sections.filter(section => {
        while (section.lines.length > 0 && section.lines[section.lines.length - 1].trim() === "") {
            section.lines.pop();
        }
        return section.lines.length > 0;
    });
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`Successfully converted ${songs.length} Hindi songs to JSON`);
