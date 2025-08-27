/**
 * Input Language Handler
 * Manages the input language switching in the transcript window
 */

class InputLanguageHandler {
    constructor(app) {
        this.app = app;
        this.currentLanguage = 'auto';
        this.isDropdownOpen = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle transcript language indicator click
        const transcriptIndicator = document.getElementById('transcriptLanguageIndicator');
        const dropdown = document.getElementById('inputLanguageDropdown');
        
        if (transcriptIndicator && dropdown) {
            // Toggle dropdown on click
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
        }
        
        console.log('[InputLanguage] Handler initialized');
    }
    
    toggleDropdown() {
        const dropdown = document.getElementById('inputLanguageDropdown');
        if (dropdown) {
            this.isDropdownOpen = !this.isDropdownOpen;
            dropdown.style.display = this.isDropdownOpen ? 'block' : 'none';
        }
    }
    
    closeDropdown() {
        const dropdown = document.getElementById('inputLanguageDropdown');
        if (dropdown) {
            this.isDropdownOpen = false;
            dropdown.style.display = 'none';
        }
    }
    
    selectLanguage(langCode) {
        console.log(`[InputLanguage] Switching to: ${langCode}`);
        
        this.currentLanguage = langCode;
        
        if (langCode === 'auto') {
            // Set to auto-detect mode
            this.updateIndicator('🌐', 'AUTO');
            
            // Update settings
            if (this.app.settings) {
                this.app.settings.settings.autoInputLanguage = true;
            }
            
            console.log('[InputLanguage] Auto-detect mode enabled');
        } else {
            // Set to specific language
            const languageInfo = this.getLanguageInfo(langCode);
            this.updateIndicator(languageInfo.flag, languageInfo.code);
            
            // Update app language
            this.app.currentLang = langCode;
            
            // Update speech recognition if available
            if (this.app.speechRecognition && this.app.speechRecognition.recognition) {
                this.app.speechRecognition.recognition.lang = langCode;
                console.log(`[InputLanguage] Speech recognition language updated to: ${langCode}`);
            }
            
            // Update settings
            if (this.app.settings) {
                this.app.settings.settings.autoInputLanguage = false;
                this.app.settings.settings.language = langCode;
            }
            
            console.log(`[InputLanguage] Fixed language mode: ${langCode}`);
        }
        
        // Save settings
        if (this.app.settings && this.app.settings.saveSettings) {
            this.app.settings.saveSettings();
        }
    }
    
    updateIndicator(flag, code) {
        const flagEl = document.getElementById('transcriptLanguageFlag');
        const codeEl = document.getElementById('langCodeTranscript');
        
        if (flagEl) flagEl.textContent = flag;
        if (codeEl) codeEl.textContent = code;
    }
    
    getLanguageInfo(langCode) {
        const languages = {
            'en-US': { flag: '🇺🇸', code: 'EN' },
            'de-DE': { flag: '🇩🇪', code: 'DE' },
            'fr-FR': { flag: '🇫🇷', code: 'FR' },
            'es-ES': { flag: '🇪🇸', code: 'ES' },
            'it-IT': { flag: '🇮🇹', code: 'IT' },
            'pt-PT': { flag: '🇵🇹', code: 'PT' },
            'nl-NL': { flag: '🇳🇱', code: 'NL' },
            'ru-RU': { flag: '🇷🇺', code: 'RU' },
            'zh-CN': { flag: '🇨🇳', code: 'ZH' },
            'ja-JP': { flag: '🇯🇵', code: 'JP' },
            'ko-KR': { flag: '🇰🇷', code: 'KR' },
            'ar-SA': { flag: '🇸🇦', code: 'AR' },
            'hi-IN': { flag: '🇮🇳', code: 'HI' }
        };
        
        return languages[langCode] || { flag: '🌐', code: 'AUTO' };
    }
    
    // Initialize with current app language
    initialize() {
        const currentLang = this.app.currentLang || 'en-US';
        
        if (this.app.settings && this.app.settings.settings.autoInputLanguage) {
            this.selectLanguage('auto');
        } else {
            this.selectLanguage(currentLang);
        }
    }
}

window.InputLanguageHandler = InputLanguageHandler;