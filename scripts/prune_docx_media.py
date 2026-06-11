from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET


DOCX = Path(r"D:\worship-song-library\docs\worship_song_library_blackbook_corrected.docx")
OUT = Path(r"D:\worship-song-library\docs\worship_song_library_blackbook_final_images.docx")


NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def used_relationship_ids(zipf: ZipFile) -> set[str]:
    root = ET.fromstring(zipf.read("word/document.xml"))
    used: set[str] = set()
    embed_key = "{%s}embed" % NS["r"]
    for blip in root.findall(".//a:blip", NS):
        rid = blip.attrib.get(embed_key)
        if rid:
            used.add(rid)
    return used


def main():
    with ZipFile(DOCX, "r") as zin:
        used_rids = used_relationship_ids(zin)
        rel_root = ET.fromstring(zin.read("word/_rels/document.xml.rels"))
        keep_media: set[str] = set()
        for rel in list(rel_root.findall("pr:Relationship", NS)):
            target = rel.attrib.get("Target", "")
            if "media/" not in target:
                continue
            if rel.attrib.get("Id") in used_rids:
                keep_media.add(f"word/{target}")
            else:
                rel_root.remove(rel)
        with ZipFile(OUT, "w", ZIP_DEFLATED) as zout:
            for name in zin.namelist():
                if name == "word/_rels/document.xml.rels":
                    xml_bytes = ET.tostring(rel_root, encoding="utf-8", xml_declaration=True)
                    zout.writestr(name, xml_bytes)
                    continue
                if name.startswith("word/media/") and name not in keep_media:
                    continue
                zout.writestr(name, zin.read(name))
    print(OUT)


if __name__ == "__main__":
    main()
