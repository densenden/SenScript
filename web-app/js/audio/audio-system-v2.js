/**
 * Audio System V2 - Simplified and Robust
 * Eliminates race conditions and multiple permission requests
 */

class AudioSystemV2 {
    constructor(app) {
        this.app = app;
        this.micStream = null;
        this.systemStream = null;
        this.audioContext = null;
        this.audioAnalyser = null;
        this.currentSource = 'microphone';
        this.isRequesting = false;
        this.switchingInProgress = false;
        
        this.initialize();
    }
    
    async initialize() {
        console.log('[AudioV2] Initializing simplified audio system...');
        
        // Setup toggle listeners
        this.setupToggleListeners();
        
        // Setup level dots
        this.setupLevelVisualization();
        
        // Request initial microphone permission
        await this.requestInitialMicrophone();
        
        console.log('[AudioV2] Audio system ready');
    }
    
    setupToggleListeners() {
        const toggle = this.app.els.audioSourceSwitch;
        if (!toggle) return;
        
        const options = toggle.querySelectorAll('.toggle-option');
        options.forEach(option => {
            option.addEventListener('click', async () => {
                const newSource = option.dataset.value;
                await this.switchSource(newSource);
            });
        });
    }
    
    async requestInitialMicrophone() {
        this.updateUI('Microphone Mode', 'Requesting microphone access...');
        
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false }
            });
            
            this.connectAudioVisualization(this.micStream);
            this.updateUI('Microphone Ready', 'Audio levels active - ready to transcribe');
            this.updateToggleState('microphone');
            
        } catch (error) {
            console.error('[AudioV2] Initial microphone failed:', error);
            this.updateUI('Microphone Denied', 'Please allow microphone access');
        }
    }
    
    async switchSource(newSource) {
        // Prevent concurrent switches
        if (this.switchingInProgress || this.isRequesting) {
            console.log('[AudioV2] Switch already in progress, ignoring');
            return;
        }
        
        if (newSource === this.currentSource) {
            console.log('[AudioV2] Already on', newSource);
            return;
        }
        
        this.switchingInProgress = true;
        console.log('[AudioV2] Switching to', newSource);
        
        try {
            if (newSource === 'microphone') {
                await this.activateMicrophone();
            } else if (newSource === 'system') {
                await this.activateSystemAudio();
            }
            
            this.currentSource = newSource;
            this.updateToggleState(newSource);
            
        } catch (error) {
            console.error('[AudioV2] Switch failed:', error);
        } finally {
            this.switchingInProgress = false;
        }
    }
    
    async activateMicrophone() {
        // Use existing stream if available
        if (this.micStream && this.micStream.active) {
            console.log('[AudioV2] Using existing microphone stream');
            this.connectAudioVisualization(this.micStream);
            this.updateUI('Microphone Active', 'Audio levels active - ready to transcribe');
            return;
        }
        
        // Request new microphone permission
        this.isRequesting = true;
        this.updateUI('Microphone Mode', 'Requesting microphone access...');
        
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false }
            });
            
            this.connectAudioVisualization(this.micStream);
            this.updateUI('Microphone Ready', 'Audio levels active - ready to transcribe');
            
        } catch (error) {
            this.updateUI('Microphone Denied', 'Please allow microphone access');
            throw error;
        } finally {
            this.isRequesting = false;
        }
    }
    
    async activateSystemAudio() {
        // Use existing stream if available
        if (this.systemStream && this.systemStream.active) {
            console.log('[AudioV2] Using existing system stream');
            this.connectAudioVisualization(this.systemStream);
            this.updateUI('System Audio Active', 'Tab audio levels active - ready to transcribe');
            return;
        }
        
        // Request new system audio permission
        this.isRequesting = true;
        this.updateUI('System Audio Mode', 'Requesting tab audio share...');
        
        try {
            this.systemStream = await navigator.mediaDevices.getDisplayMedia({
                audio: { echoCancellation: false, noiseSuppression: false },
                video: { width: 1, height: 1 }
            });
            
            // Monitor for stream end
            const videoTrack = this.systemStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onended = () => {
                    console.log('[AudioV2] System stream ended');
                    this.systemStream = null;
                    // Auto-switch back to microphone
                    this.switchSource('microphone');
                };
            }
            
            this.connectAudioVisualization(this.systemStream);
            this.updateUI('System Audio Ready', 'Tab audio active - ready to transcribe');
            
        } catch (error) {
            this.updateUI('System Audio Cancelled', 'Switching back to microphone');
            // Auto-switch back to microphone
            await this.activateMicrophone();
            this.currentSource = 'microphone';
            this.updateToggleState('microphone');
            throw error;
        } finally {
            this.isRequesting = false;
        }
    }
    
    connectAudioVisualization(stream) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioAnalyser = this.audioContext.createAnalyser();
                this.audioAnalyser.fftSize = 256;
            }
            
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.audioAnalyser);
            this.startVisualization();
            
        } catch (error) {
            console.error('[AudioV2] Visualization setup failed:', error);
        }
    }
    
    setupLevelVisualization() {
        // Setup level dots based on current source
        this.updateLevelDots();
    }
    
    updateLevelDots() {
        this.currentDots = this.currentSource === 'microphone' 
            ? this.app.els.micLevelDots 
            : this.app.els.deviceLevelDots;
    }
    
    startVisualization() {
        if (!this.audioAnalyser || !this.currentDots) return;
        
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const animate = () => {
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            const level = Math.min(average / 128, 1);
            const activeDots = Math.floor(level * this.currentDots.length);
            
            this.currentDots.forEach((dot, index) => {
                dot.classList.toggle('active', index < activeDots);
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    updateToggleState(source) {
        const toggle = this.app.els.audioSourceSwitch;
        if (!toggle) return;
        
        const options = toggle.querySelectorAll('.toggle-option');
        options.forEach(option => {
            option.classList.toggle('active', option.dataset.value === source);
        });
        
        this.updateLevelDots();
    }
    
    updateUI(title, message) {
        if (!this.app.els.transcript) return;
        
        const html = `
            <div class="transcript-rows">
                <div class="transcript-row current">${title}</div>
                <div class="transcript-row previous">${message}</div>
            </div>
        `;
        
        this.app.els.transcript.innerHTML = html;
    }
    
    // Public API for speech recognition
    async ensureAudioSource() {
        if (this.currentSource === 'microphone') {
            if (this.micStream && this.micStream.active) return true;
            await this.activateMicrophone();
            return this.micStream && this.micStream.active;
        } else {
            if (this.systemStream && this.systemStream.active) return true;
            await this.activateSystemAudio();
            return this.systemStream && this.systemStream.active;
        }
    }
    
    getCurrentSource() {
        return this.currentSource;
    }
    
    isSourceReady() {
        if (this.currentSource === 'microphone') {
            return this.micStream && this.micStream.active;
        } else {
            return this.systemStream && this.systemStream.active;
        }
    }
}

window.AudioSystemV2 = AudioSystemV2;