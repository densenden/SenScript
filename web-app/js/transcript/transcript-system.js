/**
 * SenScript Transcript System - Unified Implementation
 * Based on /monorepo/07-Transcript-System-Requirements.md
 * 
 * Features:
 * - Language detection and switching (auto/manual modes)
 * - Sophisticated transcript display with animations
 * - Three-tier font sizing and opacity effects
 * - Horizontal flip animations for interim text
 * - Wobble effects for final sentences
 * - Optimized card generation integration
 */

class TranscriptSystem {
    constructor(app) {
        this.app = app;
        
        // Core state (language mode now managed by LanguageManager)
        this.state = {
            transcriptBuffer: [], // Final sentences with metadata
            interimText: '',
            finalizedSentences: [],
            lastLanguageDetection: null,
            pendingSentence: '',
            sessionStarted: false,
            // Rhythm-based segmentation
            currentSegmentStart: null,
            currentSegmentText: '',
            segmentTimer: null,
            maxSegmentDuration: this.app.settings?.rhythmSegmentDuration || 5000 // Default 5 seconds, adjustable
        };
        
        // UI components
        this.ui = new TranscriptUI(this.app);
        this.animations = new TranscriptAnimations();
        this.languageManager = new LanguageManager(this.app);
        
        // Performance optimization
        this.cardGenerationQueue = [];
        this.lastCardGeneration = 0;
        this.cardGenerationDebounce = 500; // ms
        
        this.initialize();
    }
    
    initialize() {
        console.log('[TranscriptSystem] Initializing unified transcript system');
        
        // Setup UI components
        this.ui.initialize();
        this.animations.initialize();
        this.languageManager.initialize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize with default language
        this.languageManager.setMode('auto');
        
        console.log(' [TranscriptSystem] Transcript system ready');
        
        // Add test function for manual testing
        window.testTranscriptSystem = () => {
            console.log('🧪 [TranscriptSystem] Testing transcript system...');
            
            // Start session if not already started
            if (!this.state.sessionStarted) {
                console.log('🧪 [TranscriptSystem] Starting test session...');
                this.startSession();
            }
            
            // Test interim text
            this.processIncomingSpeech({
                isFinal: false,
                transcript: 'Testing interim text...',
                confidence: 0.5
            });
            
            setTimeout(() => {
                // Test final text
                this.processIncomingSpeech({
                    isFinal: true,
                    transcript: 'This is a test sentence for transcript processing and card generation.',
                    confidence: 0.85
                });
            }, 1000);
            
            setTimeout(() => {
                // Test another final text
                this.processIncomingSpeech({
                    isFinal: true,
                    transcript: 'What is machine learning and how does it work in practice?',
                    confidence: 0.90
                });
            }, 2000);
            
            console.log('🧪 [TranscriptSystem] Test completed - check transcript display and cards');
        };
    }
    
    setupEventListeners() {
        // Language indicator click handler
        const languageIndicator = document.getElementById('transcriptLanguageIndicator');
        if (languageIndicator) {
            languageIndicator.addEventListener('click', () => {
                this.languageManager.toggleDropdown();
            });
        }
    }
    
    /**
     * MAIN PROCESSING ENTRY POINT
     * Called by Speech Recognition with interim and final results (LEGACY)
     */
    processIncomingSpeech(speechResult) {
        const { isFinal, transcript, confidence } = speechResult;
        
        console.log(`[TranscriptSystem] ========== INCOMING SPEECH ==========`);
        console.log(`[TranscriptSystem] Final: ${isFinal}, Text: "${transcript}", Confidence: ${confidence}`);
        console.log(`[TranscriptSystem] Session started: ${this.state.sessionStarted}`);
        
        if (!this.state.sessionStarted) {
            console.log(`[TranscriptSystem] Session not started, ignoring speech`);
            return;
        }
        
        if (isFinal) {
            this.handleFinalText(transcript);
        } else {
            this.handleInterimText(transcript);
        }
    }
    
    /**
     * NEW MAIN PROCESSING ENTRY POINT
     * Called by Whisper Client with rich transcription data
     */
    async processWhisperTranscription(transcriptionData) {
        console.log(` [TranscriptSystem] ========== INCOMING WHISPER DATA ==========`);
        console.log(` [TranscriptSystem] Text length: ${transcriptionData.text?.length || 0}`);
        console.log(` [TranscriptSystem] Language: ${transcriptionData.language}`);
        console.log(` [TranscriptSystem] Words: ${transcriptionData.words?.length || 0}`);
        console.log(` [TranscriptSystem] Segments: ${transcriptionData.segments?.length || 0}`);
        console.log(` [TranscriptSystem] Educational: ${transcriptionData.metadata?.educational !== false}`);
        console.log(` [TranscriptSystem] Session state: sessionStarted=${this.state.sessionStarted}`);
        
        if (!this.state.sessionStarted) {
            console.log(` [TranscriptSystem]  Session not started, ignoring transcription`);
            return;
        }
        
        if (!transcriptionData.text || transcriptionData.text.trim().length === 0) {
            console.log(` [TranscriptSystem]  Empty transcription, ignoring`);
            return;
        }
        
        try {
            // Process each segment for better granularity
            if (transcriptionData.segments && transcriptionData.segments.length > 0) {
                for (const segment of transcriptionData.segments) {
                    await this.handleWhisperSegment(segment, transcriptionData);
                }
            } else {
                // Fallback: treat entire text as one segment
                await this.handleWhisperSegment({
                    text: transcriptionData.text,
                    start: 0,
                    end: transcriptionData.duration || 10
                }, transcriptionData);
            }
            
        } catch (error) {
            console.error(` [TranscriptSystem] Failed to process Whisper transcription:`, error);
        }
    }
    
    /**
     * Handle individual Whisper segment
     */
    async handleWhisperSegment(segment, transcriptionData) {
        const segmentText = segment.text?.trim();
        if (!segmentText || segmentText.length < 5) {
            console.log(` [TranscriptSystem] Skipping short segment: "${segmentText}"`);
            return;
        }
        
        console.log(`📋 [TranscriptSystem] Processing segment: "${segmentText.substring(0, 50)}..."`);
        
        // Create enhanced sentence record
        const sentence = {
            text: segmentText,
            timestamp: Date.now(),
            language: transcriptionData.language,
            whisperData: {
                start: segment.start,
                end: segment.end,
                duration: segment.end - segment.start,
                confidence: transcriptionData.metadata?.confidence || 0.8,
                words: this.extractWordsFromSegment(segment, transcriptionData.words || []),
                educational: transcriptionData.metadata?.educational !== false
            },
            source: 'whisper',
            processed: false
        };
        
        // Add to finalized sentences
        this.state.finalizedSentences.push(sentence);
        this.state.transcriptBuffer.push(sentence);
        
        // Update language indicator
        this.languageManager.updateDetectedLanguage({
            lang: transcriptionData.language,
            confidence: (transcriptionData.metadata?.confidence || 0.8) * 100,
            flag: this.languageManager.getLanguageInfo(transcriptionData.language).flag
        });
        
        // Update UI with enhanced display
        this.ui.addWhisperSentence(sentence);
        this.animations.triggerWobble();
        
        // Check for card generation (only for educational content)
        if (sentence.whisperData.educational && this.isTextWorthyOfCard(segmentText)) {
            this.queueCardGeneration(sentence);
        } else {
            console.log(`⏭️ [TranscriptSystem] Skipping card generation - educational: ${sentence.whisperData.educational}, worthy: ${this.isTextWorthyOfCard(segmentText)}`);
        }
        
        // Manage buffer size
        if (this.state.transcriptBuffer.length > 50) {
            this.state.transcriptBuffer = this.state.transcriptBuffer.slice(-50);
        }
    }
    
    /**
     * Extract words for specific segment
     */
    extractWordsFromSegment(segment, allWords) {
        if (!allWords || allWords.length === 0) return [];
        
        // Find words that fall within this segment's timeframe
        return allWords.filter(word => 
            word.start >= segment.start && word.end <= segment.end
        );
    }
    
    /**
     * Handle finalized speech text (triggers rhythm segment completion)
     */
    handleFinalText(text) {
        if (!text || text.trim().length === 0) return;
        
        const trimmedText = text.trim();
        console.log(`🎵 [RhythmSegment] Final text received - completing current segment: "${trimmedText.substring(0, 50)}..."`);
        
        // Update current segment with final text
        this.state.currentSegmentText = trimmedText;
        
        // Force end current rhythm segment (speech recognition finalized)
        if (this.state.currentSegmentStart && this.state.currentSegmentText.trim()) {
            const segmentDuration = Date.now() - this.state.currentSegmentStart;
            this.finalizeRhythmSegment(trimmedText, segmentDuration);
            
            // Start new segment for continuing speech
            this.startNewSegment();
        }
        
        // Clear interim text
        this.state.interimText = '';
        this.ui.clearInterimText();
    }
    
    /**
     * Handle interim speech text (still being recognized)
     */
    handleInterimText(text) {
        if (text === this.state.interimText) return; // No change
        
        console.log(` [TranscriptSystem] Interim: "${text.substring(0, 30)}..."`);
        
        this.state.interimText = text;
        
        // Accumulate text in current rhythm segment
        if (this.state.currentSegmentStart) {
            this.state.currentSegmentText = text;
        }
        
        // Update UI with flip animation
        this.ui.updateInterimText(text);
        this.animations.triggerFlip();
    }
    
    /**
     * Queue text for card generation with intelligent debouncing
     */
    queueCardGeneration(sentence) {
        // Check worthiness
        if (!this.isTextWorthyOfCard(sentence.text)) {
            console.log(`⏭️ [TranscriptSystem] Text not worthy: "${sentence.text.substring(0, 30)}..."`);
            return;
        }
        
        console.log(` [TranscriptSystem] Queuing for card generation: "${sentence.text.substring(0, 30)}..."`);
        
        // Add to queue
        this.cardGenerationQueue.push(sentence);
        
        // Debounced processing
        clearTimeout(this.cardGenerationTimeout);
        this.cardGenerationTimeout = setTimeout(() => {
            this.processCardGenerationQueue();
        }, this.cardGenerationDebounce);
    }
    
    /**
     * Process queued card generation requests
     */
    async processCardGenerationQueue() {
        if (this.cardGenerationQueue.length === 0) return;
        
        console.log(`🔥 [TranscriptSystem] Processing ${this.cardGenerationQueue.length} queued card generations`);
        
        // Process each queued sentence
        for (const sentence of this.cardGenerationQueue) {
            try {
                await this.generateCardFromSentence(sentence);
                sentence.processed = true;
            } catch (error) {
                console.error(` [TranscriptSystem] Card generation failed:`, error);
            }
        }
        
        // Clear queue
        this.cardGenerationQueue = [];
        this.lastCardGeneration = Date.now();
    }
    
    /**
     * Generate card from processed sentence
     */
    async generateCardFromSentence(sentence) {
        if (this.app.cardEngine) {
            console.log(`🎴 [TranscriptSystem] Generating card for: "${sentence.text.substring(0, 40)}..."`);
            await this.app.cardEngine.processText(sentence.text, sentence.language);
        } else {
            console.error(' [TranscriptSystem] CardEngine not available');
        }
    }
    
    /**
     * ENHANCED TEXT WORTHINESS CHECK
     * Based on requirements specification
     */
    isTextWorthyOfCard(text) {
        const trimmed = text.trim().toLowerCase();
        
        // Minimum length check
        if (trimmed.length < 20) return false;
        
        // Minimum word count
        const wordCount = trimmed.split(/\s+/).length;
        if (wordCount < 5) return false;
        
        // Skip filler phrases
        const fillerPatterns = [
            /^(ja|nein|ok|okay|hmm|äh|eh|um|uh|yes|no|right|sure|well)$/i,
            /^(danke|bitte|thanks|please|sorry|excuse me)$/i,
            /^(hallo|hello|hi|hey|good morning|good afternoon)$/i,
            /^(test|testing|check|mic check)$/i
        ];
        
        for (const pattern of fillerPatterns) {
            if (pattern.test(trimmed)) return false;
        }
        
        // Look for educational/informational content signals
        const educationalSignals = [
            // Question words
            'what', 'how', 'why', 'when', 'where', 'who',
            'was', 'wie', 'warum', 'wann', 'wo', 'wer',
            // Definition indicators  
            'ist', 'sind', 'bedeutet', 'is', 'are', 'means', 'called', 'defined as',
            // Explanation words
            'because', 'since', 'due to', 'weil', 'da', 'durch',
            // Examples and lists
            'example', 'such as', 'including', 'like', 'beispiel', 'wie zum beispiel',
            // Numbers and facts
            'percent', 'prozent', 'million', 'thousand', 'tausend',
            // Process words
            'first', 'second', 'then', 'next', 'finally', 'erstens', 'zweitens', 'dann',
            // Learning indicators
            'learn', 'understand', 'explain', 'define', 'lernen', 'verstehen', 'erklären'
        ];
        
        const hasEducationalContent = educationalSignals.some(signal => 
            trimmed.includes(signal.toLowerCase())
        );
        
        if (hasEducationalContent) {
            console.log(` [TranscriptSystem] Educational content detected`);
            return true;
        }
        
        // Check for complex sentence structure
        const complexityIndicators = [
            ' and ', ' but ', ' however ', ' therefore ', ' although ',
            ' und ', ' aber ', ' jedoch ', ' deshalb ', ' obwohl '
        ];
        
        const hasComplexStructure = complexityIndicators.some(indicator => 
            trimmed.includes(indicator)
        );
        
        if (hasComplexStructure && wordCount > 8) {
            console.log(` [TranscriptSystem] Complex structure detected`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Detect language for given text
     */
    detectLanguage(text) {
        if (window.LanguageDetection) {
            return window.LanguageDetection.detectLanguage(text);
        }
        
        // Fallback detection
        return this.fallbackLanguageDetection(text);
    }
    
    /**
     * Fallback language detection
     */
    fallbackLanguageDetection(text) {
        const lowerText = text.toLowerCase();
        
        // German indicators
        const germanWords = (lowerText.match(/\b(der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber|wie|was)\b/g) || []).length;
        
        // English indicators
        const englishWords = (lowerText.match(/\b(the|and|is|are|of|to|in|that|have|for|not|with|you|this|but|his|from|they|we|been|how|what)\b/g) || []).length;
        
        if (germanWords > englishWords) {
            return { 
                lang: 'de-DE', 
                confidence: Math.min(95, germanWords * 10), 
                flag: '🇩🇪' 
            };
        } else {
            return { 
                lang: 'en-US', 
                confidence: Math.min(95, englishWords * 10), 
                flag: '🇺🇸' 
            };
        }
    }
    
    /**
     * Start a new rhythm segment
     */
    startNewSegment() {
        console.log('🎵 [RhythmSegment] Starting new 5-second segment');
        
        this.state.currentSegmentStart = Date.now();
        this.state.currentSegmentText = '';
        
        // Clear any existing timer
        if (this.state.segmentTimer) {
            clearTimeout(this.state.segmentTimer);
        }
        
        // Set rhythm-based force cutoff (adjustable duration)
        this.state.segmentTimer = setTimeout(() => {
            console.log(`⏰ [RhythmSegment] ${this.state.maxSegmentDuration}ms timer expired - forcing segment end`);
            this.forceSegmentEnd();
        }, this.state.maxSegmentDuration);
    }
    
    /**
     * Force current segment to end (rhythm timer expired)
     */
    forceSegmentEnd() {
        if (!this.state.currentSegmentStart || !this.state.currentSegmentText.trim()) {
            console.log('🎵 [RhythmSegment] No active segment to force end');
            return;
        }
        
        const segmentDuration = Date.now() - this.state.currentSegmentStart;
        const segmentText = this.state.currentSegmentText.trim();
        
        console.log(`🎵 [RhythmSegment] Force-ending segment after ${segmentDuration}ms: "${segmentText.substring(0, 30)}..."`);
        
        // Finalize this segment
        this.finalizeRhythmSegment(segmentText, segmentDuration);
        
        // Start new segment for continuing speech
        this.startNewSegment();
    }
    
    /**
     * Finalize a rhythm-based segment
     */
    finalizeRhythmSegment(text, duration) {
        console.log(`🎵 [RhythmSegment] Finalizing ${duration}ms segment: "${text.substring(0, 30)}..."`);
        
        // Detect language for this segment
        const languageDetection = this.detectLanguage(text);
        
        // Create rhythm segment record
        const segment = {
            text: text,
            timestamp: Date.now(),
            duration: duration,
            isRhythmSegment: true,
            language: languageDetection,
            processed: false
        };
        
        // Add to finalized sentences
        this.state.finalizedSentences.push(segment);
        this.state.transcriptBuffer.push(segment);
        
        // Always pass language detection to LanguageManager (it will handle mode checking)
        this.languageManager.updateDetectedLanguage(languageDetection);
        
        // Update UI with rhythm segment
        this.ui.addRhythmSegment(segment);
        this.animations.triggerWobble();
        
        // Check for card generation on shorter segments
        this.queueCardGeneration(segment);
        
        // Clear the segment timer
        if (this.state.segmentTimer) {
            clearTimeout(this.state.segmentTimer);
            this.state.segmentTimer = null;
        }
    }
    
    /**
     * Start transcript session
     */
    startSession() {
        console.log('[TranscriptSystem] Starting transcript session');
        console.log('[TranscriptSystem] Previous session state:', this.state.sessionStarted);
        
        this.state.sessionStarted = true;
        
        // Start first rhythm segment
        this.startNewSegment();
        console.log('[TranscriptSystem] New session state:', this.state.sessionStarted);
        this.state.transcriptBuffer = [];
        this.state.finalizedSentences = [];
        this.state.interimText = '';
        
        // Trigger fade-in animation
        this.animations.fadeInTranscript();
        
        // Show initial state
        this.ui.showListeningState();
    }
    
    /**
     * Update rhythm segment duration (called from settings)
     */
    updateRhythmDuration(newDuration) {
        console.log(`🎵 [RhythmSegment] Updating segment duration to ${newDuration}ms`);
        
        this.state.maxSegmentDuration = newDuration;
        
        // Restart current segment with new duration if one is active
        if (this.state.currentSegmentStart && this.state.segmentTimer) {
            console.log('🎵 [RhythmSegment] Restarting current segment with new duration');
            
            // Clear existing timer
            clearTimeout(this.state.segmentTimer);
            
            // Calculate remaining time based on new duration
            const elapsed = Date.now() - this.state.currentSegmentStart;
            const remaining = Math.max(0, newDuration - elapsed);
            
            // Set new timer with remaining time
            this.state.segmentTimer = setTimeout(() => {
                console.log('⏰ [RhythmSegment] Updated timer expired - forcing segment end');
                this.forceSegmentEnd();
            }, remaining);
        }
    }
    
    /**
     * Stop transcript session
     */
    stopSession() {
        console.log(' [TranscriptSystem] Stopping transcript session');
        
        this.state.sessionStarted = false;
        
        // Process any remaining queued cards
        if (this.cardGenerationQueue.length > 0) {
            this.processCardGenerationQueue();
        }
        
        // Clear interim text
        this.state.interimText = '';
        this.ui.clearInterimText();
        
        // Show stopped state
        this.ui.showStoppedState();
    }
    
    /**
     * Get session statistics
     */
    getSessionStats() {
        const totalWords = this.state.finalizedSentences.reduce((count, sentence) => {
            return count + sentence.text.split(/\s+/).length;
        }, 0);
        
        const processedSentences = this.state.finalizedSentences.filter(s => s.processed).length;
        
        return {
            totalSentences: this.state.finalizedSentences.length,
            totalWords: totalWords,
            processedSentences: processedSentences,
            pendingGeneration: this.cardGenerationQueue.length,
            sessionActive: this.state.sessionStarted
        };
    }
}

// Export to window
window.TranscriptSystem = TranscriptSystem;