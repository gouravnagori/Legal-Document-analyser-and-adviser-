package com.legal.model;

public class DocumentAnalysisRequest {
    private String text;

    public DocumentAnalysisRequest() {}

    public DocumentAnalysisRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
