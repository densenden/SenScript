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
        // Get elements (using correct IDs)
        const languageIndicator = document.getElementById('cardLanguageIndicator');
        const languageDropdown = document.getElementById('cardLanguageDropdown');
        
        if (!languageIndicator || !languageDropdown) {
            console.warn('[UI] Card language dropdown elements not found');
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
        
        // Handle language selection (using unified class name)
        const languageOptions = languageDropdown.querySelectorAll('.language-dropdown-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                const flagElement = option.querySelector('span:first-child');
                const nameElement = option.querySelector('span:last-child');
                const flag = flagElement ? flagElement.textContent : '🌐';
                const name = nameElement ? nameElement.textContent : 'Auto-detect';
                
                // Update selection highlighting
                languageOptions.forEach(opt => opt.style.backgroundColor = '');
                option.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                
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
        
        // Update indicator (using correct IDs)
        const languageFlag = document.getElementById('cardLanguageFlag');
        const languageText = document.getElementById('cardLanguageCode');
        
        if (languageFlag) languageFlag.textContent = flag;
        if (languageText) languageText.textContent = lang === 'auto' ? 'AUTO' : name.split(' ')[0];
        
        // Update app settings
        if (this.app.settings) {
            this.app.settings.cardOutputLanguage = lang;
            this.app.settings.autoLanguage = (lang === 'auto');
            
            // Save settings
            this.app.settings.saveSettings();
        }
        
        // Sync with transcript language system if needed
        if (lang !== 'auto' && this.app.transcriptSystem?.languageManager) {
            // If user manually selects card output language, don't override transcript input
            console.log('[UI] Card language changed, keeping transcript input language independent');
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
        
        // Get transcript from actual displayed segments instead of stale app.transcript
        const transcriptText = this.collectTranscriptFromSegments();
        
        if (!transcriptText.trim()) {
            alert('No transcript to export! Start recording to generate transcript content.');
            return;
        }
        
        console.log(`[UI] Collected transcript: ${transcriptText.length} characters`);
        
        // Create both text and JSON versions
        const timestamp = new Date().toISOString();
        const wordCount = transcriptText.split(/\s+/).filter(word => word.length > 0).length;
        
        // Create JSON export with metadata
        const exportData = {
            transcript: transcriptText,
            exportDate: timestamp,
            language: this.app.currentLang || 'auto',
            wordCount: wordCount,
            segments: this.collectSegmentData()
        };
        
        // Ask user preference for format
        const userChoice = confirm('Export as plain text? (Cancel for detailed JSON)');
        
        if (userChoice) {
            // Export as plain text
            this.downloadFile(transcriptText, `senscript-transcript-${Date.now()}.txt`, 'text/plain');
        } else {
            // Export as JSON with metadata
            this.downloadFile(
                JSON.stringify(exportData, null, 2), 
                `senscript-transcript-${Date.now()}.json`, 
                'application/json'
            );
        }
        
        console.log('✅ Transcript exported successfully');
    }
    
    collectTranscriptFromSegments() {
        const segments = [];
        
        console.log('[UI] Collecting transcript from segments...');
        
        // Debug: Check what elements exist
        const allSegments = document.querySelectorAll('.finalized-segment');
        const segmentTexts = document.querySelectorAll('.segment-text');
        
        console.log(`[UI] Found ${allSegments.length} .finalized-segment elements`);
        console.log(`[UI] Found ${segmentTexts.length} .segment-text elements`);
        
        // Try to get segments from TranscriptSystem first
        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
            const segmentElements = document.querySelectorAll('.finalized-segment .segment-text');
            console.log(`[UI] Found ${segmentElements.length} combined .finalized-segment .segment-text elements`);
            
            segmentElements.forEach((element, index) => {
                const text = element.textContent.trim();
                console.log(`[UI] Segment ${index}: "${text.substring(0, 50)}..."`);
                if (text) segments.push(text);
            });
        }
        
        // Fallback: try different selectors
        if (segments.length === 0) {
            console.log('[UI] No segments found with primary selector, trying alternatives...');
            
            // Try just .segment-text
            const textElements = document.querySelectorAll('.segment-text');
            textElements.forEach((element, index) => {
                const text = element.textContent.trim();
                console.log(`[UI] Alternative segment ${index}: "${text.substring(0, 50)}..."`);
                if (text) segments.push(text);
            });
        }
        
        // Fallback to legacy transcript if no segments found
        if (segments.length === 0 && this.app.transcript && this.app.transcript.trim()) {
            console.log('[UI] Fallback to legacy transcript data');
            return this.app.transcript.trim();
        }
        
        // Additional fallback: check for any transcript content in the DOM
        if (segments.length === 0) {
            const transcriptContainer = document.querySelector('.finalized-segments');
            if (transcriptContainer && transcriptContainer.textContent.trim()) {
                const text = transcriptContainer.textContent.trim();
                // Filter out placeholder text
                if (!text.includes('Ready for transcript segments') && 
                    !text.includes('No transcript available') &&
                    text.length > 10) {
                    console.log('[UI] Using DOM text content as fallback');
                    return text;
                }
            }
        }
        
        const result = segments.join(' ');
        console.log(`[UI] Final result: ${result.length} characters`);
        return result;
    }
    
    collectSegmentData() {
        const segments = [];
        const segmentElements = document.querySelectorAll('.finalized-segment');
        
        segmentElements.forEach((element, index) => {
            const textElement = element.querySelector('.segment-text');
            const timeElement = element.querySelector('.segment-time');
            
            if (textElement) {
                segments.push({
                    id: index + 1,
                    text: textElement.textContent.trim(),
                    timestamp: timeElement ? timeElement.textContent.trim() : '',
                    wordCount: textElement.textContent.trim().split(/\s+/).length
                });
            }
        });
        
        return segments;
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    exportUnified() {
        console.log('[UI] Exporting transcript and cards...');
        
        // Check if we have content to export using improved data collection
        const transcriptText = this.collectTranscriptFromSegments();
        const hasTranscript = transcriptText.trim().length > 0;
        const hasCards = this.app.cards.length > 0;
        
        if (!hasTranscript && !hasCards) {
            alert('No content to export! Start recording to generate transcript and cards.');
            return;
        }
        
        // Create unified export data with improved transcript collection
        const exportData = {
            exportDate: new Date().toISOString(),
            exportType: 'unified',
            session: {
                language: this.app.currentLang || 'auto',
                duration: Date.now() - (this.app.startTime || Date.now())
            },
            transcript: hasTranscript ? {
                content: transcriptText,
                wordCount: transcriptText.split(/\s+/).filter(word => word.length > 0).length,
                segments: this.collectSegmentData()
            } : null,
            cards: hasCards ? {
                data: this.app.cards,
                totalCount: this.app.cards.length
            } : null
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senscript-session-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`✅ Exported unified session: ${hasTranscript ? 'transcript' : 'no transcript'}, ${hasCards ? this.app.cards.length + ' cards' : 'no cards'}`);
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