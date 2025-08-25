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