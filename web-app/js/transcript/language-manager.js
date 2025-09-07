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
        console.log('[LanguageManager] Initializing language management');
        
        this.setupDropdown();
        this.setupEventListeners();
        this.setMode('auto'); // Default to auto mode
        
        console.log('[LanguageManager] Language manager ready');
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
        
        // Create dropdown HTML with same styling as card dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'inputLanguageDropdown';
        dropdown.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            background: rgba(31, 41, 55, 0.95);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 8px;
            margin-bottom: 4px;
            min-width: 160px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: none;
        `;
        
        let dropdownHTML = `
            <div class="language-dropdown-option" data-lang="auto" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined">language</span>
                <span>Auto-detect</span>
            </div>
        `;
        
        // Add supported languages
        Object.entries(this.supportedLanguages).forEach(([langCode, lang]) => {
            dropdownHTML += `
                <div class="language-dropdown-option" data-lang="${langCode}" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>${lang.flag}</span>
                    <span>${lang.name}</span>
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
        let dropdown = document.getElementById('transcriptLanguageDropdown');
        if (!dropdown) {
            dropdown = document.getElementById('inputLanguageDropdown');
        }
        
        if (!transcriptIndicator || !dropdown) {
            console.warn('[LanguageManager] Missing elements - indicator:', !!transcriptIndicator, 'dropdown:', !!dropdown);
            return;
        }
        
        // Toggle dropdown on indicator click
        transcriptIndicator.addEventListener('click', (e) => {
            console.log('🌐 [LanguageManager] Language indicator clicked');
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Handle option clicks
        const options = dropdown.querySelectorAll('.language-dropdown-option');
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
        console.log('[LanguageManager] Auto-detection enabled');
        
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
        console.log(`[LanguageManager] Language selected: ${langCode}`);
        
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
        if (this.state.currentMode !== 'auto') {
            console.log(`[LanguageManager] Skipping language detection - not in auto mode (current: ${this.state.currentMode})`);
            return;
        }
        if (!detection) {
            console.log(`[LanguageManager] No language detection data provided`);
            return;
        }
        if (detection.confidence < 50) {
            console.log(`[LanguageManager] Language confidence too low: ${detection.confidence}% (minimum: 50%)`);
            return;
        }
        
        console.log(`🔍 [LanguageManager] Language detected: ${detection.lang} (${detection.confidence}% confidence)`);
        
        this.state.detectedLanguage = detection;
        this.updateUI();
        
        // Update speech recognition language if reasonably confident (lowered threshold)
        if (detection.confidence > 60 && this.app.speechRecognition && this.app.speechRecognition.recognition) {
            this.app.speechRecognition.recognition.lang = detection.lang;
            console.log(`[LanguageManager] Speech recognition updated to: ${detection.lang}`);
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
                flag = '<span class="material-symbols-outlined">language</span>';
                code = 'AUTO';
            }
        } else {
            // Show selected language
            const lang = this.supportedLanguages[this.state.selectedLanguage];
            flag = lang ? lang.flag : '<span class="material-symbols-outlined">language</span>';
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
        
        const options = dropdown.querySelectorAll('.language-dropdown-option');
        const selectedLang = this.state.currentMode === 'auto' ? 'auto' : this.state.selectedLanguage;
        
        options.forEach(option => {
            option.style.backgroundColor = '';
            if (option.dataset.lang === selectedLang) {
                option.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            }
        });
    }
    
    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        console.log('🌐 [LanguageManager] Toggling dropdown...');
        
        // Try transcript language dropdown first (interim area), then fall back to input language dropdown
        let dropdown = document.getElementById('transcriptLanguageDropdown');
        if (!dropdown) {
            dropdown = document.getElementById('inputLanguageDropdown');
        }
        
        if (!dropdown) {
            console.error('🌐 [LanguageManager] No dropdown element found!');
            return;
        }
        
        this.state.isDropdownOpen = !this.state.isDropdownOpen;
        dropdown.style.display = this.state.isDropdownOpen ? 'block' : 'none';
        console.log('🌐 [LanguageManager] Dropdown display:', dropdown.style.display);
        
        if (this.state.isDropdownOpen) {
            this.updateDropdownSelection();
        }
    }
    
    /**
     * Close dropdown
     */
    closeDropdown() {
        // Close both possible dropdowns
        const transcriptDropdown = document.getElementById('transcriptLanguageDropdown');
        const inputDropdown = document.getElementById('inputLanguageDropdown');
        
        if (transcriptDropdown) {
            transcriptDropdown.style.display = 'none';
        }
        if (inputDropdown) {
            inputDropdown.style.display = 'none';
        }
        
        this.state.isDropdownOpen = false;
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