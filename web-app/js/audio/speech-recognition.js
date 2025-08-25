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
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.app.currentLang;
        
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
        
        console.log('[Speech] Starting speech recognition...');
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
    }
    
    handleSpeechResult(event) {
        let final = '';
        let interim = '';
        
        // Process speech results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            
            if (result.isFinal) {
                final += text + ' ';
            } else {
                interim = text;
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
            // Handle final text
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
    
    processCompleteSentence(sentence) {
        console.log('[Speech] Processing sentence:', sentence);
        
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
        if (!this.app.els.transcript) return;
        
        // Combine final transcript with interim results
        const displayText = this.app.transcript + this.app.currentInterim;
        
        if (displayText.trim()) {
            this.app.els.transcript.innerHTML = `
                <div class="transcript-rows">
                    <div class="transcript-row current">${displayText}</div>
                </div>
            `;
        }
    }
}

window.SpeechRecognitionManager = SpeechRecognitionManager;