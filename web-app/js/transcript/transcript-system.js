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
        
        // Core state
        this.state = {
            currentMode: 'auto', // 'auto' | 'manual'
            selectedLanguage: 'en-US',
            transcriptBuffer: [], // Final sentences with metadata
            interimText: '',
            finalizedSentences: [],
            lastLanguageDetection: null,
            pendingSentence: '',
            sessionStarted: false
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
        console.log('📝 [TranscriptSystem] Initializing unified transcript system');
        
        // Setup UI components
        this.ui.initialize();
        this.animations.initialize();
        this.languageManager.initialize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize with default language
        this.languageManager.setMode('auto');
        
        console.log('✅ [TranscriptSystem] Transcript system ready');
        
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
        
        console.log(`📝 [TranscriptSystem] ========== INCOMING SPEECH (LEGACY) ==========`);
        console.log(`📝 [TranscriptSystem] Final: ${isFinal}, Text: "${transcript}", Confidence: ${confidence}`);
        console.log(`📝 [TranscriptSystem] Session started: ${this.state.sessionStarted}`);
        
        if (!this.state.sessionStarted) {
            console.log(`📝 [TranscriptSystem] ❌ Session not started, ignoring speech`);
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
        console.log(`🎯 [TranscriptSystem] ========== INCOMING WHISPER DATA ==========`);
        console.log(`🎯 [TranscriptSystem] Text length: ${transcriptionData.text?.length || 0}`);
        console.log(`🎯 [TranscriptSystem] Language: ${transcriptionData.language}`);
        console.log(`🎯 [TranscriptSystem] Words: ${transcriptionData.words?.length || 0}`);
        console.log(`🎯 [TranscriptSystem] Segments: ${transcriptionData.segments?.length || 0}`);
        console.log(`🎯 [TranscriptSystem] Educational: ${transcriptionData.metadata?.educational !== false}`);
        
        if (!this.state.sessionStarted) {
            console.log(`🎯 [TranscriptSystem] ❌ Session not started, ignoring transcription`);
            return;
        }
        
        if (!transcriptionData.text || transcriptionData.text.trim().length === 0) {
            console.log(`🎯 [TranscriptSystem] ❌ Empty transcription, ignoring`);
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
            console.error(`❌ [TranscriptSystem] Failed to process Whisper transcription:`, error);
        }
    }
    
    /**
     * Handle individual Whisper segment
     */
    async handleWhisperSegment(segment, transcriptionData) {
        const segmentText = segment.text?.trim();
        if (!segmentText || segmentText.length < 5) {
            console.log(`🎯 [TranscriptSystem] Skipping short segment: "${segmentText}"`);
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
        if (sentence.whisperData.educational && this.isWorthyOfCard(segmentText)) {
            this.queueCardGeneration(sentence);
        } else {
            console.log(`⏭️ [TranscriptSystem] Skipping card generation - educational: ${sentence.whisperData.educational}, worthy: ${this.isWorthyOfCard(segmentText)}`);
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
     * Handle finalized speech text
     */
    handleFinalText(text) {
        if (!text || text.trim().length === 0) return;
        
        const trimmedText = text.trim();
        console.log(`✅ [TranscriptSystem] Final text: "${trimmedText.substring(0, 50)}..."`);
        
        // Detect language for this text
        const languageDetection = this.detectLanguage(trimmedText);
        
        // Create sentence record
        const sentence = {
            text: trimmedText,
            timestamp: Date.now(),
            language: languageDetection,
            processed: false
        };
        
        // Add to finalized sentences
        this.state.finalizedSentences.push(sentence);
        this.state.transcriptBuffer.push(sentence);
        
        // Update language indicator if in auto mode
        if (this.state.currentMode === 'auto' && languageDetection.confidence > 70) {
            this.languageManager.updateDetectedLanguage(languageDetection);
        }
        
        // Update UI with wobble animation
        this.ui.addFinalSentence(sentence);
        this.animations.triggerWobble();
        
        // Check for card generation (with debouncing)
        this.queueCardGeneration(sentence);
        
        // Clear interim text
        this.state.interimText = '';
        this.ui.clearInterimText();
        
        // Manage buffer size (keep last 50 sentences)
        if (this.state.transcriptBuffer.length > 50) {
            this.state.transcriptBuffer = this.state.transcriptBuffer.slice(-50);
        }
    }
    
    /**
     * Handle interim speech text (still being recognized)
     */
    handleInterimText(text) {
        if (text === this.state.interimText) return; // No change
        
        console.log(`🔄 [TranscriptSystem] Interim: "${text.substring(0, 30)}..."`);
        
        this.state.interimText = text;
        
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
        
        console.log(`🎯 [TranscriptSystem] Queuing for card generation: "${sentence.text.substring(0, 30)}..."`);
        
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
                console.error(`❌ [TranscriptSystem] Card generation failed:`, error);
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
            console.error('❌ [TranscriptSystem] CardEngine not available');
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
            console.log(`✅ [TranscriptSystem] Educational content detected`);
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
            console.log(`✅ [TranscriptSystem] Complex structure detected`);
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
     * Start transcript session
     */
    startSession() {
        console.log('🚀 [TranscriptSystem] Starting transcript session');
        
        this.state.sessionStarted = true;
        this.state.transcriptBuffer = [];
        this.state.finalizedSentences = [];
        this.state.interimText = '';
        
        // Trigger fade-in animation
        this.animations.fadeInTranscript();
        
        // Show initial state
        this.ui.showListeningState();
    }
    
    /**
     * Stop transcript session
     */
    stopSession() {
        console.log('🛑 [TranscriptSystem] Stopping transcript session');
        
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