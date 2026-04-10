# ⚖️ LegalAdvisor AI — Indian Legal Document Analyzer

> AI-powered legal document analyzer that helps Indian citizens understand complex legal documents in plain English & Hindi.

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-green?logo=springboot)
![Llama AI](https://img.shields.io/badge/AI-Llama%203.3-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Optional-brightgreen?logo=mongodb)
![Deploy](https://img.shields.io/badge/Deploy-Render-purple?logo=render)

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
| Database | MongoDB (optional) |
| Frontend | HTML5, CSS3, Vanilla JS |
| Deployment | Docker + Render |

## 🚀 Quick Start (Local)

### Prerequisites
- Java 21+
- Maven 3.9+
- A [Groq API Key](https://console.groq.com/) (free)
- MongoDB (optional — app works without it)

### Run Locally

```bash
# Clone the repo
git clone https://github.com/gouravnagori/Legal-Document-analyser-and-adviser-.git
cd Legal-Document-analyser-and-adviser-

# Set your Groq API key
export GROQ_API_KEY=your_groq_api_key_here

# (Optional) Set MongoDB URI
export MONGODB_URI=mongodb://localhost:27017/legaladvisor

# Build and run
mvn clean package -DskipTests
java -jar target/legal-analyzer-0.0.1-SNAPSHOT.jar
```

Open http://localhost:8080 in your browser.

## ☁️ Deploy on Render (Recommended)

1. Fork/push this repo to GitHub
2. Go to [render.com](https://render.com) → Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select this repository
5. Render will auto-detect the `Dockerfile`
6. Add environment variables:
   - `GROQ_API_KEY` = your Groq API key
   - `MONGODB_URI` = your MongoDB Atlas connection string (optional)
7. Click **"Deploy Web Service"**

## 🔺 Deploy Frontend on Vercel (Optional)

> Only needed if you want the frontend hosted separately from the backend.

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Import this repository
3. Set **Output Directory** to `src/main/resources/static`
4. Update `API_BASE` in `script.js` to your Render backend URL
5. Deploy

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
├── vercel.json                          # Vercel frontend config
├── system.properties                    # Java version
└── pom.xml                             # Maven dependencies
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `MONGODB_URI` | ❌ Optional | MongoDB Atlas connection string for history |
| `PORT` | ❌ Auto | Set automatically by Render (default: 8080) |

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
