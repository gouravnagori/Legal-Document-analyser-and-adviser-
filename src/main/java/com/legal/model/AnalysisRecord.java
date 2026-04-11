package com.legal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "analysis_history")
public class AnalysisRecord {

    @Id
    private String id;

    @Indexed
    private String userId; // Links record to authenticated user

    private String inputType; // "text", "pdf", "image"
    private String fileName;

    // TTL index: MongoDB will auto-delete documents 15 days after analyzedAt
    @Indexed(expireAfter = "15d")
    private LocalDateTime analyzedAt;

    // All analysis fields
    private String documentType;
    private String summary;
    private String hindiSummary;
    private String keyClauses;
    private String legalSections;
    private String risks;
    private String riskSeverity;
    private String yourRights;
    private String deadlines;
    private String nextSteps;
    private String advice;
    private String legalAidInfo;

    public AnalysisRecord() {
        this.analyzedAt = LocalDateTime.now();
    }

    public static AnalysisRecord fromResponse(DocumentAnalysisResponse resp, String inputType, String fileName) {
        AnalysisRecord record = new AnalysisRecord();
        record.setInputType(inputType);
        record.setFileName(fileName);
        record.setDocumentType(resp.getDocumentType());
        record.setSummary(resp.getSummary());
        record.setHindiSummary(resp.getHindiSummary());
        record.setKeyClauses(resp.getKeyClauses());
        record.setLegalSections(resp.getLegalSections());
        record.setRisks(resp.getRisks());
        record.setRiskSeverity(resp.getRiskSeverity());
        record.setYourRights(resp.getYourRights());
        record.setDeadlines(resp.getDeadlines());
        record.setNextSteps(resp.getNextSteps());
        record.setAdvice(resp.getAdvice());
        record.setLegalAidInfo(resp.getLegalAidInfo());
        return record;
    }

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getInputType() { return inputType; }
    public void setInputType(String inputType) { this.inputType = inputType; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getHindiSummary() { return hindiSummary; }
    public void setHindiSummary(String hindiSummary) { this.hindiSummary = hindiSummary; }
    public String getKeyClauses() { return keyClauses; }
    public void setKeyClauses(String keyClauses) { this.keyClauses = keyClauses; }
    public String getLegalSections() { return legalSections; }
    public void setLegalSections(String legalSections) { this.legalSections = legalSections; }
    public String getRisks() { return risks; }
    public void setRisks(String risks) { this.risks = risks; }
    public String getRiskSeverity() { return riskSeverity; }
    public void setRiskSeverity(String riskSeverity) { this.riskSeverity = riskSeverity; }
    public String getYourRights() { return yourRights; }
    public void setYourRights(String yourRights) { this.yourRights = yourRights; }
    public String getDeadlines() { return deadlines; }
    public void setDeadlines(String deadlines) { this.deadlines = deadlines; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }
    public String getLegalAidInfo() { return legalAidInfo; }
    public void setLegalAidInfo(String legalAidInfo) { this.legalAidInfo = legalAidInfo; }
}
