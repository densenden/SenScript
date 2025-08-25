/**
 * Settings Manager Module
 * Handles application settings and preferences
 */

class SettingsManager {
    constructor(app) {
        this.app = app;
        this.settings = this.getDefaultSettings();
        this.loadSettings();
        
        // Initialize language UI after a short delay to ensure elements exist
        setTimeout(() => this.initializeLanguageUI(), 500);
    }
    
    getDefaultSettings() {
        return {
            language: 'de-DE',
            educationLevel: 3,
            detailLevel: 3,
            exampleComplexity: 3,
            interviewMode: false,
            selectedModel: 'openai',
            autoExport: false,
            cardOutputLanguage: 'auto',
            autoLanguage: true
        };
    }
    
    loadSettings() {
        try {
            const stored = localStorage.getItem('senscript-settings');
            if (stored) {
                this.settings = { ...this.settings, ...JSON.parse(stored) };
            }
            
            this.applySettings();
            console.log('[Settings] Settings loaded');
        } catch (error) {
            console.error('[Settings] Failed to load settings:', error);
        }
    }
    
    saveSettings() {
        try {
            // Collect current values from UI
            if (this.app.els.educationLevel) {
                this.settings.educationLevel = parseInt(this.app.els.educationLevel.value);
            }
            if (this.app.els.detailLevel) {
                this.settings.detailLevel = parseInt(this.app.els.detailLevel.value);
            }
            if (this.app.els.exampleComplexity) {
                this.settings.exampleComplexity = parseInt(this.app.els.exampleComplexity.value);
            }
            
            // Save to localStorage
            localStorage.setItem('senscript-settings', JSON.stringify(this.settings));
            
            // Apply new settings
            this.applySettings();
            
            console.log('[Settings] Settings saved');
            this.app.ui.showNotification('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('[Settings] Failed to save settings:', error);
            this.app.ui.showNotification('Failed to save settings', 'error');
        }
    }
    
    applySettings() {
        // Apply language setting
        if (this.settings.language && this.app.speechRecognition) {
            this.app.currentLang = this.settings.language;
            if (this.app.speechRecognition.recognition) {
                this.app.speechRecognition.recognition.lang = this.settings.language;
            }
        }
        
        // Update UI elements
        this.updateSettingsUI();
    }
    
    updateSettingsUI() {
        // Update sliders and inputs to match current settings
        if (this.app.els.educationLevel) {
            this.app.els.educationLevel.value = this.settings.educationLevel;
        }
        if (this.app.els.detailLevel) {
            this.app.els.detailLevel.value = this.settings.detailLevel;
        }
        if (this.app.els.exampleComplexity) {
            this.app.els.exampleComplexity.value = this.settings.exampleComplexity;
        }
        
        // Update any display elements that show current values
        this.updateEducationDisplay();
    }
    
    updateEducationDisplay() {
        // Update education level displays (if they exist in the UI)
        const educationDisplay = document.getElementById('educationLevelDisplay');
        if (educationDisplay) {
            const level = this.settings.educationLevel;
            const levels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
            educationDisplay.textContent = levels[level - 1] || 'Intermediate';
        }
        
        const detailDisplay = document.getElementById('detailLevelDisplay');
        if (detailDisplay) {
            const level = this.settings.detailLevel;
            const levels = ['Brief', 'Concise', 'Moderate', 'Detailed', 'Comprehensive'];
            detailDisplay.textContent = levels[level - 1] || 'Moderate';
        }
        
        const complexityDisplay = document.getElementById('exampleComplexityDisplay');
        if (complexityDisplay) {
            const level = this.settings.exampleComplexity;
            const levels = ['Simple', 'Basic', 'Standard', 'Complex', 'Academic'];
            complexityDisplay.textContent = levels[level - 1] || 'Standard';
        }
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        console.log('[Settings] Settings reset to defaults');
        this.app.ui.showNotification('Settings reset to defaults', 'info');
    }
    
    initializeLanguageUI() {
        // Load saved language settings or use defaults
        const savedLang = localStorage.getItem('cardOutputLanguage') || 'auto';
        const savedAuto = localStorage.getItem('autoLanguage') !== 'false';
        
        this.settings.cardOutputLanguage = savedLang;
        this.settings.autoLanguage = savedAuto;
        
        this.updateLanguageUI();
        console.log('[Settings] Language UI initialized:', savedLang, savedAuto);
    }
    
    updateLanguageUI() {
        const languageFlag = document.getElementById('languageFlag');
        const languageText = document.getElementById('languageText');
        
        if (this.settings.autoLanguage || this.settings.cardOutputLanguage === 'auto') {
            if (languageFlag) languageFlag.textContent = '🌐';
            if (languageText) languageText.textContent = 'AUTO';
        } else {
            // Set specific language
            const langMap = {
                'de-DE': { flag: '🇩🇪', text: 'DE' },
                'en-US': { flag: '🇺🇸', text: 'EN' },
                'fr-FR': { flag: '🇫🇷', text: 'FR' },
                'es-ES': { flag: '🇪🇸', text: 'ES' }
            };
            
            const lang = langMap[this.settings.cardOutputLanguage] || langMap['en-US'];
            if (languageFlag) languageFlag.textContent = lang.flag;
            if (languageText) languageText.textContent = lang.text;
        }
    }
}

window.SettingsManager = SettingsManager;