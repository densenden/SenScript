/**
 * Clean Audio Source Toggle Module
 * Extracted from main app.js to avoid syntax issues
 */

class AudioSourceToggle {
    constructor(app) {
        this.app = app;
        this.setupToggle();
    }

    setupToggle() {
        console.log('[Toggle] Setting up audio source toggle...');
        
        if (!this.app.els.audioSourceSwitch) {
            console.error('[Toggle] audioSourceSwitch element not found!');
            return;
        }
        
        const toggleOptions = this.app.els.audioSourceSwitch.querySelectorAll('.toggle-option');
        
        if (toggleOptions.length === 0) {
            console.error('[Toggle] No toggle options found!');
            return;
        }
        
        toggleOptions.forEach((option) => {
            option.addEventListener('click', async (event) => {
                const newSource = option.dataset.value;
                console.log('[UI] Audio source toggle clicked:', newSource);
                
                if (newSource !== this.app.currentAudioSource) {
                    // Stop current listening
                    if (this.app.shouldBeListening || this.app.isListening) {
                        this.app.stopListening();
                    }
                    
                    // Update current source
                    this.app.currentAudioSource = newSource;
                    this.app.updateToggleUI();
                    this.app.showLevelDots();
                    
                    // Handle source-specific setup
                    if (newSource === 'system') {
                        await this.handleSystemAudioSetup();
                    } else if (newSource === 'microphone') {
                        await this.handleMicrophoneSetup();
                    }
                }
            });
        });
        
        console.log('[UI] Audio source toggle initialized');
    }
    
    async handleSystemAudioSetup() {
        if (this.app.systemStream && this.app.systemStream.active) {
            console.log('[UI] Reusing existing system audio stream');
            await this.app.connectAudioSource(this.app.systemStream);
            this.updateTranscriptUI('🔊 Device Output Ready', 'Audio levels active - Click "Start" to transcribe');
        } else {
            this.updateTranscriptUI('🖥️ Setting up Device Output...', 'Requesting screen share permission...');
            
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                    video: { width: 1, height: 1 }
                });
                
                this.app.systemStream = stream;
                const captureInfo = this.app.analyzeCaptureSource(stream);
                await this.app.connectAudioSource(stream);
                
                this.updateTranscriptUI(
                    `${captureInfo.type}: ${captureInfo.name}`,
                    'Connected - Click Start to listen',
                    'Audio levels show when sound plays'
                );
            } catch (error) {
                console.log('[UI] System audio setup cancelled or failed:', error);
                this.app.currentAudioSource = 'microphone';
                this.app.updateToggleUI();
                this.updateTranscriptUI('❌ Tab audio setup cancelled', 'Switched back to Microphone');
            }
        }
    }
    
    async handleMicrophoneSetup() {
        if (this.app.microphoneStream && this.app.microphoneStream.active) {
            console.log('[UI] Reusing existing microphone stream');
            await this.app.connectAudioSource(this.app.microphoneStream);
            this.updateTranscriptUI('🎤 Microphone Ready', 'Audio levels active - Click "Start" to transcribe');
        } else {
            this.updateTranscriptUI('🎤 Setting up Microphone...', 'Requesting microphone access...');
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: { echoCancellation: false, noiseSuppression: false } 
                });
                
                this.app.microphoneStream = stream;
                await this.app.connectAudioSource(stream);
                this.updateTranscriptUI('🎤 Microphone Ready', 'Audio levels active - Click "Start" to transcribe');
            } catch (error) {
                console.error('[UI] Microphone permission denied:', error);
                this.updateTranscriptUI('❌ Microphone Access Denied', 'Please allow microphone access in browser');
            }
        }
    }
    
    updateTranscriptUI(current, previous, old = null) {
        if (!this.app.els.transcript) return;
        
        let html = `
            <div class="transcript-rows">
                <div class="transcript-row current">${current}</div>
                <div class="transcript-row previous">${previous}</div>
        `;
        
        if (old) {
            html += `<div class="transcript-row old">${old}</div>`;
        }
        
        html += `</div>`;
        this.app.els.transcript.innerHTML = html;
    }
}

// Export for use in main app
window.AudioSourceToggle = AudioSourceToggle;