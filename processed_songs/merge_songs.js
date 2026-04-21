const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\worship-song-library';
const mainFile = path.join(rootDir, 'processed_songs', 'english_songs.md');
const outputFile = path.join(rootDir, 'processed_songs', 'english_songs.json');

// Find all scratch_english_*.md files
const scratchFiles = fs.readdirSync(rootDir)
    .filter(f => f.startsWith('scratch_english_') && f.endsWith('.md'))
    .map(f => path.join(rootDir, f));

const songsMap = new Map();

const SONG_HEADER_REGEX = /^###\s+(?:SONG\s+)?(\d+)\s+(.+)/;
const SECTION_FORMAT_1 = /^\[(?:SECTION:\s+)?(.+)\]/;
const SECTION_FORMAT_2_VERSE = /^(\d+)\.\s+(.*)/;
const SECTION_FORMAT_2_CHORUS = /^(Chorus|CHORUS)\b(?::)?\s*(.*)/;

function parseFile(file, isMain) {
    let content = fs.readFileSync(file, 'utf-8');
    if (content.startsWith('\ufeff')) content = content.slice(1);
    
    const lines = content.split(/\r?\n/);
    let currentSong = null;
    let currentSection = null;

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
                sections: [],
                isMain // Flag to track priority
            };
            
            if (!songsMap.has(number)) {
                songsMap.set(number, []);
            }
            songsMap.get(number).push(currentSong);
            
            currentSection = null;
            continue;
        }

        if (currentSong) {
            const match1 = line.match(SECTION_FORMAT_1);
            if (match1) {
                const label = match1[1].trim();
                const type = label.toUpperCase().includes("CHORUS") ? "chorus" : "verse";
                currentSection = { type, label, lines: [] };
                currentSong.sections.push(currentSection);
                continue;
            }

            const match2 = line.match(SECTION_FORMAT_2_VERSE);
            if (match2) {
                const num = match2[1];
                const firstLine = match2[2].trim();
                currentSection = { type: "verse", label: `VERSE ${num}`, lines: [] };
                currentSong.sections.push(currentSection);
                if (firstLine) currentSection.lines.push(firstLine);
                continue;
            }

            const match3 = line.match(SECTION_FORMAT_2_CHORUS);
            if (match3) {
                const firstLine = match3[2].trim();
                currentSection = { type: "chorus", label: "CHORUS", lines: [] };
                currentSong.sections.push(currentSection);
                if (firstLine) currentSection.lines.push(firstLine);
                continue;
            }

            if (!currentSection && line.trim() !== "") {
                currentSection = { type: "verse", label: "VERSE 1", lines: [] };
                currentSong.sections.push(currentSection);
            }

            if (currentSection) {
                if (line.trim() === "" && currentSection.lines.length === 0) continue;
                currentSection.lines.push(line);
            }
        }
    }
}

// Parse main file first
parseFile(mainFile, true);
// Parse scratch files
scratchFiles.forEach(f => parseFile(f, false));

const finalSongs = [];
const allNumbers = Array.from(songsMap.keys()).sort((a, b) => a - b);

allNumbers.forEach(num => {
    const variants = songsMap.get(num);
    
    // Priority:
    // 1. If any variant is from main file, pick that one.
    // 2. Otherwise, pick the one with most content.
    let bestVariant = variants.find(v => v.isMain);
    
    if (!bestVariant) {
        bestVariant = variants.reduce((prev, curr) => {
            const prevScore = prev.sections.reduce((acc, s) => acc + s.lines.length, 0);
            const currScore = curr.sections.reduce((acc, s) => acc + s.lines.length, 0);
            return currScore >= prevScore ? curr : prev;
        });
    }
    
    // Trim blank lines
    bestVariant.sections.forEach(section => {
        while (section.lines.length > 0 && section.lines[section.lines.length - 1].trim() === "") {
            section.lines.pop();
        }
    });
    
    // Clean up internal metadata
    delete bestVariant.isMain;
    
    finalSongs.push(bestVariant);
});

fs.writeFileSync(outputFile, JSON.stringify(finalSongs, null, 2), 'utf-8');
console.log(`Total unique songs processed: ${finalSongs.length}`);
console.log(`Min: ${finalSongs[0].number}, Max: ${finalSongs[finalSongs.length - 1].number}`);
