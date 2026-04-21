# SONGBOOK INGESTION - IMPLEMENTATION GUIDE

**Version**: 1.0  
**Language**: Java 11+ (easily portable to Python/Go)  
**Purpose**: Complete reference for building LAYER 1-4 pipeline

---

## 1. PROJECT STRUCTURE

```
songbook-ingestion/
├── pom.xml                              # Maven configuration
├── README.md                            # Setup instructions
├── src/
│   ├── main/java/com/worship/ingest/
│   │   ├── IngestionPipeline.java      # Main orchestrator
│   │   ├── config/
│   │   │   └── TesseractConfig.java    # OCR configuration
│   │   ├── layer1/
│   │   │   └── ImageProcessor.java     # Layer 1: OCR + segmentation
│   │   ├── layer2/
│   │   │   └── SongStructureConverter.java  # Layer 2: JSON structure
│   │   ├── layer3/
│   │   │   └── JSONWriter.java         # Layer 3: File output
│   │   ├── layer4/
│   │   │   ├── SongValidator.java      # Layer 4: Validation
│   │   │   └── BatchValidator.java     # Batch-level validation
│   │   ├── models/
│   │   │   ├── RawSong.java
│   │   │   ├── RawBlock.java
│   │   │   ├── StructuredSong.java
│   │   │   ├── Section.java
│   │   │   ├── Line.java
│   │   │   ├── ValidationResult.java
│   │   │   ├── ExtractionMetadata.java
│   │   │   └── BatchStats.java
│   │   ├── exceptions/
│   │   │   ├── IngestException.java
│   │   │   ├── OCRException.java
│   │   │   ├── StructureException.java
│   │   │   ├── ValidationException.java
│   │   │   └── FatalException.java
│   │   └── util/
│   │       ├── FileSystemUtil.java
│   │       ├── LoggingUtil.java
│   │       └── MetricsCalculator.java
│   ├── resources/
│   │   ├── tesseract.properties
│   │   ├── validation-rules.yaml
│   │   └── log4j2.xml
│   └── test/java/com/worship/ingest/
│       ├── layer1/ImageProcessorTest.java
│       ├── layer2/StructureConverterTest.java
│       ├── layer4/ValidationTest.java
│       └── integration/EndToEndTest.java
└── docker/
    └── Dockerfile                       # Container for reproducibility
```

---

## 2. DEPENDENCY CONFIGURATION

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.worship</groupId>
  <artifactId>songbook-ingestion</artifactId>
  <version>1.0.0</version>
  
  <properties>
    <maven.compiler.source>11</maven.compiler.source>
    <maven.compiler.target>11</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <!-- Tesseract OCR -->
    <dependency>
      <groupId>net.sourceforge.tess4j</groupId>
      <artifactId>tess4j</artifactId>
      <version>5.3.0</version>
    </dependency>
    
    <!-- JSON Processing -->
    <dependency>
      <groupId>com.google.code.gson</groupId>
      <artifactId>gson</artifactId>
      <version>2.10.1</version>
    </dependency>
    
    <!-- Image Processing -->
    <dependency>
      <groupId>org.imgscalr</groupId>
      <artifactId>imgscalr-lib</artifactId>
      <version>4.2</version>
    </dependency>
    
    <!-- Configuration -->
    <dependency>
      <groupId>org.yaml</groupId>
      <artifactId>snakeyaml</artifactId>
      <version>2.0</version>
    </dependency>
    
    <!-- Logging -->
    <dependency>
      <groupId>org.apache.logging.log4j</groupId>
      <artifactId>log4j-core</artifactId>
      <version>2.19.0</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.13.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-assembly-plugin</artifactId>
        <version>3.3.0</version>
        <configuration>
          <archive>
            <manifest>
              <mainClass>com.worship.ingest.IngestionPipeline</mainClass>
            </manifest>
          </archive>
          <descriptorRefs>
            <descriptorRef>jar-with-dependencies</descriptorRef>
          </descriptorRefs>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

---

## 3. MODEL CLASSES

### RawBlock.java (Layer 1 Output)

```java
public class RawBlock {
    private int blockId;
    private String text;
    private BoundingBox bbox;
    private double confidence;
    private boolean isItalic;
    private int fontSizeEstimate;
    private String detectedLanguage;
    private String characterRecognized;
    
    // Getters/Setters
    public RawBlock(int blockId, String text) {
        this.blockId = blockId;
        this.text = text;
    }
}

public class BoundingBox {
    public int x, y, width, height;
    
    public BoundingBox(int x, int y, int width, int height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
```

### RawSong.java (Layer 1 Output)

```java
public class RawSong {
    private int songNumber;
    private String title;
    private List<RawBlock> blocks;
    private String sourceImage;
    private String extractionTimestamp;
    private double avgConfidence;
    private List<String> detectedLanguages;
    
    public RawSong(int songNumber, String title) {
        this.songNumber = songNumber;
        this.title = title;
        this.blocks = new ArrayList<>();
    }
    
    public void addBlock(RawBlock block) {
        blocks.add(block);
    }
}
```

### StructuredSong.java (Layer 2 Output)

```java
public class StructuredSong {
    private ExtractionMetadata metadata;
    private Song song;
    private ValidationStatus validation;
    private QualityMetrics qualityMetrics;
    private FutureExtensions futureExtensions;
    
    public StructuredSong() {
        this.metadata = new ExtractionMetadata();
        this.song = new Song();
        this.validation = new ValidationStatus();
        this.qualityMetrics = new QualityMetrics();
        this.futureExtensions = new FutureExtensions();
    }
}

public static class Song {
    public int number;
    public String language;
    public double languageConfidence;
    public String title;
    public double titleOcrConfidence;
    public List<String> alternateTitles;
    public String rawLyrics;
    public List<Section> sections;
    public SectionSummary sectionSummary;
}

public static class Section {
    public String type;  // "verse", "chorus", "bridge", etc.
    public String label; // "Verse 1", "Chorus", etc.
    public String sectionId;
    public int sectionNumber;
    public double classificationConfidence;
    public String classificationMethod;
    public boolean isRepeated;
    public List<Line> lines;
}

public static class Line {
    public String lineId;
    public String text;
    public int originalLineNumber;
    public int sourceBlockId;
    public double ocrConfidence;
    public boolean wasItalic;
    public int lengthChars;
    public String notes;
    public String encoding;
}
```

### ExtractionMetadata.java

```java
public class ExtractionMetadata {
    public String version = "1.0";
    public String sourceImage;
    public String extractionTimestamp;
    public long extractionDurationMs;
    public String ocrEngine = "tesseract-5.3";
    public double ocrConfidenceAvg;
    public String conversionCodeVersion = "v1.0";
    public String status;  // "VALID", "REVIEW_REQUIRED", "ERROR"
}
```

---

## 4. LAYER 1: IMAGE PROCESSOR

### ImageProcessor.java

```java
public class ImageProcessor {
    private static final Logger logger = LogManager.getLogger(ImageProcessor.class);
    private TesseractConfig tesseractConfig;
    private final double LOW_CONFIDENCE_THRESHOLD = 0.5;
    private final double ITALIC_CONFIDENCE_THRESHOLD = 0.8;
    
    public ImageProcessor(TesseractConfig config) {
        this.tesseractConfig = config;
    }
    
    /**
     * LAYER 1: Main entry point
     * Orchestrates: image load → OCR → segmentation → formatting detection
     */
    public List<RawSong> processImage(String imagePath) throws OCRException {
        logger.info("Processing image: {}", imagePath);
        
        try {
            // Step 1: Load and validate image
            File imageFile = new File(imagePath);
            if (!imageFile.exists()) {
                throw new OCRException("Image not found: " + imagePath);
            }
            
            BufferedImage image = ImageIO.read(imageFile);
            if (image == null) {
                throw new OCRException("Image corrupted or unreadable: " + imagePath);
            }
            
            // Step 2: Run OCR to get blocks
            List<RawBlock> blocks = extractBlocksWithOCR(image, imagePath);
            
            // Step 3: Segment by song number pattern
            List<List<RawBlock>> songSegments = segmentBySongNumber(blocks);
            
            // Step 4: Convert each segment to RawSong
            List<RawSong> songs = new ArrayList<>();
            for (List<RawBlock> segment : songSegments) {
                RawSong song = createRawSongFromSegment(segment, imagePath);
                songs.add(song);
            }
            
            logger.info("Extracted {} songs from image", songs.size());
            return songs;
            
        } catch (IOException e) {
            throw new OCRException("Failed to process image: " + imagePath, e);
        }
    }
    
    /**
     * Step 2: Run Tesseract OCR
     */
    private List<RawBlock> extractBlocksWithOCR(BufferedImage image, String imagePath) 
            throws OCRException {
        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(tesseractConfig.getDatapath());
            tesseract.setLanguage(tesseractConfig.getLanguages());
            
            // Run OCR
            String fullText = tesseract.doOCR(image);
            
            // Use Tesseract's block output to get confidence scores
            List<RawBlock> blocks = new ArrayList<>();
            int blockId = 0;
            
            String[] lines = fullText.split("\n");
            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    RawBlock block = new RawBlock(blockId++, line);
                    block.confidence = extractConfidence(line);
                    block.isItalic = detectItalic(image, line);
                    blocks.add(block);
                }
            }
            
            return blocks;
            
        } catch (Exception e) {
            throw new OCRException("OCR processing failed", e);
        }
    }
    
    /**
     * Step 3: Segment blocks by song number pattern
     * Pattern: /^[0-9]+\./ at start of line
     */
    private List<List<RawBlock>> segmentBySongNumber(List<RawBlock> blocks) {
        List<List<RawBlock>> segments = new ArrayList<>();
        List<RawBlock> currentSegment = new ArrayList<>();
        
        Pattern songNumberPattern = Pattern.compile("^[0-9]+\\.");
        
        for (RawBlock block : blocks) {
            Matcher matcher = songNumberPattern.matcher(block.text.trim());
            
            if (matcher.find()) {
                // Start of new song
                if (!currentSegment.isEmpty()) {
                    segments.add(new ArrayList<>(currentSegment));
                    currentSegment.clear();
                }
            }
            
            currentSegment.add(block);
        }
        
        if (!currentSegment.isEmpty()) {
            segments.add(currentSegment);
        }
        
        return segments;
    }
    
    /**
     * Step 4: Create RawSong from segment
     */
    private RawSong createRawSongFromSegment(List<RawBlock> segment, String imagePath) {
        if (segment.isEmpty()) {
            return null;
        }
        
        // Extract song number from first block
        String firstText = segment.get(0).text;
        int songNumber = extractSongNumber(firstText);
        
        // Extract title from second block (first line of actual content)
        String title = segment.size() > 1 ? segment.get(1).text : "Unknown";
        
        RawSong song = new RawSong(songNumber, title);
        song.sourceImage = imagePath;
        song.extractionTimestamp = Instant.now().toString();
        
        // Add all blocks
        double sumConfidence = 0;
        for (RawBlock block : segment) {
            song.addBlock(block);
            sumConfidence += block.confidence;
        }
        song.avgConfidence = sumConfidence / segment.size();
        
        return song;
    }
    
    /**
     * Extract song number from text like "1." or "42."
     */
    private int extractSongNumber(String text) {
        Pattern pattern = Pattern.compile("^([0-9]+)\\.");
        Matcher matcher = pattern.matcher(text.trim());
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return -1; // Invalid
    }
    
    /**
     * Extract OCR confidence (simplified)
     */
    private double extractConfidence(String line) {
        // In production: use Tesseract's tessdata_manager to get per-word confidence
        return 0.85; // Placeholder
    }
    
    /**
     * Detect italic formatting
     */
    private boolean detectItalic(BufferedImage image, String text) {
        // In production: analyze font metrics or use Tesseract's italic flag
        return false; // Placeholder
    }
}
```

---

## 5. LAYER 2: STRUCTURE CONVERTER

### SongStructureConverter.java

```java
public class SongStructureConverter {
    private static final Logger logger = LogManager.getLogger(SongStructureConverter.class);
    private final double SECTION_CLASSIFICATION_THRESHOLD = 0.7;
    
    /**
     * LAYER 2: Convert RawSong to StructuredSong
     */
    public StructuredSong convert(RawSong rawSong) throws StructureException {
        logger.debug("Converting raw song: {}", rawSong.songNumber);
        
        StructuredSong structured = new StructuredSong();
        
        try {
            // Step 1: Metadata setup
            structured.metadata.sourceImage = rawSong.sourceImage;
            structured.metadata.ocrConfidenceAvg = rawSong.avgConfidence;
            
            // Step 2: Basic song info
            structured.song.number = rawSong.songNumber;
            structured.song.title = rawSong.title;
            structured.song.language = detectLanguage(rawSong);
            
            // Step 3: Extract and classify sections
            List<Section> sections = parseSections(rawSong.blocks);
            structured.song.sections = sections;
            
            // Step 4: Generate section summary
            generateSectionSummary(structured);
            
            // Step 5: Preserve raw lyrics
            structured.song.rawLyrics = reconstructRawLyrics(rawSong.blocks);
            
            logger.info("Structured song {} with {} sections", 
                rawSong.songNumber, sections.size());
            
            return structured;
            
        } catch (Exception e) {
            throw new StructureException("Failed to structure song: " + 
                rawSong.songNumber, e);
        }
    }
    
    /**
     * Parse sections from blocks
     * Uses explicit labels and italic detection
     */
    private List<Section> parseSections(List<RawBlock> blocks) {
        List<Section> sections = new ArrayList<>();
        Section currentSection = null;
        int sectionNumber = 0;
        
        Pattern sectionLabelPattern = Pattern.compile(
            "^(Verse|Chorus|Bridge|Hook|Pre-Chorus)\\s*([0-9]*):?",
            Pattern.CASE_INSENSITIVE);
        
        for (RawBlock block : blocks) {
            Matcher matcher = sectionLabelPattern.matcher(block.text.trim());
            
            if (matcher.find()) {
                // Found explicit section label
                if (currentSection != null) {
                    sections.add(currentSection);
                }
                
                currentSection = new Section();
                currentSection.type = matcher.group(1).toLowerCase();
                currentSection.label = matcher.group(0);
                currentSection.sectionId = currentSection.type + "_" + sectionNumber;
                currentSection.sectionNumber = sectionNumber;
                currentSection.classificationMethod = "explicit_label";
                currentSection.classificationConfidence = 0.99;
                currentSection.lines = new ArrayList<>();
                sectionNumber++;
                
            } else if (currentSection == null) {
                // Single block - create default section
                currentSection = new Section();
                currentSection.type = block.isItalic ? "chorus" : "verse";
                currentSection.label = block.isItalic ? "Chorus" : "Verse 1";
                currentSection.sectionId = currentSection.type + "_" + sectionNumber;
                currentSection.classificationMethod = 
                    block.isItalic ? "italic_detection" : "heuristic";
                currentSection.classificationConfidence = 
                    block.isItalic ? 0.8 : 0.6;
                currentSection.lines = new ArrayList<>();
                sectionNumber++;
            }
            
            // Add line to current section
            Line line = new Line();
            line.text = block.text;
            line.ocrConfidence = block.confidence;
            line.wasItalic = block.isItalic;
            line.sourceBlockId = block.blockId;
            line.lengthChars = block.text.length();
            
            currentSection.lines.add(line);
        }
        
        if (currentSection != null) {
            sections.add(currentSection);
        }
        
        return sections;
    }
    
    /**
     * Detect language from text
     */
    private String detectLanguage(RawSong rawSong) {
        // Simplified: check for Unicode ranges
        String text = rawSong.title + " " + 
                     rawSong.blocks.stream()
                         .map(b -> b.text)
                         .collect(Collectors.joining(" "));
        
        if (text.matches(".*[\\p{InDevanagari}]+.*")) {
            return "hindi"; // Devanagari script suggests Hindi
        } else if (text.matches(".*[\\p{InBengali}]+.*")) {
            return "marathi"; // Bengali/similar script
        } else {
            return "english"; // Default
        }
    }
    
    /**
     * Generate section summary statistics
     */
    private void generateSectionSummary(StructuredSong song) {
        StructuredSong.SectionSummary summary = new StructuredSong.SectionSummary();
        summary.totalSections = song.song.sections.size();
        
        int totalLines = 0;
        int totalChars = 0;
        
        for (Section section : song.song.sections) {
            switch (section.type) {
                case "verse": summary.verseCount++; break;
                case "chorus": summary.chorusCount++; break;
                case "bridge": summary.bridgeCount++; break;
                default: summary.otherCount++;
            }
            
            totalLines += section.lines.size();
            totalChars += section.lines.stream()
                .mapToInt(l -> l.lengthChars)
                .sum();
        }
        
        summary.totalLines = totalLines;
        summary.totalCharacters = totalChars;
        song.song.sectionSummary = summary;
    }
    
    /**
     * Reconstruct raw lyrics for reference
     */
    private String reconstructRawLyrics(List<RawBlock> blocks) {
        return blocks.stream()
            .map(b -> b.text)
            .collect(Collectors.joining("\n"));
    }
}
```

---

## 6. LAYER 3: JSON WRITER

### JSONWriter.java

```java
public class JSONWriter {
    private static final Logger logger = LogManager.getLogger(JSONWriter.class);
    private Gson gson;
    private String outputPath;
    
    public JSONWriter(String outputPath) {
        this.outputPath = outputPath;
        // Pretty print with indent
        this.gson = new GsonBuilder()
            .setPrettyPrinting()
            .create();
    }
    
    /**
     * LAYER 3: Write StructuredSong to JSON file
     */
    public String writeSong(StructuredSong song, String batchId) throws IOException {
        String filename = generateFilename(song, batchId);
        String filepath = outputPath + "/batch_" + batchId + "/" + filename;
        
        // Create directories if needed
        new File(filepath).getParentFile().mkdirs();
        
        try (FileWriter writer = new FileWriter(filepath, StandardCharsets.UTF_8)) {
            gson.toJson(song, writer);
            logger.info("Wrote song to {}", filepath);
            return filepath;
        } catch (IOException e) {
            logger.error("Failed to write JSON: {}", filepath);
            throw e;
        }
    }
    
    /**
     * Generate filename based on song metadata
     */
    private String generateFilename(StructuredSong song, String batchId) {
        return String.format("song_%03d_%s.json",
            song.song.number,
            song.song.language);
    }
    
    /**
     * Write validation summary
     */
    public void writeBatchSummary(BatchStats stats, String batchId) throws IOException {
        String filepath = outputPath + "/batch_" + batchId + "/SUMMARY.json";
        
        try (FileWriter writer = new FileWriter(filepath, StandardCharsets.UTF_8)) {
            gson.toJson(stats, writer);
            logger.info("Wrote batch summary to {}", filepath);
        }
    }
}
```

---

## 7. LAYER 4: VALIDATOR

### SongValidator.java

```java
public class SongValidator {
    private static final Logger logger = LogManager.getLogger(SongValidator.class);
    private final double OCR_CONFIDENCE_THRESHOLD = 0.7;
    
    /**
     * LAYER 4: Validate StructuredSong
     */
    public ValidationResult validate(StructuredSong song) {
        ValidationResult result = new ValidationResult();
        
        logger.debug("Validating song: {}", song.song.number);
        
        // Rule A: Required fields
        if (song.song.number <= 0) {
            result.checksFailed.add("number_invalid");
        } else {
            result.checksPassed.add("number_valid");
        }
        
        if (song.song.title == null || song.song.title.trim().isEmpty()) {
            result.checksFailed.add("title_empty");
        } else {
            result.checksPassed.add("title_not_empty");
        }
        
        if (song.song.sections == null || song.song.sections.isEmpty()) {
            result.checksFailed.add("sections_empty");
        } else {
            result.checksPassed.add("sections_not_empty");
        }
        
        // Rule B: Section validation
        for (Section section : song.song.sections) {
            if (section.lines == null || section.lines.isEmpty()) {
                result.checksFailed.add("section_no_lines: " + section.label);
            }
        }
        
        // Rule C: At least one verse or chorus
        long verseCount = song.song.sections.stream()
            .filter(s -> "verse".equals(s.type))
            .count();
        long chorusCount = song.song.sections.stream()
            .filter(s -> "chorus".equals(s.type))
            .count();
        
        if (verseCount == 0 && chorusCount == 0) {
            result.checksFailed.add("no_verse_or_chorus");
        }
        
        // Rule D: OCR Confidence
        double avgConfidence = song.qualityMetrics.ocrConfidenceAvg;
        if (avgConfidence < OCR_CONFIDENCE_THRESHOLD) {
            result.warnings.add("low_ocr_confidence");
        }
        
        // Determine status
        if (result.checksFailed.isEmpty()) {
            result.status = "VALID";
        } else {
            result.status = "REVIEW_REQUIRED";
        }
        
        logger.info("Validation result for song {}: {}", 
            song.song.number, result.status);
        
        return result;
    }
}

public class ValidationResult {
    public String status;  // "VALID", "REVIEW_REQUIRED", "ERROR"
    public List<String> checksPassed = new ArrayList<>();
    public List<String> checksFailed = new ArrayList<>();
    public List<String> warnings = new ArrayList<>();
    public String failureReason;
    public boolean humanReviewRequired;
}
```

---

## 8. MAIN ORCHESTRATOR

### IngestionPipeline.java

```java
public class IngestionPipeline {
    private static final Logger logger = LogManager.getLogger(IngestionPipeline.class);
    
    private ImageProcessor imageProcessor;
    private SongStructureConverter structureConverter;
    private JSONWriter jsonWriter;
    private SongValidator validator;
    
    public IngestionPipeline(String configPath) throws Exception {
        // Initialize configuration
        TesseractConfig tesseractConfig = TesseractConfig.load(configPath);
        
        // Initialize layers
        this.imageProcessor = new ImageProcessor(tesseractConfig);
        this.structureConverter = new SongStructureConverter();
        this.jsonWriter = new JSONWriter(tesseractConfig.getOutputPath());
        this.validator = new SongValidator();
    }
    
    /**
     * Main entry point: Process entire batch of images
     */
    public void processBatch(String imageDirPath, String batchId) throws Exception {
        logger.info("Starting batch processing: {}", batchId);
        
        File imageDir = new File(imageDirPath);
        File[] images = imageDir.listFiles((d, n) -> 
            n.matches("(?i).*\\.(jpg|png|tiff)$"));
        
        if (images == null || images.length == 0) {
            throw new FatalException("No images found in: " + imageDirPath);
        }
        
        BatchStats stats = new BatchStats();
        stats.batchId = batchId;
        
        for (File imageFile : images) {
            try {
                processSingleImage(imageFile.getAbsolutePath(), batchId, stats);
            } catch (FatalException e) {
                logger.error("FATAL ERROR: {}", e.getMessage());
                throw e;  // Stop batch
            } catch (Exception e) {
                logger.error("Error processing {}: {}", 
                    imageFile.getName(), e.getMessage());
                stats.errors++;
                continue;  // Skip to next image
            }
        }
        
        // Write batch summary
        jsonWriter.writeBatchSummary(stats, batchId);
        
        logger.info("Batch complete: {} total, {} valid, {} review, {} errors",
            stats.total, stats.valid, stats.reviewRequired, stats.errors);
    }
    
    /**
     * Process single image through all 4 layers
     */
    private void processSingleImage(String imagePath, String batchId, 
            BatchStats stats) throws Exception {
        
        logger.info("Processing: {}", imagePath);
        long startTime = System.currentTimeMillis();
        
        try {
            // LAYER 1: Extract raw songs
            List<RawSong> rawSongs = imageProcessor.processImage(imagePath);
            
            for (RawSong rawSong : rawSongs) {
                // LAYER 2: Convert to structured format
                StructuredSong structured = structureConverter.convert(rawSong);
                
                // LAYER 3: Write to JSON
                String outputFile = jsonWriter.writeSong(structured, batchId);
                
                // LAYER 4: Validate
                ValidationResult validationResult = validator.validate(structured);
                structured.validation = validationResult;
                
                // Categorize result
                if ("VALID".equals(validationResult.status)) {
                    stats.valid++;
                    // Create soft link to valid/ directory
                    createSymbolicLink(outputFile, 
                        outputFile.replace("/batch_", "/valid/"));
                } else {
                    stats.reviewRequired++;
                    // Create soft link to review_required/ directory
                    createSymbolicLink(outputFile,
                        outputFile.replace("/batch_", "/review_required/"));
                }
                
                stats.total++;
            }
            
        } catch (OCRException e) {
            logger.error("OCR error for {}: {}", imagePath, e.getMessage());
            stats.errors++;
            // Write error report
        }
        
        long duration = System.currentTimeMillis() - startTime;
        logger.debug("Image processed in {}ms", duration);
    }
    
    /**
     * Create symbolic link (soft link)
     */
    private void createSymbolicLink(String source, String link) throws IOException {
        Path sourcePath = Paths.get(source);
        Path linkPath = Paths.get(link);
        
        // Create parent directories
        linkPath.getParent().toFile().mkdirs();
        
        try {
            Files.createSymbolicLink(linkPath, sourcePath);
        } catch (IOException e) {
            logger.warn("Could not create symlink: {}", e.getMessage());
            // Fallback: hard copy
            Files.copy(sourcePath, linkPath, StandardCopyOption.REPLACE_EXISTING);
        }
    }
    
    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.err.println("Usage: java IngestionPipeline <config> <image_dir> <batch_id>");
            System.exit(1);
        }
        
        String configPath = args[0];
        String imageDir = args[1];
        String batchId = args[2];
        
        IngestionPipeline pipeline = new IngestionPipeline(configPath);
        pipeline.processBatch(imageDir, batchId);
    }
}
```

---

## 9. BUILDING & RUNNING

### Build Commands

```bash
# Compile
mvn clean compile

# Run tests
mvn test

# Create executable JAR
mvn package assembly:single

# Run pipeline
java -cp target/songbook-ingestion-1.0.0-jar-with-dependencies.jar \
  com.worship.ingest.IngestionPipeline \
  config/tesseract.properties \
  /songbook_images \
  batch_001
```

### Docker Execution

```dockerfile
FROM openjdk:11-jre-slim

# Install Tesseract and dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-mar

WORKDIR /app

COPY target/songbook-ingestion-1.0.0-jar-with-dependencies.jar app.jar
COPY /songbook_images /input
COPY config/tesseract.properties config/

CMD ["java", "-Xmx4G", "-cp", "app.jar", \
     "com.worship.ingest.IngestionPipeline", \
     "config/tesseract.properties", \
     "/input", \
     "batch_001"]
```

---

## 10. TESTING FRAMEWORK

### Unit Test Example

```java
@Test
public void testSectionClassification() {
    List<RawBlock> blocks = new ArrayList<>();
    blocks.add(new RawBlock(0, "1. Song Title"));
    blocks.add(new RawBlock(1, "Verse 1"));
    blocks.add(new RawBlock(2, "First verse lyrics"));
    
    RawSong rawSong = new RawSong(1, "Song Title");
    rawSong.blocks = blocks;
    
    StructuredSong structured = converter.convert(rawSong);
    
    assertEquals(1, structured.song.sections.size());
    assertEquals("verse", structured.song.sections.get(0).type);
}

@Test
public void testValidationPassesForCompleteSong() {
    StructuredSong song = createValidStructuredSong();
    ValidationResult result = validator.validate(song);
    
    assertEquals("VALID", result.status);
    assertTrue(result.checksFailed.isEmpty());
}
```

---

**Document Version**: 1.0-DESIGN  
**Status**: READY FOR IMPLEMENTATION  
**Lines of Code Estimate**: ~3,000-4,000 LOC (with all layers + tests)
