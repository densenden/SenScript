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
        this.currentLang = 'de-DE';
        
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
        // Initialize audio system (V3 - Perfect Audio Flow)
        this.audioSystem = new AudioSystemV3(this);
        
        // Initialize speech recognition
        this.speechRecognition = new SpeechRecognitionManager(this);
        
        // Start background listening after speech recognition is ready
        setTimeout(() => {
            if (this.speechRecognition) {
                this.speechRecognition.startBackgroundListening();
            }
        }, 1000);
        
        // Initialize card generator (restored from legacy)
        this.cardGenerator = new CardGenerator(this);
        
        // Initialize card engine
        this.cardEngine = new CardEngine(this);
        
        // Initialize UI components
        this.ui = new UIManager(this);
        
        // Initialize settings
        this.settings = new SettingsManager(this);
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
        // Check speech recognition state directly
        if (this.speechRecognition && 
            (this.speechRecognition.isListening || this.speechRecognition.shouldBeListening)) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    async startListening() {
        console.log('🚀 [Control] === START BUTTON CLICKED ===');
        
        // V3: Ensure audio source is ready for transcription
        const hasAudioSource = await this.audioSystem.ensureAudioSourceForTranscription();
        if (!hasAudioSource) {
            console.error('🚀 [Control] ❌ Audio source not ready for transcription');
            return;
        }
        
        // Start transcription mode
        this.audioSystem.startTranscription();
        
        // Start speech recognition
        this.speechRecognition.startListening();
    }
    
    stopListening() {
        console.log('🛑 [Control] === STOP BUTTON CLICKED ===');
        
        // Stop transcription mode
        this.audioSystem.stopTranscription();
        
        // Stop speech recognition
        this.speechRecognition.stopListening();
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