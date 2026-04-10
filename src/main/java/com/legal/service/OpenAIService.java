package com.legal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.legal.model.DocumentAnalysisResponse;
import com.legal.model.openai.OpenAIRequest;
import com.legal.model.openai.OpenAIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.api.model}")
    private String modelName;

    @Value("${openai.api.vision.model}")
    private String visionModelName;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an expert Indian Legal Document Analyzer built to help ordinary Indian citizens understand complex legal documents in simple language.

            Analyze the following legal document. Provide the analysis strictly as a JSON object.
            Do NOT wrap in markdown code fences. Return ONLY raw JSON.

            CRITICAL RULE: Every single value in the JSON MUST be a plain STRING. Do NOT use arrays, lists, or nested objects for any value. If you want to list items, put them all within a single string separated by newlines.

            The JSON must have exactly these 20 keys (all values must be strings):

            "documentType": Identify the type — e.g. "FIR", "Court Summons", "Legal Notice", "Rental Agreement", "Employment Contract", etc.
            "summary": A clear plain-English summary any common person can understand. Be detailed.
            "hindiSummary": COMPLETE Hindi translation (Devanagari script) of the summary. Full translation, not abbreviated.
            "keyClauses": List ALL important clauses, conditions, obligations. Number them clearly within a single string.
            "hindiKeyClauses": Complete Hindi translation of keyClauses in Devanagari script.
            "legalSections": Identify ALL Indian legal sections (IPC, CrPC, BNS, etc.) with explanations. Each on a new line.
            "hindiLegalSections": Complete Hindi translation of legalSections in Devanagari script.
            "risks": All hidden risks, unfavorable terms, red flags. Be specific.
            "hindiRisks": Complete Hindi translation of risks in Devanagari script.
            "riskSeverity": Exactly one of: "LOW", "MEDIUM", "HIGH", or "CRITICAL".
            "yourRights": Citizen's constitutional and legal rights with Article/Act references.
            "hindiYourRights": Complete Hindi translation of yourRights in Devanagari script.
            "deadlines": Any deadlines, time limits, or standard legal time limits for this document type.
            "hindiDeadlines": Complete Hindi translation of deadlines in Devanagari script.
            "nextSteps": Numbered step-by-step action plan. Be specific and practical.
            "hindiNextSteps": Complete Hindi translation of nextSteps in Devanagari script.
            "advice": Practical, actionable advice in simple language.
            "hindiAdvice": Complete Hindi translation of advice in Devanagari script.
            "legalAidInfo": Indian legal aid resources (NALSA 15100, Tele-Law 1516, District Legal Services Authority, Lok Adalat).
            "hindiLegalAidInfo": Complete Hindi translation of legalAidInfo in Devanagari script.

            IMPORTANT: ALL values must be plain strings. NO arrays. NO objects. Every Hindi field must be a COMPLETE translation.
            """;

    private static final String IMAGE_PROMPT = """
            You are an expert Indian Legal Document Analyzer with OCR capabilities. Look at this image of a legal document carefully.
            Extract ALL visible text and analyze it thoroughly.

            Provide the analysis strictly as a JSON object.
            Do NOT wrap in markdown code fences. Return ONLY raw JSON.

            CRITICAL RULE: Every value MUST be a plain STRING. NO arrays, NO objects.

            The JSON must have exactly these 20 keys (all string values):

            "documentType": Identify the type.
            "summary": Clear plain-English summary.
            "hindiSummary": COMPLETE Hindi (Devanagari) translation of summary.
            "keyClauses": Important clauses/terms, numbered, as a single string.
            "hindiKeyClauses": Complete Hindi translation of keyClauses.
            "legalSections": Indian legal sections (IPC, CrPC, BNS, etc.) with explanations.
            "hindiLegalSections": Complete Hindi translation of legalSections.
            "risks": All hidden risks and red flags.
            "hindiRisks": Complete Hindi translation of risks.
            "riskSeverity": Exactly one of: "LOW", "MEDIUM", "HIGH", or "CRITICAL".
            "yourRights": Constitutional and legal rights with Article/Act references.
            "hindiYourRights": Complete Hindi translation of yourRights.
            "deadlines": Deadlines or standard legal time limits.
            "hindiDeadlines": Complete Hindi translation of deadlines.
            "nextSteps": Numbered step-by-step action plan.
            "hindiNextSteps": Complete Hindi translation of nextSteps.
            "advice": Practical advice in simple language.
            "hindiAdvice": Complete Hindi translation of advice.
            "legalAidInfo": Indian legal aid resources.
            "hindiLegalAidInfo": Complete Hindi translation of legalAidInfo.

            ALL values must be plain strings. NO arrays. Every Hindi field must be COMPLETE.
            """;

    public OpenAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public DocumentAnalysisResponse analyzeDocument(String documentText) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        List<OpenAIRequest.Message> messages = new ArrayList<>();
        messages.add(new OpenAIRequest.Message("system", SYSTEM_PROMPT));
        messages.add(new OpenAIRequest.Message("user", documentText));

        OpenAIRequest request = new OpenAIRequest(modelName, messages);
        HttpEntity<OpenAIRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<OpenAIResponse> response = restTemplate.postForEntity(apiUrl, entity, OpenAIResponse.class);

            if (response.getBody() != null && response.getBody().getChoices() != null && !response.getBody().getChoices().isEmpty()) {
                String jsonResponseText = response.getBody().getChoices().get(0).getMessage().getContent();
                jsonResponseText = cleanJsonResponse(jsonResponseText);
                return safeParseResponse(jsonResponseText);
            }
        } catch (Exception e) {
            e.printStackTrace();
            DocumentAnalysisResponse errorResponse = new DocumentAnalysisResponse();
            errorResponse.setError("Failed to analyze document: " + e.getMessage());
            return errorResponse;
        }

        DocumentAnalysisResponse fallback = new DocumentAnalysisResponse();
        fallback.setError("Empty response from AI.");
        return fallback;
    }

    public DocumentAnalysisResponse analyzeImage(String base64Image, String mimeType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", visionModelName);

        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");

        List<Map<String, Object>> contentParts = new ArrayList<>();

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("type", "text");
        textPart.put("text", IMAGE_PROMPT);
        contentParts.add(textPart);

        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("type", "image_url");
        Map<String, String> imageUrl = new HashMap<>();
        imageUrl.put("url", "data:" + mimeType + ";base64," + base64Image);
        imagePart.put("image_url", imageUrl);
        contentParts.add(imagePart);

        userMessage.put("content", contentParts);
        messages.add(userMessage);
        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String aiContent = root.path("choices").get(0).path("message").path("content").asText();
                aiContent = cleanJsonResponse(aiContent);
                return safeParseResponse(aiContent);
            }
        } catch (Exception e) {
            e.printStackTrace();
            DocumentAnalysisResponse errorResponse = new DocumentAnalysisResponse();
            errorResponse.setError("Failed to analyze image: " + e.getMessage());
            return errorResponse;
        }

        DocumentAnalysisResponse fallback = new DocumentAnalysisResponse();
        fallback.setError("Empty response from AI.");
        return fallback;
    }

    /**
     * Safely parses the AI response JSON, handling cases where the AI returns
     * arrays instead of strings for some fields. Converts any arrays to
     * newline-separated strings automatically.
     */
    private DocumentAnalysisResponse safeParseResponse(String jsonText) throws Exception {
        JsonNode root = objectMapper.readTree(jsonText);
        DocumentAnalysisResponse resp = new DocumentAnalysisResponse();

        resp.setDocumentType(nodeToString(root.get("documentType")));
        resp.setSummary(nodeToString(root.get("summary")));
        resp.setHindiSummary(nodeToString(root.get("hindiSummary")));
        resp.setKeyClauses(nodeToString(root.get("keyClauses")));
        resp.setHindiKeyClauses(nodeToString(root.get("hindiKeyClauses")));
        resp.setLegalSections(nodeToString(root.get("legalSections")));
        resp.setHindiLegalSections(nodeToString(root.get("hindiLegalSections")));
        resp.setRisks(nodeToString(root.get("risks")));
        resp.setHindiRisks(nodeToString(root.get("hindiRisks")));
        resp.setRiskSeverity(nodeToString(root.get("riskSeverity")));
        resp.setYourRights(nodeToString(root.get("yourRights")));
        resp.setHindiYourRights(nodeToString(root.get("hindiYourRights")));
        resp.setDeadlines(nodeToString(root.get("deadlines")));
        resp.setHindiDeadlines(nodeToString(root.get("hindiDeadlines")));
        resp.setNextSteps(nodeToString(root.get("nextSteps")));
        resp.setHindiNextSteps(nodeToString(root.get("hindiNextSteps")));
        resp.setAdvice(nodeToString(root.get("advice")));
        resp.setHindiAdvice(nodeToString(root.get("hindiAdvice")));
        resp.setLegalAidInfo(nodeToString(root.get("legalAidInfo")));
        resp.setHindiLegalAidInfo(nodeToString(root.get("hindiLegalAidInfo")));

        return resp;
    }

    /**
     * Converts a JsonNode to a String gracefully.
     * - If it's a text node, returns the text.
     * - If it's an array, joins all elements with newlines.
     * - If it's an object, stringifies it.
     * - If it's null or missing, returns an empty string.
     */
    private String nodeToString(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return "";
        }
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < node.size(); i++) {
                JsonNode item = node.get(i);
                if (item.isTextual()) {
                    sb.append(item.asText());
                } else {
                    sb.append(item.toString());
                }
                if (i < node.size() - 1) sb.append("\n");
            }
            return sb.toString();
        }
        return node.toString();
    }

    private String cleanJsonResponse(String text) {
        if (text == null) return "{}";
        text = text.trim();
        if (text.startsWith("```json")) text = text.substring(7);
        else if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
        return text.trim();
    }
}
