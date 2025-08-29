/**
 * SenScript Main Application
 * Clean modular entry point
 */

class SenScript {
    constructor() {
        console.log('🚀 SenScript initializing...');
        
        // Core properties
        this.recognition = null;
        this.isListening = false;
        this.shouldBeListening = false;
        this.transcript = '';
        this.transcriptLines = [];
        this.currentInterim = '';
        this.pendingSentence = '';
        this.cards = [];
        this.currentAudioSource = 'microphone';
        this.currentLang = 'en-US'; // Default to English for better recognition
        
        // Initialize modules
        this.initializeElements();
        this.initializeModules();
        this.setupEventListeners();
        
        console.log('✅ SenScript initialized successfully');
        
        // Expose test functions globally
        this.exposeTestFunctions();
    }
    
    initializeElements() {
        this.els = {
            recordBtn: document.getElementById('recordBtn'),
            mobileRecordBtn: document.getElementById('mobileRecordBtn'),
            testTranscriptsBtn: document.getElementById('testTranscriptsBtn'),
            recordDot: document.getElementById('recordDot'),
            recordText: document.getElementById('recordText'),
            transcript: document.getElementById('transcript'),
            cardsContainer: document.getElementById('cardsContainer'),
            cardCount: document.getElementById('cardCount'),
            mobileSettingsBtn: document.getElementById('mobileSettingsBtn'),
            exportBtn: document.getElementById('exportBtn'),
            exportTranscriptBtn: document.getElementById('exportTranscriptBtn'),
            audioSourceSwitch: document.getElementById('audioSourceSwitch'),
            langCode: document.getElementById('langCodeTranscript'),
            transcriptLanguageFlag: document.getElementById('transcriptLanguageFlag'),
            logo: document.getElementById('logo'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            settingsClose: document.getElementById('settingsClose'),
            settingsContent: document.getElementById('settingsContent'),
            saveSettings: document.getElementById('saveSettings'),
            educationLevel: document.getElementById('educationLevel'),
            detailLevel: document.getElementById('detailLevel'),
            exampleComplexity: document.getElementById('exampleComplexity'),
            micLevelDots: document.querySelectorAll('#micLevelDots .level-dot'),
            deviceLevelDots: document.querySelectorAll('#deviceLevelDots .level-dot')
        };
    }
    
    initializeModules() {
        // Initialize database manager first
        this.db = new DatabaseManager();
        
        // Initialize audio system (V3 - Perfect Audio Flow)
        this.audioSystem = new AudioSystemV3(this);
        
        // Initialize Whisper transcription system
        this.whisperClient = new WhisperClient(this);
        this.mediaRecorder = new MediaRecorderManager(this);
        
        // Load Whisper usage stats on startup
        this.whisperClient.loadUsageStats();
        
        // Initialize speech recognition (primary transcription method)
        this.speechRecognition = new SpeechRecognitionManager(this);
        
        // Initialize card generator (restored from legacy)
        this.cardGenerator = new CardGenerator(this);
        
        // Initialize card engine
        this.cardEngine = new CardEngine(this);
        
        // Initialize transcript system (unified)
        this.transcriptSystem = new TranscriptSystem(this);
        
        // Initialize UI components
        this.ui = new UIManager(this);
        
        // Initialize input language handler (legacy - will be replaced by transcript system)
        this.inputLanguageHandler = new InputLanguageHandler(this);
        
        // Initialize settings
        this.settings = new SettingsManager(this);
        
        // Initialize all settings UI after a delay
        setTimeout(() => {
            if (this.settings && this.settings.initializeAllSettingsUI) {
                this.settings.initializeAllSettingsUI();
            }
            
            // Initialize input language handler after settings are ready
            if (this.inputLanguageHandler && this.inputLanguageHandler.initialize) {
                this.inputLanguageHandler.initialize();
            }
        }, 1500);
    }
    
    setupEventListeners() {
        // Record button
        this.els.recordBtn.onclick = () => this.toggleListening();
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.onclick = () => this.toggleListening();
        }
        
        // Export buttons
        this.els.exportBtn.onclick = () => this.exportCards();
        this.els.exportTranscriptBtn.onclick = () => this.exportTranscript();
        
        // Settings
        this.els.settingsBtn.onclick = () => this.ui.showSettings();
        this.els.settingsClose.onclick = () => this.ui.closeSettings();
        this.els.saveSettings.onclick = () => this.settings.saveSettings();
    }
    
    toggleListening() {
        // Whisper-only mode: Check MediaRecorder state
        if (this.mediaRecorder && this.mediaRecorder.isRecording) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    async startListening() {
        console.log('🚀 [Control] === START BUTTON CLICKED ===');
        
        // Add recording class for button animation
        this.els.recordBtn.classList.add('recording');
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.classList.add('recording');
        }
        
        // Update button text
        if (this.els.recordText) {
            this.els.recordText.textContent = 'Stop';
        }
        
        // V3: Ensure audio source is ready for transcription
        const hasAudioSource = await this.audioSystem.ensureAudioSourceForTranscription();
        if (!hasAudioSource) {
            console.error('🚀 [Control] ❌ Audio source not ready for transcription');
            // Remove recording class if failed
            this.els.recordBtn.classList.remove('recording');
            if (this.els.mobileRecordBtn) {
                this.els.mobileRecordBtn.classList.remove('recording');
            }
            if (this.els.recordText) {
                this.els.recordText.textContent = 'Start';
            }
            return;
        }
        
        // Start transcript session  
        this.transcriptSystem.startSession();
        
        // Start Web Speech API (primary transcription)
        if (this.speechRecognition) {
            try {
                this.speechRecognition.start();
                console.log('✅ [Control] Web Speech API started successfully');
            } catch (speechError) {
                console.error('❌ [Control] Web Speech API failed to start:', speechError);
            }
        } else {
            console.error('❌ [Control] SpeechRecognitionManager not available');
        }
        
        // Optional Whisper transcription (if enabled in settings)
        if (this.settings && this.settings.settings && this.settings.settings.enableWhisper) {
            console.log('🎯 [Control] Starting optional Whisper transcription (user enabled)');
            
            try {
                await this.mediaRecorder.startRecording();
                console.log('✅ [Control] Whisper transcription started successfully');
                
                // Show cost tracking display
                this.showCostTracking();
                
            } catch (error) {
                console.warn('⚠️ [Control] Whisper transcription failed (optional):', error.message);
                console.log('ℹ️ [Control] Continuing with Web Speech API only');
                // Don't reset UI - Web Speech API continues working
            }
        } else {
            console.log('ℹ️ [Control] Whisper disabled in settings - using Web Speech API only');
        }
        
        // Start database session tracking
        if (this.db) {
            this.currentSession = await this.db.startListeningSession();
        }
    }
    
    async stopListening() {
        console.log('🛑 [Control] === STOP BUTTON CLICKED ===');
        
        // Remove recording class for button animation
        this.els.recordBtn.classList.remove('recording');
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.classList.remove('recording');
        }
        
        // Update button text
        if (this.els.recordText) {
            this.els.recordText.textContent = 'Start';
        }
        
        // Stop Web Speech API (primary transcription)
        if (this.speechRecognition) {
            try {
                this.speechRecognition.stop();
                console.log('✅ [Control] Web Speech API stopped');
            } catch (speechError) {
                console.warn('⚠️ [Control] Error stopping Web Speech API:', speechError);
            }
        }
        
        // Stop Whisper transcription system (if it was started)
        if (this.mediaRecorder && this.mediaRecorder.isRecording) {
            await this.mediaRecorder.stopRecording();
            console.log('✅ [Control] Whisper transcription stopped');
            
            // Hide cost tracking display
            this.hideCostTracking();
        }
        
        // Web Speech API disabled - Whisper-only mode
        
        // Stop transcript session
        this.transcriptSystem.stopSession();
        
        // End database session tracking
        if (this.db) {
            this.db.endListeningSession();
            this.currentSession = null;
        }
    }
    
    exportCards() {
        // Implementation moved to UI module
        this.ui.exportCards();
    }
    
    exportTranscript() {
        // Implementation moved to UI module
        this.ui.exportTranscript();
    }
    
    startMinuteCounting() {
        // Start counting usage minutes
        if (!this.minuteCounterInterval) {
            this.startTime = Date.now();
            this.minuteCounterInterval = setInterval(() => {
                const minutes = Math.floor((Date.now() - this.startTime) / 60000);
                console.log(`[Usage] ${minutes} minutes of listening`);
            }, 60000);
        }
    }
    
    stopMinuteCounting() {
        // Stop counting usage minutes
        if (this.minuteCounterInterval) {
            clearInterval(this.minuteCounterInterval);
            this.minuteCounterInterval = null;
            const totalMinutes = Math.floor((Date.now() - this.startTime) / 60000);
            console.log(`[Usage] Total session: ${totalMinutes} minutes`);
        }
    }
    
    exposeTestFunctions() {
        try {
            window.testCards = () => this.cardEngine.runCardGenerationTests();
            window.testCheat = () => this.cardEngine.runCheatCardTests();
            window.resetAllCaches = () => this.cardEngine.resetAllCaches();
            window.app = this;
            
            console.log('🧪 Test functions exposed:');
            console.log('  testCards() - Run card generation tests');
            console.log('  testCheat() - Run CheatCard tests');
            console.log('  window.app - Access main app instance');
            
            if (typeof window.testCards === 'function' && typeof window.testCheat === 'function') {
                console.log('✅ Test function verification passed!');
            } else {
                console.error('❌ Test function verification failed!');
            }
        } catch (error) {
            console.error('❌ Error exposing test functions:', error);
        }
    }
    
    /**
     * Process incoming transcript text using the new transcript processor
     */
    processTranscript(text) {
        if (this.transcriptProcessor) {
            this.transcriptProcessor.processTranscriptUpdate(text);
        } else {
            console.warn('[Main] TranscriptProcessor not available, falling back to direct card generation');
            if (this.cardEngine) {
                this.cardEngine.processText(text);
            }
        }
    }
    
    /**
     * Update usage minutes in database
     */
    updateUsageMinutes(minutes) {
        try {
            // Save to localStorage for now (database integration coming)
            const usageData = JSON.parse(localStorage.getItem('senscript_usage') || '{}');
            const today = new Date().toDateString();
            
            if (!usageData[today]) {
                usageData[today] = { minutes: 0, cards: 0, sessions: 0 };
            }
            
            usageData[today].minutes = minutes;
            usageData[today].cards = this.cards.length;
            
            localStorage.setItem('senscript_usage', JSON.stringify(usageData));
            
            // Check for low minutes warning
            this.checkLowMinutesWarning(minutes);
            
        } catch (error) {
            console.error('[Usage] Failed to update usage minutes:', error);
        }
    }
    
    /**
     * Check and show warning when user has 5 or fewer minutes remaining
     */
    checkLowMinutesWarning(usedMinutes) {
        const monthlyLimit = 60; // Example limit
        const remaining = monthlyLimit - usedMinutes;
        
        if (remaining <= 5 && remaining > 0) {
            console.warn(`⚠️ [Usage] Only ${remaining} minutes remaining this month!`);
            
            // Show warning in UI if available
            if (this.ui && this.ui.showNotification) {
                this.ui.showNotification(
                    `Warning: Only ${remaining} minutes remaining this month`,
                    'warning'
                );
            }
        } else if (remaining <= 0) {
            console.error('❌ [Usage] Monthly usage limit exceeded!');
            
            // Show critical warning
            if (this.ui && this.ui.showNotification) {
                this.ui.showNotification(
                    'Usage limit exceeded. Please upgrade your plan.',
                    'error'
                );
            }
        }
    }
    
    /**
     * Get usage statistics for display
     */
    getUsageStats() {
        try {
            const usageData = JSON.parse(localStorage.getItem('senscript_usage') || '{}');
            const today = new Date().toDateString();
            const currentSession = usageData[today] || { minutes: 0, cards: 0, sessions: 0 };
            
            // Calculate total usage across all days
            const totalMinutes = Object.values(usageData).reduce((sum, day) => sum + (day.minutes || 0), 0);
            const totalCards = Object.values(usageData).reduce((sum, day) => sum + (day.cards || 0), 0);
            
            return {
                todayMinutes: currentSession.minutes,
                todayCards: currentSession.cards,
                totalMinutes,
                totalCards,
                sessionsCount: Object.keys(usageData).length
            };
        } catch (error) {
            console.error('[Usage] Failed to get usage stats:', error);
            return {
                todayMinutes: 0,
                todayCards: 0,
                totalMinutes: 0,
                totalCards: 0,
                sessionsCount: 0
            };
        }
    }
    
    /**
     * Show cost tracking display during recording
     */
    showCostTracking() {
        const whisperUsage = document.getElementById('whisperUsage');
        const transcriptionCost = document.getElementById('transcriptionCost');
        
        if (whisperUsage) {
            whisperUsage.style.display = 'flex';
            whisperUsage.style.gap = '4px';
        }
        
        if (transcriptionCost) {
            transcriptionCost.style.display = 'block';
        }
        
        console.log('💰 [Control] Cost tracking display shown');
    }
    
    /**
     * Hide cost tracking display when recording stops
     */
    hideCostTracking() {
        const whisperUsage = document.getElementById('whisperUsage');
        const transcriptionCost = document.getElementById('transcriptionCost');
        
        if (whisperUsage) {
            whisperUsage.style.display = 'none';
        }
        
        if (transcriptionCost) {
            transcriptionCost.style.display = 'none';
        }
        
        console.log('💰 [Control] Cost tracking display hidden');
    }
}

// Export SenScript class to window
window.SenScript = SenScript;

// Initialize when DOM is ready (prevent multiple initialization)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.senScript) {
            window.senScript = new SenScript();
        }
    });
} else {
    if (!window.senScript) {
        window.senScript = new SenScript();
    }
}