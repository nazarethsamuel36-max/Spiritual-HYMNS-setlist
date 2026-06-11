from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor


DOCX_PATH = Path(r"D:\worship-song-library\docs\worship_song_library_blackbook_final_images_with_explanations.docx")
OUT_PATH = Path(r"D:\worship-song-library\docs\worship_song_library_blackbook_final_images_with_explanations_headings_formatted.docx")

TARGET_HEADINGS = {
    "1.1 Background of the Study",
    "1.2 Problem Statement",
    "1.3 Objectives of the Project",
    "1.4 Scope and Limitations",
    "1.5 Significance of the Study",
    "2.1 Digital Hymnal and Songbook Systems",
    "2.2 Web-Based Content Retrieval Approaches",
    "2.3 Multilingual Information Access",
    "2.4 Chord Rendering Approaches",
    "2.5 Research Gap",
    "3.1 Functional Requirements",
    "3.2 Non-Functional Requirements",
    "3.3 User Roles and Use Cases",
    "3.4 Feasibility Analysis",
    "3.5 Risk Assessment",
    "4.1 Architectural Overview",
    "4.2 Database Design",
    "4.3 Module Decomposition",
    "4.4 Data Flow and Control Boundaries",
    "5.1 Input Formats and Parsing Strategy",
    "5.2 Positional Chord Mapping",
    "5.3 Structured Rendering Preparation",
    "5.4 Error Handling in Chord Alignment",
    "6.1 Interface Principles",
    "6.2 Responsive Rendering Constraints",
    "6.3 Margin-Based Alignment Philosophy",
    "6.4 Accessibility and Readability",
    "7.1 Servlet Layer",
    "7.2 Service Layer",
    "7.3 DAO Layer",
    "7.4 Utility Components",
    "8.1 Schema Realization",
    "8.2 Seed Data Strategy",
    "8.3 Integrity Constraints",
    "8.4 Migration and Cleanup Considerations",
    "9.1 Numeric Search",
    "9.2 Token-Based Text Search",
    "9.3 Transliteration Support",
    "9.4 Result Ranking and Filtering",
    "10.1 Unit Testing Strategy",
    "10.2 Integration Testing",
    "10.3 User Interface Validation",
    "10.4 Defect Tracking and Resolution",
    "11.1 Performance Objectives",
    "11.2 Reliability Concerns",
    "11.3 Session and Access Control",
    "11.4 Data Quality Safeguards",
    "12.1 Development Environment",
    "12.2 Build and Deployment Pipeline",
    "12.3 Administrative Operations",
    "12.4 Maintenance Workflow",
    "13.1 Functional Outcomes",
    "13.2 Comparative Improvement",
    "13.3 Observed Challenges",
    "13.4 Discussion",
    "14.1 Conclusion",
    "14.2 Contribution Summary",
    "14.3 Future Scope",
    "14.4 Final Remarks",
}


def format_run(run) -> None:
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(14)
    run.bold = True
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)


def main() -> None:
    doc = Document(DOCX_PATH)
    count = 0
    for paragraph in doc.paragraphs:
        text = " ".join(paragraph.text.strip().split())
        if text not in TARGET_HEADINGS:
            continue
        for run in paragraph.runs:
            format_run(run)
        count += 1
    doc.save(OUT_PATH)
    print(f"updated={count}")


if __name__ == "__main__":
    main()
