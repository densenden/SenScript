/**
 * Speech Recognition Module
 * Handles Web Speech API integration
 */

class SpeechRecognitionManager {
    constructor(app) {
        this.app = app;
        this.recognition = null;
        this.isListening = false;
        this.shouldBeListening = false;
        this.backgroundListening = false;
        this.transcriptCache = [];
        this.cacheTimeout = 10000; // 10 seconds
        this.restartPending = false;
        this.isTabInactive = false;
        
        this.setupSpeechRecognition();
        this.setupTabFocusHandlers();
    }
    
    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('[Speech] Speech recognition not supported');
            return;
        }
        
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognitionAPI();
        
        // Configure recognition for maximum stability
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.app.currentLang;
        
        // Add audio context for better stability
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.setupAudioContext();
        }
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('[Speech] Recognition started');
            this.isListening = true;
            this.updateUI();
        };
        
        this.recognition.onend = () => {
            console.log('[Speech] Recognition ended');
            this.isListening = false;
            
            // Only restart if we're truly meant to be listening (not background)
            if (this.shouldBeListening && !this.restartPending) {
                this.restartPending = true;
                setTimeout(() => {
                    this.restartPending = false;
                    if (this.shouldBeListening && !this.isListening) {
                        console.log('[Speech] Auto-restarting recognition');
                        try {
                            this.recognition.start();
                        } catch (error) {
                            console.log('[Speech] Auto-restart failed:', error);
                        }
                    }
                }, 500);
            }
            this.updateUI();
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[Speech] Recognition error:', event.error);
            
            // Handle specific error types
            if (event.error === 'aborted') {
                console.log('[Speech] Recognition aborted - likely tab switch or page blur');
                // Don't restart if manually stopped
                if (this.shouldBeListening && !this.isTabInactive) {
                    setTimeout(() => {
                        if (this.shouldBeListening) {
                            console.log('[Speech] Restarting after abort');
                            try {
                                this.recognition.start();
                            } catch (error) {
                                console.log('[Speech] Restart after abort failed:', error);
                            }
                        }
                    }, 1000);
                }
            } else {
                this.handleRecognitionError(event);
            }
        };
        
        console.log('[Speech] Speech recognition initialized');
    }
    
    setupAudioContext() {
        try {
            // Create audio context for better audio processing
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('[Speech] Audio context created for enhanced stability');
            
            // Request microphone permissions and setup audio processing
            navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                } 
            })
            .then(stream => {
                console.log('[Speech] Microphone stream acquired with enhanced settings');
                this.mediaStream = stream;
                
                // Create audio processing nodes for better signal quality
                this.source = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 2048;
                this.analyser.smoothingTimeConstant = 0.8;
                
                // Connect nodes for audio processing
                this.source.connect(this.analyser);
                
                console.log('[Speech] Audio processing pipeline established');
            })
            .catch(error => {
                console.warn('[Speech] Microphone permission denied or unavailable:', error);
                // Fallback to basic speech recognition without audio context
            });
            
        } catch (error) {
            console.warn('[Speech] Audio context creation failed:', error);
            // Continue without audio context - basic recognition will still work
        }
    }
    
    setupTabFocusHandlers() {
        // Handle page visibility changes (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('[Speech] Tab became inactive');
                this.isTabInactive = true;
            } else {
                console.log('[Speech] Tab became active');
                this.isTabInactive = false;
                
                // Restart recognition if we should be listening
                if (this.shouldBeListening && !this.isListening) {
                    setTimeout(() => {
                        if (this.shouldBeListening && !this.isListening) {
                            console.log('[Speech] Restarting after tab focus');
                            try {
                                this.recognition.start();
                            } catch (error) {
                                console.log('[Speech] Restart after focus failed:', error);
                            }
                        }
                    }, 500);
                }
            }
        });
    }
    
    startListening() {
        if (!this.recognition) {
            console.error('[Speech] No recognition available');
            return;
        }
        
        // Prevent multiple starts
        if (this.shouldBeListening || this.isListening) {
            console.log('[Speech] Already listening or starting');
            return;
        }
        
        console.log('[Speech] === STARTING ACTIVE LISTENING ===');
        console.log('[Speech] Web Speech API will use the audio source set by the audio system');
        console.log('[Speech] Microphone mode: direct mic input | Device Output mode: system/tab audio');
        this.shouldBeListening = true;
        
        // Process cached transcripts immediately for instant flashcards
        if (this.transcriptCache.length > 0) {
            console.log(`[Speech] Processing ${this.transcriptCache.length} cached transcripts`);
            setTimeout(() => {
                for (const entry of this.transcriptCache) {
                    if (entry.isFinal) {
                        this.processCompleteSentence(entry.text);
                    }
                }
            }, 100);
        }
        
        try {
            this.recognition.start();
            this.app.startMinuteCounting();
        } catch (error) {
            console.error('[Speech] Failed to start recognition:', error);
            this.shouldBeListening = false;
        }
        
        this.updateUI();
    }
    
    startBackgroundListening() {
        // Start listening in background to cache transcript
        if (!this.backgroundListening) {
            console.log('[Speech] Starting background listening with 10-second cache');
            this.backgroundListening = true;
            this.transcriptCache = [];
            
            // Start recognition silently if not already listening
            if (this.recognition && !this.isListening && !this.shouldBeListening) {
                try {
                    this.recognition.start();
                } catch (error) {
                    console.log('[Speech] Background listening already active');
                }
            }
        }
    }
    
    stopBackgroundListening() {
        if (this.backgroundListening) {
            console.log('[Speech] Stopping background listening');
            this.backgroundListening = false;
            if (!this.shouldBeListening && this.isListening) {
                this.recognition.stop();
            }
        }
    }
    
    stopListening() {
        console.log('[Speech] Stopping speech recognition...');
        this.shouldBeListening = false;
        this.restartPending = false;
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('[Speech] Error stopping recognition:', error);
            }
        }
        
        // Stop minute counting
        if (this.app.stopMinuteCounting) {
            this.app.stopMinuteCounting();
        }
        
        this.updateUI();
        
        // Clean up audio resources when stopping
        this.cleanupAudioResources();
    }
    
    cleanupAudioResources() {
        try {
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('[Speech] Audio track stopped');
                });
                this.mediaStream = null;
            }
            
            if (this.source) {
                this.source.disconnect();
                this.source = null;
            }
            
            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }
            
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
                console.log('[Speech] Audio context closed');
            }
        } catch (error) {
            console.warn('[Speech] Error cleaning up audio resources:', error);
        }
    }
    
    handleSpeechResult(event) {
        let final = '';
        let interim = '';
        
        console.log('[Speech] Processing speech result - resultIndex:', event.resultIndex, 'results.length:', event.results.length);
        
        // Process speech results with enhanced logging
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript.trim();
            const confidence = result[0].confidence || 0.5;
            
            console.log(`[Speech] Result ${i}: "${text}" (final: ${result.isFinal}, confidence: ${confidence.toFixed(2)})`);
            
            if (result.isFinal && text.length > 0) {
                final += text + ' ';
                console.log('[Speech] Added to final transcript:', text);
            } else if (!result.isFinal && text.length > 0) {
                interim = text;
                console.log('[Speech] Updated interim result:', text);
            }
        }
        
        // Cache transcript if background listening
        if (this.backgroundListening && (final || interim)) {
            const text = final.trim() || interim;
            if (text) {
                const cacheEntry = {
                    text: text,
                    timestamp: Date.now(),
                    isFinal: !!final.trim()
                };
                
                this.transcriptCache.push(cacheEntry);
                
                // Remove old entries beyond 10 seconds
                const cutoffTime = Date.now() - this.cacheTimeout;
                this.transcriptCache = this.transcriptCache.filter(
                    entry => entry.timestamp > cutoffTime
                );
                
                if (final.trim()) {
                    console.log(`[Speech] Cached final: "${text.substring(0, 50)}..." (${this.transcriptCache.length} entries)`);
                }
            }
        }
        
        // Only process and display if actively listening (not just background)
        if (this.shouldBeListening) {
            // Use new unified transcript system if available
            if (this.app.transcriptSystem) {
                // Handle final text
                if (final.trim()) {
                    this.app.transcriptSystem.processIncomingSpeech({
                        isFinal: true,
                        transcript: final.trim(),
                        confidence: 0.85 // Default confidence
                    });
                }
                
                // Handle interim text
                if (interim) {
                    this.app.transcriptSystem.processIncomingSpeech({
                        isFinal: false,
                        transcript: interim,
                        confidence: 0.5 // Lower confidence for interim
                    });
                }
            } else {
                // Fallback to old system
                if (final.trim()) {
                    this.app.pendingSentence += final;
                    this.app.transcript += final;
                    this.processCompleteSentence(final.trim());
                }
                
                // Update UI with interim results
                this.app.currentInterim = interim;
                this.updateTranscriptDisplay();
            }
        }
    }
    
    processCompleteSentence(sentence) {
        console.log('[Speech] Processing sentence:', sentence);
        
        // Use the new transcript processor if available (much more sophisticated)
        if (this.app.transcriptProcessor) {
            console.log('[Speech] Using new TranscriptProcessor for sentence processing');
            this.app.transcriptProcessor.processTranscriptUpdate(sentence);
        } else {
            // Fallback to old system
            console.log('[Speech] Using fallback processing - TranscriptProcessor not available');
            
            // Detect language and update UI if AUTO mode is enabled
            if (this.app.settings && this.app.settings.autoLanguage && window.LanguageDetection) {
                const detection = window.LanguageDetection.detectLanguage(sentence);
                if (detection.confidence > 2) { // Minimum confidence threshold
                    this.updateLanguageIndicator(detection.lang, detection.flag);
                }
            }
            
            // Pass to card engine for potential card generation
            if (this.app.cardEngine) {
                this.app.cardEngine.processText(sentence);
            }
        }
    }
    
    updateLanguageIndicator(lang, flag) {
        // Only update if different from current
        if (this.app.detectedLanguage === lang) return;
        
        this.app.detectedLanguage = lang;
        const languageFlag = document.getElementById('languageFlag');
        const languageText = document.getElementById('languageText');
        
        if (languageFlag) languageFlag.textContent = flag;
        if (languageText) {
            const langName = lang === 'de-DE' ? 'DE' : lang === 'fr-FR' ? 'FR' : 'EN';
            languageText.textContent = langName;
        }
        
        console.log(`[Speech] Language detected: ${lang} ${flag}`);
    }
    
    handleRecognitionError(event) {
        console.error('[Speech] Recognition error:', event.error);
        
        if (event.error === 'no-speech') {
            // No speech detected, try to restart
            if (this.shouldBeListening) {
                setTimeout(() => this.startListening(), 1000);
            }
        } else if (event.error === 'audio-capture') {
            console.error('[Speech] Audio capture failed - check microphone permissions');
        }
    }
    
    updateUI() {
        // Update record button state
        if (this.app.els.recordBtn) {
            if (this.isListening) {
                this.app.els.recordBtn.classList.add('listening');
                this.app.els.recordText.textContent = 'Stop';
            } else {
                this.app.els.recordBtn.classList.remove('listening');
                this.app.els.recordText.textContent = 'Start';
            }
        }
        
        // Update record dot
        if (this.app.els.recordDot) {
            this.app.els.recordDot.classList.toggle('active', this.isListening);
        }
    }
    
    updateTranscriptDisplay() {
        console.log('[Speech] === UPDATING TRANSCRIPT DISPLAY ===');
        console.log('[Speech] Transcript element:', this.app.els.transcript);
        console.log('[Speech] Final transcript length:', this.app.transcript.length);
        console.log('[Speech] Final transcript:', `"${this.app.transcript.substring(0, 100)}..."`);
        console.log('[Speech] Current interim:', `"${this.app.currentInterim}"`);
        
        if (!this.app.els.transcript) {
            console.error('[Speech] ❌ Transcript element not found!');
            return;
        }
        
        // Combine final transcript with interim results
        const displayText = this.app.transcript + this.app.currentInterim;
        const wordCount = displayText.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        console.log('[Speech] Combined display text length:', displayText.length);
        console.log('[Speech] Word count:', wordCount);
        
        if (displayText.trim()) {
            // Enhanced display with word highlighting for interim results
            const finalPart = this.app.transcript;
            const interimPart = this.app.currentInterim;
            
            this.app.els.transcript.innerHTML = `
                <div class="transcript-rows">
                    <div class="transcript-row current">
                        <span class="final-text" style="color: rgba(255, 255, 255, 0.9);">${finalPart}</span>
                        <span class="interim-text" style="color: rgba(255, 255, 255, 0.6); font-style: italic;">${interimPart}</span>
                    </div>
                    <div class="transcript-stats" style="font-size: 10px; opacity: 0.5; margin-top: 8px;">
                        Words: ${wordCount} | Listening: ${this.isListening ? '✅' : '❌'}
                    </div>
                </div>
            `;
            console.log('[Speech] ✅ Enhanced transcript display updated - Words:', wordCount);
            
            // Auto-scroll to bottom to show latest content
            this.app.els.transcript.scrollTop = this.app.els.transcript.scrollHeight;
        } else {
            // Show helpful status when no content
            this.app.els.transcript.innerHTML = `
                <div class="transcript-rows">
                    <div class="transcript-row placeholder" style="color: rgba(255, 255, 255, 0.4); font-style: italic;">
                        ${this.isListening ? 'Listening for speech...' : 'Click Start to begin transcription'}
                    </div>
                </div>
            `;
            console.log('[Speech] ⚠️ No content to display - showing placeholder');
        }
    }
}

window.SpeechRecognitionManager = SpeechRecognitionManager;