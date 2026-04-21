import json
import os

def refine_marathi_json(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)

    refined_songs = []
    seen_numbers = set()

    for song in songs:
        # 1. Critical Fix: Language Standardization
        song['language'] = "marathi"
        
        # 2. Critical Fix: Data Integrity (Number & Title)
        num = song.get('number')
        if num in seen_numbers:
            print(f"WARNING: Duplicate song number found: {num}")
        seen_numbers.add(num)

        # Refine Title: Trim and remove trailing punctuation
        title = song.get('title', '').strip()
        title = title.rstrip(',.;')
        song['title'] = title

        # 3. Optional Cleanup: Section Labels & Line Trimming
        sections = song.get('sections', [])
        valid_sections = []
        for section in sections:
            # Normalize Label
            label = section.get('label', '').upper().strip()
            section['label'] = label
            
            # Normalize Type
            s_type = section.get('type', 'verse').lower()
            if s_type not in ['verse', 'chorus', 'bridge', 'other']:
                s_type = 'verse'
            section['type'] = s_type

            # Trim Lines
            lines = [l.strip() for l in section.get('lines', []) if l.strip()]
            if lines:
                section['lines'] = lines
                valid_sections.append(section)
        
        song['sections'] = valid_sections
        refined_songs.append(song)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(refined_songs, f, ensure_ascii=False, indent=2)

    print("Refinement complete.")

if __name__ == "__main__":
    refine_marathi_json('D:/worship-song-library/extracted_songs/marathi_songs.json')
