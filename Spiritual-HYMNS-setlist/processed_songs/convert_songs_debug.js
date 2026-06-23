const fs = require('fs');
const path = require('fs');
// Wait, I used path = require('fs') by mistake? No, it's 'path'.
const path2 = require('path');

const inputFile = path2.join(__dirname, 'english_songs.md');
const outputFile = path2.join(__dirname, 'english_songs.json');

let content = fs.readFileSync(inputFile, 'utf-8');
if (content.startsWith('\ufeff')) {
    content = content.slice(1);
}

const lines = content.split(/\r?\n/);

const songs = [];
let currentSong = null;
let currentSection = null;

const SONG_HEADER_REGEX = /^###\s+(?:SONG\s+)?(\d+)\s+(.+)/;
const SECTION_REGEX = /^\[(?:SECTION:\s+)?(.+)\]/;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
        
        if (number === 161 || number === 162) {
            console.log(`Starting Song ${number} at line ${i + 1}: "${line}"`);
        }
        continue;
    }

    if (currentSong) {
        const sectionMatch = line.match(SECTION_REGEX);
        if (sectionMatch) {
            const label = sectionMatch[1].trim();
            let type = "verse";
            if (label.toUpperCase().includes("CHORUS")) {
                type = "chorus";
            }
            currentSection = {
                type,
                label,
                lines: []
            };
            currentSong.sections.push(currentSection);
            
            if (currentSong.number === 161 || currentSong.number === 162) {
                console.log(`  Found Section "${label}" at line ${i + 1}`);
            }
            continue;
        }

        if (currentSection) {
            if (line.trim() === "" && currentSection.lines.length === 0) {
                continue;
            }
            currentSection.lines.push(line);
            
            if (currentSong.number === 161 || currentSong.number === 162) {
                // Log first line of section
                if (currentSection.lines.length === 1) {
                    console.log(`    First lyric line: "${line}"`);
                }
            }
        }
    }
}

songs.forEach(song => {
    song.sections.forEach(section => {
        while (section.lines.length > 0 && section.lines[section.lines.length - 1].trim() === "") {
            section.lines.pop();
        }
    });
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`Successfully converted ${songs.length} songs`);
