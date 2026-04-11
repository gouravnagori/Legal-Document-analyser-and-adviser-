// API Base URL — leave empty when backend serves the frontend (Render).
const API_BASE = '';

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    //  ELEMENT REFERENCES
    // ============================================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // Auth Page
    const authPage = $('#auth-page');
    const appMain = $('#app-main');
    const authTitle = $('#auth-title');
    const authSubtitle = $('#auth-subtitle');
    const signinForm = $('#signin-form');
    const signupForm = $('#signup-form');
    const showSignup = $('#show-signup');
    const showSignin = $('#show-signin');
    const signinError = $('#signin-error');
    const signupError = $('#signup-error');
    const signupSuccess = $('#signup-success');

    // Nav
    const navLinks = $$('.nav-link');
    const pages = $$('.page');
    const userMenu = $('#user-menu');
    const userAvatar = $('#user-avatar');
    const userDropdown = $('#user-dropdown');
    const dropdownName = $('#dropdown-name');
    const dropdownEmail = $('#dropdown-email');
    const logoutBtn = $('#logout-btn');
    const themeToggle = $('#theme-toggle');

    // Analyze Page
    const tabs = $$('.tab');
    const inputBoxes = $$('.input-box');
    const pdfUpload = $('#pdf-upload');
    const pdfFileName = $('#pdf-file-name');
    const pdfDropZone = $('#pdf-drop-zone');
    const imageUpload = $('#image-upload');
    const imageFileName = $('#image-file-name');
    const imageDropZone = $('#image-drop-zone');
    const imagePreviewContainer = $('#image-preview-container');
    const imagePreview = $('#image-preview');
    const textInput = $('#text-input');
    const charCount = $('#char-count');
    const analyzeBtn = $('#analyze-btn');
    const resetBtn = $('#reset-btn');
    const copyBtn = $('#copy-btn');
    const printBtn = $('#print-btn');
    const inputPanel = $('#input-panel');
    const loadingSection = $('#loading-section');
    const resultsPanel = $('#results-panel');
    const errorMessage = $('#error-message');
    const errorText = $('#error-text');

    // Results
    const resDocType = $('#res-doc-type');
    const resRiskSeverity = $('#res-risk-severity');
    const riskBar = $('#risk-bar');
    const riskCard = $('#risk-card');
    const resSummary = $('#res-summary');
    const resHindi = $('#res-hindi');
    const resClauses = $('#res-clauses');
    const resSections = $('#res-sections');
    const resRisks = $('#res-risks');
    const resRights = $('#res-rights');
    const resDeadlines = $('#res-deadlines');
    const resNextSteps = $('#res-nextsteps');
    const resAdvice = $('#res-advice');
    const resLegalAid = $('#res-legalaid');
    const langToggle = $('#lang-toggle');

    // History
    const historyEmpty = $('#history-empty');
    const historyList = $('#history-list');
    const historyDetail = $('#history-detail');
    const historyDetailContent = $('#history-detail-content');
    const backToHistoryBtn = $('#back-to-history-btn');
    const heroGreeting = $('#hero-greeting');

    let currentMode = 'pdf';
    let selectedPdf = null;
    let selectedImage = null;
    let hindiVisible = true;
    let currentUser = null; // { name, email }

    // ============================================================
    //  THEME TOGGLE
    // ============================================================
    function initTheme() {
        const saved = localStorage.getItem('legal-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
    }
    initTheme();

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('legal-theme', next);
    });

    // ============================================================
    //  AUTH — Show/Hide Pages
    // ============================================================
    function showAuthPage() {
        authPage.classList.remove('hidden');
        appMain.classList.add('hidden');
    }

    function showAppPage() {
        authPage.classList.add('hidden');
        appMain.classList.remove('hidden');
        // Set greeting
        if (currentUser && heroGreeting) {
            heroGreeting.textContent = `Welcome back, ${currentUser.name} 👋`;
        }
        // Set user menu
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        dropdownName.textContent = currentUser.name;
        dropdownEmail.textContent = currentUser.email;
    }

    // ============================================================
    //  AUTH — Check Session on Load
    // ============================================================
    async function checkAuth() {
        try {
            const resp = await fetch(API_BASE + '/api/auth/me', { credentials: 'same-origin' });
            const data = await resp.json();
            if (data.authenticated) {
                currentUser = { name: data.name, email: data.email };
                showAppPage();
            } else {
                currentUser = null;
                showAuthPage();
            }
        } catch {
            currentUser = null;
            showAuthPage();
        }
    }

    checkAuth();

    // ============================================================
    //  AUTH — Switch Between Sign In / Sign Up
    // ============================================================
    function showSignInForm() {
        signinForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        authTitle.textContent = 'Welcome back';
        authSubtitle.textContent = 'Sign in to continue analyzing documents';
        signinError.classList.add('hidden');
        signupError.classList.add('hidden');
        signupSuccess.classList.add('hidden');
    }

    function showSignUpForm() {
        signupForm.classList.remove('hidden');
        signinForm.classList.add('hidden');
        authTitle.textContent = 'Create your account';
        authSubtitle.textContent = 'Start analyzing legal documents for free';
        signinError.classList.add('hidden');
        signupError.classList.add('hidden');
        signupSuccess.classList.add('hidden');
    }

    showSignup.addEventListener('click', (e) => { e.preventDefault(); showSignUpForm(); });
    showSignin.addEventListener('click', (e) => { e.preventDefault(); showSignInForm(); });

    // Sign Up
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupError.classList.add('hidden');
        signupSuccess.classList.add('hidden');
        const btn = $('#signup-submit-btn');
        btn.disabled = true;

        const name = $('#signup-name').value.trim();
        const email = $('#signup-email').value.trim();
        const password = $('#signup-password').value;

        try {
            const resp = await fetch(API_BASE + '/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await resp.json();
            if (!resp.ok) {
                signupError.textContent = data.error || 'Sign up failed.';
                signupError.classList.remove('hidden');
                btn.disabled = false;
                return;
            }
            signupSuccess.textContent = '✅ ' + (data.message || 'Account created! Signing you in...');
            signupSuccess.classList.remove('hidden');
            signupForm.reset();
            // Auto-sign in after signup
            setTimeout(() => showSignInForm(), 1500);
        } catch {
            signupError.textContent = 'Network error. Please try again.';
            signupError.classList.remove('hidden');
        }
        btn.disabled = false;
    });

    // Sign In
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signinError.classList.add('hidden');
        const btn = $('#signin-submit-btn');
        btn.disabled = true;

        const email = $('#signin-email').value.trim();
        const password = $('#signin-password').value;

        try {
            const resp = await fetch(API_BASE + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ email, password })
            });
            const data = await resp.json();
            if (!resp.ok) {
                signinError.textContent = data.error || 'Sign in failed.';
                signinError.classList.remove('hidden');
                btn.disabled = false;
                return;
            }
            currentUser = { name: data.name, email: data.email };
            signinForm.reset();
            showAppPage();
        } catch {
            signinError.textContent = 'Network error. Please try again.';
            signinError.classList.remove('hidden');
        }
        btn.disabled = false;
    });

    // User Dropdown Toggle
    userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => userDropdown.classList.add('hidden'));

    // Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch(API_BASE + '/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        } catch {}
        currentUser = null;
        userDropdown.classList.add('hidden');
        showAuthPage();
    });

    // ============================================================
    //  PAGE NAVIGATION
    // ============================================================
    function navigateTo(page) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === page));
        pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === `page-${page}`) p.classList.add('active');
        });
        if (page === 'history') loadHistory();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => navigateTo(link.dataset.page));
    });

    // ============================================================
    //  LANGUAGE TOGGLE
    // ============================================================
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            hindiVisible = !hindiVisible;
            $$('.hindi-sub').forEach(el => el.style.display = hindiVisible ? 'block' : 'none');
            const hindiCard = $('.hindi-variant');
            if (hindiCard) hindiCard.style.display = hindiVisible ? 'block' : 'none';
            langToggle.querySelector('span').textContent = hindiVisible ? 'Hide Hindi' : 'Show Hindi';
        });
    }

    // ============================================================
    //  TAB SWITCHING
    // ============================================================
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            inputBoxes.forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.tab;
            $(`#${currentMode}-box`).classList.add('active');
            hideError();
        });
    });

    // ============================================================
    //  FILE HANDLING
    // ============================================================
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

    imageUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImageFile(e.target.files[0]);
    });
    setupDropZone(imageDropZone, (file) => {
        if (file.type.startsWith('image/')) handleImageFile(file);
        else showError('Please upload a valid image.');
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

    // Text counter
    textInput.addEventListener('input', () => {
        charCount.textContent = `${textInput.value.length} characters`;
    });

    // ============================================================
    //  COLLAPSIBLE RESULT CARDS
    // ============================================================
    $$('.card-header-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.result-card');
            const content = card.querySelector('.card-content');
            card.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        });
    });

    // ============================================================
    //  ANALYZE
    // ============================================================
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

    analyzeBtn.addEventListener('click', async () => {
        hideError();

        let url, options;
        if (currentMode === 'text') {
            const text = textInput.value.trim();
            if (!text) return showError('Please paste some legal text to analyze.');
            url = API_BASE + '/api/analyze';
            options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ text }) };
        } else if (currentMode === 'pdf') {
            if (!selectedPdf) return showError('Please select a PDF file first.');
            url = API_BASE + '/api/analyze/pdf';
            const fd = new FormData(); fd.append('file', selectedPdf);
            options = { method: 'POST', credentials: 'same-origin', body: fd };
        } else if (currentMode === 'image') {
            if (!selectedImage) return showError('Please select an image first.');
            url = API_BASE + '/api/analyze/image';
            const fd = new FormData(); fd.append('file', selectedImage);
            options = { method: 'POST', credentials: 'same-origin', body: fd };
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

            // If 401, session expired — go back to auth
            if (resp.status === 401) {
                clearInterval(stepInterval);
                currentUser = null;
                showAuthPage();
                return;
            }

            const data = await resp.json();
            clearInterval(stepInterval);
            steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });

            if (!resp.ok) throw new Error(data.error || `Server error: ${resp.status}`);
            await sleep(300);

            populateResults(data);
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

    function populateResults(data) {
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

        const severity = (data.riskSeverity || 'medium').toLowerCase();
        riskBar.className = 'risk-bar ' + severity;
        resRiskSeverity.className = 'meta-value risk-text ' + severity;
        resRiskSeverity.textContent = (data.riskSeverity || 'MEDIUM').toUpperCase();
        riskCard.className = 'risk-badge glass-card ' + severity;

        // Expand summary, collapse others
        $$('.result-card').forEach(card => {
            const section = card.dataset.section;
            const content = card.querySelector('.card-content');
            if (section === 'summary') {
                card.classList.remove('collapsed');
                if (content) content.classList.add('expanded');
            } else {
                card.classList.add('collapsed');
                if (content) content.classList.remove('expanded');
            }
        });
    }

    // ============================================================
    //  RESET
    // ============================================================
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

    // ============================================================
    //  COPY & PRINT
    // ============================================================
    copyBtn.addEventListener('click', () => {
        const getText = (el) => el ? el.textContent : '';
        const text = `=== LEGAL DOCUMENT ANALYSIS ===
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
${getText(resLegalAid)}`.trim();

        navigator.clipboard.writeText(text).then(() => {
            const orig = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✓ Copied!</span>';
            setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
        });
    });

    printBtn.addEventListener('click', () => window.print());

    // ============================================================
    //  HISTORY
    // ============================================================
    async function loadHistory() {
        historyDetail.classList.add('hidden');
        historyList.innerHTML = '';
        historyEmpty.classList.add('hidden');

        try {
            const resp = await fetch(API_BASE + '/api/history', { credentials: 'same-origin' });
            if (resp.status === 401) {
                currentUser = null;
                showAuthPage();
                return;
            }
            const records = await resp.json();
            if (!records || records.length === 0) {
                historyEmpty.classList.remove('hidden');
                return;
            }

            records.forEach(record => {
                const card = document.createElement('div');
                card.className = 'history-card';

                const iconEmoji = record.inputType === 'pdf' ? '📄' : record.inputType === 'image' ? '📸' : '✍️';
                const iconClass = record.inputType || 'text';
                const date = record.analyzedAt ? formatDate(record.analyzedAt) : 'Unknown date';
                const riskClass = (record.riskSeverity || 'medium').toLowerCase();

                card.innerHTML = `
                    <div class="history-card-icon ${iconClass}">${iconEmoji}</div>
                    <div class="history-card-body">
                        <div class="history-card-title">${escapeHtml(record.documentType || 'Legal Document')}</div>
                        <div class="history-card-meta">
                            <span>${escapeHtml(record.fileName || 'Document')}</span>
                            <span>${date}</span>
                            <span class="risk-text ${riskClass}">${(record.riskSeverity || 'MEDIUM').toUpperCase()}</span>
                        </div>
                        <div class="history-card-preview">${escapeHtml((record.summary || '').substring(0, 120))}...</div>
                    </div>
                    <div class="history-card-actions">
                        <button class="history-delete-btn" data-id="${record.id}" title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                `;

                card.querySelector('.history-card-body').addEventListener('click', () => showHistoryDetail(record));
                card.querySelector('.history-card-icon').addEventListener('click', () => showHistoryDetail(record));

                card.querySelector('.history-delete-btn').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!confirm('Delete this analysis?')) return;
                    try {
                        await fetch(API_BASE + '/api/history/' + record.id, { method: 'DELETE', credentials: 'same-origin' });
                    } catch {}
                    loadHistory();
                });

                historyList.appendChild(card);
            });
        } catch {
            historyEmpty.classList.remove('hidden');
        }
    }

    function showHistoryDetail(record) {
        historyList.style.display = 'none';
        historyEmpty.classList.add('hidden');
        historyDetail.classList.remove('hidden');

        const riskClass = (record.riskSeverity || 'medium').toLowerCase();
        historyDetailContent.innerHTML = `
            <div class="results-header">
                <h2>📋 ${escapeHtml(record.documentType || 'Legal Document')}</h2>
                <div class="results-actions">
                    <span class="icon-btn">${escapeHtml(record.fileName || 'Document')}</span>
                    <span class="icon-btn risk-text ${riskClass}">${(record.riskSeverity || 'MEDIUM').toUpperCase()}</span>
                </div>
            </div>
            ${buildDetailCard('📝', 'Summary', 'summary-variant', 'summary-badge', record.summary)}
            ${buildDetailCard('🇮🇳', 'हिंदी सारांश', 'hindi-variant', 'hindi-badge', record.hindiSummary)}
            ${buildDetailCard('📎', 'Key Clauses', 'clauses-variant', 'clauses-badge', record.keyClauses)}
            ${buildDetailCard('⚖️', 'Legal Sections', 'sections-variant', 'sections-badge', record.legalSections)}
            ${buildDetailCard('🚨', 'Risks & Red Flags', 'risks-variant', 'risks-badge', record.risks)}
            ${buildDetailCard('🛡️', 'Your Rights', 'rights-variant', 'rights-badge', record.yourRights)}
            ${buildDetailCard('⏰', 'Deadlines', 'deadlines-variant', 'deadlines-badge', record.deadlines)}
            ${buildDetailCard('📋', 'Next Steps', 'steps-variant', 'steps-badge', record.nextSteps)}
            ${buildDetailCard('💡', 'Advice', 'advice-variant', 'advice-badge', record.advice)}
            ${buildDetailCard('📞', 'Legal Help', 'legalaid-variant', 'legalaid-badge', record.legalAidInfo)}
        `;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function buildDetailCard(icon, title, variant, badge, content) {
        return `
            <div class="result-card glass-card ${variant}" style="margin-bottom:0.6rem;padding:1rem 1.25rem;">
                <div class="card-icon-row" style="margin-bottom:0.5rem;">
                    <div class="card-badge ${badge}">${icon}</div>
                    <h3 style="font-size:0.9rem;font-weight:600;">${title}</h3>
                </div>
                <div class="card-content expanded" style="max-height:none;padding:0;">${escapeHtml(content || 'Not available.')}</div>
            </div>
        `;
    }

    backToHistoryBtn.addEventListener('click', () => {
        historyDetail.classList.add('hidden');
        historyList.style.display = '';
        loadHistory();
    });

    // ============================================================
    //  UTILITIES
    // ============================================================
    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function hideError() { errorMessage.classList.add('hidden'); errorText.textContent = ''; }

    function formatSize(b) {
        return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
    }

    function formatDate(dateStr) {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diffMs = now - d;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return 'Unknown';
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
});
