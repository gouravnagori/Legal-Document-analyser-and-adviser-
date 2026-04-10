package com.legal.controller;

import com.legal.model.AnalysisRecord;
import com.legal.model.DocumentAnalysisRequest;
import com.legal.model.DocumentAnalysisResponse;
import com.legal.repository.AnalysisRepository;
import com.legal.service.OpenAIService;
import com.legal.service.PdfExtractionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalyzerController {

    private final OpenAIService openAIService;
    private final PdfExtractionService pdfExtractionService;
    private final AnalysisRepository analysisRepository;

    public AnalyzerController(OpenAIService openAIService, PdfExtractionService pdfExtractionService, AnalysisRepository analysisRepository) {
        this.openAIService = openAIService;
        this.pdfExtractionService = pdfExtractionService;
        this.analysisRepository = analysisRepository;
    }

    // Analyze plain text
    @PostMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentAnalysisResponse> analyzeText(@RequestBody DocumentAnalysisRequest request) {
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            DocumentAnalysisResponse err = new DocumentAnalysisResponse();
            err.setError("Document text cannot be empty.");
            return ResponseEntity.badRequest().body(err);
        }

        DocumentAnalysisResponse response = openAIService.analyzeDocument(request.getText());
        if (response.getError() != null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        // Save to MongoDB
        try {
            AnalysisRecord record = AnalysisRecord.fromResponse(response, "text", "Pasted Text");
            analysisRepository.save(record);
        } catch (Exception e) {
            // Don't fail the response if DB save fails
            System.err.println("Warning: Could not save to MongoDB - " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    // Analyze uploaded PDF file
    @PostMapping(value = "/analyze/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentAnalysisResponse> analyzePdf(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            DocumentAnalysisResponse err = new DocumentAnalysisResponse();
            err.setError("File is empty.");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            String extractedText = pdfExtractionService.extractText(file);
            if (extractedText == null || extractedText.trim().isEmpty()) {
                DocumentAnalysisResponse err = new DocumentAnalysisResponse();
                err.setError("Could not extract any text from the PDF.");
                return ResponseEntity.badRequest().body(err);
            }

            DocumentAnalysisResponse response = openAIService.analyzeDocument(extractedText);
            if (response.getError() != null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            // Save to MongoDB
            try {
                AnalysisRecord record = AnalysisRecord.fromResponse(response, "pdf", file.getOriginalFilename());
                analysisRepository.save(record);
            } catch (Exception e) {
                System.err.println("Warning: Could not save to MongoDB - " + e.getMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            DocumentAnalysisResponse err = new DocumentAnalysisResponse();
            err.setError("Error processing PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // Analyze uploaded image using vision model
    @PostMapping(value = "/analyze/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentAnalysisResponse> analyzeImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            DocumentAnalysisResponse err = new DocumentAnalysisResponse();
            err.setError("Image file is empty.");
            return ResponseEntity.badRequest().body(err);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            DocumentAnalysisResponse err = new DocumentAnalysisResponse();
            err.setError("Invalid file type. Please upload an image (JPEG, PNG, etc.).");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            DocumentAnalysisResponse response = openAIService.analyzeImage(base64Image, contentType);
            if (response.getError() != null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            // Save to MongoDB
            try {
                AnalysisRecord record = AnalysisRecord.fromResponse(response, "image", file.getOriginalFilename());
                analysisRepository.save(record);
            } catch (Exception e) {
                System.err.println("Warning: Could not save to MongoDB - " + e.getMessage());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            DocumentAnalysisResponse err = new DocumentAnalysisResponse();
            err.setError("Error processing image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    // Get analysis history
    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<AnalysisRecord>> getHistory() {
        try {
            List<AnalysisRecord> records = analysisRepository.findAllByOrderByAnalyzedAtDesc();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of()); // return empty if DB unavailable
        }
    }

    // Delete a history record
    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable String id) {
        try {
            analysisRepository.deleteById(id);
        } catch (Exception ignored) {}
        return ResponseEntity.ok().build();
    }
}
