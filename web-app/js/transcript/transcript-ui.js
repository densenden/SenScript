/**
 * Transcript UI Management
 * Handles visual display of transcript with sophisticated animations and effects
 */

class TranscriptUI {
    constructor(app) {
        this.app = app;
        this.transcriptElement = null;
        this.interimElement = null;
        this.languageIndicator = null;
        this.maxVisibleSentences = 5;
    }
    
    initialize() {
        console.log('🎨 [TranscriptUI] Initializing transcript UI');
        
        this.transcriptElement = document.getElementById('transcript');
        if (!this.transcriptElement) {
            console.error('[TranscriptUI] Transcript element not found');
            return;
        }
        
        this.languageIndicator = document.getElementById('transcriptLanguageIndicator');
        
        // Setup initial HTML structure
        this.setupTranscriptStructure();
        
        console.log('[TranscriptUI] Transcript UI ready');
    }
    
    setupTranscriptStructure() {
        // Get current audio source for appropriate placeholder
        const audioSource = this.app.audioSystem?.currentAudioSource || 'microphone';
        const placeholderText = this.getPlaceholderText(audioSource);
        
        // NEW COMPACT LAYOUT: Current line at bottom, completed sentences above, max 3 sentences
        this.transcriptElement.innerHTML = `
            <div class="transcript-sentences-compact" id="transcriptSentences">
                <div class="transcript-placeholder-compact">
                    ${placeholderText}
                </div>
            </div>
            <div class="transcript-current-line" id="transcriptInterim"></div>
        `;
        
        this.sentencesContainer = document.getElementById('transcriptSentences');
        this.interimElement = document.getElementById('transcriptInterim');
        this.maxVisibleSentences = 3; // Updated to 3 max as requested
    }
    
    /**
     * Get appropriate placeholder text based on audio source
     */
    getPlaceholderText(audioSource) {
        if (audioSource === 'system') {
            return 'Device Output Mode<br><small>Select tab or window to capture audio, then click Start</small>';
        } else {
            return 'Microphone Mode<br><small>Click Start to begin transcription</small>';
        }
    }
    
    /**
     * Update placeholder text when audio source changes
     */
    updateAudioSource(audioSource) {
        console.log(`[TranscriptUI] Audio source changed to: ${audioSource}`);
        
        // Update placeholder if no transcription is active
        const placeholder = this.sentencesContainer?.querySelector('.transcript-placeholder');
        if (placeholder) {
            placeholder.innerHTML = this.getPlaceholderText(audioSource);
        }
    }
    
    /**
     * Add a finalized sentence to the transcript display (COMPACT VERSION)
     */
    addFinalSentence(sentence) {
        console.log(`[TranscriptUI] Adding final sentence: "${sentence.text.substring(0, 30)}..."`);
        
        // Remove placeholder if present
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create compact sentence element
        const sentenceEl = this.createCompactSentenceElement(sentence);
        
        // Add to container TOP (newest sentences push older ones up)
        this.sentencesContainer.insertBefore(sentenceEl, this.sentencesContainer.firstChild);
        
        // Update font sizes and opacity with 3-tier system
        this.updateCompactSentenceHierarchy();
        
        // Manage sentence count (keep last 3 sentences max)
        this.manageSentenceCount();
    }
    
    /**
     * Add a sentence from Whisper transcription
     */
    addWhisperSentence(sentence) {
        if (!this.sentencesContainer) {
            this.initialize();
            if (!this.sentencesContainer) {
                console.error(`[TranscriptUI] Cannot add sentence - container not found`);
                return;
            }
        }
        
        // Remove placeholder if present
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create sentence element with Whisper-specific enhancements
        const sentenceEl = this.createWhisperSentenceElement(sentence);
        
        // Add to container (newest at bottom for natural reading flow)
        this.sentencesContainer.appendChild(sentenceEl);
        
        // Update font sizes and opacity (newest = largest/brightest)
        this.updateSentenceHierarchy();
        
        // Auto-scroll to show latest content
        this.scrollToBottom();
        
        // Manage sentence count (keep last N sentences)
        this.manageSentenceCount();
    }
    
    /**
     * Create DOM element for Whisper sentence with enhanced data
     */
    createWhisperSentenceElement(sentence) {
        const sentenceEl = document.createElement('div');
        sentenceEl.className = 'transcript-sentence whisper-sentence';
        sentenceEl.dataset.timestamp = sentence.timestamp;
        sentenceEl.dataset.confidence = sentence.confidence || 0.5;
        sentenceEl.dataset.duration = sentence.duration || 0;
        
        // Add language indicator (from detection)
        const languageFlag = sentence.language ? sentence.language.flag || '<span class="material-symbols-outlined">language</span>' : '<span class="material-symbols-outlined">language</span>';
        const languageCode = sentence.language ? sentence.language.code || 'auto' : 'auto';
        
        // Confidence indicator
        const confidenceLevel = sentence.confidence > 0.8 ? 'high' : 
                              sentence.confidence > 0.5 ? 'medium' : 'low';
        
        sentenceEl.innerHTML = `
            <div class="sentence-content">
                <span class="sentence-flag" title="${languageCode}">${languageFlag}</span>
                <span class="sentence-text">${sentence.text}</span>
                <span class="sentence-meta">
                    <span class="confidence-indicator confidence-${confidenceLevel}" title="Confidence: ${(sentence.confidence * 100).toFixed(0)}%">●</span>
                </span>
            </div>
        `;
        
        return sentenceEl;
    }
    
    /**
     * Create compact DOM element for sentence (no background containers)
     */
    createCompactSentenceElement(sentence) {
        const sentenceEl = document.createElement('div');
        sentenceEl.className = 'transcript-sentence-compact';
        sentenceEl.dataset.timestamp = sentence.timestamp;
        
        // Add language flag and text only (clean, no containers)
        const languageFlag = sentence.language ? sentence.language.flag || '🌐' : '🌐';
        
        sentenceEl.innerHTML = `
            <span class="sentence-flag-compact">${languageFlag}</span>
            <span class="sentence-text-compact">${sentence.text}</span>
        `;
        
        return sentenceEl;
    }
    
    /**
     * Create DOM element for sentence (legacy method for compatibility)
     */
    createSentenceElement(sentence) {
        return this.createCompactSentenceElement(sentence);
    }
    
    /**
     * Update compact visual hierarchy (3 text sizes, smooth upward movement)
     */
    updateCompactSentenceHierarchy() {
        const sentences = this.sentencesContainer.querySelectorAll('.transcript-sentence-compact');
        
        sentences.forEach((sentence, index) => {
            // Remove existing hierarchy classes
            sentence.classList.remove('sentence-newest', 'sentence-middle', 'sentence-oldest');
            
            // Apply 3-tier hierarchy (index 0 = newest at top)
            if (index === 0) {
                // Newest sentence - largest font, full opacity
                sentence.classList.add('sentence-newest');
            } else if (index === 1) {
                // Middle sentence - medium font, medium opacity
                sentence.classList.add('sentence-middle');
            } else if (index === 2) {
                // Oldest sentence - smallest font, low opacity
                sentence.classList.add('sentence-oldest');
            }
        });
    }
    
    /**
     * Legacy method for compatibility
     */
    updateSentenceHierarchy() {
        this.updateCompactSentenceHierarchy();
    }
    
    /**
     * Update interim text (COMPACT VERSION - more prominent current line)
     */
    updateInterimText(text) {
        if (!this.interimElement) return;
        
        console.log(`[TranscriptUI] Updating interim: "${text.substring(0, 30)}..."`);
        
        if (text && text.trim()) {
            // Clean, prominent current line with blinking cursor
            this.interimElement.innerHTML = `
                <span class="interim-text-compact">${text}</span>
                <span class="interim-cursor-compact">▌</span>
            `;
            this.interimElement.classList.add('active-compact');
        } else {
            this.clearInterimText();
        }
    }
    
    /**
     * Clear interim text (COMPACT VERSION)
     */
    clearInterimText() {
        if (this.interimElement) {
            this.interimElement.innerHTML = '';
            this.interimElement.classList.remove('active', 'active-compact');
        }
    }
    
    /**
     * Show listening state
     */
    showListeningState() {
        // Remove placeholder and show listening indicator
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder');
        if (placeholder) {
            // Check if we're in device output mode
            const isDeviceOutput = this.app.audioSystem && this.app.audioSystem.currentAudioSource === 'system';
            
            if (isDeviceOutput) {
                placeholder.innerHTML = `
                    <div class="listening-indicator">
                        <span class="listening-dot"></span>
                        <span class="listening-text">Listening for speech...</span>
                        <div style="font-size: 11px; opacity: 0.6; margin-top: 8px;">
                            Tab audio captured - transcription should work! If not, try audio routing software.
                        </div>
                    </div>
                `;
            } else {
                placeholder.innerHTML = `
                    <div class="listening-indicator">
                        <span class="listening-dot"></span>
                        <span class="listening-text">Listening for speech...</span>
                    </div>
                `;
            }
            placeholder.classList.add('listening');
        }
    }
    
    /**
     * Show stopped state
     */
    showStoppedState() {
        // Clear interim text
        this.clearInterimText();
        
        // If no sentences, show default placeholder
        if (this.sentencesContainer.children.length === 0) {
            this.sentencesContainer.innerHTML = `
                <div class="transcript-placeholder">
                    Click Start to begin transcription
                </div>
            `;
        }
    }
    
    /**
     * Show error state
     */
    showErrorState(errorMessage) {
        console.log(`[TranscriptUI] Showing error: ${errorMessage}`);
        
        // Clear interim text
        this.clearInterimText();
        
        // Show error message
        this.sentencesContainer.innerHTML = `
            <div class="transcript-placeholder error">
                ${errorMessage}
            </div>
        `;
    }
    
    /**
     * Auto-scroll to show latest content
     */
    scrollToBottom() {
        if (this.transcriptElement) {
            this.transcriptElement.scrollTop = this.transcriptElement.scrollHeight;
        }
    }
    
    /**
     * Manage sentence count to avoid memory issues
     */
    manageSentenceCount() {
        const sentences = this.sentencesContainer.querySelectorAll('.transcript-sentence');
        
        if (sentences.length > this.maxVisibleSentences) {
            // Remove oldest sentences
            const excessCount = sentences.length - this.maxVisibleSentences;
            for (let i = 0; i < excessCount; i++) {
                sentences[i].remove();
            }
        }
    }
    
    /**
     * Clear all transcript content
     */
    clearAll() {
        this.sentencesContainer.innerHTML = `
            <div class="transcript-placeholder">
                Click Start to begin transcription
            </div>
        `;
        this.clearInterimText();
    }
    
    /**
     * Update language indicator
     */
    updateLanguageIndicator(flag, code, mode) {
        if (this.languageIndicator) {
            if (mode === 'auto') {
                this.languageIndicator.innerHTML = `
                    <span class="language-flag material-symbols-outlined">language</span>
                    <span class="language-code">AUTO</span>
                `;
            } else {
                this.languageIndicator.innerHTML = `
                    <span class="language-flag">${flag}</span>
                    <span class="language-code">${code}</span>
                `;
            }
        }
    }
}

// Export to window
window.TranscriptUI = TranscriptUI;