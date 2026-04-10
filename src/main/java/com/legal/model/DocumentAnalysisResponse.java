package com.legal.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DocumentAnalysisResponse {
    private String documentType;
    private String summary;
    private String hindiSummary;
    private String keyClauses;
    private String hindiKeyClauses;
    private String legalSections;
    private String hindiLegalSections;
    private String risks;
    private String hindiRisks;
    private String riskSeverity;
    private String yourRights;
    private String hindiYourRights;
    private String deadlines;
    private String hindiDeadlines;
    private String nextSteps;
    private String hindiNextSteps;
    private String advice;
    private String hindiAdvice;
    private String legalAidInfo;
    private String hindiLegalAidInfo;
    private String error;

    public DocumentAnalysisResponse() {}

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String v) { this.documentType = v; }
    public String getSummary() { return summary; }
    public void setSummary(String v) { this.summary = v; }
    public String getHindiSummary() { return hindiSummary; }
    public void setHindiSummary(String v) { this.hindiSummary = v; }
    public String getKeyClauses() { return keyClauses; }
    public void setKeyClauses(String v) { this.keyClauses = v; }
    public String getHindiKeyClauses() { return hindiKeyClauses; }
    public void setHindiKeyClauses(String v) { this.hindiKeyClauses = v; }
    public String getLegalSections() { return legalSections; }
    public void setLegalSections(String v) { this.legalSections = v; }
    public String getHindiLegalSections() { return hindiLegalSections; }
    public void setHindiLegalSections(String v) { this.hindiLegalSections = v; }
    public String getRisks() { return risks; }
    public void setRisks(String v) { this.risks = v; }
    public String getHindiRisks() { return hindiRisks; }
    public void setHindiRisks(String v) { this.hindiRisks = v; }
    public String getRiskSeverity() { return riskSeverity; }
    public void setRiskSeverity(String v) { this.riskSeverity = v; }
    public String getYourRights() { return yourRights; }
    public void setYourRights(String v) { this.yourRights = v; }
    public String getHindiYourRights() { return hindiYourRights; }
    public void setHindiYourRights(String v) { this.hindiYourRights = v; }
    public String getDeadlines() { return deadlines; }
    public void setDeadlines(String v) { this.deadlines = v; }
    public String getHindiDeadlines() { return hindiDeadlines; }
    public void setHindiDeadlines(String v) { this.hindiDeadlines = v; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String v) { this.nextSteps = v; }
    public String getHindiNextSteps() { return hindiNextSteps; }
    public void setHindiNextSteps(String v) { this.hindiNextSteps = v; }
    public String getAdvice() { return advice; }
    public void setAdvice(String v) { this.advice = v; }
    public String getHindiAdvice() { return hindiAdvice; }
    public void setHindiAdvice(String v) { this.hindiAdvice = v; }
    public String getLegalAidInfo() { return legalAidInfo; }
    public void setLegalAidInfo(String v) { this.legalAidInfo = v; }
    public String getHindiLegalAidInfo() { return hindiLegalAidInfo; }
    public void setHindiLegalAidInfo(String v) { this.hindiLegalAidInfo = v; }
    public String getError() { return error; }
    public void setError(String v) { this.error = v; }
}
