/**
 * Audio System Management
 * Handles microphone, system audio, and audio source switching
 */

class AudioSystem {
    constructor(app) {
        this.app = app;
        this.microphoneStream = null;
        this.systemStream = null;
        this.audioContext = null;
        this.audioAnalyser = null;
        this.currentActiveDots = null;
        
        this.initialize();
    }
    
    async initialize() {
        console.log('[Audio] Initializing audio system...');
        
        // Setup audio source toggle
        this.setupAudioSourceToggle();
        
        // Setup level dots
        this.setupLevelDots();
        
        // Request initial microphone permission
        await this.requestInitialPermissions();
        
        console.log('[Audio] Audio system initialized');
    }
    
    setupAudioSourceToggle() {
        if (!this.app.els.audioSourceSwitch) {
            console.error('[Audio] Audio source switch not found');
            return;
        }
        
        const toggleOptions = this.app.els.audioSourceSwitch.querySelectorAll('.toggle-option');
        
        toggleOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const newSource = option.dataset.value;
                await this.switchAudioSource(newSource);
            });
        });
    }
    
    async switchAudioSource(newSource) {
        if (newSource === this.app.currentAudioSource) return;
        
        console.log(`[Audio] Switching from ${this.app.currentAudioSource} to ${newSource}`);
        
        // Stop current listening
        if (this.app.isListening) {
            this.app.stopListening();
        }
        
        // Update source
        this.app.currentAudioSource = newSource;
        this.updateToggleUI();
        
        // Setup new source
        if (newSource === 'microphone') {
            await this.setupMicrophone();
        } else if (newSource === 'system') {
            await this.setupSystemAudio();
        }
    }
    
    async setupMicrophone() {
        try {
            if (this.microphoneStream && this.microphoneStream.active) {
                console.log('[Audio] Reusing existing microphone stream');
                await this.connectAudioSource(this.microphoneStream);
                this.updateTranscriptUI('🎤 Microphone Ready', 'Click "Start" to transcribe');
                return;
            }
            
            this.updateTranscriptUI('🎤 Setting up Microphone...', 'Requesting microphone access...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false }
            });
            
            this.microphoneStream = stream;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI('🎤 Microphone Ready', 'Click "Start" to transcribe');
            
        } catch (error) {
            console.error('[Audio] Microphone setup failed:', error);
            this.updateTranscriptUI('❌ Microphone Access Denied', 'Please allow microphone access');
        }
    }
    
    async setupSystemAudio() {
        try {
            if (this.systemStream && this.systemStream.active) {
                console.log('[Audio] Reusing existing system stream');
                await this.connectAudioSource(this.systemStream);
                this.updateTranscriptUI('🔊 System Audio Ready', 'Click "Start" to transcribe');
                return;
            }
            
            this.updateTranscriptUI('🖥️ Setting up System Audio...', 'Requesting screen share permission...');
            
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                video: { width: 1, height: 1 }
            });
            
            this.systemStream = stream;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI('🔊 System Audio Ready', 'Click "Start" to transcribe');
            
        } catch (error) {
            console.log('[Audio] System audio setup cancelled or failed:', error);
            // Fallback to microphone
            this.app.currentAudioSource = 'microphone';
            this.updateToggleUI();
            await this.setupMicrophone();
        }
    }
    
    async connectAudioSource(stream) {
        try {
            // Setup audio context for visualization
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioAnalyser = this.audioContext.createAnalyser();
                this.audioAnalyser.fftSize = 256;
                this.audioAnalyser.smoothingTimeConstant = 0.5;
            }
            
            // Connect stream to analyser
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.audioAnalyser);
            
            // Start monitoring levels
            this.monitorAudioLevels();
            
            console.log('[Audio] Audio source connected and monitoring started');
        } catch (error) {
            console.error('[Audio] Failed to connect audio source:', error);
        }
    }
    
    setupLevelDots() {
        this.currentActiveDots = this.app.currentAudioSource === 'microphone' 
            ? this.app.els.micLevelDots 
            : this.app.els.deviceLevelDots;
    }
    
    monitorAudioLevels() {
        if (!this.audioAnalyser || !this.currentActiveDots) return;
        
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateLevels = () => {
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            // Calculate average level
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            const normalizedLevel = Math.min(average / 128, 1);
            
            // Update level dots
            const activeDotsCount = Math.floor(normalizedLevel * this.currentActiveDots.length);
            
            this.currentActiveDots.forEach((dot, index) => {
                if (index < activeDotsCount) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            requestAnimationFrame(updateLevels);
        };
        
        updateLevels();
    }
    
    async requestInitialPermissions() {
        // Only request microphone permission on page load
        if (this.app.currentAudioSource === 'microphone') {
            await this.setupMicrophone();
        }
    }
    
    updateToggleUI() {
        if (!this.app.els.audioSourceSwitch) return;
        
        const toggleOptions = this.app.els.audioSourceSwitch.querySelectorAll('.toggle-option');
        toggleOptions.forEach(option => {
            if (option.dataset.value === this.app.currentAudioSource) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
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

window.AudioSystem = AudioSystem;