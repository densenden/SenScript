/**
 * Language Manager
 * Handles language detection, switching, and UI management
 */

class LanguageManager {
    constructor(app) {
        this.app = app;
        
        this.state = {
            currentMode: 'auto', // 'auto' | 'manual'
            selectedLanguage: 'en-US',
            detectedLanguage: null,
            isDropdownOpen: false
        };
        
        this.supportedLanguages = {
            'en-US': { flag: '🇺🇸', name: 'English', code: 'EN' },
            'de-DE': { flag: '🇩🇪', name: 'Deutsch', code: 'DE' },
            'fr-FR': { flag: '🇫🇷', name: 'Français', code: 'FR' },
            'es-ES': { flag: '🇪🇸', name: 'Español', code: 'ES' },
            'it-IT': { flag: '🇮🇹', name: 'Italiano', code: 'IT' },
            'pt-PT': { flag: '🇵🇹', name: 'Português', code: 'PT' },
            'nl-NL': { flag: '🇳🇱', name: 'Nederlands', code: 'NL' },
            'ru-RU': { flag: '🇷🇺', name: 'Русский', code: 'RU' },
            'zh-CN': { flag: '🇨🇳', name: '中文', code: 'ZH' },
            'ja-JP': { flag: '🇯🇵', name: '日本語', code: 'JP' },
            'ko-KR': { flag: '🇰🇷', name: '한국어', code: 'KR' },
            'ar-SA': { flag: '🇸🇦', name: 'العربية', code: 'AR' },
            'hi-IN': { flag: '🇮🇳', name: 'हिन्दी', code: 'HI' }
        };
    }
    
    initialize() {
        console.log('🌐 [LanguageManager] Initializing language management');
        
        this.setupDropdown();
        this.setupEventListeners();
        this.setMode('auto'); // Default to auto mode
        
        console.log('✅ [LanguageManager] Language manager ready');
    }
    
    setupDropdown() {
        // Create dropdown if it doesn't exist
        const existingDropdown = document.getElementById('inputLanguageDropdown');
        if (existingDropdown) return;
        
        const transcriptIndicator = document.getElementById('transcriptLanguageIndicator');
        if (!transcriptIndicator) {
            console.warn('[LanguageManager] Language indicator not found');
            return;
        }
        
        // Create dropdown HTML
        const dropdown = document.createElement('div');
        dropdown.id = 'inputLanguageDropdown';
        dropdown.className = 'input-language-dropdown';
        dropdown.style.display = 'none';
        
        let dropdownHTML = `
            <div class="input-language-dropdown-option" data-lang="auto">
                <span class="option-flag">🌐</span>
                <span class="option-text">Auto-detect</span>
            </div>
        `;
        
        // Add supported languages
        Object.entries(this.supportedLanguages).forEach(([langCode, lang]) => {
            dropdownHTML += `
                <div class="input-language-dropdown-option" data-lang="${langCode}">
                    <span class="option-flag">${lang.flag}</span>
                    <span class="option-text">${lang.name}</span>
                </div>
            `;
        });
        
        dropdown.innerHTML = dropdownHTML;
        
        // Insert after the indicator
        transcriptIndicator.parentNode.insertBefore(dropdown, transcriptIndicator.nextSibling);
        
        console.log('📋 [LanguageManager] Dropdown created');
    }
    
    setupEventListeners() {
        const transcriptIndicator = document.getElementById('transcriptLanguageIndicator');
        const dropdown = document.getElementById('inputLanguageDropdown');
        
        if (!transcriptIndicator || !dropdown) return;
        
        // Toggle dropdown on indicator click
        transcriptIndicator.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Handle option clicks
        const options = dropdown.querySelectorAll('.input-language-dropdown-option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = option.dataset.lang;
                this.selectLanguage(selectedLang);
                this.closeDropdown();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!transcriptIndicator.contains(e.target) && !dropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        console.log('👂 [LanguageManager] Event listeners attached');
    }
    
    /**
     * Set language mode (auto or manual)
     */
    setMode(mode) {
        console.log(`🌐 [LanguageManager] Setting mode: ${mode}`);
        
        this.state.currentMode = mode;
        
        if (mode === 'auto') {
            this.enableAutoMode();
        } else {
            this.enableManualMode();
        }
        
        this.updateUI();
    }
    
    /**
     * Enable automatic language detection
     */
    enableAutoMode() {
        console.log('🔄 [LanguageManager] Auto-detection enabled');
        
        // Update speech recognition to be flexible
        if (this.app.speechRecognition && this.app.speechRecognition.recognition) {
            // Use a neutral language that can adapt
            this.app.speechRecognition.recognition.lang = 'en-US';
        }
        
        // Save setting
        if (this.app.settings) {
            this.app.settings.settings.autoInputLanguage = true;
        }
    }
    
    /**
     * Enable manual language mode
     */
    enableManualMode() {
        console.log(`🔒 [LanguageManager] Manual mode enabled: ${this.state.selectedLanguage}`);
        
        // Set fixed language for speech recognition
        if (this.app.speechRecognition && this.app.speechRecognition.recognition) {
            this.app.speechRecognition.recognition.lang = this.state.selectedLanguage;
        }
        
        // Update app language
        this.app.currentLang = this.state.selectedLanguage;
        
        // Save setting
        if (this.app.settings) {
            this.app.settings.settings.autoInputLanguage = false;
            this.app.settings.settings.language = this.state.selectedLanguage;
        }
    }
    
    /**
     * Select a specific language
     */
    selectLanguage(langCode) {
        console.log(`🎯 [LanguageManager] Language selected: ${langCode}`);
        
        if (langCode === 'auto') {
            this.setMode('auto');
        } else {
            this.state.selectedLanguage = langCode;
            this.setMode('manual');
        }
    }
    
    /**
     * Update detected language (only in auto mode)
     */
    updateDetectedLanguage(detection) {
        if (this.state.currentMode !== 'auto') return;
        if (!detection || detection.confidence < 70) return;
        
        console.log(`🔍 [LanguageManager] Language detected: ${detection.lang} (${detection.confidence}% confidence)`);
        
        this.state.detectedLanguage = detection;
        this.updateUI();
        
        // Update speech recognition language if confident enough
        if (detection.confidence > 80 && this.app.speechRecognition && this.app.speechRecognition.recognition) {
            this.app.speechRecognition.recognition.lang = detection.lang;
            console.log(`🗣️ [LanguageManager] Speech recognition updated to: ${detection.lang}`);
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        const transcriptIndicator = document.getElementById('transcriptLanguageIndicator');
        if (!transcriptIndicator) return;
        
        let flag, code;
        
        if (this.state.currentMode === 'auto') {
            if (this.state.detectedLanguage) {
                // Show detected language with auto indicator
                flag = this.state.detectedLanguage.flag;
                code = `AUTO (${this.supportedLanguages[this.state.detectedLanguage.lang]?.code || 'UNK'})`;
            } else {
                // Show auto mode
                flag = '🌐';
                code = 'AUTO';
            }
        } else {
            // Show selected language
            const lang = this.supportedLanguages[this.state.selectedLanguage];
            flag = lang ? lang.flag : '🌐';
            code = lang ? lang.code : 'UNK';
        }
        
        transcriptIndicator.innerHTML = `
            <span class="language-flag">${flag}</span>
            <span class="language-code">${code}</span>
            <span class="dropdown-arrow">▼</span>
        `;
        
        // Update dropdown selection
        this.updateDropdownSelection();
    }
    
    /**
     * Update dropdown to show current selection
     */
    updateDropdownSelection() {
        const dropdown = document.getElementById('inputLanguageDropdown');
        if (!dropdown) return;
        
        const options = dropdown.querySelectorAll('.input-language-dropdown-option');
        const selectedLang = this.state.currentMode === 'auto' ? 'auto' : this.state.selectedLanguage;
        
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.lang === selectedLang) {
                option.classList.add('selected');
            }
        });
    }
    
    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        const dropdown = document.getElementById('inputLanguageDropdown');
        if (!dropdown) return;
        
        this.state.isDropdownOpen = !this.state.isDropdownOpen;
        dropdown.style.display = this.state.isDropdownOpen ? 'block' : 'none';
        
        if (this.state.isDropdownOpen) {
            this.updateDropdownSelection();
        }
    }
    
    /**
     * Close dropdown
     */
    closeDropdown() {
        const dropdown = document.getElementById('inputLanguageDropdown');
        if (dropdown) {
            this.state.isDropdownOpen = false;
            dropdown.style.display = 'none';
        }
    }
    
    /**
     * Get current language configuration
     */
    getCurrentLanguage() {
        return {
            mode: this.state.currentMode,
            selectedLanguage: this.state.selectedLanguage,
            detectedLanguage: this.state.detectedLanguage,
            activeLanguage: this.state.currentMode === 'auto' 
                ? (this.state.detectedLanguage?.lang || 'en-US')
                : this.state.selectedLanguage
        };
    }
    
    /**
     * Get language info by code
     */
    getLanguageInfo(langCode) {
        return this.supportedLanguages[langCode] || { 
            flag: '🌐', 
            name: 'Unknown', 
            code: 'UNK' 
        };
    }
}

// Export to window
window.LanguageManager = LanguageManager;