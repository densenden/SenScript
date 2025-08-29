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
        
        // Add debug method to window
        window.debugSpeechRecognition = () => {
            this.debugCurrentAudioSetup();
        };
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
        
        // RESTORED: Based on working commit babbaf8
        // Web Speech API DOES work with system audio after getDisplayMedia permission
        console.log('[Speech] Web Speech API supports system audio in Chrome after getDisplayMedia');
        console.log('[Speech] Tab audio transcription should work when systemAudioReady=true');
        
        // Add audio context for better stability
        // Skip automatic setup - will be done when needed
        // This prevents double permission requests
        console.log('[Speech] Audio context setup deferred until needed');
        
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
    
    setupAudioContext(skipPermissionRequest = false) {
        try {
            // Create audio context for better audio processing
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('[Speech] Audio context created for enhanced stability');
            
            // Skip permission request if already handled by audio system
            if (skipPermissionRequest) {
                console.log('[Speech] Skipping getUserMedia - handled by audio system');
                return;
            }
            
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
        this.shouldBeListening = true;
        
        // Check audio source mode
        const audioSource = this.app.audioSystem?.currentAudioSource || 'microphone';
        console.log(`[Speech] Audio source: ${audioSource}`);
        
        if (audioSource === 'system') {
            console.log('[Speech] SYSTEM AUDIO MODE - Web Speech API cannot directly use system audio');
            console.log('[Speech] Attempting to set up system audio processing...');
            this.startSystemAudioProcessing();
        } else {
            console.log('[Speech] MICROPHONE MODE - Using Web Speech API directly');
            this.startMicrophoneProcessing();
        }
        
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
        
        this.updateUI();
    }
    
    startMicrophoneProcessing() {
        console.log('[Speech] Starting microphone processing with Web Speech API');
        try {
            this.recognition.start();
            this.app.startMinuteCounting();
            console.log('[Speech] Web Speech API started for microphone input');
        } catch (error) {
            console.error('[Speech] Failed to start microphone recognition:', error);
            this.shouldBeListening = false;
        }
    }
    
    startSystemAudioProcessing() {
        console.log('[Speech] === SYSTEM AUDIO PROCESSING ===');
        
        // Check if system audio stream is available
        const systemStream = this.app.audioSystem?.systemStream;
        if (!systemStream || !systemStream.active) {
            console.error('[Speech] No active system audio stream available');
            this.shouldBeListening = false;
            return;
        }
        
        console.log('[Speech] System stream available, setting up audio processing...');
        
        // CRITICAL FIX: Web Speech API cannot use system audio directly
        // We need to implement a workaround using Web Audio API or MediaRecorder
        
        try {
            // Method 1: Try to create a virtual microphone using Web Audio API
            this.setupSystemAudioBridge(systemStream);
        } catch (error) {
            console.error('[Speech] Failed to setup system audio bridge:', error);
            // Fallback: Show user that system audio transcription is not available
            console.log('[Speech] System audio transcription requires server-side processing');
            this.shouldBeListening = false;
            
            // Update UI to show limitation
            if (this.app.transcriptSystem?.ui) {
                this.app.transcriptSystem.ui.updatePlaceholder(
                    'System Audio Limitation',
                    'Web Speech API cannot process system audio directly. Switch to microphone mode for transcript generation.'
                );
            }
        }
    }
    
    setupSystemAudioBridge(systemStream) {
        console.log('[Speech] Setting up Web Audio API bridge for system audio');
        
        // TECHNICAL NOTE: This is a complex workaround
        // Web Speech API only works with getUserMedia streams, not getDisplayMedia
        // We attempt to create an audio context bridge, but this has limitations
        
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('Web Audio API not supported');
        }
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.systemAudioContext = new AudioContext();
        
        // Create source from system stream
        const source = this.systemAudioContext.createMediaStreamSource(systemStream);
        
        // Create destination for processing
        const destination = this.systemAudioContext.createMediaStreamDestination();
        
        // Connect source to destination
        source.connect(destination);
        
        // LIMITATION: We cannot force Web Speech API to use this destination stream
        // This is a known limitation of the Web Speech API
        console.warn('[Speech] LIMITATION: Cannot redirect system audio to Web Speech API');
        console.warn('[Speech] Web Speech API only accepts getUserMedia() streams');
        
        // Alternative: Start Web Speech API anyway (it will use microphone)
        // And show user the limitation
        console.log('[Speech] Starting Web Speech API with microphone as fallback');
        console.log('[Speech] NOTE: Transcript will come from microphone, not system audio');
        
        try {
            this.recognition.start();
            this.app.startMinuteCounting();
            
            // Inform user about limitation
            setTimeout(() => {
                if (this.app.transcriptSystem?.ui) {
                    this.app.transcriptSystem.ui.updatePlaceholder(
                        'System Audio + Microphone Mode',
                        'System audio visualization active, but transcript comes from microphone due to Web Speech API limitations.'
                    );
                }
            }, 1000);
            
        } catch (error) {
            console.error('[Speech] Failed to start recognition fallback:', error);
            this.shouldBeListening = false;
        }
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
            
            // Clean up system audio context
            if (this.systemAudioContext && this.systemAudioContext.state !== 'closed') {
                this.systemAudioContext.close();
                this.systemAudioContext = null;
                console.log('[Speech] System audio context closed');
            }
        } catch (error) {
            console.warn('[Speech] Error cleaning up audio resources:', error);
        }
    }
    
    handleSpeechResult(event) {
        let final = '';
        let interim = '';
        
        console.log('[Speech] ========== PROCESSING SPEECH RESULT ==========');
        console.log('[Speech] ResultIndex:', event.resultIndex, 'Results.length:', event.results.length);
        console.log('[Speech] Should be listening:', this.shouldBeListening);
        console.log('[Speech] Background listening:', this.backgroundListening);
        
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
            console.log('[Speech] No speech detected - this is normal, continuing...');
            // Don't restart immediately for no-speech - it's normal
            // Speech recognition will restart automatically via onend handler
        } else if (event.error === 'audio-capture') {
            console.error('[Speech] Audio capture failed - check microphone permissions');
            this.updateUI();
            // Show error in transcript
            if (this.app.transcriptSystem) {
                this.app.transcriptSystem.ui.showErrorState('Microphone access failed');
            }
        } else if (event.error === 'not-allowed') {
            console.error('[Speech] Microphone permission denied');
            this.shouldBeListening = false;
            this.updateUI();
            if (this.app.transcriptSystem) {
                this.app.transcriptSystem.ui.showErrorState('Microphone permission denied');
            }
        } else if (event.error === 'network') {
            console.error('[Speech] Network error - speech recognition unavailable');
            if (this.app.transcriptSystem) {
                this.app.transcriptSystem.ui.showErrorState('Speech recognition network error');
            }
        }
    }
    
    updateUI() {
        // Update record button state
        if (this.app.els.recordBtn) {
            if (this.isListening) {
                this.app.els.recordBtn.classList.add('listening');
            } else {
                this.app.els.recordBtn.classList.remove('listening');
            }
        }
        
        // Update record dot (main visual indicator)
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
                        <span class="interim-text" style="color: rgba(255, 255, 255, 0.6);">${interimPart}</span>
                    </div>
                    <div class="transcript-stats" style="font-size: 10px; opacity: 0.5; margin-top: 8px;">
                        Words: ${wordCount} | Listening: ${this.isListening ? 'Active' : 'Inactive'}
                    </div>
                </div>
            `;
            console.log('[Speech] Enhanced transcript display updated - Words:', wordCount);
            
            // Auto-scroll to bottom to show latest content
            this.app.els.transcript.scrollTop = this.app.els.transcript.scrollHeight;
        } else {
            // Show helpful status when no content
            this.app.els.transcript.innerHTML = `
                <div class="transcript-rows">
                    <div class="transcript-row placeholder" style="color: rgba(255, 255, 255, 0.4);">
                        ${this.isListening ? 'Listening for speech...' : 'Click Start to begin transcription'}
                    </div>
                </div>
            `;
            console.log('[Speech] No content to display - showing placeholder');
        }
    }
    
    /**
     * DEBUG: Analyze current speech recognition audio setup
     */
    debugCurrentAudioSetup() {
        console.log('🔍 [Speech] ========== SPEECH RECOGNITION DEBUG ==========');
        console.log('🔍 [Speech] Recognition state:', this.recognition ? 'initialized' : 'not initialized');
        console.log('🔍 [Speech] Is listening:', this.isListening);
        console.log('🔍 [Speech] Should be listening:', this.shouldBeListening);
        console.log('🔍 [Speech] Current language:', this.recognition?.lang);
        console.log('🔍 [Speech] Continuous:', this.recognition?.continuous);
        console.log('🔍 [Speech] Interim results:', this.recognition?.interimResults);
        
        // Check audio system state
        if (this.app.audioSystem) {
            console.log('🔍 [Speech] Audio source:', this.app.audioSystem.currentAudioSource);
            console.log('🔍 [Speech] System audio ready:', this.app.audioSystem.systemAudioReady);
        }
        
        // Try to analyze what microphone access we have
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                console.log('🔍 [Speech] Microphone access: ✅ Available');
                console.log('🔍 [Speech] Audio tracks:', stream.getAudioTracks().length);
                if (stream.getAudioTracks().length > 0) {
                    const track = stream.getAudioTracks()[0];
                    console.log('🔍 [Speech] Default mic:', track.label);
                    console.log('🔍 [Speech] Mic settings:', track.getSettings());
                }
                stream.getTracks().forEach(track => track.stop());
            })
            .catch(error => {
                console.log('🔍 [Speech] Microphone access: ❌', error.message);
            });
    }
}

window.SpeechRecognitionManager = SpeechRecognitionManager;