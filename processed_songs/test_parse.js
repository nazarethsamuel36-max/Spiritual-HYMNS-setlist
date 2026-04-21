const SONG_HEADER_REGEX = /^###\s+(?:SONG\s+)?(\d+)\s+(.+)/;
const SECTION_REGEX = /^\[(?:SECTION:\s+)?(.+)\]/;

const lines = [
    "### SONG 162 - MINE EYES HAVE SEEN THE GLORY",
    "",
    "[Verse 1]",
    "Mine eyes have seen the glory of the coming of the Lord;"
];

const songs = [];
let currentSong = null;
let currentSection = null;

for (const line of lines) {
    console.log(`Processing: "${line}"`);
    const songMatch = line.match(SONG_HEADER_REGEX);
    if (songMatch) {
        console.log("  Matched Song Header");
        const number = parseInt(songMatch[1], 10);
        const titleRaw = songMatch[2].trim();
        const title = titleRaw.replace(/^[^a-zA-Z0-9'"]+/, '').trim();
        currentSong = { number, title, sections: [] };
        songs.push(currentSong);
        currentSection = null;
        continue;
    }

    if (currentSong) {
        const sectionMatch = line.match(SECTION_REGEX);
        if (sectionMatch) {
            console.log("  Matched Section Label");
            const label = sectionMatch[1].trim();
            currentSection = { label, lines: [] };
            currentSong.sections.push(currentSection);
            continue;
        }

        if (currentSection) {
            console.log("  Added Line to Section");
            currentSection.lines.push(line);
        } else {
            console.log("  Skipped Line (No Section)");
        }
    }
}

console.log(JSON.stringify(songs, null, 2));
