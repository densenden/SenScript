/**
 * Emergency fix for the double permission and audio issues
 * This patch should be loaded after other audio components
 */

// Global stream storage to prevent double permission requests
window.audioPermissionManager = {
    sharedMicStream: null,
    streamUsers: new Set(),
    
    // Get shared microphone stream (request once, share everywhere)
    async getSharedMicStream() {
        if (this.sharedMicStream && this.sharedMicStream.active) {
            console.log('🎤 [PermissionFix] Using cached microphone stream');
            return this.sharedMicStream;
        }
        
        console.log('🎤 [PermissionFix] Requesting NEW microphone permission');
        try {
            this.sharedMicStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 48000
                }
            });
            
            console.log('✅ [PermissionFix] Microphone permission granted - sharing with all components');
            this.shareStreamWithComponents();
            return this.sharedMicStream;
            
        } catch (error) {
            console.error('❌ [PermissionFix] Permission denied:', error);
            throw error;
        }
    },
    
    // Share the stream with all audio components
    shareStreamWithComponents() {
        if (!this.sharedMicStream) return;
        
        const app = window.app;
        if (!app) return;
        
        // Share with AudioSystem
        if (app.audioSystem) {
            app.audioSystem.microphoneStream = this.sharedMicStream;
            console.log('🔄 [PermissionFix] Shared stream with AudioSystem');
        }
        
        // Share with MediaRecorder
        if (app.mediaRecorder) {
            app.mediaRecorder.currentStream = this.sharedMicStream;
            console.log('🔄 [PermissionFix] Shared stream with MediaRecorder');
        }
        
        // Share with SpeechRecognition (if it has a stream property)
        if (app.speechRecognition) {
            app.speechRecognition.stream = this.sharedMicStream;
            console.log('🔄 [PermissionFix] Shared stream with SpeechRecognition');
        }
    },
    
    // Clean up when done
    cleanup() {
        if (this.sharedMicStream) {
            this.sharedMicStream.getTracks().forEach(track => track.stop());
            this.sharedMicStream = null;
        }
        this.streamUsers.clear();
    }
};

// Override getUserMedia to prevent double requests
const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
let getUserMediaCallCount = 0;

navigator.mediaDevices.getUserMedia = async function(constraints) {
    getUserMediaCallCount++;
    console.log(`🎤 [PermissionFix] getUserMedia call #${getUserMediaCallCount}`);
    
    // If it's for audio and we already have a stream, return the cached one
    if (constraints?.audio && window.audioPermissionManager.sharedMicStream?.active) {
        console.log('🎤 [PermissionFix] PREVENTING duplicate request - returning cached stream');
        return window.audioPermissionManager.sharedMicStream;
    }
    
    // Otherwise, proceed with the original request
    const stream = await originalGetUserMedia.call(this, constraints);
    
    // If this was an audio request, cache it
    if (constraints?.audio) {
        window.audioPermissionManager.sharedMicStream = stream;
        window.audioPermissionManager.shareStreamWithComponents();
    }
    
    return stream;
};

// Fix the export button issue
document.addEventListener('DOMContentLoaded', () => {
    // Check if exportTranscriptBtn exists, if not, create a temporary one
    if (!document.getElementById('exportTranscriptBtn')) {
        console.warn('[PermissionFix] Creating missing exportTranscriptBtn');
        const btn = document.createElement('button');
        btn.id = 'exportTranscriptBtn';
        btn.style.display = 'none';
        document.body.appendChild(btn);
    }
});

// Monitor for audio connection errors and provide fixes
let audioContextErrorCount = 0;

window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('connect')) {
        audioContextErrorCount++;
        console.warn(`🎵 [PermissionFix] Audio connection error #${audioContextErrorCount}:`, event.message);
        
        // Try to fix by recreating audio context
        if (window.app?.audioSystem) {
            setTimeout(() => {
                try {
                    const audioSystem = window.app.audioSystem;
                    if (audioSystem.audioContext) {
                        audioSystem.audioContext = null; // Force recreation
                    }
                    console.log('🎵 [PermissionFix] Audio context reset for retry');
                } catch (e) {
                    console.log('🎵 [PermissionFix] Could not reset audio context');
                }
            }, 1000);
        }
    }
});

console.log('✅ [PermissionFix] Audio permission fix loaded - no more double requests!');