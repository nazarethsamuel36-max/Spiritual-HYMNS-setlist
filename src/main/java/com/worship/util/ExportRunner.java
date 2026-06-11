package com.worship.util;

import com.worship.service.ExportService;
import java.io.File;

public class ExportRunner {
    public static void main(String[] args) {
        try {
            System.out.println("=== Starting Hardened Export Process (Workspace Copy) ===");
            
            // Path to the runtime exports directory
            String outputDir = "d:/worship-song-library - Copy/worship-song-library-runtime/public/exports";
            
            ExportService exportService = new ExportService();
            exportService.exportFull(outputDir);
            
            System.out.println("=== Export Process COMPLETED Successfully ===");
        } catch (Exception e) {
            System.err.println("CRITICAL EXPORT FAILURE:");
            e.printStackTrace();
            System.exit(1);
        }
    }
}
