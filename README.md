# ⚖️ LegalAdvisor AI — Indian Legal Document Analyzer

> AI-powered legal document analyzer that helps Indian citizens understand complex legal documents in plain English & Hindi.

### 🌐 [**Try It Live → legal-document-analyser-and-adviser.onrender.com**](https://legal-document-analyser-and-adviser.onrender.com/)

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-green?logo=springboot)
![Llama AI](https://img.shields.io/badge/AI-Llama%203.3-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)
![Deploy](https://img.shields.io/badge/Live-Render-purple?logo=render)

## ✨ Features

- 📄 **PDF Upload** — Upload FIRs, court orders, contracts, notices
- 📸 **Image Scan** — Take a photo of any legal document
- ✍️ **Paste Text** — Paste clauses or legal text directly
- 🇮🇳 **Bilingual** — Results in English + Hindi (Devanagari)
- ⚖️ **Legal Sections** — Identifies IPC, CrPC, BNS sections with explanations
- 🛡️ **Know Your Rights** — Constitutional & legal rights with Article references
- 🚨 **Risk Assessment** — Color-coded risk severity (LOW → CRITICAL)
- ⏰ **Deadlines** — Important time limits and deadlines
- 📋 **Action Plan** — Step-by-step what to do next
- 📞 **Legal Aid** — Free helpline numbers (NALSA 15100, Tele-Law 1516)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21 + Spring Boot 3.2.4 |
| AI | Groq API (Llama 3.3 70B + Llama 4 Scout Vision) |
| Database | MongoDB Atlas |
| Frontend | HTML5, CSS3, Vanilla JS |
| Deployment | Docker + Render |

## 📁 Project Structure

```
├── src/main/java/com/legal/
│   ├── LegalAnalyzerApplication.java    # Main entry point
│   ├── controller/
│   │   └── AnalyzerController.java      # REST API endpoints
│   ├── service/
│   │   ├── OpenAIService.java           # Groq/Llama AI integration
│   │   └── PdfExtractionService.java    # PDF text extraction
│   ├── model/
│   │   ├── DocumentAnalysisRequest.java
│   │   ├── DocumentAnalysisResponse.java
│   │   ├── AnalysisRecord.java
│   │   └── openai/                      # OpenAI API models
│   ├── repository/
│   │   └── AnalysisRepository.java      # MongoDB repository
│   └── exception/
│       └── GlobalExceptionHandler.java
├── src/main/resources/
│   ├── application.properties           # App configuration
│   └── static/
│       ├── index.html                   # Frontend UI
│       ├── style.css                    # Styles
│       └── script.js                    # Frontend logic
├── Dockerfile                           # Docker build for Render
├── render.yaml                          # Render deployment blueprint
└── pom.xml                             # Maven dependencies
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze plain text |
| `POST` | `/api/analyze/pdf` | Analyze uploaded PDF |
| `POST` | `/api/analyze/image` | Analyze document image |
| `GET` | `/api/history` | Get analysis history |
| `DELETE` | `/api/history/{id}` | Delete a history record |

## 👨‍💻 Author

**Gourav Nagori** — [GitHub](https://github.com/gouravnagori) · [Email](mailto:gouravnagori189@gmail.com)

## ⚠️ Disclaimer

This tool is for **informational purposes only** and is **not a substitute for professional legal advice**. Always consult a qualified lawyer for legal matters.

**Free Legal Aid**: Call NALSA Helpline **15100** | Emergency **112**
