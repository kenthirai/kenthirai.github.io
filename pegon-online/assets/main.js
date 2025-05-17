// Elemen DOM
const elements = {
    sourceText: document.getElementById('sourceText'),
    targetText: document.getElementById('targetText'),
    translateBtn: document.getElementById('translateBtn'),
    copySourceBtn: document.getElementById('copySource'),
    copyTargetBtn: document.getElementById('copyTarget'),
    clearSourceBtn: document.getElementById('clearSource'),
    clearTargetBtn: document.getElementById('clearTarget'),
    toggleDirectionBtn: document.getElementById('toggleDirection'),
    helpBtn: document.getElementById('helpBtn'),
    sourceLabel: document.getElementById('sourceLabel'),
    targetLabel: document.getElementById('targetLabel'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    sourceCharCount: document.getElementById('sourceCharCount'),
    targetCharCount: document.getElementById('targetCharCount'),
    detectedLang: document.getElementById('detectedLang'),
    languageIndicator: document.getElementById('languageIndicator'),
    sourceLanguageSelect: document.getElementById('sourceLanguage'),
    languageOptions: document.getElementById('languageOptions')
};

// Status aplikasi
const appState = {
    translationDirection: 'auto-pegon', // 'auto-pegon', 'pegon-indonesia', atau 'manual'
    detectedLanguage: null,
    manualLanguage: 'indonesia',
    autoDetect: true,
    isProcessing: false
};

// Daftar bahasa yang didukung
const supportedLanguages = {
    indonesia: 'Indonesia',
    english: 'Inggris',
    arabic: 'Arab',
    javanese: 'Jawa',
    sundanese: 'Sunda',
    malay: 'Melayu',
    dutch: 'Belanda',
    german: 'Jerman',
    french: 'Prancis',
    spanish: 'Spanyol'
};

// Inisialisasi
function init() {
    setupEventListeners();
    populateLanguageSelect();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    elements.translateBtn.addEventListener('click', translateText);
    elements.copySourceBtn.addEventListener('click', () => copyText(elements.sourceText, elements.sourceLabel.textContent));
    elements.copyTargetBtn.addEventListener('click', () => copyText(elements.targetText, elements.targetLabel.textContent));
    elements.clearSourceBtn.addEventListener('click', clearSource);
    elements.clearTargetBtn.addEventListener('click', clearTarget);
    elements.toggleDirectionBtn.addEventListener('click', toggleDirectionMode);
    elements.helpBtn.addEventListener('click', showHelpGuide);
    elements.sourceLanguageSelect.addEventListener('change', handleManualLanguageChange);
    
    elements.sourceText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') translateText();
    });
    
    elements.sourceText.addEventListener('input', () => {
        updateCharCount();
        if (appState.autoDetect) {
            detectLanguage();
        }
    });
    
    elements.targetText.addEventListener('input', updateCharCount);
}

// Populate language select dropdown
function populateLanguageSelect() {
    elements.sourceLanguageSelect.innerHTML = '';
    
    // Add auto-detect option
    const autoOption = document.createElement('option');
    autoOption.value = 'auto';
    autoOption.textContent = 'Deteksi Otomatis';
    elements.sourceLanguageSelect.appendChild(autoOption);
    
    // Add supported languages
    for (const [code, name] of Object.entries(supportedLanguages)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        elements.sourceLanguageSelect.appendChild(option);
    }
    
    // Add other option
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Lainnya';
    elements.sourceLanguageSelect.appendChild(otherOption);
}

// Fungsi deteksi bahasa utama
function detectLanguage() {
    if (appState.isProcessing) return;
    
    const text = elements.sourceText.value.trim();
    
    if (!text) {
        resetLanguageDetection();
        return;
    }
    
    // 1. Check for Pegon/Arabic characters first
    if (isPegonText(text)) {
        setLanguageDirection('pegon', 'pegon-indonesia');
        return;
    }
    
    // 2. Detect other languages
    const detected = detectTextLanguage(text);
    
    // 3. If not Indonesian, show confirmation
    if (detected !== 'indonesia') {
        setLanguageDirection(detected, 'foreign-pegon');
    } else {
        setLanguageDirection('indonesia', 'indonesia-pegon');
    }
}

// Deteksi teks Pegon
function isPegonText(text) {
    const pegonRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return pegonRegex.test(text);
}

// Deteksi bahasa teks menggunakan heuristik
function detectTextLanguage(text) {
    const textLower = text.toLowerCase();
    
    // Check for Indonesian
    const idWords = ['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'ini', 'itu', 'ada'];
    const idMatches = idWords.filter(word => textLower.includes(word));
    if (idMatches.length >= 3) return 'indonesia';
    
    // Check for English
    const enWords = ['the', 'and', 'you', 'that', 'have', 'for', 'with', 'this', 'that'];
    const enMatches = enWords.filter(word => textLower.includes(word));
    if (enMatches.length >= 3) return 'english';
    
    // Check for Dutch
    const nlWords = ['de', 'en', 'van', 'het', 'een', 'voor', 'met', 'dat', 'die'];
    const nlMatches = nlWords.filter(word => textLower.includes(word));
    if (nlMatches.length >= 3) return 'dutch';
    
    // Check for Javanese
    const jvWords = ['iku', 'ing', 'kang', 'sing', 'ora', 'ana', 'iku', 'saka'];
    const jvMatches = jvWords.filter(word => textLower.includes(word));
    if (jvMatches.length >= 2) return 'javanese';
    
    // Check for Sundanese
    const suWords = ['nu', 'teu', 'nya', 'mah', 'anjeun', 'urang', 'di', 'ka'];
    const suMatches = suWords.filter(word => textLower.includes(word));
    if (suMatches.length >= 2) return 'sundanese';
    
    // Check for Malay
    const msWords = ['dan', 'di', 'ke', 'dari', 'untuk', 'ini', 'itu', 'ada', 'akan'];
    const msMatches = msWords.filter(word => textLower.includes(word));
    if (msMatches.length >= 3) return 'malay';
    
    // Check for Arabic (Latin script)
    const arWords = ['al', 'wa', 'fi', 'min', 'ala', 'anna', 'inna', 'allah'];
    const arMatches = arWords.filter(word => textLower.includes(word));
    if (arMatches.length >= 2) return 'arabic';
    
    // Check for special characters
    if (/[åäöæøß]/.test(text)) return 'swedish/norwegian';
    if (/[éèêëáàâä]/.test(text)) return 'french';
    if (/[ñ]/.test(text)) return 'spanish';
    if (/[äöüß]/.test(text)) return 'german';
    
    return 'unknown';
}

// Set language direction
function setLanguageDirection(lang, direction) {
    if (appState.detectedLanguage === lang && appState.translationDirection === direction) return;
    
    appState.detectedLanguage = lang;
    appState.translationDirection = direction;
    
    updateUI();
    
    // Show notification only if textarea is focused
    if (elements.sourceText === document.activeElement && lang !== 'unknown') {
        showLanguageNotification(lang, direction);
    }
}

// Reset language detection
function resetLanguageDetection() {
    appState.detectedLanguage = null;
    if (appState.autoDetect) {
        appState.translationDirection = 'auto-pegon';
    }
    updateUI();
}

// Toggle between auto/manual mode
function toggleDirectionMode() {
    appState.autoDetect = !appState.autoDetect;
    
    if (appState.autoDetect) {
        elements.languageOptions.style.display = 'none';
        detectLanguage();
    } else {
        elements.languageOptions.style.display = 'block';
        appState.translationDirection = 'manual';
    }
    
    updateUI();
    
    Swal.fire({
        icon: 'success',
        title: appState.autoDetect ? 'Mode Otomatis Diaktifkan' : 'Mode Manual Diaktifkan',
        text: appState.autoDetect 
            ? 'Sistem akan mendeteksi bahasa secara otomatis' 
            : 'Silakan pilih bahasa sumber secara manual',
        timer: 1500,
        showConfirmButton: false
    });
}

// Handle manual language selection change
function handleManualLanguageChange() {
    const selectedLang = elements.sourceLanguageSelect.value;
    
    if (selectedLang === 'auto') {
        appState.autoDetect = true;
        elements.languageOptions.style.display = 'none';
        detectLanguage();
    } else {
        appState.manualLanguage = selectedLang;
        appState.translationDirection = 'manual';
        appState.detectedLanguage = selectedLang;
        updateUI();
    }
}

// Fungsi terjemahan utama
async function translateText() {
    if (appState.isProcessing) return;
    
    const text = elements.sourceText.value.trim();
    if (!text) {
        Swal.fire({
            icon: 'warning',
            title: 'Teks Kosong',
            text: 'Masukkan teks yang akan diterjemahkan!'
        });
        return;
    }

    appState.isProcessing = true;
    elements.loadingIndicator.style.display = 'block';
    elements.targetText.value = '';

    try {
        let instruction;
        let sourceLang;
        
        // Determine source language and instruction
        if (appState.translationDirection === 'pegon-indonesia') {
            sourceLang = 'Pegon';
            instruction = "Terjemahkan teks Pegon berikut ke Bahasa Indonesia: ";
        } 
        else if (appState.translationDirection === 'manual') {
            sourceLang = supportedLanguages[appState.manualLanguage] || appState.manualLanguage;
            instruction = `Terjemahkan teks ${sourceLang} berikut ke tulisan Pegon: `;
        }
        else if (appState.translationDirection === 'foreign-pegon') {
            sourceLang = supportedLanguages[appState.detectedLanguage] || appState.detectedLanguage;
            instruction = `Terjemahkan teks ${sourceLang} berikut ke tulisan Pegon: `;
        }
        else { // auto-pegon or indonesia-pegon
            sourceLang = 'Indonesia';
            instruction = "Terjemahkan teks Indonesia berikut ke tulisan Pegon: ";
        }

        const result = await postChatCompletion([
            { 
                role: "system", 
                content: "Anda adalah penerjemah ahli multibahasa ke Pegon. " +
                         "Gunakan gaya tulisan Pegon yang standar dan konsisten."
            },
            { role: "user", content: instruction + text }
        ], { model: "gpt-3.5-turbo" });
        
        if (result?.choices?.[0]?.message?.content) {
            elements.targetText.value = result.choices[0].message.content;
            animateTranslationResult();
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: `Diterjemahkan dari ${sourceLang} ke Pegon`,
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Terjadi kesalahan saat menerjemahkan'
        });
        elements.targetText.value = 'Error: Gagal menerjemahkan';
    } finally {
        appState.isProcessing = false;
        elements.loadingIndicator.style.display = 'none';
        updateCharCount();
    }
}

// Animasi hasil terjemahan
function animateTranslationResult() {
    elements.targetText.classList.add('translation-result');
    setTimeout(() => {
        elements.targetText.classList.remove('translation-result');
    }, 500);
}

// Show language detection notification
function showLanguageNotification(lang, direction) {
    const langName = supportedLanguages[lang] || lang;
    let actionText = '';
    
    if (direction === 'pegon-indonesia') {
        actionText = 'Pegon → Indonesia';
    } else if (direction === 'foreign-pegon') {
        actionText = `${langName} → Pegon`;
    } else {
        actionText = 'Indonesia → Pegon';
    }
    
    const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    
    toast.fire({
        icon: 'info',
        title: `Terdeteksi: ${langName}`,
        text: `Arah terjemahan: ${actionText}`
    });
}

// Update UI based on current state
function updateUI() {
    let sourceLang, targetLang, modeText;
    
    switch(appState.translationDirection) {
        case 'pegon-indonesia':
            sourceLang = 'Pegon';
            targetLang = 'Indonesia';
            modeText = 'Pegon → Indonesia';
            break;
            
        case 'foreign-pegon':
            sourceLang = supportedLanguages[appState.detectedLanguage] || appState.detectedLanguage;
            targetLang = 'Pegon';
            modeText = `${sourceLang} → Pegon`;
            break;
            
        case 'manual':
            sourceLang = supportedLanguages[appState.manualLanguage] || appState.manualLanguage;
            targetLang = 'Pegon';
            modeText = `${sourceLang} → Pegon (Manual)`;
            break;
            
        default: // auto-pegon or indonesia-pegon
            sourceLang = 'Indonesia';
            targetLang = 'Pegon';
            modeText = 'Indonesia → Pegon';
    }

    // Update labels and placeholders
    elements.sourceLabel.textContent = `Tulisan ${sourceLang}`;
    elements.targetLabel.textContent = `Terjemahan ${targetLang}`;
    elements.sourceText.placeholder = `Masukkan teks ${sourceLang} di sini...`;
    
    // Update mode indicator
    elements.detectedLang.textContent = `Mode: ${modeText}`;
    
    // Update UI colors based on mode
    updateUIColors();
    
    // Update character count
    updateCharCount();
}

// Update UI colors based on current state
function updateUIColors() {
    // Reset all classes
    elements.languageIndicator.classList.remove('auto-mode', 'manual-mode', 'pegon-mode', 'foreign-mode');
    
    // Add appropriate class
    if (appState.translationDirection === 'pegon-indonesia') {
        elements.languageIndicator.classList.add('pegon-mode');
    } 
    else if (appState.translationDirection === 'foreign-pegon') {
        elements.languageIndicator.classList.add('foreign-mode');
    }
    else if (appState.autoDetect) {
        elements.languageIndicator.classList.add('auto-mode');
    } 
    else {
        elements.languageIndicator.classList.add('manual-mode');
    }
}

// Fungsi bantuan
function showHelpGuide() {
    Swal.fire({
        title: 'Panduan Penggunaan',
        html: `
            <div style="text-align: left;">
                <h3>Fitur Deteksi Otomatis</h3>
                <p>Sistem dapat mendeteksi berbagai bahasa dan menerjemahkannya ke Pegon:</p>
                <ul>
                    <li>Indonesia</li>
                    <li>Inggris</li>
                    <li>Jawa</li>
                    <li>Sunda</li>
                    <li>Melayu</li>
                    <li>Belanda</li>
                    <li>Arab (Latin)</li>
                    <li>Dan lainnya</li>
                </ul>
                
                <h3>Cara Menggunakan:</h3>
                <ol>
                    <li>Masukkan teks di kolom input</li>
                    <li>Sistem akan otomatis mendeteksi bahasa</li>
                    <li>Klik "Terjemahkan" atau tekan Ctrl+Enter</li>
                    <li>Hasil terjemahan Pegon akan muncul</li>
                </ol>
                
                <h3>Mode Manual</h3>
                <p>Gunakan tombol "Atur Manual" jika ingin menentukan bahasa sumber secara manual.</p>
                
                <h3>Shortcut:</h3>
                <ul>
                    <li><strong>Ctrl+Enter</strong>: Terjemahkan</li>
                    <li><strong>Ctrl+C</strong>: Salin teks</li>
                </ul>
            </div>
        `,
        confirmButtonText: 'Mengerti',
        width: '600px'
    });
}

// Fungsi utilitas
async function postChatCompletion(messages, options = {}) {
    const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: options.model || "gpt-3.5-turbo",
            messages,
            referrer: "PegonTranslator"
        })
    });
    return await response.json();
}

async function copyText(textArea, label) {
    try {
        if (!textArea.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Teks Kosong',
                text: 'Tidak ada teks untuk disalin'
            });
            return;
        }
        
        await navigator.clipboard.writeText(textArea.value);
        
        Swal.fire({
            icon: 'success',
            title: 'Teks Disalin!',
            text: `Teks dari ${label} berhasil disalin`,
            timer: 1000,
            showConfirmButton: false
        });
    } catch (err) {
        fallbackCopyText(textArea, label);
    }
}

function fallbackCopyText(textArea, label) {
    try {
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        
        const successful = document.execCommand('copy');
        
        if (successful) {
            Swal.fire({
                icon: 'success',
                title: 'Teks Disalin!',
                text: `Teks dari ${label} berhasil disalin`,
                timer: 1000,
                showConfirmButton: false
            });
        } else {
            throw new Error('Fallback copy failed');
        }
    } catch (err) {
        Swal.fire({
            icon: 'info',
            title: 'Salin Manual',
            html: `Tekan <kbd>Ctrl+C</kbd> untuk menyalin:<br>
                  <textarea style="width:100%; height:100px; margin-top:10px;">${textArea.value}</textarea>`,
            confirmButtonText: 'Mengerti'
        });
    }
}

function clearSource() {
    elements.sourceText.value = '';
    resetLanguageDetection();
}

function clearTarget() {
    elements.targetText.value = '';
    updateCharCount();
}

function updateCharCount() {
    elements.sourceCharCount.textContent = `${elements.sourceText.value.length} karakter`;
    elements.targetCharCount.textContent = `${elements.targetText.value.length} karakter`;
}

// Inisialisasi aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', init);