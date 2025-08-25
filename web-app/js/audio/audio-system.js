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
        this.isRequestingPermission = false;
        this.permissionCache = {
            microphone: false,
            system: false
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('[Audio] Initializing audio system...');
        
        // Setup audio source toggle
        this.setupAudioSourceToggle();
        
        // Setup level dots
        this.setupLevelDots();
        
        // Request microphone permission on load
        this.requestMicrophoneOnLoad();
        
        // Start background listening with cache
        this.startBackgroundListening();
        
        console.log('[Audio] Audio system initialized');
    }
    
    async requestMicrophoneOnLoad() {
        // Request microphone permission immediately on load
        this.app.currentAudioSource = 'microphone';
        this.updateToggleUI();
        
        // Check if already have permission
        if (this.microphoneStream && this.microphoneStream.active) {
            console.log('[Audio] Using existing microphone stream');
            await this.connectAudioSource(this.microphoneStream);
            this.updateTranscriptUI('Microphone Ready', 'Audio levels active - Click Start to transcribe');
            return;
        }
        
        // Prevent duplicate requests
        if (this.isRequestingPermission) {
            console.log('[Audio] Already requesting permission');
            return;
        }
        
        this.isRequestingPermission = true;
        this.updateTranscriptUI('Microphone Mode', 'Requesting microphone access...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false }
            });
            
            this.microphoneStream = stream;
            this.permissionCache.microphone = true;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI('Microphone Ready', 'Audio levels active - Click Start to transcribe');
            console.log('[Audio] Microphone permission granted on load');
            
        } catch (error) {
            console.error('[Audio] Microphone permission denied on load:', error);
            this.permissionCache.microphone = false;
            this.updateTranscriptUI('Microphone Access Denied', 'Please allow microphone access in browser settings');
        } finally {
            this.isRequestingPermission = false;
        }
    }
    
    startBackgroundListening() {
        // This is handled by SpeechRecognitionManager now
        console.log('[Audio] Background listening will be handled by speech recognition module');
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
        if (newSource === this.app.currentAudioSource) {
            console.log(`[Audio] Already on ${newSource}, ignoring`);
            return;
        }
        
        // Prevent switching while requesting permission
        if (this.isRequestingPermission) {
            console.log('[Audio] Permission request in progress, ignoring switch');
            return;
        }
        
        console.log(`[Audio] Switching from ${this.app.currentAudioSource} to ${newSource}`);
        
        // Update source
        this.app.currentAudioSource = newSource;
        this.updateToggleUI();
        
        // Switch to the new source
        if (newSource === 'microphone') {
            await this.switchToMicrophone();
        } else if (newSource === 'system') {
            await this.switchToDeviceOutput();
        }
    }
    
    async switchToMicrophone() {
        // Check cached stream first
        if (this.microphoneStream && this.microphoneStream.active) {
            console.log('[Audio] Switching to cached microphone stream');
            await this.connectAudioSource(this.microphoneStream);
            this.updateTranscriptUI('Microphone Active', 'Audio levels active - Ready to transcribe');
            return;
        }
        
        // Prevent duplicate permission requests
        if (this.isRequestingPermission) {
            console.log('[Audio] Already requesting permission, ignoring');
            return;
        }
        
        // Request permission
        this.isRequestingPermission = true;
        this.updateTranscriptUI('Microphone Mode', 'Requesting microphone access...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false }
            });
            
            this.microphoneStream = stream;
            this.permissionCache.microphone = true;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI('Microphone Ready', 'Audio levels active - Click Start to transcribe');
            
        } catch (error) {
            console.error('[Audio] Microphone permission denied:', error);
            this.permissionCache.microphone = false;
            this.updateTranscriptUI('Microphone Access Denied', 'Please allow microphone access and try again');
        } finally {
            this.isRequestingPermission = false;
        }
    }
    
    async switchToDeviceOutput() {
        // Check cached stream first
        if (this.systemStream && this.systemStream.active) {
            console.log('[Audio] Switching to cached system stream');
            await this.connectAudioSource(this.systemStream);
            this.updateTranscriptUI('Device Output Active', 'Tab audio levels active - Ready to transcribe');
            return;
        }
        
        // Prevent duplicate permission requests
        if (this.isRequestingPermission) {
            console.log('[Audio] Already requesting permission, ignoring');
            return;
        }
        
        // Request permission
        this.isRequestingPermission = true;
        this.updateTranscriptUI('Device Output Mode', 'Requesting tab audio share...');
        
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                video: { width: 1, height: 1 }
            });
            
            this.systemStream = stream;
            this.permissionCache.system = true;
            
            // Listen for stream end (user stops sharing or switches tabs)
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onended = () => {
                    console.log('[Audio] Tab share ended - stream ended');
                    this.systemStream = null;
                    this.permissionCache.system = false;
                    this.updateTranscriptUI('Tab Share Ended', 'Switched back to microphone mode');
                    // Switch back to microphone
                    this.app.currentAudioSource = 'microphone';
                    this.updateToggleUI();
                    this.switchToMicrophone();
                };
                
                // Monitor track state periodically
                this.tabSwitchMonitor = setInterval(() => {
                    if (videoTrack.readyState === 'ended' || !this.systemStream || !this.systemStream.active) {
                        console.log('[Audio] System stream became inactive - switching back');
                        clearInterval(this.tabSwitchMonitor);
                        this.systemStream = null;
                        this.permissionCache.system = false;
                        
                        // Only switch back if we're still on system mode
                        if (this.app.currentAudioSource === 'system') {
                            this.updateTranscriptUI('System Audio Lost', 'Switching back to microphone');
                            this.app.currentAudioSource = 'microphone';
                            this.updateToggleUI();
                            this.switchToMicrophone();
                        }
                    }
                }, 2000); // Check every 2 seconds
            }
            
            await this.connectAudioSource(stream);
            this.updateTranscriptUI('Device Output Ready', 'Tab audio active - Click Start to transcribe');
            
        } catch (error) {
            console.log('[Audio] Tab audio share cancelled:', error);
            this.permissionCache.system = false;
            // Fall back to microphone
            this.app.currentAudioSource = 'microphone';
            this.updateToggleUI();
            await this.switchToMicrophone();
        } finally {
            this.isRequestingPermission = false;
        }
    }
    
    
    // Called ONLY when Start button is clicked - can request permissions
    async requestMicrophonePermission() {
        try {
            console.log('[Audio]  Requesting microphone permission (Start button clicked)...');
            this.updateTranscriptUI(' Setting up Microphone...', 'Requesting microphone access...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false }
            });
            
            this.microphoneStream = stream;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI(' Microphone Ready', 'Listening for speech...');
            
            console.log('[Audio] ✅ Microphone permission granted and cached');
            return true;
            
        } catch (error) {
            console.error('[Audio] Microphone permission denied:', error);
            this.updateTranscriptUI(' Microphone Access Denied', 'Please allow microphone access and try again');
            return false;
        }
    }
    
    // Called ONLY when Start button is clicked - can request permissions  
    async requestSystemAudioPermission() {
        try {
            console.log('[Audio]  Requesting system audio permission (Start button clicked)...');
            this.updateTranscriptUI(' Setting up System Audio...', 'Requesting screen share permission...');
            
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                video: { width: 1, height: 1 }
            });
            
            this.systemStream = stream;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI(' System Audio Ready', 'Listening to tab audio...');
            
            console.log('[Audio] ✅ System audio permission granted and cached');
            return true;
            
        } catch (error) {
            console.log('[Audio] System audio permission cancelled or failed:', error);
            // Fallback to microphone mode
            this.app.currentAudioSource = 'microphone';
            this.updateToggleUI();
            this.updateTranscriptUI(' Microphone Mode', 'Click "Start" to request microphone access');
            return false;
        }
    }
    
    // Public method called by speechRecognition when Start is pressed
    async ensureAudioSource() {
        if (this.app.currentAudioSource === 'microphone') {
            if (this.microphoneStream && this.microphoneStream.active) {
                // Use cached stream
                await this.connectAudioSource(this.microphoneStream);
                this.updateTranscriptUI(' Microphone Ready', 'Listening for speech...');
                return true;
            } else {
                // Request permission
                return await this.requestMicrophonePermission();
            }
        } else if (this.app.currentAudioSource === 'system') {
            if (this.systemStream && this.systemStream.active) {
                // Use cached stream
                await this.connectAudioSource(this.systemStream);
                this.updateTranscriptUI(' System Audio Ready', 'Listening to tab audio...');
                return true;
            } else {
                // Request permission
                return await this.requestSystemAudioPermission();
            }
        }
        return false;
    }
    
    async setupSystemAudio() {
        try {
            if (this.systemStream && this.systemStream.active) {
                console.log('[Audio] Reusing existing system stream');
                await this.connectAudioSource(this.systemStream);
                this.updateTranscriptUI(' System Audio Ready', 'Click "Start" to transcribe');
                return;
            }
            
            this.updateTranscriptUI(' Setting up System Audio...', 'Requesting screen share permission...');
            
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                video: { width: 1, height: 1 }
            });
            
            this.systemStream = stream;
            await this.connectAudioSource(stream);
            this.updateTranscriptUI(' System Audio Ready', 'Click "Start" to transcribe');
            
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