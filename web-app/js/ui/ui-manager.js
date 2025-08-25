/**
 * UI Manager Module
 * Handles all UI interactions and updates
 */

class UIManager {
    constructor(app) {
        this.app = app;
        this.initialize();
    }
    
    initialize() {
        console.log('[UI] Initializing UI manager...');
        this.setupModalHandlers();
        this.setupLanguageDropdown();
    }
    
    setupModalHandlers() {
        // Settings modal backdrop click
        if (this.app.els.settingsModal) {
            this.app.els.settingsModal.onclick = (e) => {
                if (e.target.classList.contains('settings-modal')) {
                    this.closeSettings();
                }
            };
        }
        
        // Prevent modal content clicks from closing
        if (this.app.els.settingsContent) {
            this.app.els.settingsContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    setupLanguageDropdown() {
        // Get elements
        const languageIndicator = document.getElementById('languageIndicator');
        const languageDropdown = document.getElementById('languageDropdown');
        
        if (!languageIndicator || !languageDropdown) {
            console.warn('[UI] Language dropdown elements not found');
            return;
        }
        
        // Initially hide dropdown
        languageDropdown.style.display = 'none';
        
        // Toggle dropdown on click
        languageIndicator.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = languageDropdown.style.display === 'block';
            languageDropdown.style.display = isVisible ? 'none' : 'block';
            console.log('[UI] Language dropdown:', isVisible ? 'closed' : 'opened');
        });
        
        // Handle language selection
        const languageOptions = languageDropdown.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                const flag = option.querySelector('.flag').textContent;
                const name = option.querySelector('.lang-name').textContent;
                
                // Update the app language
                this.updateCardLanguage(lang, flag, name);
                
                // Hide dropdown
                languageDropdown.style.display = 'none';
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            languageDropdown.style.display = 'none';
        });
    }
    
    updateCardLanguage(lang, flag, name) {
        console.log(`[UI] Changing card language to: ${lang} ${flag} ${name}`);
        
        // Update indicator
        const languageFlag = document.getElementById('languageFlag');
        const languageText = document.getElementById('languageText');
        
        if (languageFlag) languageFlag.textContent = flag;
        if (languageText) languageText.textContent = lang === 'auto' ? 'AUTO' : name.split(' ')[0];
        
        // Update app settings
        if (this.app.settings) {
            this.app.settings.cardOutputLanguage = lang;
            this.app.settings.autoLanguage = (lang === 'auto');
        }
        
        // Save to localStorage
        localStorage.setItem('cardOutputLanguage', lang);
        localStorage.setItem('autoLanguage', lang === 'auto' ? 'true' : 'false');
    }
    
    showSettings() {
        console.log('[UI] Opening settings modal');
        if (this.app.els.settingsModal) {
            this.app.els.settingsModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }
    
    closeSettings() {
        console.log('[UI] Closing settings modal');
        if (this.app.els.settingsModal) {
            this.app.els.settingsModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    exportCards() {
        console.log('[UI] Exporting cards...');
        
        if (this.app.cards.length === 0) {
            alert('No cards to export!');
            return;
        }
        
        // Create export data
        const exportData = {
            cards: this.app.cards,
            exportDate: new Date().toISOString(),
            totalCards: this.app.cards.length
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senscript-cards-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`✅ Exported ${this.app.cards.length} cards`);
    }
    
    exportTranscript() {
        console.log('[UI] Exporting transcript...');
        
        if (!this.app.transcript.trim()) {
            alert('No transcript to export!');
            return;
        }
        
        // Create transcript export
        const exportData = {
            transcript: this.app.transcript,
            exportDate: new Date().toISOString(),
            language: this.app.currentLang,
            wordCount: this.app.transcript.split(' ').length
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senscript-transcript-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Transcript exported');
    }
    
    updateStatus(element, status) {
        // Update status indicators
        const statusElement = document.getElementById(element);
        if (statusElement) {
            statusElement.className = `status-indicator ${status}`;
        }
    }
    
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

window.UIManager = UIManager;