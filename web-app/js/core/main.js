/**
 * SenScript Main Application
 * Clean modular entry point
 */

class SenScript {
    constructor() {
        console.log('SenScript initializing...');
        
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
            interimStartBtn: document.getElementById('interimStartBtn'),
            testTranscriptsBtn: document.getElementById('testTranscriptsBtn'),
            recordDot: document.getElementById('recordDot'),
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
            activeLevelDots: document.querySelectorAll('#activeLevelDots .level-dot'),
            levelMeterContainer: document.getElementById('levelMeterContainer'),
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
        
        // Language handling now integrated in TranscriptSystem
        
        // Initialize settings
        this.settings = new SettingsManager(this);
        
        // Initialize all settings UI after a delay
        setTimeout(() => {
            if (this.settings && this.settings.initializeAllSettingsUI) {
                this.settings.initializeAllSettingsUI();
            }
            
            // Setup dynamic element event listeners after transcript UI is ready
            this.setupDynamicEventListeners();
            
            // Language handler integrated in transcript system
        }, 1500);
    }
    
    setupEventListeners() {
        // Record button
        this.els.recordBtn.onclick = () => this.toggleListening();
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.onclick = () => this.toggleListening();
        }
        
        // Interim start button will be handled in setupDynamicEventListeners
        
        // Export buttons
        this.els.exportBtn.onclick = () => this.exportCards();
        this.els.exportTranscriptBtn.onclick = () => this.exportTranscript();
        
        // Settings
        this.els.settingsBtn.onclick = () => this.ui.showSettings();
        this.els.settingsClose.onclick = () => this.ui.closeSettings();
        this.els.saveSettings.onclick = () => this.settings.saveSettings();
    }
    
    /**
     * Setup event listeners for dynamically created elements
     * Called after transcript UI is initialized
     */
    setupDynamicEventListeners() {
        console.log('[Main] Setting up dynamic element event listeners...');
        
        // Interim start button (created by transcript UI)
        const interimStartBtn = document.getElementById('interimStartBtn');
        if (interimStartBtn) {
            interimStartBtn.onclick = () => this.toggleListening();
            console.log('[Main] ✅ Interim start button event listener added');
        } else {
            console.warn('[Main] ⚠️ Interim start button not found');
        }
        
        // Transcript export button (created by transcript UI)  
        const exportTranscriptBtn = document.getElementById('exportTranscriptBtn');
        if (exportTranscriptBtn) {
            exportTranscriptBtn.onclick = () => this.exportTranscript();
            console.log('[Main] ✅ Export transcript button event listener added');
        } else {
            console.warn('[Main] ⚠️ Export transcript button not found');
        }
        
        // Input source indicator button (created by transcript UI)
        const inputSourceIndicator = document.getElementById('inputSourceIndicator');
        if (inputSourceIndicator) {
            inputSourceIndicator.onclick = () => {
                // Toggle between microphone and system audio
                if (this.audioSystem && this.audioSystem.switchAudioSource) {
                    const newSource = this.audioSystem.currentAudioSource === 'microphone' ? 'system' : 'microphone';
                    this.audioSystem.switchAudioSource(newSource);
                    console.log(`[Main] Switching audio source to: ${newSource}`);
                }
            };
            console.log('[Main] ✅ Input source indicator event listener added');
        } else {
            console.warn('[Main] ⚠️ Input source indicator not found');
        }
    }
    
    toggleListening() {
        // Check if any transcription system is active
        const isRecording = (this.mediaRecorder && this.mediaRecorder.isRecording) || 
                           (this.speechRecognition && this.speechRecognition.shouldBeListening) ||
                           this.isListening;
                           
        if (isRecording) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    async startListening() {
        console.log('[Control] === START BUTTON CLICKED ===');
        
        // Set listening state
        this.isListening = true;
        
        // Add recording class for button animation and update icon
        this.els.recordBtn.classList.add('recording');
        const recordIcon = document.getElementById('recordIcon');
        if (recordIcon) {
            recordIcon.textContent = 'pause';
        }
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.classList.add('recording');
        }
        
        // Update interim start button
        if (this.els.interimStartBtn) {
            this.els.interimStartBtn.classList.add('recording');
            const interimStartIcon = document.getElementById('interimStartIcon');
            if (interimStartIcon) {
                interimStartIcon.textContent = 'pause';
            }
        }
        
        // Update button text
        
        // V3: Ensure audio source is ready for transcription
        const hasAudioSource = await this.audioSystem.ensureAudioSourceForTranscription();
        if (!hasAudioSource) {
            console.error('[Control] Audio source not ready for transcription');
            // Reset state if failed
            this.isListening = false;
            // Remove recording class if failed
            this.els.recordBtn.classList.remove('recording');
            if (this.els.mobileRecordBtn) {
                this.els.mobileRecordBtn.classList.remove('recording');
            }
            return;
        }
        
        // Start transcript session  
        this.transcriptSystem.startSession();
        
        // Start Web Speech API (primary transcription)
        if (this.speechRecognition) {
            try {
                this.speechRecognition.startListening();
                console.log('[Control] Web Speech API started successfully');
            } catch (speechError) {
                console.error('[Control] Web Speech API failed to start:', speechError);
            }
        } else {
            console.error('[Control] SpeechRecognitionManager not available');
        }
        
        // Optional Whisper transcription (if enabled in settings)
        if (this.settings && this.settings.settings && this.settings.settings.enableWhisper) {
            console.log('[Control] Starting optional Whisper transcription (user enabled)');
            
            try {
                await this.mediaRecorder.startRecording();
                console.log('[Control] Whisper transcription started successfully');
                
                // Show cost tracking display
                this.showCostTracking();
                
            } catch (error) {
                console.warn('[Control] Whisper transcription failed (optional):', error.message);
                console.log('[Control] Continuing with Web Speech API only');
                // Don't reset UI - Web Speech API continues working
            }
        } else {
            console.log('[Control] Whisper disabled in settings - using Web Speech API only');
        }
        
        // Start database session tracking
        if (this.db) {
            this.currentSession = await this.db.startListeningSession();
        }
    }
    
    async stopListening() {
        console.log('[Control] === STOP BUTTON CLICKED ===');
        
        // Reset listening state
        this.isListening = false;
        
        // Remove recording class for button animation and update icon
        this.els.recordBtn.classList.remove('recording');
        const recordIcon = document.getElementById('recordIcon');
        if (recordIcon) {
            recordIcon.textContent = 'play_arrow';
        }
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.classList.remove('recording');
        }
        
        // Update interim start button
        if (this.els.interimStartBtn) {
            this.els.interimStartBtn.classList.remove('recording');
            const interimStartIcon = document.getElementById('interimStartIcon');
            if (interimStartIcon) {
                interimStartIcon.textContent = 'play_arrow';
            }
        }
        
        // Update button text
        
        // Stop Web Speech API (primary transcription)
        if (this.speechRecognition) {
            try {
                this.speechRecognition.stopListening();
                console.log('[Control] Web Speech API stopped');
            } catch (speechError) {
                console.warn('[Control] Error stopping Web Speech API:', speechError);
            }
        }
        
        // Stop Whisper transcription system (if it was started)
        if (this.mediaRecorder && this.mediaRecorder.isRecording) {
            await this.mediaRecorder.stopRecording();
            console.log('[Control] Whisper transcription stopped');
            
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
    
    /**
     * Called when audio system is ready (microphone or system audio)
     */
    onAudioSystemReady(audioSource) {
        console.log(`[Control] 🎯 Audio system ready: ${audioSource}`);
        
        // Ensure start button is enabled and responsive
        if (this.els.recordBtn) {
            this.els.recordBtn.disabled = false;
            this.els.recordBtn.style.opacity = '1';
            this.els.recordBtn.style.cursor = 'pointer';
            console.log(`[Control] ✅ Start button enabled for ${audioSource} audio`);
        }
        
        // Update UI state to indicate ready
        if (this.ui && this.ui.updateAudioReadyState) {
            this.ui.updateAudioReadyState(audioSource);
        }
    }
    
    exposeTestFunctions() {
        try {
            // Ensure cardEngine exists before exposing functions
            if (!this.cardEngine) {
                console.error('❌ Card engine not initialized yet');
                // Retry after a delay
                setTimeout(() => this.exposeTestFunctions(), 1000);
                return;
            }
            
            // Card test functions
            window.testCards = () => this.cardEngine.runCardGenerationTests();
            window.testCheat = () => this.cardEngine.runCheatCardTests();
            window.testCardTypeDisplay = () => this.cardEngine.testCardTypeDisplay();
            
            // Transcript test functions - EXPOSE THE NEW COMPREHENSIVE TESTS
            if (this.transcriptSystem?.tests) {
                window.tt = this.transcriptSystem.tests;
                window.transcriptTests = this.transcriptSystem.tests;
                console.log('🎯 Transcript tests ready! Use: tt.help()');
            }
            
            window.testTranscriptRhythm = () => {
                if (this.transcriptSystem?.ui) {
                    this.transcriptSystem.ui.showListeningState();
                    console.log('🎵 [Test] Rhythm system started - you should see pending line animation');
                }
            };
            
            // EMERGENCY TEST: Force create a segment to verify display
            window.testForceSegment = () => {
                console.log('🧪 [TEST] Creating emergency test segment...');
                if (this.transcriptSystem) {
                    console.log('🧪 [TEST] TranscriptSystem available');
                    const testSegment = {
                        text: "This is a test segment to verify the display is working properly.",
                        duration: 2000,
                        timestamp: Date.now(),
                        cardCreated: false
                    };
                    console.log('🧪 [TEST] Calling addFinalizedSegment directly...');
                    this.transcriptSystem.ui.addFinalizedSegment(testSegment);
                } else {
                    console.log('🧪 [TEST] TranscriptSystem not available');
                }
            };
            window.testToggle = () => {
                if (this.cardEngine) {
                    const currentMode = this.cardEngine.interviewMode;
                    console.log(`🔄 [Test] Current mode: ${currentMode ? 'CheatCard' : 'FlashCard'}`);
                    console.log('🔄 [Test] Toggling mode...');
                    document.getElementById('cardsModeToggle')?.click();
                    setTimeout(() => {
                        const newMode = this.cardEngine.interviewMode;
                        console.log(`✅ [Test] New mode: ${newMode ? 'CheatCard' : 'FlashCard'}`);
                        console.log('🔄 [Test] Check if button background changed to orange for CheatCard mode');
                    }, 100);
                }
            };
            window.resetAllCaches = () => this.cardEngine.resetAllCaches();
            window.app = this;
            
            console.log('🧪 Test functions exposed:');
            console.log('  testCards() - Run card generation tests');
            console.log('  testCheat() - Run CheatCard tests');
            console.log('  testCardTypeDisplay() - Test card type detection');
            console.log('  testTranscriptRhythm() - Test rhythm system');
            console.log('  testToggle() - Test card mode toggle');
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
            window.app = window.senScript; // Alias for compatibility
        }
    });
} else {
    if (!window.senScript) {
        window.senScript = new SenScript();
        window.app = window.senScript; // Alias for compatibility
    }
}

// Manual initialization helper for test functions
window.initTests = () => {
    const app = window.senScript || window.senScriptApp || window.app;
    if (app && app.cardEngine) {
        // Directly expose test functions
        window.testCards = () => app.cardEngine.runCardGenerationTests();
        window.testCheat = () => app.cardEngine.runCheatCardTests();
        window.testCardTypeDisplay = () => app.cardEngine.testCardTypeDisplay();
        console.log('✅ Test functions initialized:');
        console.log('  - testCards()');
        console.log('  - testCheat()');
        console.log('  - testCardTypeDisplay()');
        return true;
    } else {
        console.error('❌ App or cardEngine not ready. Try again in a moment.');
        return false;
    }
};

// Auto-initialize tests after a delay
setTimeout(() => {
    if (!window.testCheat) {
        window.initTests();
    }
}, 2000);