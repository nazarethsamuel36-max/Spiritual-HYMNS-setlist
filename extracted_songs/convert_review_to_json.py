import json
import os
import re

def parse_md_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    song_dict = {
        "number": 0,
        "title": "",
        "language": "",
        "book": "",
        "originalKey": "",
        "sections": []
    }

    current_section = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Metadata
        if line.startswith("**NUMBER:**"):
            song_dict["number"] = int(re.search(r'\d+', line).group())
        elif line.startswith("**TITLE:**"):
            song_dict["title"] = line.replace("**TITLE:**", "").strip()
        elif line.startswith("**LANGUAGE:**"):
            song_dict["language"] = line.replace("**LANGUAGE:**", "").strip().lower()
        elif line.startswith("**BOOK:**"):
            song_dict["book"] = line.replace("**BOOK:**", "").strip().lower()
        elif line.startswith("**KEY:**") or line.startswith("**ORIGINAL KEY:**"):
            song_dict["originalKey"] = line.split(":")[-1].strip()
        
        # Sections
        elif line.startswith("###"):
            label = line.replace("###", "").strip()
            s_type = "verse"
            if "CHORUS" in label.upper():
                s_type = "chorus"
            elif "BRIDGE" in label.upper():
                s_type = "bridge"
            
            current_section = {
                "type": s_type,
                "label": label,
                "lines": []
            }
            song_dict["sections"].append(current_section)
        
        # Section Content
        elif current_section is not None:
            if not line.startswith("#") and not line.startswith("**"):
                current_section["lines"].append(line)

    return song_dict

def convert_dir_to_json(dir_path, output_file):
    songs = []
    for filename in sorted(os.listdir(dir_path)):
        if filename.endswith(".md"):
            song = parse_md_file(os.path.join(dir_path, filename))
            if song["number"] > 0:
                songs.append(song)
    
    # Sort by number
    songs.sort(key=lambda x: x["number"])

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully converted {len(songs)} songs to {output_file}")

if __name__ == "__main__":
    # English
    convert_dir_to_json('D:/worship-song-library/extracted_songs/review/english', 'D:/worship-song-library/extracted_songs/special_english_songs.json')
    # Hindi
    convert_dir_to_json('D:/worship-song-library/extracted_songs/review/hindi', 'D:/worship-song-library/extracted_songs/special_hindi_songs.json')
