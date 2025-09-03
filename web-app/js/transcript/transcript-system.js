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
            maxSegmentDuration: this.app.settings?.rhythmSegmentDuration || 12000, // Default 12 seconds - allow complete sentences
            recentlyStopped: false  // Grace period flag for final text
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
        
        // Add comprehensive test functions for console testing
        // Create test object and attach to both window and the transcript system
        const transcriptTests = {
            // Quick test with a few segments
            quick: () => {
                console.log('🧪 Running quick transcript test...');
                if (!this.state.sessionStarted) {
                    this.startSession();
                }
                
                const phrases = [
                    'Testing the transcript system with some initial text',
                    'Machine learning is a subset of artificial intelligence',
                    'Neural networks process information through layers',
                    'This should create visible segments in the transcript window'
                ];
                
                phrases.forEach((phrase, i) => {
                    setTimeout(() => {
                        this.processIncomingSpeech({
                            isFinal: true,
                            transcript: phrase,
                            confidence: 0.85 + Math.random() * 0.15
                        });
                        console.log(`✓ Added: "${phrase.substring(0, 40)}..."`);;
                    }, i * 500);
                });
                
                console.log('🧪 Quick test started - segments will appear over 2 seconds');
                return 'Test running...';
            },
            
            // Test history retention with many segments
            history: () => {
                console.log('🧪 Testing history retention (50 segments)...');
                if (!this.state.sessionStarted) {
                    this.startSession();
                }
                
                const templates = [
                    'Understanding {}',
                    '{} is a key concept',
                    'The {} algorithm works by',
                    'In practice, {} means',
                    'Applications of {} include'
                ];
                
                const topics = [
                    'machine learning', 'neural networks', 'gradient descent',
                    'backpropagation', 'convolution', 'transformers', 'attention',
                    'embeddings', 'optimization', 'regularization'
                ];
                
                // Keep session active during the test
                const keepAlive = setInterval(() => {
                    if (this.state.sessionStarted) {
                        console.log('🔄 Keeping session alive during test...');
                    }
                }, 1000);
                
                for (let i = 0; i < 50; i++) {
                    const template = templates[i % templates.length];
                    const topic = topics[i % topics.length];
                    const text = template.replace('{}', topic) + ` [Segment ${i + 1}]`;
                    
                    setTimeout(() => {
                        // Ensure session stays active
                        if (!this.state.sessionStarted) {
                            console.log('⚠️ Session stopped - restarting...');
                            this.startSession();
                        }
                        
                        this.processIncomingSpeech({
                            isFinal: true,
                            transcript: text,
                            confidence: 0.9
                        });
                        if (i % 10 === 0) {
                            console.log(`📝 Added ${i + 1}/50 segments...`);
                        }
                        
                        // Clear keep-alive after last segment
                        if (i === 49) {
                            clearInterval(keepAlive);
                            console.log('✅ History test complete - segments should remain visible');
                        }
                    }, i * 100);
                }
                
                console.log('🧪 History test started - 50 segments over 5 seconds');
                return 'Adding 50 segments...';
            },
            
            // Test realistic speech with interim updates
            realistic: () => {
                console.log('🧪 Simulating realistic speech patterns...');
                if (!this.state.sessionStarted) {
                    this.startSession();
                }
                
                const speechFlow = [
                    { type: 'interim', text: 'So today', delay: 300 },
                    { type: 'interim', text: 'So today we are', delay: 300 },
                    { type: 'interim', text: 'So today we are going to discuss', delay: 400 },
                    { type: 'interim', text: 'So today we are going to discuss how', delay: 300 },
                    { type: 'final', text: 'So today we are going to discuss how machine learning works in production environments.', delay: 800 },
                    
                    { type: 'interim', text: 'The key', delay: 400 },
                    { type: 'interim', text: 'The key difference', delay: 300 },
                    { type: 'interim', text: 'The key difference between', delay: 300 },
                    { type: 'interim', text: 'The key difference between development and production', delay: 400 },
                    { type: 'final', text: 'The key difference between development and production is scale and reliability requirements.', delay: 1000 },
                    
                    { type: 'interim', text: 'You need', delay: 300 },
                    { type: 'interim', text: 'You need to consider', delay: 400 },
                    { type: 'interim', text: 'You need to consider things like', delay: 400 },
                    { type: 'final', text: 'You need to consider things like monitoring, versioning, and rollback strategies.', delay: 800 }
                ];
                
                let totalDelay = 0;
                speechFlow.forEach(item => {
                    totalDelay += item.delay;
                    setTimeout(() => {
                        this.processIncomingSpeech({
                            isFinal: item.type === 'final',
                            transcript: item.text,
                            confidence: item.type === 'final' ? 0.9 : 0.5
                        });
                        console.log(`${item.type === 'final' ? '✓' : '◌'} ${item.type}: "${item.text.substring(0, 40)}..."`);;
                    }, totalDelay);
                });
                
                console.log(`🧪 Realistic speech test started - ${totalDelay/1000}s total`);
                return 'Simulating natural speech...';
            },
            
            // Test pending line animation
            pendingLine: () => {
                console.log('🧪 Testing pending line animation...');
                if (!this.state.sessionStarted) {
                    this.startSession();
                }
                
                // Force start a new segment to see the line
                if (this.ui) {
                    this.ui.startNewSegment();
                    console.log('✓ Pending line started - watch for 5 second growth from center');
                    console.log('  The line should grow symmetrically from center outward');
                    console.log('  After 5 seconds, it will finalize or fade');
                    
                    // Add some text after 3 seconds
                    setTimeout(() => {
                        this.processIncomingSpeech({
                            isFinal: false,
                            transcript: 'Speaking while the line animates...',
                            confidence: 0.5
                        });
                    }, 3000);
                    
                    // Finalize after 6 seconds
                    setTimeout(() => {
                        this.processIncomingSpeech({
                            isFinal: true,
                            transcript: 'This text appears when the line completes its animation cycle.',
                            confidence: 0.9
                        });
                    }, 6000);
                }
                
                return 'Pending line animation started...';
            },
            
            // Clear all segments
            clear: () => {
                console.log('🧹 Clearing transcript...');
                if (this.ui && this.ui.finalizedSegmentsContainer) {
                    this.ui.finalizedSegmentsContainer.innerHTML = '';
                    this.ui.finalizedSegments = [];
                    this.state.finalizedSentences = [];
                    this.state.transcriptBuffer = [];
                    console.log('✓ Transcript cleared');
                }
                return 'Cleared';
            },
            
            // Get current stats
            stats: () => {
                const stats = this.getSessionStats();
                console.log('📊 Transcript Statistics:');
                console.log(`  • Session Active: ${stats.sessionActive}`);
                console.log(`  • Total Sentences: ${stats.totalSentences}`);
                console.log(`  • Total Words: ${stats.totalWords}`);
                console.log(`  • Visible Segments: ${this.ui?.finalizedSegments?.length || 0}`);
                console.log(`  • Pending Generation: ${stats.pendingGeneration}`);
                return stats;
            },
            
            // Help message
            help: () => {
                console.log('📚 Transcript Test Commands:');
                console.log('  testTranscript.quick()     - Add a few test segments');
                console.log('  testTranscript.history()   - Test with 50 segments (history retention)');
                console.log('  testTranscript.realistic() - Simulate natural speech with interim text');
                console.log('  testTranscript.pendingLine() - Test the pending line animation');
                console.log('  testTranscript.clear()     - Clear all transcript segments');
                console.log('  testTranscript.stats()     - Show current statistics');
                console.log('  testTranscript.help()      - Show this help message');
                return 'Commands listed above';
            }
        };
        
        // Expose test functions in multiple ways to avoid conflicts
        window.tt = transcriptTests;  // Short alias for easy console access
        window.transcriptTests = transcriptTests;  // Full name
        this.tests = transcriptTests;  // Attached to transcript system
        
        // Also keep the simple version for backward compatibility
        window.testTranscriptSystem = transcriptTests.quick;
        
        // Log availability
        console.log('📚 Transcript tests loaded! Use any of these:');
        console.log('  tt.quick()     - Quick test');
        console.log('  tt.history()   - History retention test');
        console.log('  tt.realistic() - Realistic speech');
        console.log('  tt.help()      - Show all commands');
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
        
        console.log(`🔥 [TranscriptSystem] ========== INCOMING SPEECH ==========`);
        console.log(`🔥 [TranscriptSystem] Final: ${isFinal}, Text: "${transcript}", Confidence: ${confidence}`);
        console.log(`🔥 [TranscriptSystem] Session started: ${this.state.sessionStarted}`);
        
        // AUTO-START SESSION if not started
        if (!this.state.sessionStarted) {
            console.log(`🚨 [TranscriptSystem] Session not started - AUTO-STARTING NOW!`);
            this.startSession();
        }
        
        if (isFinal) {
            this.handleFinalText(transcript);
        } else {
            this.handleInterimText(transcript);
        }
    }
    
    /**
     * Handle final text that arrives after session stops (grace period)
     */
    handleFinalTextAfterStop(text) {
        if (!text || text.trim().length === 0) return;
        
        const trimmedText = text.trim();
        console.log(` [TranscriptSystem] Processing late final text: "${trimmedText.substring(0, 50)}..."`);
        
        // Create a finalized segment directly without going through the full rhythm system
        const segment = {
            text: trimmedText,
            duration: 1000, // Default duration for late arrivals
            timestamp: new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            }),
            cardCreated: false
        };
        
        // Add to UI
        this.ui.addFinalizedSegment(segment);
        
        // Still generate card if educational
        this.queueCardGeneration(trimmedText);
        
        console.log(` [TranscriptSystem] Late final text processed and added to history`);
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
     * PRIORITY: Natural speech boundaries override timer boundaries
     */
    handleFinalText(text) {
        if (!text || text.trim().length === 0) return;
        
        const trimmedText = text.trim();
        console.log(`📝 [TRANSCRIPT] ========== FINAL TEXT RECEIVED ==========`);
        console.log(`📝 [TRANSCRIPT] Text: "${trimmedText}"`);
        console.log(`📝 [TRANSCRIPT] Length: ${trimmedText.length} characters`);
        
        // SIMPLIFIED APPROACH: Every final text becomes a visible segment immediately
        // No complex rhythm system, no timers, just direct display
        
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Create segment data
        const segment = {
            text: trimmedText,
            timestamp: timestamp,
            duration: 1000, // Default duration
            isFinalized: true,
            id: `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        console.log(`📝 [TRANSCRIPT] Creating segment with ID: ${segment.id}`);
        
        // Add directly to UI - this is the ONLY path for segments
        if (this.ui && this.ui.addFinalizedSegment) {
            console.log(`📝 [TRANSCRIPT] Adding segment to UI`);
            this.ui.addFinalizedSegment(segment);
        } else {
            console.error(`❌ [TRANSCRIPT] UI not available to display segment!`);
        }
        
        // Also queue for card generation if worthy
        if (this.isTextWorthyOfCard(trimmedText)) {
            console.log(`🎴 [TRANSCRIPT] Text worthy of card - queuing`);
            this.queueCardGeneration(segment);
        }
        
        // Clear interim text
        this.state.interimText = '';
        if (this.ui) {
            this.ui.clearInterimText();
        }
        
        console.log(`📝 [TRANSCRIPT] ========== SEGMENT PROCESSED ==========`);
    }
    
    /**
     * Process large text blocks by chunking them into sentences
     */
    processLargeTextBlock(text) {
        console.log(`📦 [RhythmSegment] Processing large text block: ${text.length} characters`);
        
        // Split text into sentences (improved regex for better sentence detection)
        const sentenceRegex = /[^.!?]+[.!?]+/g;
        let sentences = text.match(sentenceRegex) || [];
        
        // If no sentences found with punctuation, split by common conjunctions or length
        if (sentences.length === 0) {
            console.log(`📦 [RhythmSegment] No sentence punctuation found - splitting by phrases`);
            // Split by common conjunctions and phrase boundaries
            sentences = text.split(/(?:and|but|however|therefore|although|because|while|when|if|that|which|where|after|before|then|thus)/i)
                .filter(s => s.trim().length > 0)
                .map(s => s.trim());
            
            // If still too large, force split by character count
            if (sentences.length === 0 || sentences.some(s => s.length > 200)) {
                console.log(`📦 [RhythmSegment] Force-splitting by character count`);
                sentences = [];
                let currentChunk = '';
                const words = text.split(/\s+/);
                
                for (const word of words) {
                    if ((currentChunk + ' ' + word).length > 150) {
                        if (currentChunk) sentences.push(currentChunk.trim());
                        currentChunk = word;
                    } else {
                        currentChunk += (currentChunk ? ' ' : '') + word;
                    }
                }
                if (currentChunk) sentences.push(currentChunk.trim());
            }
        }
        
        console.log(`📦 [RhythmSegment] Split into ${sentences.length} chunks`);
        
        // Process each sentence as a separate segment with staggered timing
        sentences.forEach((sentence, index) => {
            const cleanSentence = sentence.trim();
            if (cleanSentence.length < 5) return; // Skip very short fragments
            
            // Add slight delay between segments for visual separation
            setTimeout(() => {
                console.log(`📦 [RhythmSegment] Processing chunk ${index + 1}/${sentences.length}: "${cleanSentence.substring(0, 50)}..."`);
                
                // Estimate duration based on text length (roughly 150 words per minute)
                const wordCount = cleanSentence.split(/\s+/).length;
                const estimatedDuration = Math.max(1000, Math.min(5000, wordCount * 400)); // 400ms per word, capped 1-5s
                
                // Finalize this chunk as a segment
                this.finalizeRhythmSegment(cleanSentence, estimatedDuration);
            }, index * 200); // 200ms delay between each segment for visual effect
        });
        
        // Start new segment for future speech after processing all chunks
        setTimeout(() => {
            this.startNewSegment();
        }, sentences.length * 200 + 100);
    }
    
    /**
     * Handle interim speech text (still being recognized)
     */
    handleInterimText(text) {
        if (text === this.state.interimText) return; // No change
        
        console.log(`📝 [TranscriptSystem] Interim: "${text.substring(0, 50)}..."`);
        
        // Store full text in state
        this.state.interimText = text;
        
        // Accumulate text in current rhythm segment
        if (this.state.currentSegmentStart) {
            this.state.currentSegmentText = text;
            console.log(`📝 [TranscriptSystem] Updated segment text with interim: "${text.substring(0, 30)}..."`);
        } else {
            console.log(`⚠️ [TranscriptSystem] No active segment - starting one for interim text`);
            this.startNewSegment();
            this.state.currentSegmentText = text;
        }
        
        // For display, limit length to prevent UI overflow
        const maxInterimLength = 200;
        let displayText = text;
        if (text.length > maxInterimLength) {
            displayText = '...' + text.substring(text.length - maxInterimLength);
            console.log(`📝 [TranscriptSystem] Truncating display to last ${maxInterimLength} chars`);
        }
        
        // Update UI with flip animation (using display text)
        this.ui.updateInterimText(displayText);
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
        // DISABLED: Using direct segment creation from final text
        // No timers, no rhythm segments - just direct display
        console.log('🎵 [RhythmSegment] DISABLED - segments created directly');
        return;
    }
    
    /**
     * Force current segment to end (rhythm timer expired)
     */
    forceSegmentEnd() {
        console.log('⏰ [RhythmSegment] Timer expired - checking for content to finalize');
        console.log(`⏰ [RhythmSegment] Current segment text: "${this.state.currentSegmentText}"`);
        console.log(`⏰ [RhythmSegment] Interim text: "${this.state.interimText}"`);
        
        // Use interim text if current segment text is empty
        const textToFinalize = this.state.currentSegmentText.trim() || this.state.interimText.trim();
        
        if (!this.state.currentSegmentStart || !textToFinalize) {
            console.log('🎵 [RhythmSegment] No active segment or text to force end');
            // Still start a new segment to keep the rhythm going
            this.startNewSegment();
            return;
        }
        
        const segmentDuration = Date.now() - this.state.currentSegmentStart;
        
        console.log(`🎵 [RhythmSegment] Force-ending segment after ${segmentDuration}ms: "${textToFinalize.substring(0, 30)}..."`);
        
        // Finalize this segment with either current segment text or interim text
        this.finalizeRhythmSegment(textToFinalize, segmentDuration);
        
        // Clear both segment and interim text
        this.state.currentSegmentText = '';
        this.state.interimText = '';
        this.ui.clearInterimText();
        
        // Start new segment for continuing speech
        this.startNewSegment();
    }
    
    /**
     * Finalize a rhythm-based segment
     */
    finalizeRhythmSegment(text, duration) {
        console.log(`🎵 [RhythmSegment] ========== FINALIZING SEGMENT ==========`);
        console.log(`🎵 [RhythmSegment] Text: "${text}"`);
        console.log(`🎵 [RhythmSegment] Duration: ${duration}ms`);
        console.log(`🎵 [RhythmSegment] UI available: ${!!this.ui}`);
        console.log(`🎵 [RhythmSegment] UI.addRhythmSegment available: ${!!this.ui?.addRhythmSegment}`);
        
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
        if (this.languageManager) {
            this.languageManager.updateDetectedLanguage(languageDetection);
        }
        
        // Update UI with rhythm segment - THIS IS CRITICAL FOR DISPLAY
        if (this.ui && this.ui.addRhythmSegment) {
            console.log(`🎵 [RhythmSegment] Calling UI.addRhythmSegment with segment:`, segment);
            this.ui.addRhythmSegment(segment);
        } else {
            console.error(`❌ [RhythmSegment] UI or addRhythmSegment not available!`);
        }
        
        // Trigger animation if available
        if (this.animations) {
            this.animations.triggerWobble();
        }
        
        // Check for card generation on shorter segments
        this.queueCardGeneration(segment);
        
        // Clear the segment timer
        if (this.state.segmentTimer) {
            clearTimeout(this.state.segmentTimer);
            this.state.segmentTimer = null;
        }
        
        console.log(`🎵 [RhythmSegment] ========== SEGMENT FINALIZED ==========`);
    }
    
    /**
     * Start transcript session
     */
    startSession() {
        console.log('🚀 [TranscriptSystem] Starting transcript session');
        console.log('🚀 [TranscriptSystem] Previous session state:', this.state.sessionStarted);
        console.log('🚀 [TranscriptSystem] UI available:', !!this.ui);
        console.log('🚀 [TranscriptSystem] UI finalizedSegmentsContainer:', !!this.ui?.finalizedSegmentsContainer);
        
        this.state.sessionStarted = true;
        
        // SIMPLIFIED: No rhythm segments, just direct transcript processing
        console.log('🚀 [TranscriptSystem] Session started - ready for speech');
        
        // Clear state
        this.state.transcriptBuffer = [];
        this.state.finalizedSentences = [];
        this.state.interimText = '';
        
        // Trigger fade-in animation
        if (this.animations) {
            this.animations.fadeInTranscript();
        }
        
        // Show initial state
        if (this.ui) {
            this.ui.showListeningState();
        }
        
        console.log('🚀 [TranscriptSystem] Session ready');
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
        
        // Set grace period flag for 2 seconds to catch final speech results
        this.state.recentlyStopped = true;
        setTimeout(() => {
            this.state.recentlyStopped = false;
            console.log(' [TranscriptSystem] Grace period expired');
        }, 2000);
        
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