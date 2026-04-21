import json
import re

def parse_md_to_json(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into individual songs
    songs_raw = re.split(r'------', content)
    songs_data = []

    for song_raw in songs_raw:
        song_raw = song_raw.strip()
        if not song_raw:
            continue

        song_dict = {}
        
        # Extract number
        num_match = re.search(r'NUMBER:\s*(\d+)', song_raw)
        if num_match:
            song_dict['number'] = int(num_match.group(1))

        # Extract title
        title_match = re.search(r'TITLE:\s*(.*)', song_raw)
        if title_match:
            song_dict['title'] = title_match.group(1).strip()

        song_dict['language'] = 'marathi'
        song_dict['book'] = 'prime_songbook'

        # Extract sections
        sections = []
        section_blocks = re.split(r'SECTION:\s*', song_raw)[1:]
        
        for block in section_blocks:
            lines = block.split('\n')
            if not lines:
                continue
            
            section_type = lines[0].strip()
            # Default to verse if not chorus
            s_type = 'verse'
            if 'CHORUS' in section_type.upper():
                s_type = 'chorus'
            
            s_label = section_type
            
            # Extract [DEV] part
            dev_start = block.find('[DEV]')
            eng_start = block.find('[ENG]')
            
            if dev_start != -1:
                end_pos = eng_start if eng_start != -1 else len(block)
                dev_text = block[dev_start+5:end_pos].strip()
                # Split lines and clean
                line_list = [l.strip() for l in dev_text.split('\n') if l.strip()]
                
                sections.append({
                    "type": s_type,
                    "label": s_label,
                    "lines": line_list
                })

        song_dict['sections'] = sections
        songs_data.append(song_dict)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(songs_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    parse_md_to_json('D:/worship-song-library/extracted_songs/marathi_songs.md', 'D:/worship-song-library/extracted_songs/marathi_songs.json')
    print("Successfully converted MD to JSON")
