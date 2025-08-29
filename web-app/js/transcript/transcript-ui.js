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
        
        // NEW COMPACT LAYOUT: Current line at bottom, completed sentences above, max 3 sentences (no separate status bar)
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
            return this.getSystemAudioPlaceholder();
        } else {
            return 'Microphone Mode<br><small>AI analyzes your speech in real-time</small>';
        }
    }
    
    /**
     * Get system audio placeholder with active sharing information
     */
    getSystemAudioPlaceholder() {
        // Check if there's an active system audio stream
        const systemStream = this.app.audioSystem?.systemStream;
        
        if (systemStream && systemStream.active) {
            // Try to get information about what's being shared
            const tracks = systemStream.getVideoTracks();
            let sourceInfo = 'System Audio';
            
            if (tracks.length > 0) {
                const track = tracks[0];
                const settings = track.getSettings();
                
                if (settings.displaySurface === 'window') {
                    sourceInfo = 'Window Audio Shared';
                } else if (settings.displaySurface === 'browser') {
                    sourceInfo = 'Browser Tab Audio Shared';
                } else if (settings.displaySurface === 'monitor') {
                    sourceInfo = 'Screen Audio Shared';
                }
            }
            
            return `Device Output Mode<br><small>${sourceInfo} • Permission active • Click Start</small>`;
        } else {
            return 'Device Output Mode<br><small>Select tab or window to capture audio, then click Start</small>';
        }
    }
    
    /**
     * Update placeholder text when audio source changes
     */
    updateAudioSource(audioSource) {
        console.log(`[TranscriptUI] Audio source changed to: ${audioSource}`);
        
        // Update placeholder if no transcription is active
        const placeholder = this.sentencesContainer?.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.innerHTML = this.getPlaceholderText(audioSource);
        }
        
        // Also update legacy placeholder
        const legacyPlaceholder = this.sentencesContainer?.querySelector('.transcript-placeholder');
        if (legacyPlaceholder) {
            legacyPlaceholder.innerHTML = this.getPlaceholderText(audioSource);
        }
    }
    
    /**
     * Add a finalized sentence to the transcript display (COMPACT VERSION)
     */
    addFinalSentence(sentence, options = {}) {
        console.log(`[TranscriptUI] Adding final sentence: "${sentence.text.substring(0, 30)}..."`);
        
        // Remove placeholder if present
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create compact sentence element with worthiness status
        const sentenceEl = this.createCompactSentenceElement(sentence, options);
        
        // Add to container TOP (newest sentences push older ones up)
        this.sentencesContainer.insertBefore(sentenceEl, this.sentencesContainer.firstChild);
        
        // Update font sizes and opacity with 3-tier system
        this.updateCompactSentenceHierarchy();
        
        // Manage sentence count (keep last 3 sentences max)
        this.manageSentenceCount();
        
        // Force scroll to show new sentence
        this.forceScrollToBottom();
    }
    
    /**
     * Add a rejected sentence (not worthy of card generation)
     */
    addRejectedSentence(sentence, reason = 'not worthy') {
        console.log(`[TranscriptUI] Adding rejected sentence: "${sentence.text.substring(0, 30)}..." (${reason})`);
        
        // Add with rejection flag
        this.addFinalSentence(sentence, { 
            rejected: true, 
            rejectionReason: reason 
        });
    }
    
    /**
     * Add a rhythm-based segment (5-second chunks)
     */
    addRhythmSegment(segment) {
        console.log(`[TranscriptUI] Adding rhythm segment (${segment.duration}ms): "${segment.text.substring(0, 30)}..."`);
        
        if (!this.sentencesContainer) {
            this.initialize();
            if (!this.sentencesContainer) {
                console.error(`[TranscriptUI] Cannot add rhythm segment - container not found`);
                return;
            }
        }
        
        // Remove placeholder if present
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create rhythm segment element with timing visualization
        const segmentEl = this.createRhythmSegmentElement(segment);
        
        // Add to container TOP (newest segments push older ones up)
        this.sentencesContainer.insertBefore(segmentEl, this.sentencesContainer.firstChild);
        
        // Update font sizes and opacity with 3-tier system
        this.updateCompactSentenceHierarchy();
        
        // Manage segment count (keep last 3 segments max)
        this.manageSentenceCount();
        
        // Force scroll to show new segment
        this.forceScrollToBottom();
    }
    
    /**
     * Create rhythm segment element with timing dots
     */
    createRhythmSegmentElement(segment) {
        const segmentEl = document.createElement('div');
        segmentEl.className = 'transcript-sentence-compact rhythm-segment';
        segmentEl.dataset.timestamp = segment.timestamp;
        segmentEl.dataset.duration = segment.duration;
        
        // Create rhythm dots (●●●○○ pattern)
        const rhythmDots = this.createRhythmDots(segment.duration, 5000);
        
        // Language flag
        const languageFlag = segment.language ? segment.language.flag || '🌐' : '🌐';
        
        // Create status line for this segment
        const statusLine = this.createSegmentStatusLine(segment.duration);
        
        segmentEl.innerHTML = `
            <div class="segment-main-content">
                <span class="sentence-flag-compact">${languageFlag}</span>
                <span class="sentence-text-compact">${segment.text}</span>
                <span class="rhythm-dots">${rhythmDots}</span>
            </div>
            <div class="segment-status-line">${statusLine}</div>
        `;
        
        return segmentEl;
    }
    
    /**
     * Create rhythm visualization dots (●●●○○)
     */
    createRhythmDots(duration, maxDuration = 5000) {
        const totalDots = 5;
        const filledDots = Math.round((duration / maxDuration) * totalDots);
        const filled = '●'.repeat(Math.min(filledDots, totalDots));
        const empty = '○'.repeat(Math.max(0, totalDots - filledDots));
        return filled + empty;
    }
    
    /**
     * Create status line for individual segment (EN • 3.2s • 14:23)
     */
    createSegmentStatusLine(segmentDuration) {
        // Get language info
        const langInfo = this.app.languageManager?.getCurrentLanguage();
        const langDisplay = langInfo?.mode === 'auto' ? 'AUTO' : (langInfo?.selectedLanguage?.split('-')[0]?.toUpperCase() || 'EN');
        
        // Format duration
        const seconds = (segmentDuration / 1000).toFixed(1);
        const durationDisplay = `${seconds}s`;
        
        // Get timestamp
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `${langDisplay} • ${durationDisplay} • ${timeStr}`;
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
    createCompactSentenceElement(sentence, options = {}) {
        const sentenceEl = document.createElement('div');
        sentenceEl.className = 'transcript-sentence-compact';
        sentenceEl.dataset.timestamp = sentence.timestamp;
        
        // Add language flag and text
        const languageFlag = sentence.language ? sentence.language.flag || '🌐' : '🌐';
        
        // Check if this sentence was rejected (not worthy)
        if (options.rejected) {
            sentenceEl.classList.add('sentence-rejected');
            sentenceEl.title = `Not worthy of card generation: ${options.rejectionReason || 'unknown reason'}`;
            
            // Add rejection indicator (struck-through document icon in circle)
            sentenceEl.innerHTML = `
                <span class="sentence-rejection-indicator" title="Not worthy of card generation">
                    <span class="material-symbols-outlined">description</span>
                </span>
                <span class="sentence-flag-compact">${languageFlag}</span>
                <span class="sentence-text-compact sentence-text-rejected">${sentence.text}</span>
            `;
        } else {
            // Normal sentence (worthy of card generation or will be processed)
            sentenceEl.innerHTML = `
                <span class="sentence-flag-compact">${languageFlag}</span>
                <span class="sentence-text-compact">${sentence.text}</span>
            `;
        }
        
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
            
            // Ensure current line is visible when typing
            this.scrollToBottom();
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
        // Hide placeholder when transcription is running
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.classList.add('hidden');
        }
        
        // Legacy placeholder support
        const legacyPlaceholder = this.sentencesContainer.querySelector('.transcript-placeholder');
        if (legacyPlaceholder) {
            // Check if we're in device output mode
            const isDeviceOutput = this.app.audioSystem && this.app.audioSystem.currentAudioSource === 'system';
            
            if (isDeviceOutput) {
                legacyPlaceholder.innerHTML = `
                    <div class="listening-indicator">
                        <span class="listening-dot"></span>
                        <span class="listening-text">Listening for speech...</span>
                        <div style="font-size: 11px; opacity: 0.6; margin-top: 8px;">
                            Tab audio captured - transcription should work! If not, try audio routing software.
                        </div>
                    </div>
                `;
            } else {
                legacyPlaceholder.innerHTML = `
                    <div class="listening-indicator">
                        <span class="listening-dot"></span>
                        <span class="listening-text">Listening for speech...</span>
                    </div>
                `;
            }
            legacyPlaceholder.classList.add('listening');
        }
    }
    
    /**
     * Show stopped state
     */
    showStoppedState() {
        // Clear interim text
        this.clearInterimText();
        
        // Show placeholder again when stopped
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.classList.remove('hidden');
        }
        
        // If no sentences, show default placeholder
        if (this.sentencesContainer.children.length === 0) {
            const audioSource = this.app.audioSystem?.currentAudioSource || 'microphone';
            const placeholderText = this.getPlaceholderText(audioSource);
            
            this.sentencesContainer.innerHTML = `
                <div class="transcript-placeholder-compact">
                    ${placeholderText}
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
     * Auto-scroll to show latest content (only when new content is added)
     */
    scrollToBottom() {
        if (!this.transcriptElement) return;
        
        // Only auto-scroll if user is already near the bottom (within 50px)
        const isNearBottom = this.transcriptElement.scrollHeight - this.transcriptElement.scrollTop - this.transcriptElement.clientHeight < 50;
        
        if (isNearBottom) {
            this.transcriptElement.scrollTop = this.transcriptElement.scrollHeight;
        }
    }
    
    /**
     * Force scroll to bottom (for new sentence additions)
     */
    forceScrollToBottom() {
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

// Export to window
window.TranscriptUI = TranscriptUI;