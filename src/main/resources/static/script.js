// API Base URL — leave empty when backend serves the frontend (Render).
// Set to your Render backend URL when deploying frontend separately on Vercel.
// Example: const API_BASE = 'https://your-app-name.onrender.com';
const API_BASE = '';

document.addEventListener('DOMContentLoaded', () => {
    // === Element References ===
    const tabs = document.querySelectorAll('.tab');
    const inputBoxes = document.querySelectorAll('.input-box');
    const pdfUpload = document.getElementById('pdf-upload');
    const pdfFileName = document.getElementById('pdf-file-name');
    const pdfDropZone = document.getElementById('pdf-drop-zone');
    const imageUpload = document.getElementById('image-upload');
    const imageFileName = document.getElementById('image-file-name');
    const imageDropZone = document.getElementById('image-drop-zone');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const copyBtn = document.getElementById('copy-btn');
    const printBtn = document.getElementById('print-btn');
    const inputPanel = document.getElementById('input-panel');
    const loadingSection = document.getElementById('loading-section');
    const resultsPanel = document.getElementById('results-panel');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Result Fields
    const resDocType = document.getElementById('res-doc-type');
    const resRiskSeverity = document.getElementById('res-risk-severity');
    const riskBar = document.getElementById('risk-bar');
    const riskCard = document.getElementById('risk-card');
    const resSummary = document.getElementById('res-summary');
    const resHindi = document.getElementById('res-hindi');
    const resClauses = document.getElementById('res-clauses');
    const resSections = document.getElementById('res-sections');
    const resRisks = document.getElementById('res-risks');
    const resRights = document.getElementById('res-rights');
    const resDeadlines = document.getElementById('res-deadlines');
    const resNextSteps = document.getElementById('res-nextsteps');
    const resAdvice = document.getElementById('res-advice');
    const resLegalAid = document.getElementById('res-legalaid');
    const langToggle = document.getElementById('lang-toggle');

    let currentMode = 'pdf';
    let selectedPdf = null;
    let selectedImage = null;
    let hindiVisible = true;

    // === Language Toggle ===
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            hindiVisible = !hindiVisible;
            document.querySelectorAll('.hindi-sub').forEach(el => {
                el.style.display = hindiVisible ? 'block' : 'none';
            });
            const hindiCard = document.querySelector('.hindi-variant');
            if (hindiCard) hindiCard.style.display = hindiVisible ? 'block' : 'none';
            langToggle.querySelector('span').textContent = hindiVisible ? 'Hide Hindi' : 'Show Hindi';
        });
    }

    // === Tab Switching ===
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            inputBoxes.forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.tab;
            document.getElementById(`${currentMode}-box`).classList.add('active');
            hideError();
        });
    });

    // === PDF Handling ===
    pdfUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handlePdfFile(e.target.files[0]);
    });
    setupDropZone(pdfDropZone, (file) => {
        if (file.type === 'application/pdf') handlePdfFile(file);
        else showError('Please upload a valid PDF file.');
    });
    function handlePdfFile(file) {
        selectedPdf = file;
        pdfFileName.textContent = `✔ ${file.name} (${formatSize(file.size)})`;
        hideError();
    }

    // === Image Handling ===
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageFile(e.target.files[0]);
    });
    setupDropZone(imageDropZone, (file) => {
        if (file.type.startsWith('image/')) handleImageFile(file);
        else showError('Please upload a valid image (JPG, PNG, WebP).');
    });
    function handleImageFile(file) {
        selectedImage = file;
        imageFileName.textContent = `✔ ${file.name} (${formatSize(file.size)})`;
        hideError();
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function setupDropZone(zone, onFile) {
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault(); zone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) onFile(e.dataTransfer.files[0]);
        });
        zone.addEventListener('click', (e) => {
            if (e.target.tagName === 'LABEL' || e.target.tagName === 'INPUT') return;
            const input = zone.querySelector('input[type="file"]');
            if (input) input.click();
        });
    }

    // === Text Input Counter ===
    textInput.addEventListener('input', () => {
        charCount.textContent = `${textInput.value.length} characters`;
    });

    // Helper: Set content with Hindi subtitle
    function setWithHindi(el, eng, hindi) {
        el.innerHTML = '';
        const engDiv = document.createElement('div');
        engDiv.textContent = eng;
        el.appendChild(engDiv);

        if (hindi && hindi.trim()) {
            const hindiDiv = document.createElement('div');
            hindiDiv.className = 'hindi-sub';
            hindiDiv.textContent = hindi;
            hindiDiv.style.display = hindiVisible ? 'block' : 'none';
            el.appendChild(hindiDiv);
        }
    }

    // === Analyze ===
    analyzeBtn.addEventListener('click', async () => {
        hideError();
        let url, options;

        if (currentMode === 'text') {
            const text = textInput.value.trim();
            if (!text) return showError('Please paste some legal text to analyze.');
            url = API_BASE + '/api/analyze';
            options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) };
        } else if (currentMode === 'pdf') {
            if (!selectedPdf) return showError('Please select a PDF file first.');
            url = API_BASE + '/api/analyze/pdf';
            const fd = new FormData(); fd.append('file', selectedPdf);
            options = { method: 'POST', body: fd };
        } else if (currentMode === 'image') {
            if (!selectedImage) return showError('Please select an image first.');
            url = API_BASE + '/api/analyze/image';
            const fd = new FormData(); fd.append('file', selectedImage);
            options = { method: 'POST', body: fd };
        }

        analyzeBtn.disabled = true;
        inputPanel.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        resultsPanel.classList.add('hidden');

        const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'].map(id => document.getElementById(id));
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
            if (stepIdx < steps.length) {
                if (stepIdx > 0) { steps[stepIdx - 1].classList.remove('active'); steps[stepIdx - 1].classList.add('done'); }
                steps[stepIdx].classList.add('active');
                stepIdx++;
            }
        }, 1800);

        try {
            const resp = await fetch(url, options);
            const data = await resp.json();
            clearInterval(stepInterval);
            steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });

            if (!resp.ok) throw new Error(data.error || `Server error: ${resp.status}`);
            await sleep(400);

            // Populate results with Hindi under each section
            resDocType.textContent = data.documentType || 'Legal Document';
            resSummary.textContent = data.summary || 'No summary provided.';
            resHindi.textContent = data.hindiSummary || 'हिंदी सारांश उपलब्ध नहीं है।';
            setWithHindi(resClauses, data.keyClauses || 'No key clauses found.', data.hindiKeyClauses);
            setWithHindi(resSections, data.legalSections || 'No legal sections identified.', data.hindiLegalSections);
            setWithHindi(resRisks, data.risks || 'No major risks identified.', data.hindiRisks);
            setWithHindi(resRights, data.yourRights || 'Rights information not available.', data.hindiYourRights);
            setWithHindi(resDeadlines, data.deadlines || 'No specific deadlines found.', data.hindiDeadlines);
            setWithHindi(resNextSteps, data.nextSteps || 'No specific next steps.', data.hindiNextSteps);
            setWithHindi(resAdvice, data.advice || 'No specific advice.', data.hindiAdvice);
            setWithHindi(resLegalAid, data.legalAidInfo || 'Call NALSA Helpline: 15100', data.hindiLegalAidInfo);

            // Risk Severity
            const severity = (data.riskSeverity || 'medium').toLowerCase();
            riskBar.className = 'risk-bar ' + severity;
            resRiskSeverity.className = 'meta-value risk-text ' + severity;
            resRiskSeverity.textContent = (data.riskSeverity || 'MEDIUM').toUpperCase();
            riskCard.className = 'risk-badge glass-card ' + severity;

            loadingSection.classList.add('hidden');
            resultsPanel.classList.remove('hidden');
            resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {
            clearInterval(stepInterval);
            steps.forEach(s => { s.classList.remove('active', 'done'); });
            showError(err.message);
            loadingSection.classList.add('hidden');
            inputPanel.classList.remove('hidden');
            analyzeBtn.disabled = false;
        }
    });

    // === Reset ===
    resetBtn.addEventListener('click', () => {
        resultsPanel.classList.add('hidden');
        inputPanel.classList.remove('hidden');
        analyzeBtn.disabled = false;
        hideError();
        textInput.value = '';
        charCount.textContent = '0 characters';
        selectedPdf = null; selectedImage = null;
        pdfUpload.value = ''; imageUpload.value = '';
        pdfFileName.textContent = ''; imageFileName.textContent = '';
        imagePreviewContainer.classList.add('hidden');
        imagePreview.src = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === Copy ===
    copyBtn.addEventListener('click', () => {
        const getText = (el) => el ? el.textContent : '';
        const text = `
=== LEGAL DOCUMENT ANALYSIS ===
Document Type: ${resDocType.textContent}
Risk Level: ${resRiskSeverity.textContent}

📝 SUMMARY:
${resSummary.textContent}

🇮🇳 HINDI SUMMARY:
${resHindi.textContent}

📎 KEY CLAUSES:
${getText(resClauses)}

⚖️ LEGAL SECTIONS:
${getText(resSections)}

🚨 RISKS:
${getText(resRisks)}

🛡️ YOUR RIGHTS:
${getText(resRights)}

⏰ DEADLINES:
${getText(resDeadlines)}

📋 NEXT STEPS:
${getText(resNextSteps)}

💡 ADVICE:
${getText(resAdvice)}

📞 LEGAL AID:
${getText(resLegalAid)}
        `.trim();

        navigator.clipboard.writeText(text).then(() => {
            const orig = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✓ Copied!</span>';
            setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
        });
    });

    // === Print ===
    printBtn.addEventListener('click', () => window.print());

    // === Utilities ===
    function showError(msg) { errorText.textContent = msg; errorMessage.classList.remove('hidden'); errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    function hideError() { errorMessage.classList.add('hidden'); errorText.textContent = ''; }
    function formatSize(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
});
