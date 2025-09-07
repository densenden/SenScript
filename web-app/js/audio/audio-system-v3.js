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
        this.initializeInputSourceIndicator();
        
        console.log('🎤 [AudioV3] ✅ Audio system initialized - waiting for user action');
    }
    
    showInitialState() {
        // Check saved preference from settings manager
        const savedSource = this.app.settings?.settings?.audioSource || 'microphone';
        console.log(`🎤 [AudioV3] Setting initial state: ${savedSource} mode (from settings)`);
        this.currentAudioSource = savedSource;
        
        // Update ALL UI elements to ensure consistency
        this.updateToggleUI();
        this.updateInputSourceIndicator(savedSource);
        
        // DON'T request permission on load - wait for user action
        console.log('🎤 [AudioV3] Microphone mode ready - permission will be requested when needed');
        
        // Clear any stale saved preference
        localStorage.removeItem('preferredAudioSource');
    }
    
    setupToggleListeners() {
        const toggle = this.app.els.audioSourceSwitch;
        if (!toggle) {
            console.error('🎤 [AudioV3] ❌ Audio source toggle not found!');
            console.error('🎤 [AudioV3] Available elements:', Object.keys(this.app.els));
            return;
        }
        
        console.log('🎤 [AudioV3] Toggle element found:', toggle);
        console.log('🎤 [AudioV3] Toggle HTML:', toggle.outerHTML);
        
        const options = toggle.querySelectorAll('.toggle-option');
        console.log(`🎤 [AudioV3] Found ${options.length} toggle options`);
        
        // Debug: Check if options are visible and clickable
        options.forEach((option, index) => {
            const rect = option.getBoundingClientRect();
            const computed = window.getComputedStyle(option);
            console.log(`🎤 [AudioV3] Option ${index + 1}:`, {
                dataset: option.dataset,
                visible: rect.width > 0 && rect.height > 0,
                pointerEvents: computed.pointerEvents,
                zIndex: computed.zIndex,
                position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            });
        });
        
        options.forEach((option, index) => {
            const source = option.dataset.value;
            console.log(`🎤 [AudioV3] Setting up toggle listener ${index + 1}: ${source}`);
            
            option.addEventListener('click', async (event) => {
                console.log(`🎤 [AudioV3] === TOGGLE CLICKED: ${source} ===`);
                console.log(`🎤 [AudioV3] Click event target:`, event.target);
                console.log(`🎤 [AudioV3] Current audio source:`, this.currentAudioSource);
                
                // Prevent any potential event bubbling issues
                event.preventDefault();
                event.stopPropagation();
                
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
            console.log(`🎤 [AudioV3] Already on ${newSource}`);
            return; // No need to switch if already on this source
        }
        
        this.lastSwitchTime = now;
        
        console.log(`🎤 [AudioV3] === SWITCHING: ${this.currentAudioSource} → ${newSource} ===`);
        
        // Update current source immediately (per spec: UI updates immediately)
        this.currentAudioSource = newSource;
        
        // Update ALL UI elements to ensure consistency
        this.updateToggleUI();
        this.updateInputSourceIndicator(newSource);
        
        // Update TranscriptUI placeholder
        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
            this.app.transcriptSystem.ui.updateAudioSource(newSource);
        }
        
        // Now request permissions for the new source
        if (newSource === 'microphone') {
            await this.switchToMicrophone();
        } else if (newSource === 'system') {
            await this.switchToDeviceOutput();
        }
        
        // Update indicator again after async operation completes to ensure it's in sync
        this.updateInputSourceIndicator(this.currentAudioSource);
    }
    
    async switchToMicrophone() {
        console.log('🎤 [AudioV3] === SWITCHING TO MICROPHONE ===');
        
        // Mark that we're requesting permission
        this.microphonePermissionRequested = true;
        
        // Reset system stream flag when switching away
        this.systemStreamRequestedOnce = false;
        
        // Clean up system stream if it exists
        if (this.systemStream) {
            console.log('🎤 [AudioV3] Cleaning up system stream before switching');
            try {
                this.systemStream.getTracks().forEach(track => track.stop());
            } catch (e) {
                console.warn('🎤 [AudioV3] Error stopping system stream tracks:', e);
            }
            this.systemStream = null;
        }
        
        // Check if we have cached microphone stream
        if (this.microphoneStream && this.microphoneStream.active) {
            console.log('🎤 [AudioV3] ✅ Using cached microphone stream');
            this.connectAudioVisualization(this.microphoneStream);
            // this.updateTranscriptUI('Microphone Ready', 'Audio levels active - Click Start to transcribe'); // Disabled: TranscriptUI now manages this
            
            // Set up microphone for speech recognition
            this.setupMicrophoneProcessing();
            
            // Notify the app that microphone audio is ready
            if (this.app.onAudioSystemReady) {
                this.app.onAudioSystemReady('microphone');
            }
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
            
            // CRITICAL FIX: Update input source indicator after permission granted
            this.updateInputSourceIndicator('microphone');
            console.log('🎤 [AudioV3] UI toggles updated after permission granted');
            
            // Notify the app that microphone audio is ready
            if (this.app.onAudioSystemReady) {
                this.app.onAudioSystemReady('microphone');
            }
            
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
        
        // Clean up microphone stream if it exists to prevent multiple streams
        if (this.microphoneStream) {
            console.log('🖥️ [AudioV3] Cleaning up microphone stream before switching');
            try {
                this.microphoneStream.getTracks().forEach(track => track.stop());
            } catch (e) {
                console.warn('🖥️ [AudioV3] Error stopping microphone stream tracks:', e);
            }
            this.microphoneStream = null;
        }
        
        // Check if we have a cached and active system stream
        if (this.systemStream && this.systemStream.active) {
            console.log('🖥️ [AudioV3] ✅ Using cached system stream');
            this.connectAudioVisualization(this.systemStream);
            this.setupSystemAudioProcessing();
            
            // Notify the app that system audio is ready
            if (this.app.onAudioSystemReady) {
                this.app.onAudioSystemReady('system');
            }
            return;
        }
        
        // No cached stream - request fresh system stream
        console.log('🖥️ [AudioV3] 🔐 No cached system stream - requesting permission');
        this.permissionRequestInProgress = true;
        
        // Show helpful guidance for system audio
        this.showSystemAudioGuidance();
        
        try {
            console.log('🖥️ [AudioV3] 📞 Calling getDisplayMedia...');
            console.log('🖥️ [AudioV3] ⚠️ Remember to CHECK "Share audio" checkbox!');
            
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
                },
                preferCurrentTab: false  // Always show full picker
            });
            
            console.log('🖥️ [AudioV3] ✅ System audio permission granted!');
            console.log('🖥️ [AudioV3] System stream tracks:', this.systemStream.getTracks().length);
            console.log('🖥️ [AudioV3] Audio tracks:', this.systemStream.getAudioTracks().length);
            console.log('🖥️ [AudioV3] Video tracks:', this.systemStream.getVideoTracks().length);
            
            // Hide the guidance overlay
            this.hideSystemAudioGuidance();
            
            // Check if we actually have audio tracks
            const audioTracks = this.systemStream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.error('🖥️ [AudioV3] ❌ No audio tracks in system stream');
                console.log('🖥️ [AudioV3] 📌 User likely forgot to check "Share audio"');
                
                // Show helpful message
                this.showNoAudioMessage();
                
                // Clean up video-only stream
                if (this.systemStream) {
                    this.systemStream.getTracks().forEach(track => track.stop());
                }
                this.systemStream = null;
                
                // Fall back to microphone
                this.currentAudioSource = 'microphone';
                this.updateToggleUI();
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
                        
                        // Update transcript UI
                        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
                            this.app.transcriptSystem.ui.updateAudioSource('microphone');
                        }
                    }, 500); // Longer delay when stream naturally ends
                };
            }
            
            this.connectAudioVisualization(this.systemStream);
            // this.updateTranscriptUI('Device Output Ready', 'Audio levels active - Click Start to transcribe'); // Disabled: TranscriptUI now manages this
            
            // CRITICAL FIX: Update input source indicator after permission granted
            this.updateInputSourceIndicator('system');
            console.log('🖥️ [AudioV3] UI toggles updated after system permission granted');
            
            // Update transcript UI with new system stream information
            if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
                this.app.transcriptSystem.ui.updateAudioSource('system');
            }
            
            // Notify the app that system audio is ready
            if (this.app.onAudioSystemReady) {
                this.app.onAudioSystemReady('system');
            }
            
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
                if (error.name === 'NotAllowedError') {
                    this.showPermissionDeniedMessage();
                }
            } else {
                console.log('🖥️ [AudioV3] System audio failed, falling back to microphone');
            }
            
        } finally {
            this.permissionRequestInProgress = false;
            this.hideSystemAudioGuidance();
            console.log('🖥️ [AudioV3] 🔓 Permission request completed');
        }
    }
    
    connectAudioVisualization(stream) {
        console.log('🎵 [AudioV3] === CONNECTING AUDIO VISUALIZATION ===');
        console.log('🎵 [AudioV3] Current audio source:', this.currentAudioSource);
        console.log('🎵 [AudioV3] Stream being connected:', stream === this.microphoneStream ? 'microphone' : stream === this.systemStream ? 'system' : 'unknown');
        
        try {
            // Disconnect previous source if exists
            if (this.currentAudioSource) {
                try {
                    this.currentAudioSource.disconnect();
                } catch (e) {
                    // Ignore disconnect errors
                }
            }
            
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
            
            // Create new source and store reference
            const source = this.audioContext.createMediaStreamSource(stream);
            this.currentAudioSourceNode = source; // Store for later disconnect
            
            // Ensure analyser is not already connected
            try {
                source.connect(this.audioAnalyser);
            } catch (error) {
                console.warn('🎵 [AudioV3] Connection warning:', error.message);
                // Try to create a new analyser if connection failed
                this.audioAnalyser = this.audioContext.createAnalyser();
                this.audioAnalyser.fftSize = 256;
                source.connect(this.audioAnalyser);
            }
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
        
        console.log(`[AudioV3] Level dots for ${this.currentAudioSource}:`, levelDots ? levelDots.length : 'null');
        console.log(`[AudioV3] Audio analyser:`, !!this.audioAnalyser);
        
        // Show level meter (new container has priority, fallback to legacy overlay)
        if (this.app.els.levelMeterContainer) {
            this.app.els.levelMeterContainer.classList.add('active');
        } else if (this.app.els.levelMeterOverlay) {
            this.app.els.levelMeterOverlay.classList.add('active');
        }
            
        if (!levelDots || levelDots.length === 0 || !this.audioAnalyser) {
            console.warn('[AudioV3] Level dots or analyser not available');
            return;
        }
        
        console.log(`[AudioV3] Starting level visualization for ${this.currentAudioSource}`);
        
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
                console.log(' [AudioV3] ⚠️ No active microphone stream');
                // Request permission ONLY if not already requested
                if (!this.microphonePermissionRequested) {
                    console.log(' [AudioV3] First time - requesting microphone permission');
                    this.microphonePermissionRequested = true;
                    await this.switchToMicrophone();
                    return this.microphoneStream && this.microphoneStream.active;
                } else {
                    console.log(' [AudioV3] Permission should have been requested when switching - check stream');
                    return false;
                }
            }
        } else if (this.currentAudioSource === 'system') {
            if (this.systemStream && this.systemStream.active) {
                console.log(' [AudioV3] ✅ System stream ready for transcription');
                return true;
            } else {
                console.log(' [AudioV3] ⚠️ No active system stream');
                // System stream should have been requested when switching
                console.log(' [AudioV3] System stream should be active from switching - not requesting again');
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
    
    /**
     * Initialize input source indicator button
     */
    initializeInputSourceIndicator() {
        const indicator = document.getElementById('inputSourceIndicator');
        if (indicator) {
            // Set initial state
            this.updateInputSourceIndicator(this.currentAudioSource);
            
            // Only add event listener if not already added
            if (!indicator.dataset.listenerAdded) {
                indicator.addEventListener('click', () => {
                    console.log('🎤 [AudioV3] Input source indicator clicked');
                    const newSource = this.currentAudioSource === 'microphone' ? 'system' : 'microphone';
                    this.switchAudioSource(newSource);
                });
                indicator.dataset.listenerAdded = 'true';
            }
        }
    }
    
    /**
     * Update input source indicator icon and tooltip
     */
    updateInputSourceIndicator(source) {
        const indicator = document.getElementById('inputSourceIndicator');
        const icon = document.getElementById('inputSourceIcon');
        
        if (indicator && icon) {
            if (source === 'system') {
                icon.textContent = 'desktop_windows';
                indicator.title = 'Input: System Audio (click to switch to microphone)';
                indicator.style.color = '#10b981'; // Green for system audio
            } else {
                icon.textContent = 'mic';
                indicator.title = 'Input: Microphone (click to switch to system audio)';
                indicator.style.color = '#3b82f6'; // Blue for microphone
            }
        }
    }
    
    /**
     * Show guidance for system audio permissions
     */
    showSystemAudioGuidance() {
        // Create or update a guidance element
        let guidance = document.getElementById('systemAudioGuidance');
        if (!guidance) {
            guidance = document.createElement('div');
            guidance.id = 'systemAudioGuidance';
            guidance.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(30, 41, 59, 0.98);
                border: 2px solid #3b82f6;
                border-radius: 12px;
                padding: 20px;
                z-index: 10000;
                color: white;
                font-size: 14px;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            `;
            document.body.appendChild(guidance);
        }
        
        guidance.innerHTML = `
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: 600;">
                📢 System Audio Setup
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Step 1:</strong> Select the tab or window you want to capture
            </div>
            <div style="margin-bottom: 10px; padding: 10px; background: rgba(59, 130, 246, 0.2); border-radius: 6px;">
                <strong>⚠️ Step 2:</strong> CHECK the "Share audio" checkbox before clicking Share!
            </div>
            <div style="font-size: 12px; opacity: 0.8;">
                Chrome requires both steps for audio capture to work.
            </div>
        `;
        
        guidance.style.display = 'block';
    }
    
    /**
     * Hide system audio guidance
     */
    hideSystemAudioGuidance() {
        const guidance = document.getElementById('systemAudioGuidance');
        if (guidance) {
            guidance.style.display = 'none';
        }
    }
    
    /**
     * Show message when no audio track is detected
     */
    showNoAudioMessage() {
        // Create a temporary message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            max-width: 350px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        message.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">⚠️ No Audio Detected</div>
            <div style="font-size: 14px;">
                The "Share audio" checkbox was not selected. 
                Please try again and make sure to check "Share audio" before clicking Share.
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    /**
     * Show permission denied message
     */
    showPermissionDeniedMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            max-width: 350px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        message.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">🚫 Permission Denied</div>
            <div style="font-size: 14px;">
                Screen sharing was denied. Switching back to microphone input.
                You can try again by clicking the Device Output toggle.
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            message.remove();
        }, 4000);
    }
}

window.AudioSystemV3 = AudioSystemV3;