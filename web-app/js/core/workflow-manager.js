/**
 * Workflow Manager - Centralized workflow coordination
 * Ensures proper initialization order and prevents race conditions
 */
export class WorkflowManager {
    constructor(app) {
        this.app = app;
        this.initialized = false;
        this.permissionGranted = false;
        this.audioStream = null;
    }
    
    /**
     * Initialize the complete workflow
     */
    async initialize() {
        if (this.initialized) {
            console.log('[Workflow] Already initialized');
            return;
        }
        
        console.log('[Workflow] === INITIALIZING WORKFLOW ===');
        
        try {
            // Step 1: Request audio permission ONCE
            await this.requestAudioPermission();
            
            // Step 2: Initialize UI (preserves existing segments)
            this.initializeUI();
            
            // Step 3: Setup audio components with shared stream
            await this.setupAudioComponents();
            
            this.initialized = true;
            console.log('[Workflow] ✅ Workflow initialized successfully');
            
        } catch (error) {
            console.error('[Workflow] ❌ Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Request audio permission once and share the stream
     */
    async requestAudioPermission() {
        if (this.permissionGranted && this.audioStream) {
            console.log('[Workflow] Permission already granted, using existing stream');
            return this.audioStream;
        }
        
        console.log('[Workflow] Requesting audio permission...');
        
        try {
            // Request permission ONCE
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 48000
                }
            });
            
            this.permissionGranted = true;
            console.log('[Workflow] ✅ Audio permission granted');
            
            // Share stream with all components
            if (this.app.audioSystem) {
                this.app.audioSystem.microphoneStream = this.audioStream;
            }
            
            return this.audioStream;
            
        } catch (error) {
            console.error('[Workflow] ❌ Permission denied:', error);
            this.permissionGranted = false;
            throw error;
        }
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        console.log('[Workflow] Initializing UI components...');
        
        // Ensure transcript UI doesn't clear existing segments
        if (this.app.transcriptSystem?.ui) {
            const existingSegments = document.querySelectorAll('.finalized-segment');
            if (existingSegments.length > 0) {
                console.log(`[Workflow] Preserving ${existingSegments.length} existing segments`);
            }
        }
        
        console.log('[Workflow] ✅ UI initialized');
    }
    
    /**
     * Setup audio components with shared stream
     */
    async setupAudioComponents() {
        console.log('[Workflow] Setting up audio components...');
        
        // Ensure all components use the shared stream
        const components = [
            this.app.audioSystem,
            this.app.speechRecognition,
            this.app.mediaRecorder
        ];
        
        for (const component of components) {
            if (component && this.audioStream) {
                if (component.setAudioStream) {
                    component.setAudioStream(this.audioStream);
                } else if (component.stream === undefined) {
                    component.stream = this.audioStream;
                }
            }
        }
        
        console.log('[Workflow] ✅ Audio components configured');
    }
    
    /**
     * Start transcription workflow
     */
    async startTranscription() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        console.log('[Workflow] === STARTING TRANSCRIPTION ===');
        
        // Ensure we have permission
        if (!this.permissionGranted) {
            await this.requestAudioPermission();
        }
        
        // Start all transcription services
        const startPromises = [];
        
        // Start Speech Recognition (no permission request)
        if (this.app.speechRecognition) {
            startPromises.push(
                this.app.speechRecognition.start(true) // Skip permission
            );
        }
        
        // Start Media Recorder (uses shared stream)
        if (this.app.mediaRecorder && this.app.settings?.settings?.enableWhisper) {
            startPromises.push(
                this.app.mediaRecorder.startRecording()
            );
        }
        
        await Promise.all(startPromises);
        console.log('[Workflow] ✅ All transcription services started');
    }
    
    /**
     * Stop transcription workflow
     */
    async stopTranscription() {
        console.log('[Workflow] === STOPPING TRANSCRIPTION ===');
        
        const stopPromises = [];
        
        if (this.app.speechRecognition) {
            stopPromises.push(this.app.speechRecognition.stop());
        }
        
        if (this.app.mediaRecorder) {
            stopPromises.push(this.app.mediaRecorder.stopRecording());
        }
        
        await Promise.all(stopPromises);
        console.log('[Workflow] ✅ All transcription services stopped');
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        this.permissionGranted = false;
        this.initialized = false;
        console.log('[Workflow] ✅ Resources cleaned up');
    }
}