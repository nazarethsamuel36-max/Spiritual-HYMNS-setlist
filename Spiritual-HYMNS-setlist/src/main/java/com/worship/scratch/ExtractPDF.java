package com.worship.scratch;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ExtractPDF {
    public static void main(String[] args) {
        String pdfPath = "d:\\worship-song-library\\raw chords lyrics\\Praise-and-Worship-Book-WITH-CHORDS (1).pdf";
        String outPath = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\1f97565e-d26e-4d24-b5ed-cac0f536a47d\\scratch\\extracted_chords.txt";
        
        try (PDDocument document = PDDocument.load(new File(pdfPath))) {
            if (!document.isEncrypted()) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true); // To try and keep chords above lyrics
                String text = stripper.getText(document);
                Files.write(Paths.get(outPath), text.getBytes());
                System.out.println("Extracted successfully to " + outPath);
            } else {
                System.out.println("Document is encrypted.");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
