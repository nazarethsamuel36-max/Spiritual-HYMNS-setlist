const fs = require('fs');
const path = require('path');

function parseMdFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const song = {
        number: 0,
        title: "",
        language: "",
        book: "",
        originalKey: "",
        sections: []
    };

    let inFrontmatter = false;
    let currentSection = null;

    for (let line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine && !currentSection) continue;

        // Handle Frontmatter
        if (trimmedLine === '---') {
            inFrontmatter = !inFrontmatter;
            continue;
        }

        if (inFrontmatter) {
            const lowerLine = trimmedLine.toLowerCase();
            if (lowerLine.startsWith('number:')) song.number = parseInt(trimmedLine.split(':').pop());
            if (lowerLine.startsWith('title:')) song.title = trimmedLine.split(':').slice(1).join(':').trim();
            if (lowerLine.startsWith('language:')) song.language = trimmedLine.split(':').pop().trim().toLowerCase();
            if (lowerLine.startsWith('book:')) song.book = trimmedLine.split(':').pop().trim().toLowerCase();
            if (lowerLine.startsWith('original_key:') || lowerLine.startsWith('key:')) song.originalKey = trimmedLine.split(':').pop().trim();
            continue;
        }

        // Handle Metadata (Key-Value style)
        const upperLine = trimmedLine.toUpperCase();
        if (upperLine.includes("**NUMBER:**")) {
            const match = trimmedLine.match(/\d+/);
            if (match) song.number = parseInt(match[0]);
        } else if (upperLine.includes("**TITLE:**")) {
            song.title = trimmedLine.split(":").slice(1).join(":").trim();
        } else if (upperLine.includes("**LANGUAGE:**")) {
            song.language = trimmedLine.split(":").pop().trim().toLowerCase();
        } else if (upperLine.includes("**BOOK:**")) {
            song.book = trimmedLine.split(":").pop().trim().toLowerCase();
        } else if (upperLine.includes("**KEY:**") || upperLine.includes("**ORIGINAL KEY:**")) {
            song.originalKey = trimmedLine.split(":").pop().trim();
        } 
        
        // Handle Sections (### or #)
        else if (trimmedLine.startsWith("###") || (trimmedLine.startsWith("#") && !trimmedLine.toUpperCase().startsWith("# SONG"))) {
            const label = trimmedLine.replace(/^#+/, "").trim();
            let type = "verse";
            if (label.toUpperCase().includes("CHORUS")) type = "chorus";
            else if (label.toUpperCase().includes("BRIDGE")) type = "bridge";

            currentSection = {
                type: type,
                label: label,
                lines: []
            };
            song.sections.push(currentSection);
        } 
        
        // Section Content
        else if (currentSection) {
            if (!trimmedLine.startsWith("#") && !trimmedLine.startsWith("**") && !trimmedLine.startsWith("---")) {
                // Only push if it's not empty, or if we want to preserve internal empty lines
                if (trimmedLine) {
                    currentSection.lines.push(trimmedLine);
                }
            }
        }
    }

    return song;
}

function convertDirToJson(dirPath, outputFile) {
    if (!fs.existsSync(dirPath)) {
        console.log(`Directory not found: ${dirPath}`);
        return;
    }
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).sort();
    const songs = [];

    for (const file of files) {
        const song = parseMdFile(path.join(dirPath, file));
        if (song.number > 0) {
            songs.push(song);
        } else {
            console.warn(`Warning: Could not parse number for ${file}`);
        }
    }

    songs.sort((a, b) => a.number - b.number);

    fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf8');
    console.log(`Successfully converted ${songs.length} songs to ${outputFile}`);
}

// Execution
convertDirToJson('D:/worship-song-library/extracted_songs/review/english', 'D:/worship-song-library/extracted_songs/special_english_songs.json');
convertDirToJson('D:/worship-song-library/extracted_songs/review/hindi', 'D:/worship-song-library/extracted_songs/special_hindi_songs.json');
