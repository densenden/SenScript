/**
 * MediaRecorder Audio Capture System
 * Universal audio capture for both microphone and system/tab audio
 * Optimized for Whisper API with 10-second chunks
 */

class MediaRecorderManager {
    constructor(app) {
        this.app = app;
        
        // Recording state
        this.mediaRecorder = null;
        this.isRecording = false;
        this.currentStream = null;
        this.audioChunks = [];
        
        // Whisper optimization
        this.chunkDuration = 10000; // 10 seconds optimal for Whisper
        this.chunkInterval = null;
        this.totalRecordingTime = 0;
        this.estimatedCost = 0;
        
        // Optimized settings for Whisper API
        this.recordingOptions = this.getBestRecordingOptions();
        
        console.log('🎙️ [MediaRecorder] Initialized for Whisper transcription');
    }
    
    /**
     * Get optimal recording options for Whisper API
     */
    getBestRecordingOptions() {
        // Test supported formats and prioritize those that work best with OpenAI Whisper
        const formats = [
            'audio/mp4',           // Most compatible with OpenAI
            'audio/mpeg',          // Standard MP3
            'audio/wav',           // Universal compatibility 
            'audio/webm;codecs=opus', // WebM with specific codec
            'audio/webm',          // Generic WebM (often problematic)
            'audio/ogg'            // Fallback
        ];
        
        let selectedFormat = 'audio/mp4'; // Fallback to most compatible format
        
        console.log('🔍 [MediaRecorder] Testing audio formats for Whisper compatibility:');
        for (const format of formats) {
            const isSupported = MediaRecorder.isTypeSupported(format);
            console.log(`  ➤ ${format}: ${isSupported ? '✅ Supported' : '❌ Not supported'}`);
            if (isSupported) {
                selectedFormat = format;
                console.log(`🎵 [MediaRecorder] Selected format: ${format}`);
                break;
            }
        }
        
        console.log(`📋 [MediaRecorder] Final format choice: ${selectedFormat}`);
        
        return {
            mimeType: selectedFormat,
            audioBitsPerSecond: 64000, // Optimal for Whisper (good quality, reasonable size)
            videoBitsPerSecond: 0 // Audio only
        };
    }
    
    /**
     * Start recording from current audio source (microphone or system)
     */
    async startRecording() {
        if (this.isRecording) {
            console.log('🎙️ [MediaRecorder] Already recording, ignoring start');
            return;
        }
        
        console.log(' [MediaRecorder] === STARTING RECORDING ===');
        
        // FIXED: Try to use existing stream first before getting new one
        if (!this.currentStream && this.app?.audioSystem?.microphoneStream) {
            console.log('🎙️ [MediaRecorder] Using AudioSystem stream to avoid double permission');
            this.currentStream = this.app.audioSystem.microphoneStream;
        }
        
        try {
            // Get current audio stream from audio system only if we don't have one
            if (!this.currentStream) {
                this.currentStream = await this.getCurrentAudioStream();
            }
            if (!this.currentStream) {
                throw new Error('No audio stream available');
            }
            
            // Validate stream has audio tracks
            const audioTracks = this.currentStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio tracks available in stream');
            }
            
            console.log('🎵 [MediaRecorder] Audio tracks:', audioTracks.length);
            console.log('🎵 [MediaRecorder] Track details:', audioTracks.map(t => ({ 
                label: t.label, 
                kind: t.kind, 
                enabled: t.enabled, 
                readyState: t.readyState 
            })));
            
            // Try multiple MediaRecorder configurations with our optimized format selection
            const configurations = [
                // Try our optimized format selection first
                this.recordingOptions,
                // Fallback to basic formats
                { mimeType: 'audio/mp4' },
                { mimeType: 'audio/mpeg' },
                { mimeType: 'audio/wav' },
                { mimeType: 'audio/webm;codecs=opus' },
                { mimeType: 'audio/webm' },
                // Last resort - basic recorder
                null
            ];
            
            let recorderCreated = false;
            
            for (const config of configurations) {
                try {
                    if (config && config.mimeType && !MediaRecorder.isTypeSupported(config.mimeType)) {
                        console.log('🎵 [MediaRecorder] Skipping unsupported format:', config.mimeType);
                        continue;
                    }
                    
                    this.mediaRecorder = config ? 
                        new MediaRecorder(this.currentStream, config) : 
                        new MediaRecorder(this.currentStream);
                    
                    console.log('✅ [MediaRecorder] Created with config:', config || 'default');
                    recorderCreated = true;
                    break;
                    
                } catch (error) {
                    console.warn('⚠️ [MediaRecorder] Config failed:', config, error.message);
                    continue;
                }
            }
            
            if (!recorderCreated) {
                throw new Error('Failed to create MediaRecorder with any configuration');
            }
            
            this.setupRecorderEvents();
            
            // Start recording with extensive debugging
            try {
                console.log(' [MediaRecorder] Attempting to start recording...');
                console.log(' [MediaRecorder] Stream active:', this.currentStream.active);
                console.log(' [MediaRecorder] MediaRecorder state:', this.mediaRecorder.state);
                console.log(' [MediaRecorder] Audio tracks active:', audioTracks.map(t => t.readyState));
                
                this.mediaRecorder.start();
                console.log('✅ [MediaRecorder] Started successfully with state:', this.mediaRecorder.state);
                
                // Wait a moment to verify it actually started
                setTimeout(() => {
                    console.log('🔍 [MediaRecorder] State after start:', this.mediaRecorder.state);
                }, 100);
                
            } catch (startError) {
                console.error('❌ [MediaRecorder] Start failed:', startError);
                console.error('🔍 [MediaRecorder] Debug info:', {
                    streamActive: this.currentStream.active,
                    streamId: this.currentStream.id,
                    audioTracksCount: audioTracks.length,
                    audioTracksState: audioTracks.map(t => t.readyState),
                    recorderState: this.mediaRecorder.state
                });
                throw startError;
            }
            this.isRecording = true;
            this.totalRecordingTime = 0;
            this.estimatedCost = 0;
            
            // Setup chunk processing
            this.startChunkProcessing();
            
            console.log('✅ [MediaRecorder] Recording started successfully');
            console.log('🎵 [MediaRecorder] Audio format:', this.recordingOptions.mimeType);
            
        } catch (error) {
            console.error('❌ [MediaRecorder] Failed to start recording:', error);
            this.showError('Failed to start audio recording: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Stop recording and process final chunk
     */
    async stopRecording() {
        if (!this.isRecording) {
            console.log('🎙️ [MediaRecorder] Not recording, ignoring stop');
            return;
        }
        
        console.log('🛑 [MediaRecorder] === STOPPING RECORDING ===');
        
        this.isRecording = false;
        
        // Stop chunk processing
        if (this.chunkInterval) {
            clearInterval(this.chunkInterval);
            this.chunkInterval = null;
        }
        
        // Stop MediaRecorder
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        // Process any remaining audio chunks
        await this.processRemainingChunks();
        
        console.log(`✅ [MediaRecorder] Recording stopped. Total time: ${this.totalRecordingTime.toFixed(1)}s`);
        console.log(`💰 [MediaRecorder] Estimated cost: $${this.estimatedCost.toFixed(4)}`);
    }
    
    /**
     * Get current audio stream from audio system
     */
    async getCurrentAudioStream() {
        const audioSystem = this.app.audioSystem;
        
        if (!audioSystem) {
            console.error('❌ [MediaRecorder] Audio system not available');
            return null;
        }
        
        console.log('🔍 [MediaRecorder] Current audio source:', audioSystem.currentAudioSource);
        console.log('🔍 [MediaRecorder] Available streams - mic:', !!audioSystem.microphoneStream, 'system:', !!audioSystem.systemStream);
        
        // Use existing streams from AudioSystem (avoid duplicate permissions)
        if (audioSystem.currentAudioSource === 'microphone') {
            if (audioSystem.microphoneStream && audioSystem.microphoneStream.active) {
                console.log('🎤 [MediaRecorder] Using existing microphone stream');
                return audioSystem.microphoneStream;
            } else {
                console.log('🎤 [MediaRecorder] Requesting fresh microphone stream');
                return await this.requestMicrophoneStream();
            }
        } else if (audioSystem.currentAudioSource === 'system') {
            if (audioSystem.systemStream && audioSystem.systemStream.active) {
                console.log('🖥️ [MediaRecorder] Using existing system audio stream');
                
                // Detailed stream analysis
                const audioTracks = audioSystem.systemStream.getAudioTracks();
                const videoTracks = audioSystem.systemStream.getVideoTracks();
                
                console.log('🔍 [MediaRecorder] Stream analysis:');
                console.log('  🎵 Audio tracks:', audioTracks.length);
                console.log('  🎬 Video tracks:', videoTracks.length);
                
                audioTracks.forEach((track, i) => {
                    console.log(`  🎵 Audio track ${i}:`, {
                        label: track.label,
                        enabled: track.enabled,
                        readyState: track.readyState,
                        muted: track.muted
                    });
                });
                
                if (videoTracks.length > 0) {
                    console.log('🖥️ [MediaRecorder] System stream has video tracks, might need special handling');
                }
                
                return audioSystem.systemStream;
            } else {
                console.log('🖥️ [MediaRecorder] No system stream available - cannot record');
                throw new Error('No system audio stream available. Please switch to system audio first.');
            }
        }
        
        console.error('❌ [MediaRecorder] Unknown audio source:', audioSystem.currentAudioSource);
        return null;
    }
    
    /**
     * Request microphone stream
     */
    async requestMicrophoneStream() {
        try {
            // FIXED: Check if AudioSystem already has a stream to avoid double permission
            if (this.app?.audioSystem?.microphoneStream) {
                console.log('🎙️ [MediaRecorder] Using existing microphone stream from AudioSystem');
                return this.app.audioSystem.microphoneStream;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 16000 // Optimal for Whisper
                }
            });
            
            console.log('✅ [MediaRecorder] Microphone stream acquired');
            return stream;
            
        } catch (error) {
            console.error('❌ [MediaRecorder] Microphone access failed:', error);
            throw new Error('Microphone access denied. Please allow microphone permissions.');
        }
    }
    
    /**
     * Request system audio stream
     */
    async requestSystemAudioStream() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                },
                video: { width: 1, height: 1 } // Minimal video for audio capture
            });
            
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio tracks available in system stream');
            }
            
            console.log('✅ [MediaRecorder] System audio stream acquired');
            console.log('🎧 [MediaRecorder] Audio track:', audioTracks[0].label);
            
            return stream;
            
        } catch (error) {
            console.error('❌ [MediaRecorder] System audio access failed:', error);
            throw new Error('System audio access failed. Please share a tab with audio.');
        }
    }
    
    /**
     * Setup MediaRecorder event handlers
     */
    setupRecorderEvents() {
        this.audioChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
            console.log('🔍 [MediaRecorder] ondataavailable fired - event.data:', !!event.data, 'size:', event.data?.size || 0);
            if (event.data && event.data.size > 0) {
                this.audioChunks.push(event.data);
                console.log(`📦 [MediaRecorder] Chunk received: ${event.data.size} bytes`);
            } else {
                console.log('⚠️ [MediaRecorder] Empty or no data in ondataavailable event');
            }
        };
        
        this.mediaRecorder.onstop = async () => {
            console.log('🔄 [MediaRecorder] MediaRecorder stopped, processing final chunks');
            await this.processFinalChunks();
        };
        
        this.mediaRecorder.onerror = (event) => {
            console.error('❌ [MediaRecorder] Recording error:', event.error);
            this.showError('Recording error: ' + event.error.message);
        };
        
        this.mediaRecorder.onstart = () => {
            console.log('▶️ [MediaRecorder] Recording started');
        };
    }
    
    /**
     * Start processing chunks at regular intervals
     */
    startChunkProcessing() {
        console.log(`⏰ [MediaRecorder] Starting chunk processing every ${this.chunkDuration/1000}s`);
        
        this.chunkInterval = setInterval(() => {
            this.processChunk();
        }, this.chunkDuration);
    }
    
    /**
     * Process current audio chunk for Whisper transcription
     */
    async processChunk() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        console.log('🔄 [MediaRecorder] Processing audio chunk...');
        
        // Request data from MediaRecorder
        console.log('📞 [MediaRecorder] Calling requestData() - recorder state:', this.mediaRecorder.state);
        this.mediaRecorder.requestData();
        
        // Wait a moment for data to be available
        setTimeout(async () => {
            await this.sendChunksToWhisper();
        }, 100);
        
        // Update timing and cost
        this.totalRecordingTime += this.chunkDuration / 1000;
        this.estimatedCost = (this.totalRecordingTime / 60) * 0.006; // $0.006 per minute
        
        // Update UI with cost estimate
        this.updateCostDisplay();
    }
    
    /**
     * Send collected audio chunks to Whisper API
     */
    async sendChunksToWhisper() {
        if (this.audioChunks.length === 0) {
            console.log('📦 [MediaRecorder] No audio chunks to process');
            return;
        }
        
        console.log(` [MediaRecorder] Sending ${this.audioChunks.length} chunks to Whisper`);
        
        try {
            // Combine chunks into single blob
            const audioBlob = new Blob(this.audioChunks, { 
                type: this.recordingOptions.mimeType 
            });
            
            console.log(`📤 [MediaRecorder] Audio blob created:`);
            console.log(`  ➤ Size: ${(audioBlob.size / 1024).toFixed(1)}KB (${audioBlob.size} bytes)`);
            console.log(`  ➤ Type: "${audioBlob.type}"`);
            console.log(`  ➤ Recording options used: ${JSON.stringify(this.recordingOptions)}`);
            
            // Validate audio blob before sending
            if (audioBlob.size === 0) {
                console.error('❌ [MediaRecorder] Audio blob is empty - recording failed');
                return;
            }
            
            if (audioBlob.size < 100) {
                console.warn('⚠️ [MediaRecorder] Audio blob is very small - might be corrupted');
            }
            
            if (!audioBlob.type || audioBlob.type === '') {
                console.error('❌ [MediaRecorder] Audio blob has no MIME type');
                return;
            }
            
            console.log('✅ [MediaRecorder] Audio blob validation passed');
            
            // Send to Whisper client
            if (this.app.whisperClient) {
                await this.app.whisperClient.transcribeAudio(audioBlob, {
                    duration: this.chunkDuration / 1000,
                    source: this.app.audioSystem.currentAudioSource
                });
            } else {
                console.error('❌ [MediaRecorder] Whisper client not available');
            }
            
            // Clear processed chunks
            this.audioChunks = [];
            
        } catch (error) {
            console.error('❌ [MediaRecorder] Failed to send chunks to Whisper:', error);
            this.showError('Transcription failed: ' + error.message);
        }
    }
    
    /**
     * Process remaining chunks when recording stops
     */
    async processRemainingChunks() {
        if (this.audioChunks.length > 0) {
            console.log('🔄 [MediaRecorder] Processing remaining chunks...');
            await this.sendChunksToWhisper();
        }
    }
    
    /**
     * Process final chunks when MediaRecorder stops
     */
    async processFinalChunks() {
        console.log('🏁 [MediaRecorder] Processing final chunks...');
        await this.sendChunksToWhisper();
    }
    
    /**
     * Update cost display in UI
     */
    updateCostDisplay() {
        const minutes = this.totalRecordingTime / 60;
        const cost = minutes * 0.006;
        
        // Update UI elements if they exist
        const costElement = document.getElementById('transcriptionCost');
        if (costElement) {
            costElement.textContent = `${minutes.toFixed(1)}min ($${cost.toFixed(4)})`;
        }
        
        console.log(`💰 [MediaRecorder] Cost update: ${minutes.toFixed(1)}min = $${cost.toFixed(4)}`);
    }
    
    /**
     * Show error message to user
     */
    showError(message) {
        console.error('❌ [MediaRecorder] Error:', message);
        
        // Show in transcript UI if available
        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
            this.app.transcriptSystem.ui.showErrorState(message);
        }
    }
    
    /**
     * Get recording statistics
     */
    getStats() {
        return {
            isRecording: this.isRecording,
            totalTime: this.totalRecordingTime,
            estimatedCost: this.estimatedCost,
            audioSource: this.app.audioSystem?.currentAudioSource || 'unknown',
            chunkDuration: this.chunkDuration / 1000
        };
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('🧹 [MediaRecorder] Cleaning up resources...');
        
        if (this.chunkInterval) {
            clearInterval(this.chunkInterval);
            this.chunkInterval = null;
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        this.audioChunks = [];
        this.currentStream = null;
        this.isRecording = false;
    }
}

// Export to window
window.MediaRecorderManager = MediaRecorderManager;