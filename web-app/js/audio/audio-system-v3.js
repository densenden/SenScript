/**
 * Audio System V3 - Perfect Audio Flow Implementation
 * Based exactly on /Users/densen/sen_dev/SenScript/monorepo/07-Perfect-Audio-Flow.md
 */

class AudioSystemV3 {
    constructor(app) {
        this.app = app;
        
        // Stream management
        this.microphoneStream = null;
        this.systemStream = null;
        
        // Audio visualization
        this.audioContext = null;
        this.audioAnalyser = null;
        this.animationFrame = null;
        
        // State management
        this.currentAudioSource = 'microphone'; // Default per spec
        this.isTranscribing = false; // Separate from audio levels
        this.permissionRequestInProgress = false;
        this.lastSwitchTime = 0; // Prevent rapid switching
        this.switchDebounceMs = 1000; // 1 second debounce
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🎤 [AudioV3] === INITIALIZING PERFECT AUDIO FLOW ===');
        console.log('🎤 [AudioV3] Following spec: /monorepo/07-Perfect-Audio-Flow.md');
        
        this.setupUI();
        this.setupToggleListeners();
        
        // Per spec: App loads → Microphone mode → NO permission requests initially
        this.showInitialState();
        
        console.log('🎤 [AudioV3] ✅ Audio system initialized - waiting for user action');
    }
    
    showInitialState() {
        console.log('🎤 [AudioV3] Setting initial state: Microphone mode, requesting permission');
        this.currentAudioSource = 'microphone';
        this.updateToggleUI();
        
        // Per Perfect Audio Flow: Request microphone permission immediately on toggle
        this.switchToMicrophone();
    }
    
    setupToggleListeners() {
        const toggle = this.app.els.audioSourceSwitch;
        if (!toggle) {
            console.error('🎤 [AudioV3] ❌ Audio source toggle not found!');
            return;
        }
        
        const options = toggle.querySelectorAll('.toggle-option');
        console.log(`🎤 [AudioV3] Found ${options.length} toggle options`);
        
        options.forEach((option, index) => {
            const source = option.dataset.value;
            console.log(`🎤 [AudioV3] Setting up toggle listener ${index + 1}: ${source}`);
            
            option.addEventListener('click', async () => {
                console.log(`🎤 [AudioV3] === TOGGLE CLICKED: ${source} ===`);
                await this.switchAudioSource(source);
            });
        });
    }
    
    async switchAudioSource(newSource) {
        // Debounce rapid switches
        const now = Date.now();
        if (now - this.lastSwitchTime < this.switchDebounceMs && newSource !== this.currentAudioSource) {
            console.log('🎤 [AudioV3] ⚠️ Switch too rapid, ignoring (debounce)');
            // Reset toggle UI to current source to prevent visual mismatch
            this.updateToggleUI();
            return;
        }
        
        if (this.permissionRequestInProgress) {
            console.log('🎤 [AudioV3] ⚠️ Permission request in progress, ignoring switch');
            return;
        }
        
        if (newSource === this.currentAudioSource) {
            console.log(`🎤 [AudioV3] Already on ${newSource}, but ensuring stream is ready`);
            // Don't ignore - ensure the stream is active for current source
        }
        
        this.lastSwitchTime = now;
        
        console.log(`🎤 [AudioV3] === SWITCHING: ${this.currentAudioSource} → ${newSource} ===`);
        
        // Update current source immediately (per spec: UI updates immediately)
        this.currentAudioSource = newSource;
        this.updateToggleUI();
        
        // Update TranscriptUI placeholder
        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
            this.app.transcriptSystem.ui.updateAudioSource(newSource);
        }
        
        if (newSource === 'microphone') {
            await this.switchToMicrophone();
        } else if (newSource === 'system') {
            await this.switchToDeviceOutput();
        }
    }
    
    async switchToMicrophone() {
        console.log('🎤 [AudioV3] === SWITCHING TO MICROPHONE ===');
        
        // Check if we have cached microphone stream
        if (this.microphoneStream && this.microphoneStream.active) {
            console.log('🎤 [AudioV3] ✅ Using cached microphone stream');
            this.connectAudioVisualization(this.microphoneStream);
            // this.updateTranscriptUI('Microphone Ready', 'Audio levels active - Click Start to transcribe'); // Disabled: TranscriptUI now manages this
            
            // Set up microphone for speech recognition
            this.setupMicrophoneProcessing();
            return;
        }
        
        // No cached stream - request permission
        console.log('🎤 [AudioV3] 🔐 No cached microphone - requesting permission');
        this.permissionRequestInProgress = true;
        // this.updateTranscriptUI('Microphone Mode', 'Requesting microphone permission...'); // Disabled: TranscriptUI manages this
        
        try {
            console.log('🎤 [AudioV3] 📞 Calling getUserMedia...');
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                audio: { 
                    echoCancellation: false, 
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            
            console.log('🎤 [AudioV3] ✅ Microphone permission granted!');
            console.log('🎤 [AudioV3] 🎵 Connecting audio visualization...');
            
            this.connectAudioVisualization(this.microphoneStream);
            // this.updateTranscriptUI('Microphone Ready', 'Audio levels active - Click Start to transcribe'); // Disabled: TranscriptUI now manages this
            
            // Set up microphone for speech recognition
            this.setupMicrophoneProcessing();
            
        } catch (error) {
            console.error('🎤 [AudioV3] ❌ Microphone permission denied:', error);
            // this.updateTranscriptUI('Microphone Access Denied', 'Please allow microphone access and try again'); // Disabled: TranscriptUI manages this
        } finally {
            this.permissionRequestInProgress = false;
            console.log('🎤 [AudioV3] 🔓 Permission request completed');
        }
    }
    
    async switchToDeviceOutput() {
        console.log('🖥️ [AudioV3] === SWITCHING TO DEVICE OUTPUT ===');
        
        // Clean up any existing system stream first
        if (this.systemStream && this.systemStream.active) {
            console.log('🖥️ [AudioV3] 🧹 Cleaning up existing system stream');
            this.systemStream.getTracks().forEach(track => track.stop());
            this.systemStream = null;
        }
        
        // Request fresh system stream
        console.log('🖥️ [AudioV3] 🔐 Requesting fresh system audio permission');
        this.permissionRequestInProgress = true;
        // this.updateTranscriptUI('Device Output Mode', 'Select tab or window to capture audio...'); // Disabled: TranscriptUI now manages this
        
        try {
            console.log('🖥️ [AudioV3] 📞 Calling getDisplayMedia...');
            
            // Request with more explicit audio requirements
            this.systemStream = await navigator.mediaDevices.getDisplayMedia({
                audio: { 
                    echoCancellation: false, 
                    noiseSuppression: false, 
                    autoGainControl: false,
                    suppressLocalAudioPlayback: false
                },
                video: { 
                    width: { ideal: 1 }, 
                    height: { ideal: 1 },
                    frameRate: { ideal: 1 }
                }
            });
            
            console.log('🖥️ [AudioV3] ✅ System audio permission granted!');
            console.log('🖥️ [AudioV3] System stream tracks:', this.systemStream.getTracks().length);
            console.log('🖥️ [AudioV3] Audio tracks:', this.systemStream.getAudioTracks().length);
            console.log('🖥️ [AudioV3] Video tracks:', this.systemStream.getVideoTracks().length);
            
            // Check if we actually have audio tracks
            const audioTracks = this.systemStream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.error('🖥️ [AudioV3] ❌ No audio tracks in system stream - falling back to microphone');
                this.systemStream = null;
                this.currentAudioSource = 'microphone';
                this.updateToggleUI();
                // this.updateTranscriptUI('System Audio Failed', 'No audio track available - switched to microphone'); // Disabled: TranscriptUI manages this
                await this.switchToMicrophone();
                return;
            }
            
            console.log('🖥️ [AudioV3] 🎵 System audio captured successfully!');
            console.log('🖥️ [AudioV3] 🎧 Tab audio track:', audioTracks[0].label);
            
            // CRITICAL: Set up system audio for speech recognition (from legacy)
            this.setupSystemAudioProcessing();
            
            console.log('🖥️ [AudioV3] 🎵 Connecting audio visualization...');
            
            // Monitor for stream end
            const videoTrack = this.systemStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onended = () => {
                    console.log('🖥️ [AudioV3] ⚠️ System stream ended - switching back to microphone');
                    this.systemStream = null;
                    // Add delay to prevent jarring UI jump when user stops screen sharing
                    setTimeout(() => {
                        this.currentAudioSource = 'microphone';
                        this.updateToggleUI();
                        this.switchToMicrophone();
                    }, 500); // Longer delay when stream naturally ends
                };
            }
            
            this.connectAudioVisualization(this.systemStream);
            // this.updateTranscriptUI('Device Output Ready', 'Audio levels active - Click Start to transcribe'); // Disabled: TranscriptUI now manages this
            
        } catch (error) {
            console.log('🖥️ [AudioV3] ⚠️ System audio permission cancelled/failed:', error);
            console.log('🖥️ [AudioV3] Error name:', error.name);
            console.log('🖥️ [AudioV3] 🔄 Auto-switching back to microphone');
            
            // Clean up any partial stream
            if (this.systemStream) {
                this.systemStream.getTracks().forEach(track => track.stop());
                this.systemStream = null;
            }
            
                // Per spec: fallback to microphone with appropriate message
            // Add a small delay before switching to prevent jarring UI jump
            setTimeout(() => {
                this.currentAudioSource = 'microphone';
                this.updateToggleUI();
                this.switchToMicrophone();
            }, 300); // 300ms delay for better UX
            
            if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
                console.log('🖥️ [AudioV3] User cancelled system audio permission');
            } else {
                console.log('🖥️ [AudioV3] System audio failed, falling back to microphone');
            }
            
        } finally {
            this.permissionRequestInProgress = false;
            console.log('🖥️ [AudioV3] 🔓 Permission request completed');
        }
    }
    
    connectAudioVisualization(stream) {
        console.log('🎵 [AudioV3] === CONNECTING AUDIO VISUALIZATION ===');
        console.log('🎵 [AudioV3] Current audio source:', this.currentAudioSource);
        console.log('🎵 [AudioV3] Stream being connected:', stream === this.microphoneStream ? 'microphone' : stream === this.systemStream ? 'system' : 'unknown');
        
        try {
            // Setup audio context if needed
            if (!this.audioContext) {
                console.log('🎵 [AudioV3] 🔧 Creating audio context...');
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioAnalyser = this.audioContext.createAnalyser();
                this.audioAnalyser.fftSize = 256;
                this.audioAnalyser.smoothingTimeConstant = 0.5;
            }
            
            // Connect stream to analyser
            console.log('🎵 [AudioV3] 🔌 Connecting stream to analyser...');
            console.log('🎵 [AudioV3] Stream active:', stream.active);
            console.log('🎵 [AudioV3] Stream tracks:', stream.getTracks().length);
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.audioAnalyser);
            console.log('🎵 [AudioV3] ✅ Source connected to analyser');
            
            // Start visual feedback (levels animation)
            this.startLevelVisualization();
            
            console.log('🎵 [AudioV3] ✅ Audio visualization connected and running');
            
        } catch (error) {
            console.error('🎵 [AudioV3] ❌ Failed to connect audio visualization:', error);
        }
    }
    
    startLevelVisualization() {
        // Stop existing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const levelDots = this.app.els.activeLevelDots;
        
        console.log(`🎵 [AudioV3] Level dots for ${this.currentAudioSource}:`, levelDots ? levelDots.length : 'null');
        console.log(`🎵 [AudioV3] Audio analyser:`, !!this.audioAnalyser);
        
        // Show level meter (new container has priority, fallback to legacy overlay)
        if (this.app.els.levelMeterContainer) {
            this.app.els.levelMeterContainer.classList.add('active');
        } else if (this.app.els.levelMeterOverlay) {
            this.app.els.levelMeterOverlay.classList.add('active');
        }
            
        if (!levelDots || levelDots.length === 0 || !this.audioAnalyser) {
            console.warn('🎵 [AudioV3] ⚠️ Level dots or analyser not available');
            return;
        }
        
        console.log(`🎵 [AudioV3] 📊 Starting level visualization for ${this.currentAudioSource}`);
        
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateLevels = () => {
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            // Calculate average audio level
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            const normalizedLevel = Math.min(average / 128, 1);
            
            // Update level dots
            const activeDotsCount = Math.floor(normalizedLevel * levelDots.length);
            
            levelDots.forEach((dot, index) => {
                if (index < activeDotsCount) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            this.animationFrame = requestAnimationFrame(updateLevels);
        };
        
        updateLevels();
    }
    
    // ============ PUBLIC API FOR START BUTTON ============
    
    async ensureAudioSourceForTranscription() {
        console.log(' [AudioV3] === START BUTTON PRESSED ===');
        console.log(` [AudioV3] Current source: ${this.currentAudioSource}`);
        console.log(` [AudioV3] Permission in progress: ${this.permissionRequestInProgress}`);
        
        // Wait if permission request is in progress
        if (this.permissionRequestInProgress) {
            console.log(' [AudioV3] ⏳ Waiting for permission request to complete...');
            await this.waitForPermissionComplete();
        }
        
        if (this.currentAudioSource === 'microphone') {
            if (this.microphoneStream && this.microphoneStream.active) {
                console.log(' [AudioV3] ✅ Microphone stream ready for transcription');
                return true;
            } else {
                console.log(' [AudioV3] ❌ No active microphone stream');
                return false;
            }
        } else if (this.currentAudioSource === 'system') {
            if (this.systemStream && this.systemStream.active) {
                console.log(' [AudioV3] ✅ System stream ready for transcription');
                return true;
            } else {
                console.log(' [AudioV3] ❌ No active system stream');
                return false;
            }
        }
        
        return false;
    }
    
    async waitForPermissionComplete() {
        while (this.permissionRequestInProgress) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    startTranscription() {
        console.log(' [AudioV3] === STARTING TRANSCRIPTION ===');
        this.isTranscribing = true;
        
        // Update UI to show transcription started
        const sourceText = this.currentAudioSource === 'microphone' ? 'Microphone' : 'Device Output';
        // this.updateTranscriptUI(`${sourceText} Listening`, 'Transcription active - generating cards'); // Disabled: TranscriptUI now manages this
    }
    
    stopTranscription() {
        console.log(' [AudioV3] === STOPPING TRANSCRIPTION ===');
        this.isTranscribing = false;
        
        // Update UI to show transcription stopped
        const sourceText = this.currentAudioSource === 'microphone' ? 'Microphone Ready' : 'Device Output Ready';
        // this.updateTranscriptUI(sourceText, 'Audio levels active - Click Start to transcribe'); // Disabled: TranscriptUI now manages this
    }
    
    // ============ UI HELPERS ============
    
    updateToggleUI() {
        const toggle = this.app.els.audioSourceSwitch;
        if (!toggle) return;
        
        const options = toggle.querySelectorAll('.toggle-option');
        options.forEach(option => {
            if (option.dataset.value === this.currentAudioSource) {
                option.classList.add('active');
                console.log(`🎨 [AudioV3] Toggle UI: ${option.dataset.value} marked as active`);
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    
    setupUI() {
        // Any additional UI setup can go here
        console.log('🎨 [AudioV3] UI setup completed');
    }
    
    /**
     * CRITICAL: Setup system audio processing for speech recognition
     * This is what makes Web Speech API work with tab/system audio in Chrome
     * Restored from legacy system that worked
     */
    setupSystemAudioProcessing() {
        console.log('🔄 [AudioV3] === SETTING UP SYSTEM AUDIO PROCESSING ===');
        console.log('🔄 [AudioV3] This enables Web Speech API to work with tab audio!');
        
        try {
            // Get audio tracks from the system stream
            const audioTracks = this.systemStream.getAudioTracks();
            console.log('🔄 [AudioV3] Audio tracks found:', audioTracks.length);
            
            if (audioTracks.length > 0) {
                console.log('🔄 [AudioV3] 🎧 Tab audio track:', audioTracks[0].label);
                
                // Ensure speech recognition is ready
                if (!this.app.speechRecognition) {
                    console.error('🔄 [AudioV3] ❌ Speech recognition not available');
                    return;
                }
                
                // CRITICAL RESTORATION: This method restores the working functionality
                // Based on commit babbaf8 that had tab audio transcription working
                // The key insight: Web Speech API DOES work with system audio in Chrome
                // when the permission context is correct (after getDisplayMedia)
                
                console.log('🔄 [AudioV3] ✅ System audio ready for Web Speech API');
                console.log('🔄 [AudioV3] 🎯 Chrome allows Web Speech API after getDisplayMedia permission');
                
                // Mark that system audio is ready for speech recognition
                // This flag tells the system that tab audio transcription should work
                this.systemAudioReady = true;
                
                // DEEP DEBUG: Let's analyze what's in this audio stream
                this.debugSystemAudioStream(audioTracks[0]);
                
                console.log('🔄 [AudioV3] ✅ System audio processing setup complete');
                
            } else {
                console.error('🔄 [AudioV3] ❌ No audio tracks in system stream');
            }
            
        } catch (error) {
            console.error('🔄 [AudioV3] ❌ Failed to setup system audio processing:', error);
        }
    }
    
    /**
     * Setup microphone processing for speech recognition
     * Microphone works directly with Web Speech API (standard behavior)
     */
    setupMicrophoneProcessing() {
        console.log('🎤 [AudioV3] === SETTING UP MICROPHONE PROCESSING ===');
        
        try {
            // Get audio tracks from the microphone stream
            const audioTracks = this.microphoneStream.getAudioTracks();
            console.log('🎤 [AudioV3] Audio tracks found:', audioTracks.length);
            
            if (audioTracks.length > 0) {
                console.log('🎤 [AudioV3] 🎧 Microphone track:', audioTracks[0].label);
                
                // Ensure speech recognition is ready
                if (!this.app.speechRecognition) {
                    console.error('🎤 [AudioV3] ❌ Speech recognition not available');
                    return;
                }
                
                // Microphone is the standard input for Web Speech API
                console.log('🎤 [AudioV3] ✅ Microphone ready for Web Speech API');
                console.log('🎤 [AudioV3] 🎯 Standard microphone input mode');
                
                // Mark that microphone audio is ready for speech recognition
                this.microphoneAudioReady = true;
                
                console.log('🎤 [AudioV3] ✅ Microphone processing setup complete');
                
            } else {
                console.error('🎤 [AudioV3] ❌ No audio tracks in microphone stream');
            }
            
        } catch (error) {
            console.error('🎤 [AudioV3] ❌ Failed to setup microphone processing:', error);
        }
    }
    
    /**
     * DEBUG: Analyze system audio stream in detail
     */
    debugSystemAudioStream(audioTrack) {
        console.log('🔍 [AudioV3] ========== AUDIO STREAM ANALYSIS ==========');
        console.log('🔍 [AudioV3] Track ID:', audioTrack.id);
        console.log('🔍 [AudioV3] Track kind:', audioTrack.kind);
        console.log('🔍 [AudioV3] Track label:', audioTrack.label);
        console.log('🔍 [AudioV3] Track enabled:', audioTrack.enabled);
        console.log('🔍 [AudioV3] Track muted:', audioTrack.muted);
        console.log('🔍 [AudioV3] Track ready state:', audioTrack.readyState);
        
        // Get audio constraints/settings if available
        const settings = audioTrack.getSettings ? audioTrack.getSettings() : null;
        if (settings) {
            console.log('🔍 [AudioV3] Audio settings:', settings);
        }
        
        // Create a temporary analyzer to check audio levels
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        try {
            // Create audio stream from track
            const stream = new MediaStream([audioTrack]);
            const source = this.audioContext.createMediaStreamSource(stream);
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 2048;
            
            source.connect(analyser);
            
            // Check if there's actual audio data
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            let checkCount = 0;
            const checkAudioData = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                const peak = Math.max(...dataArray);
                
                console.log(`🔍 [AudioV3] Audio check ${checkCount + 1}/5 - Average: ${average.toFixed(1)}, Peak: ${peak}`);
                
                checkCount++;
                if (checkCount < 5) {
                    setTimeout(checkAudioData, 500);
                } else {
                    console.log('🔍 [AudioV3] ========== AUDIO ANALYSIS COMPLETE ==========');
                    // Clean up
                    source.disconnect();
                }
            };
            
            // Start checking after a brief delay
            setTimeout(checkAudioData, 100);
            
        } catch (error) {
            console.error('🔍 [AudioV3] Audio analysis failed:', error);
        }
    }
    
    // ============ GETTERS ============
    
    getCurrentAudioSource() {
        return this.currentAudioSource;
    }
    
    isCurrentlyTranscribing() {
        return this.isTranscribing;
    }
    
    getStreamStatus() {
        return {
            microphone: this.microphoneStream ? this.microphoneStream.active : false,
            system: this.systemStream ? this.systemStream.active : false,
            current: this.currentAudioSource,
            transcribing: this.isTranscribing,
            requestingPermission: this.permissionRequestInProgress
        };
    }
}

window.AudioSystemV3 = AudioSystemV3;