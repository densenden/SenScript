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
        
        // Quality settings for different sources
        this.recordingOptions = {
            mimeType: 'audio/webm;codecs=opus', // Best for Whisper
            audioBitsPerSecond: 64000, // Good quality, smaller files
            videoBitsPerSecond: 0 // Audio only
        };
        
        console.log('🎙️ [MediaRecorder] Initialized for Whisper transcription');
    }
    
    /**
     * Start recording from current audio source (microphone or system)
     */
    async startRecording() {
        if (this.isRecording) {
            console.log('🎙️ [MediaRecorder] Already recording, ignoring start');
            return;
        }
        
        console.log('🚀 [MediaRecorder] === STARTING RECORDING ===');
        
        try {
            // Get current audio stream from audio system
            this.currentStream = await this.getCurrentAudioStream();
            if (!this.currentStream) {
                throw new Error('No audio stream available');
            }
            
            // Check MediaRecorder support
            if (!MediaRecorder.isTypeSupported(this.recordingOptions.mimeType)) {
                console.warn('🎙️ [MediaRecorder] Preferred format not supported, trying fallback');
                this.recordingOptions.mimeType = 'audio/webm';
            }
            
            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.currentStream, this.recordingOptions);
            this.setupRecorderEvents();
            
            // Start recording
            this.mediaRecorder.start();
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
        
        if (audioSystem.currentAudioSource === 'microphone') {
            // Use microphone stream
            if (audioSystem.microphoneStream && audioSystem.microphoneStream.active) {
                console.log('🎤 [MediaRecorder] Using microphone stream');
                return audioSystem.microphoneStream;
            } else {
                console.log('🎤 [MediaRecorder] Requesting microphone access');
                return await this.requestMicrophoneStream();
            }
        } else if (audioSystem.currentAudioSource === 'system') {
            // Use system stream
            if (audioSystem.systemStream && audioSystem.systemStream.active) {
                console.log('🖥️ [MediaRecorder] Using system audio stream');
                return audioSystem.systemStream;
            } else {
                console.log('🖥️ [MediaRecorder] Requesting system audio access');
                return await this.requestSystemAudioStream();
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
            if (event.data && event.data.size > 0) {
                this.audioChunks.push(event.data);
                console.log(`📦 [MediaRecorder] Chunk received: ${event.data.size} bytes`);
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
        
        console.log(`🚀 [MediaRecorder] Sending ${this.audioChunks.length} chunks to Whisper`);
        
        try {
            // Combine chunks into single blob
            const audioBlob = new Blob(this.audioChunks, { 
                type: this.recordingOptions.mimeType 
            });
            
            console.log(`📤 [MediaRecorder] Audio blob size: ${(audioBlob.size / 1024).toFixed(1)}KB`);
            
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