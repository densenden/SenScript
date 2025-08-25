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
        
        this.setupSpeechRecognition();
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
            if (this.shouldBeListening) {
                // Auto-restart if we should still be listening
                setTimeout(() => this.startListening(), 100);
            }
            this.updateUI();
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[Speech] Recognition error:', event.error);
            this.handleRecognitionError(event);
        };
        
        console.log('[Speech] Speech recognition initialized');
    }
    
    startListening() {
        if (!this.recognition) {
            console.error('[Speech] No recognition available');
            return;
        }
        
        console.log('[Speech] Starting speech recognition...');
        this.shouldBeListening = true;
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('[Speech] Failed to start recognition:', error);
        }
        
        this.updateUI();
    }
    
    stopListening() {
        console.log('[Speech] Stopping speech recognition...');
        this.shouldBeListening = false;
        
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('[Speech] Error stopping recognition:', error);
            }
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
    
    processCompleteSentence(sentence) {
        console.log('[Speech] Processing sentence:', sentence);
        
        // Pass to card engine for potential card generation
        if (this.app.cardEngine) {
            this.app.cardEngine.processText(sentence);
        }
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