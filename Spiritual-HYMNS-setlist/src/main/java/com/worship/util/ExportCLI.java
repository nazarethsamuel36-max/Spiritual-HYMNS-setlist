package com.worship.util;

import com.worship.service.ExportService;

public class ExportCLI {
    public static void main(String[] args) {
        System.out.println("Initializing JSON Export Pipeline...");
        ExportService exporter = new ExportService();
        String outputDir = "exports";
        
        long startTime = System.currentTimeMillis();
        exporter.exportFull(outputDir);
        long endTime = System.currentTimeMillis();
        
        System.out.println("Export finished in " + (endTime - startTime) + "ms.");
        System.exit(0);
    }
}
