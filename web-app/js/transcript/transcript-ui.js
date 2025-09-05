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
        
        // Rhythm-based segmentation state
        this.finalizedSegments = []; // Keep significant history
        this.currentSegmentText = '';
        this.currentSegmentStart = null;
        // pendingLine removed - no longer needed
        this.segmentTimer = null;
        this.maxSegmentDuration = 5000; // 5 seconds per PRD spec
        this.maxSegments = 50; // Keep much more history for visibility
        this.isActivelyListening = false; // Track listening state
    }
    
    initialize() {
        console.log('🎨 [TranscriptUI] Initializing transcript UI');
        
        this.transcriptElement = document.getElementById('transcript');
        if (!this.transcriptElement) {
            console.error('[TranscriptUI] Transcript element not found');
            return;
        }
        
        this.languageIndicator = document.getElementById('transcriptLanguageIndicator');
        
        // Setup rhythm-based HTML structure
        this.initializeRhythmDisplay();
        
        // CRITICAL: Cache references to the containers we just created
        this.finalizedSegmentsContainer = document.getElementById('finalizedSegments');
        this.interimArea = document.getElementById('interimArea');
        
        console.log('[TranscriptUI] Transcript UI ready with rhythm-based segmentation');
        console.log('[TranscriptUI] Container references cached:', {
            finalizedSegments: !!this.finalizedSegmentsContainer,
            interimArea: !!this.interimArea
        });
    }
    
    /**
     * Initialize the rhythm-based display structure
     */
    initializeRhythmDisplay() {
        if (!this.transcriptElement) return;
        
        this.transcriptElement.innerHTML = `
            <!-- Finalized segments area (last 3x5-second segments) -->
            <div id="finalizedSegments" class="finalized-segments">
                <div class="transcript-placeholder">
                    Ready for transcript segments (mic active, hit start to transcribe and make cards)
                </div>
            </div>
            
            
            <!-- Current interim transcription (fixed bottom) -->
            <div id="interimArea" class="interim-area">
                <div class="interim-controls">
                    <div id="transcriptLanguageIndicator" class="control-element">
                        <span id="transcriptLanguageFlag" class="material-symbols-outlined">language</span>
                        <span id="langCodeTranscript">AUTO</span>
                        <span style="font-size: 8px;">▼</span>
                    </div>
                    <div id="transcriptLanguageDropdown" style="
                        position: absolute;
                        top: -200px;
                        left: 0;
                        background: rgba(30, 41, 59, 0.95);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        padding: 8px;
                        min-width: 150px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        z-index: 1000;
                        display: none;
                    ">
                        <div class="language-dropdown-option" data-lang="auto" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-outlined">language</span>
                            <span>Auto-detect</span>
                        </div>
                        <div class="language-dropdown-option" data-lang="en-US" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>🇺🇸</span>
                            <span>English</span>
                        </div>
                        <div class="language-dropdown-option" data-lang="de-DE" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>🇩🇪</span>
                            <span>German</span>
                        </div>
                        <div class="language-dropdown-option" data-lang="fr-FR" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>🇫🇷</span>
                            <span>French</span>
                        </div>
                        <div class="language-dropdown-option" data-lang="es-ES" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>🇪🇸</span>
                            <span>Spanish</span>
                        </div>
                        <div class="language-dropdown-option" data-lang="it-IT" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                            <span>🇮🇹</span>
                            <span>Italian</span>
                        </div>
                    </div>
                    <button id="inputSourceIndicator" class="control-element" title="Input Source">
                        <span id="inputSourceIcon" class="material-symbols-outlined">mic</span>
                    </button>
                    <button id="exportTranscriptBtn" class="control-element" disabled>
                        <span class="material-symbols-outlined">download</span>
                    </button>
                </div>
                <div id="interimText" class="interim-text">
                    <!-- Live interim text appears here -->
                </div>
                <div class="interim-right-controls">
                    <button id="interimStartBtn" class="start-button-mini" title="Start/Stop Recording">
                        <span id="interimStartIcon" class="material-symbols-outlined">play_arrow</span>
                    </button>
                </div>
            </div>
        `;
        
        // Cache the new elements
        this.finalizedSegmentsContainer = document.getElementById('finalizedSegments');
        this.interimArea = document.getElementById('interimArea');
        this.interimText = document.getElementById('interimText');
        
        console.log('🎯 [TranscriptUI] Cached elements:');
        console.log('🎯 [TranscriptUI] finalizedSegmentsContainer:', !!this.finalizedSegmentsContainer);
        console.log('🎯 [TranscriptUI] interimArea:', !!this.interimArea);
        console.log('🎯 [TranscriptUI] interimText:', !!this.interimText);
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
     * Get appropriate placeholder text based on audio source (matches cards placeholder format)
     */
    getPlaceholderText(audioSource) {
        if (audioSource === 'system') {
            return this.getSystemAudioPlaceholder();
        } else {
            return `
                <p style="font-size: 1.2em;">Microphone active</p>
                <p style="font-size: 1.2em; margin-top: 8px;">AI analyzes your speech in real-time</p>
            `;
        }
    }
    
    /**
     * Get system audio placeholder with detailed sharing information (matches cards placeholder format)
     */
    getSystemAudioPlaceholder() {
        // Check if there's an active system audio stream
        const systemStream = this.app.audioSystem?.systemStream;
        
        if (systemStream && systemStream.active) {
            // Try to get information about what's being shared
            const tracks = systemStream.getVideoTracks();
            let sourceInfo = 'System Audio';
            let detailedStatus = 'Permission active • Ready to transcribe';
            
            if (tracks.length > 0) {
                const track = tracks[0];
                const settings = track.getSettings();
                
                if (settings.displaySurface === 'window') {
                    sourceInfo = 'Window Audio Capture';
                    detailedStatus = 'Sharing specific application window • Permission granted';
                } else if (settings.displaySurface === 'browser') {
                    sourceInfo = 'Browser Tab Audio Capture';  
                    detailedStatus = 'Sharing selected browser tab • Permission granted';
                } else if (settings.displaySurface === 'monitor') {
                    sourceInfo = 'Screen Audio Capture';
                    detailedStatus = 'Sharing entire screen audio • Permission granted';
                }
            }
            
            return `
                <p style="font-size: 1.2em;">${sourceInfo} active</p>
                <p style="font-size: 1.2em; margin-top: 8px;">${detailedStatus}</p>
            `;
        } else {
            return `
                <p style="font-size: 1.2em;">Device Output Mode</p>
                <p style="font-size: 1.2em; margin-top: 8px;">Select tab or window to capture audio</p>
            `;
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
     * Now integrates with rhythm-based system instead of creating separate elements
     */
    addFinalSentence(sentence, options = {}) {
        console.log(`[TranscriptUI] Final sentence received: "${sentence.text.substring(0, 30)}..."`);
        console.log(`[TranscriptUI] Is actively listening: ${this.isActivelyListening}`);
        
        // Initialize if needed
        if (!this.sentencesContainer && !this.finalizedSegmentsContainer) {
            console.log('[TranscriptUI] Containers not initialized - initializing now');
            this.initialize();
        }
        
        if (this.isActivelyListening) {
            // If we're in rhythm mode, just update the current segment text - don't force finalize
            console.log(`[TranscriptUI] Updating current segment with final sentence (rhythm mode)`);
            this.currentSegmentText = sentence.text;
            // Let the 5-second timer handle finalization naturally
            return; // Exit early to prevent dual processing
        } else {
            // Fallback to legacy system if not in rhythm mode
            console.log(`[TranscriptUI] Using legacy sentence display (not in rhythm mode)`);
            
            // Remove placeholder if present
            const placeholder = this.sentencesContainer?.querySelector('.transcript-placeholder-compact');
            if (placeholder) {
                placeholder.remove();
            }
            
            // Create compact sentence element with worthiness status
            const sentenceEl = this.createCompactSentenceElement(sentence, options);
            
            // Add to container BOTTOM (newest sentences at bottom) 
            this.sentencesContainer?.appendChild(sentenceEl);
            
            // Update font sizes and opacity with 3-tier system
            this.updateCompactSentenceHierarchy();
            
            // Manage sentence count (keep reasonable limit)
            this.manageSentenceCount();
            
            // Force scroll to show new sentence
            this.forceScrollToBottom();
        }
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
        
        // Skip segments with minimal content to avoid duplicates (relaxed thresholds)
        if (!segment.text || segment.text.trim().length < 3 || segment.text.trim().split(' ').length < 1) {
            console.log(`⏭️ [TranscriptUI] Skipping minimal rhythm segment: "${segment.text}"`);            return;
        }
        
        // Initialize if needed and use finalized segments container
        if (!this.finalizedSegmentsContainer) {
            this.initialize();
            if (!this.finalizedSegmentsContainer) {
                console.error(`[TranscriptUI] Cannot add rhythm segment - finalized container not found`);
                return;
            }
        }
        
        // Route rhythm segments to finalized segments area
        this.addFinalizedSegment({
            text: segment.text,
            duration: segment.duration,
            timestamp: segment.timestamp || new Date().toLocaleTimeString(),
            cardCreated: false
        });
        return;
        
        // Remove placeholder if present
        const placeholder = this.sentencesContainer.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create rhythm segment element with timing visualization
        const segmentEl = this.createRhythmSegmentElement(segment);
        
        // Add to container BOTTOM (newest segments at bottom)
        this.sentencesContainer.appendChild(segmentEl);
        
        // Update font sizes and opacity with 3-tier system
        this.updateCompactSentenceHierarchy();
        
        // Manage segment count (keep reasonable limit)
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
        
        // Manage sentence count (keep reasonable limit) 
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
        // Ensure container exists before trying to query it
        if (!this.sentencesContainer) {
            console.warn('[TranscriptUI] sentencesContainer not initialized - skipping hierarchy update');
            return;
        }
        
        const sentences = this.sentencesContainer.querySelectorAll('.transcript-sentence-compact');
        const length = sentences.length;
        
        sentences.forEach((sentence, index) => {
            // Remove existing hierarchy classes
            sentence.classList.remove('sentence-newest', 'sentence-middle', 'sentence-oldest');
            
            // Apply 3-tier hierarchy (last index = newest at bottom)
            if (index === length - 1) {
                // Newest sentence - largest font, full opacity
                sentence.classList.add('sentence-newest');
            } else if (index === length - 2) {
                // Middle sentence - medium font, medium opacity
                sentence.classList.add('sentence-middle');
            } else if (index === length - 3) {
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
        console.log(`[TranscriptUI] Updating interim text: "${text.substring(0, 30)}..."`);
        
        // Update both old and new systems for compatibility
        // New rhythm system (preferred)
        this.updateInterim(text);
        
        // Legacy system (fallback)
        if (this.interimElement) {
            if (text && text.trim()) {
                // Clean, prominent current line with simple text display
                this.interimElement.innerHTML = `
                    <span class="interim-text-compact">${text}<span class="interim-cursor-compact">▌</span></span>
                `;
                this.interimElement.classList.add('active-compact');
                
                // Ensure current line is visible when typing
                this.scrollToBottom();
            } else {
                this.clearInterimText();
            }
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
        console.log('🎤 [TranscriptUI] Starting listening state with rhythm system');
        
        this.isActivelyListening = true;
        
        // Remove placeholder completely when listening starts
        const placeholder = this.finalizedSegmentsContainer?.querySelector('.transcript-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Start the 5-second rhythm system immediately
        this.startNewSegment();
        
        // Update interim area with simple status
        if (this.interimText) {
            const audioSource = this.app.audioSystem?.currentAudioSource || 'microphone';
            let statusMessage = 'Listening to microphone';
            
            if (audioSource === 'system') {
                const systemStream = this.app.audioSystem?.systemStream;
                if (systemStream && systemStream.active) {
                    const tracks = systemStream.getVideoTracks();
                    if (tracks.length > 0) {
                        const settings = tracks[0].getSettings();
                        if (settings.displaySurface === 'window') {
                            statusMessage = 'Listening to window audio';
                        } else if (settings.displaySurface === 'browser') {
                            statusMessage = 'Listening to browser tab audio';
                        } else if (settings.displaySurface === 'monitor') {
                            statusMessage = 'Listening to screen audio';
                        }
                    } else {
                        statusMessage = 'Listening to system audio';
                    }
                } else {
                    statusMessage = 'Device audio not active';
                }
            }
            
            this.interimText.textContent = statusMessage + '...';
            this.interimText.style.opacity = '0.6';
        }
        
        // Legacy support for old system
        const legacyPlaceholder = this.sentencesContainer?.querySelector('.transcript-placeholder');
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
        console.log('🛑 [TranscriptUI] Stopping rhythm system');
        
        this.isActivelyListening = false;
        
        // Stop the rhythm system
        if (this.segmentTimer) {
            clearTimeout(this.segmentTimer);
            this.segmentTimer = null;
        }
        
        // Pending line functionality removed
        
        // Clear interim text
        this.clearInterimText();
        
        // CRITICAL FIX: Check DOM segments, not just the array
        // The array might be out of sync with the actual DOM elements
        const existingSegments = this.finalizedSegmentsContainer?.querySelectorAll('.finalized-segment');
        const hasVisibleSegments = existingSegments && existingSegments.length > 0;
        
        // CRITICAL FIX: Only show placeholder if NO segments exist at all
        // Do NOT clear segments just because recording stopped
        if (!hasVisibleSegments) {
            console.log('📏 [TranscriptUI] No segments found - showing placeholder');
            const audioSource = this.app.audioSystem?.currentAudioSource || 'microphone';
            const placeholderText = this.getPlaceholderText(audioSource);
            
            this.finalizedSegmentsContainer.innerHTML = `
                <div class="transcript-placeholder">
                    Ready for transcript segments (mic active, hit start to transcribe and make cards)
                </div>
            `;
        } else {
            console.log(`📏 [TranscriptUI] Keeping existing segments: ${existingSegments?.length || 0} visible`);
            // NEVER clear segments that are already displayed - this is the key fix
        }
        
        // Legacy support
        const placeholder = this.sentencesContainer?.querySelector('.transcript-placeholder-compact');
        if (placeholder) {
            placeholder.classList.remove('hidden');
        }
        
        // If no sentences, show default placeholder
        if (this.sentencesContainer && this.sentencesContainer.children.length === 0) {
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
     * Show system audio limitation message
     */
    showSystemAudioLimitation() {
        console.log('[TranscriptUI] Showing system audio limitation message');
        
        // Update the finalized segments area with clear message
        if (this.finalizedSegmentsContainer) {
            // Only show if no segments are already displayed
            const existingSegments = this.finalizedSegmentsContainer.querySelectorAll('.finalized-segment');
            if (existingSegments.length === 0) {
                this.finalizedSegmentsContainer.innerHTML = `
                    <div class="transcript-placeholder" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 20px; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <span style="font-size: 24px;">⚠️</span>
                            <span style="font-size: 16px; font-weight: 600; color: #f59e0b;">Browser Limitation Detected</span>
                        </div>
                        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
                            Web browsers cannot transcribe audio from other tabs or applications due to security restrictions.
                        </p>
                        <p style="font-size: 13px; opacity: 0.8;">
                            <strong>Solution:</strong> Switch to <span style="color: #3b82f6;">Microphone Mode</span> to transcribe your own speech,
                            or use screen recording software with audio routing for system audio transcription.
                        </p>
                    </div>
                `;
            }
        }
        
        // Also update interim text area
        if (this.interimText) {
            this.interimText.style.color = '#f59e0b';
            this.interimText.textContent = 'System audio cannot be transcribed - switch to microphone mode';
        }
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
     * Manage sentence count to keep history visible
     */
    manageSentenceCount() {
        // Ensure container exists before trying to query it
        if (!this.sentencesContainer) {
            console.warn('[TranscriptUI] sentencesContainer not initialized - skipping sentence count management');
            return;
        }
        
        const sentences = this.sentencesContainer.querySelectorAll('.transcript-sentence, .transcript-sentence-compact');
        const maxSentences = 50; // Keep much more history for better visibility
        
        if (sentences.length > maxSentences) {
            // Remove oldest sentences (first elements since newest are at bottom)
            const excessCount = sentences.length - maxSentences;
            for (let i = 0; i < excessCount; i++) {
                if (sentences[i]) {
                    sentences[i].remove();
                }
            }
        }
    }
    
    /**
     * Clear all transcript content
     */
    clearAll() {
        this.sentencesContainer.innerHTML = `
            <div class="transcript-placeholder">
                Ready for transcript segments (mic active, hit start to transcribe and make cards)
            </div>
        `;
        this.clearInterimText();
    }
    
    /**
     * Update interim transcription (bottom area)
     */
    updateInterim(text) {
        // Update the rhythm system with current text
        this.addToCurrentSegment(text);
        
        // Update the fixed bottom interim area
        if (this.interimText) {
            if (text && text.trim()) {
                this.interimText.innerHTML = `${text}<span class="interim-cursor-compact">▌</span>`;
                this.interimText.style.opacity = '0.9';
            } else {
                this.interimText.innerHTML = '';
                this.interimText.style.opacity = '0.4';
            }
        }
    }
    
    /**
     * Start a new segment with pending line animation (12s max)
     */
    startNewSegment() {
        console.log('📏 [TranscriptUI] Starting new segment (12s max)');
        console.log('📏 [TranscriptUI] Current segments count:', this.finalizedSegments.length);
        console.log('📏 [TranscriptUI] Is actively listening:', this.isActivelyListening);
        
        this.currentSegmentStart = Date.now();
        this.currentSegmentText = '';
        
        // Create and animate the pending line
        this.createPendingLine();
        
        // Set timer to finalize segment after 5 seconds
        if (this.segmentTimer) {
            console.log('📏 [TranscriptUI] Clearing existing segment timer');
            clearTimeout(this.segmentTimer);
        }
        
        console.log('📏 [TranscriptUI] Setting 12-second timer for segment finalization');
        this.segmentTimer = setTimeout(() => {
            this.finalizeCurrentSegment();
        }, this.maxSegmentDuration);
    }
    
    /**
     * Create and animate the pending line - REMOVED
     * This functionality has been removed as the pendingLineArea no longer exists
     */
    createPendingLine() {
        // Pending line functionality has been removed
        console.log('⏱️ [TranscriptUI] Pending line creation skipped - functionality removed');
    }
    
    /**
     * Finalize the current segment with "plop" animation
     */
    finalizeCurrentSegment() {
        const segmentDuration = Date.now() - this.currentSegmentStart;
        const hasContent = this.currentSegmentText && this.currentSegmentText.trim().length > 0;
        
        console.log('✅ [TranscriptUI] Finalizing segment (timer-based)');
        console.log(`📏 [TranscriptUI] Segment duration: ${(segmentDuration / 1000).toFixed(1)}s`);
        console.log(`📏 [TranscriptUI] Has content: ${hasContent}`);
        console.log(`📏 [TranscriptUI] Content: "${this.currentSegmentText}"`);
        
        if (hasContent) {
            console.log(`✅ [TranscriptUI] Finalizing segment with content: "${this.currentSegmentText.substring(0, 50)}..."`);            
            
            // Skip if content is too minimal (avoid duplicates with rhythm system) - relaxed thresholds
            if (this.currentSegmentText.trim().length < 3 || this.currentSegmentText.trim().split(' ').length < 1) {
                console.log(`⏭️ [TranscriptUI] Skipping minimal finalized segment: "${this.currentSegmentText}"`);                return;
            }
            
            // Create finalized segment from current interim text
            this.addFinalizedSegment({
                text: this.currentSegmentText,
                duration: segmentDuration,
                timestamp: new Date().toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                }),
                cardCreated: false // Will be updated when card is created
            });
            
            // Don't clear interim text immediately - let it fade naturally
            // This prevents the jarring visual jump when segments finalize
            // this.clearInterimText();
            
        } else {
            console.log('⏭️ [TranscriptUI] No content in segment - skipping');
        }
        
        // Pending line functionality removed
        
        // Reset segment state
        this.currentSegmentText = '';
        this.currentSegmentStart = null;
        
        // Always start next segment if actively listening (metronome behavior)
        console.log(`📏 [TranscriptUI] After finalization - isActivelyListening: ${this.isActivelyListening}`);
        if (this.isActivelyListening) {
            console.log('📏 [TranscriptUI] Starting next segment immediately (metronome)');
            // Start next segment immediately for continuous metronome effect
            this.startNewSegment();
        } else {
            console.log('📏 [TranscriptUI] Not starting next segment - no longer listening');
        }
    }
    
    /**
     * Add text to current segment
     */
    addToCurrentSegment(text) {
        if (this.currentSegmentStart) {
            this.currentSegmentText = text;
            console.log(`📏 [TranscriptUI] Adding to current segment: "${text.substring(0, 30)}..."`);
        } else {
            console.log(`⚠️ [TranscriptUI] No active segment to add text to. Starting new segment.`);
            this.startNewSegment();
            this.currentSegmentText = text;
        }
    }
    
    /**
     * Add a finalized segment to the display
     */
    addFinalizedSegment(segment) {
        console.log(`🎯 [TranscriptUI] ========= ADDING FINALIZED SEGMENT =========`);
        console.log(`🎯 [TranscriptUI] Segment text: "${segment.text}"`);
        
        // CRITICAL: Ensure container exists
        if (!this.finalizedSegmentsContainer) {
            console.log(`🚨 [TranscriptUI] Container missing - finding/creating it...`);
            // Try to find it
            this.finalizedSegmentsContainer = document.getElementById('finalizedSegments');
            
            // If still not found, create it
            if (!this.finalizedSegmentsContainer) {
                console.log(`🚨 [TranscriptUI] Creating container from scratch`);
                const transcriptEl = document.getElementById('transcript');
                if (transcriptEl) {
                    const container = document.createElement('div');
                    container.id = 'finalizedSegments';
                    container.className = 'finalized-segments';
                    transcriptEl.appendChild(container);
                    this.finalizedSegmentsContainer = container;
                }
            }
        }
        
        if (!this.finalizedSegmentsContainer) {
            console.error(`❌ [TranscriptUI] CRITICAL: Cannot create container - segment lost!`);
            return;
        }
        
        // Remove placeholder if it exists
        const placeholder = this.finalizedSegmentsContainer.querySelector('.transcript-placeholder');
        if (placeholder) {
            console.log(`🎯 [TranscriptUI] Removing placeholder`);
            placeholder.remove();
        }
        
        // Create segment element - SIMPLE AND VISIBLE
        const segmentEl = document.createElement('div');
        segmentEl.className = 'finalized-segment';
        
        // FORCE VISIBILITY with inline styles
        segmentEl.style.cssText = `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            padding: 10px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.05);
            border-left: 3px solid #3b82f6;
            border-radius: 5px;
            color: white;
        `;
        
        // Simple content - just text and timestamp
        segmentEl.innerHTML = `
            <div style="font-size: 14px; margin-bottom: 5px;">${segment.text}</div>
            <div style="font-size: 11px; opacity: 0.6;">
                ${segment.timestamp || new Date().toLocaleTimeString()}
            </div>
        `;
        
        // Add to container (newest at bottom)
        this.finalizedSegmentsContainer.appendChild(segmentEl);
        
        // Force container to be visible
        this.finalizedSegmentsContainer.style.display = 'block';
        this.finalizedSegmentsContainer.style.visibility = 'visible';
        
        // Scroll to show new segment
        segmentEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
        
        // Keep last segments visible as history
        this.finalizedSegments.push(segment);
        
        // Keep history with much longer retention for visibility
        const maxSegments = this.maxSegments; // Use class property
        if (this.finalizedSegments.length > maxSegments) {
            this.finalizedSegments = this.finalizedSegments.slice(-maxSegments);
            
            // Remove oldest DOM elements only when we exceed the limit
            const segments = this.finalizedSegmentsContainer.querySelectorAll('.finalized-segment');
            if (segments.length > maxSegments) {
                // Remove only the excess elements
                const toRemove = segments.length - maxSegments;
                for (let i = 0; i < toRemove; i++) {
                    segments[i].remove();
                }
            }
        }
        
        console.log(`🎯 [TranscriptUI] Added segment, now have ${this.finalizedSegments.length} visible segments`);
        
        // Add visual hierarchy with gradual fade for older segments
        const allSegments = this.finalizedSegmentsContainer.querySelectorAll('.finalized-segment');
        allSegments.forEach((seg, index) => {
            // Calculate age-based opacity
            const totalSegments = allSegments.length;
            const position = totalSegments - index; // 1 = newest, higher = older
            
            // First 10 segments stay fully visible
            // Next 20 segments fade gradually
            // Rest maintain minimum visibility
            let opacity = 1;
            if (position > 10) {
                opacity = Math.max(0.4, 1 - ((position - 10) * 0.02));
            }
            
            // Ensure animation completes before adjusting opacity
            if (seg.classList.contains('segment-plop')) {
                setTimeout(() => {
                    seg.classList.remove('segment-plop');
                    seg.style.opacity = opacity;
                }, 400);
            } else {
                seg.style.opacity = opacity;
            }
            
            // Also adjust font size for visual hierarchy
            if (position === 1) {
                seg.style.fontSize = '15px';
            } else if (position === 2) {
                seg.style.fontSize = '14px';
            } else {
                seg.style.fontSize = '13px';
            }
        });
        
        // Enable download button now that we have content
        this.enableDownloadButton();
    }
    
    enableDownloadButton() {
        const downloadBtn = document.getElementById('exportTranscriptBtn');
        if (downloadBtn && downloadBtn.disabled) {
            downloadBtn.disabled = false;
            downloadBtn.title = 'Download transcript';
            console.log('📥 [TranscriptUI] Download button enabled');
        }
    }
    
    /**
     * Mark a segment as having created a card
     */
    markSegmentCardCreated(segmentIndex = -1) {
        // Default to most recent segment (-1 = last item)
        const actualIndex = segmentIndex === -1 ? this.finalizedSegments.length - 1 : segmentIndex;
        
        if (this.finalizedSegments[actualIndex]) {
            this.finalizedSegments[actualIndex].cardCreated = true;
            
            // Update DOM - segments are now ordered oldest to newest
            const segments = this.finalizedSegmentsContainer.querySelectorAll('.finalized-segment');
            if (segments[actualIndex]) {
                const statusDiv = segments[actualIndex].querySelector('.segment-status');
                if (statusDiv && !statusDiv.querySelector('.card-icon')) {
                    statusDiv.insertAdjacentHTML('beforeend', '<span class="card-icon">🃏</span>');
                }
            }
        }
    }
    
    /**
     * Format timestamp to ensure consistent display format
     */
    formatTimestamp(timestamp) {
        if (!timestamp) {
            return new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        // If it's already a formatted time string (HH:MM:SS), return as is
        if (typeof timestamp === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
            return timestamp;
        }
        
        // If it's a number (milliseconds), convert to Date first
        if (typeof timestamp === 'number') {
            timestamp = new Date(timestamp);
        }
        
        // If it's a Date object or string, format it
        try {
            const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
            return date.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.warn('[TranscriptUI] Error formatting timestamp:', timestamp, error);
            // Fallback to current time
            return new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    /**
     * Removed - letter animation no longer used for interim text
     */
    
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