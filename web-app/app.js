// SenScript - Simple Working Version
// GOAL NUMBER 1: CARD CREATION SPEED
class SenScript {
    constructor() {
        // SenScript initializing
        
        this.recognition = null;
        this.isListening = false;
        this.shouldBeListening = false;
        this.transcript = '';
        this.transcriptLines = [];
        this.currentInterim = '';
        this.pendingSentence = '';  // Accumulate blocks into sentences
        this.cards = [];
        this.fullTranscriptLog = [];  // Keep full transcript for download
        this.isLight = false;
        
        // Card Generation Tracking
        this.cardGenerationCounter = 0;
        this.themePreference = this.detectSystemTheme();
        // Support for 12 major languages
        this.supportedLanguages = [
            'de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT', 'pt-PT', 
            'nl-NL', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA'
        ];
        
        // Start with auto-detection
        this.currentLang = 'auto';
        this.fallbackLang = navigator.language || 'de-DE';
        // Multi-language mode enabled
        this.lastSentenceProcessed = 0;  // Timestamp of last sentence processing
        this.sessionId = `session_${Date.now()}`;
        
        // Initialize new card generation engine for speed and reliability
        this.cardEngine = new CardGenerationEngine(this.apiSettings, this.sessionId);
        console.log('🎯 [INIT] Card engine initialized');
        
        // Memory management for long sessions  
        this.memoryCleanupInterval = null;
        this.startMemoryCleanup();
        
        this.audioContext = null;
        this.audioAnalyser = null;
        this.audioSource = null;
        this.silenceTimer = null;
        this.audioLevel = 0;
        this.processingCard = false;
        this.apiSettings = {
            apiKeys: {},
            selectedModel: 'auto',
            useFallback: true,
            education: {
                userLevel: 3,
                detailLevel: 3,
                exampleComplexity: 3
            },
            outputLanguage: {
                auto: true,
                fixed: 'en-US'
            },
            interviewMode: false
        };
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        // Setting up UI
        
        // Get elements
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
            screen1: document.getElementById('screen1'),
            screen2: document.getElementById('screen2'),
            screen3: document.getElementById('screen3'),
            screen4: document.getElementById('screen4'),
            speechStatus: document.getElementById('speechStatus'),
            aiStatus: document.getElementById('aiStatus'),
            micStatus: document.getElementById('micStatus'),
            audioStatus: document.getElementById('audioStatus'),
            waveform: document.getElementById('waveform'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            settingsClose: document.getElementById('settingsClose'),
            modelGrid: document.getElementById('modelGrid'),
            openaiKey: document.getElementById('openaiKey'),
            anthropicKey: document.getElementById('anthropicKey'),
            deepseekKey: document.getElementById('deepseekKey'),
            useFallback: document.getElementById('useFallback'),
            saveSettings: document.getElementById('saveSettings'),
            totalCalls: document.getElementById('totalCalls'),
            totalTokens: document.getElementById('totalTokens'),
            cardsGenerated: document.getElementById('cardsGenerated'),
            avgResponseTime: document.getElementById('avgResponseTime'),
            micLevelDots: document.getElementById('micLevelDots'),
            deviceLevelDots: document.getElementById('deviceLevelDots'),
            // Education level controls
            educationLevel: document.getElementById('educationLevel'),
            // Language controls
            autoLanguage: document.getElementById('autoLanguage'),
            outputLanguage: document.getElementById('outputLanguage'),
            languageSelectContainer: document.getElementById('languageSelectContainer'),
            languageIndicator: document.getElementById('languageIndicator'),
            languageFlag: document.getElementById('languageFlag'),
            languageText: document.getElementById('languageText'),
            // Interview mode controls
            interviewMode: document.getElementById('interviewMode'),
            interviewModeDescription: document.getElementById('interviewModeDescription'),
            cardsModeToggle: document.getElementById('cardsModeToggle'),
            modeInfoButton: document.getElementById('modeInfoButton'),
            educationLevelValue: document.getElementById('educationLevelValue'),
            educationLevelDesc: document.getElementById('educationLevelDesc'),
            detailLevel: document.getElementById('detailLevel'),
            detailLevelValue: document.getElementById('detailLevelValue'),
            detailLevelDesc: document.getElementById('detailLevelDesc'),
            exampleComplexity: document.getElementById('exampleComplexity'),
            exampleComplexityValue: document.getElementById('exampleComplexityValue'),
            exampleComplexityDesc: document.getElementById('exampleComplexityDesc'),
            // Modal containers
            settingsContent: document.querySelector('.settings-content')
        };
        
        // Add event listeners
        this.els.recordBtn.onclick = () => {
            // Listen button clicked
            this.toggleListening();
        };
        
        // Mobile listen button  
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.onclick = () => {
                // Mobile listen button clicked
                this.toggleListening();
            };
        }
        
        // Test transcripts button
        if (this.els.testTranscriptsBtn) {
            this.testRunning = false;
            this.els.testTranscriptsBtn.onclick = () => {
                console.log('🧪 [TEST-BTN] Test transcripts button clicked');
                if (this.testRunning) {
                    this.stopTest();
                } else {
                    this.runVisualCardGenerationTests();
                }
            };
        }
        
        // Mobile settings button
        if (this.els.mobileSettingsBtn) {
            this.els.mobileSettingsBtn.onclick = () => {
                // Mobile settings button clicked
                this.showSettings();
            };
        }
        
        this.els.exportBtn.onclick = () => {
            this.exportCards();
        };
        
        this.els.exportTranscriptBtn.onclick = () => {
            this.exportTranscript();
        };
        
        // Initialize toggle switch
        this.currentAudioSource = 'microphone';
        this.setupAudioSourceToggle();
        
        this.els.settingsBtn.onclick = () => {
            this.showSettings();
        };
        
        this.els.settingsClose.onclick = () => {
            this.closeSettings();
        };
        
        // Setup tab functionality
        this.setupModalTabs();
        
        this.els.saveSettings.onclick = () => {
            this.saveSettings();
        };
        
        // Education level controls event listeners
        this.els.educationLevel.oninput = () => this.updateEducationDisplay();
        this.els.detailLevel.oninput = () => this.updateEducationDisplay();
        this.els.exampleComplexity.oninput = () => this.updateEducationDisplay();
        
        // Close modal only when clicking the modal backdrop
        this.els.settingsModal.onclick = (e) => {
            // Only close if clicking directly on the modal backdrop
            if (e.target.classList.contains('settings-modal')) {
                // Modal backdrop clicked - closing
                this.closeSettings();
            }
        };
        
        // Simple content click prevention
        if (this.els.settingsContent) {
            this.els.settingsContent.addEventListener('click', (e) => {
                // Content area clicked, modal stays open
                // Don't prevent anything - let the modal onclick handler deal with it
            });
        }
        
        // Local duplicate prevention for API efficiency
        this.recentTexts = new Set(); // Track recent texts to avoid duplicates
        this.DUPLICATE_TIMEOUT = 10000; // Clear duplicates after 10 seconds
        
        this.setupSpeechRecognition();
        this.checkMicrophone();
        // Audio visualization will be setup after first user interaction
        this.setupLevelDots();
        this.setupLanguageControls();
        this.setupInterviewMode();
        this.loadSettings();
        
        // Apply system theme by default
        this.applySystemTheme();
        
        // Ensure clean state after all setup
        this.resetAllStates();
        
        // Auto-restart functionality after page reload
        this.setupAutoRestart();
        
        // SenScript ready!
        
        // Show initial guidance in transcript window
        this.showInitialGuidance();
        
        // Make test functions available globally for console access  
        window.testCards = () => this.runCardGenerationTests();
        window.testCheat = () => this.runCheatCardTests();
        window.resetAllCaches = () => this.resetAllCaches();
        window.app = this;
        console.log('🧪 [DEBUG] Available console commands:');
        console.log('  testCards() - Run all card generation tests');
        console.log('  testCheat() - Test CheatCards specifically');
        console.log('  resetAllCaches() - Clear all caches for fresh generation');
        console.log('  app.resetCardEngine() - Reset card engine only');
    }
    
    setupAutoRestart() {
        // Setting up auto-restart functionality
        
        // Check if we should auto-restart based on saved state
        const autoRestart = localStorage.getItem('senscript_auto_restart');
        const lastAudioSource = localStorage.getItem('senscript_last_audio_source');
        
        if (autoRestart === 'true' && lastAudioSource) {
            // Auto-restarting after page reload
            
            // Set the audio source
            this.currentAudioSource = lastAudioSource;
            
            // Update UI to reflect the audio source
            if (this.els.audioSourceSwitch) {
                this.els.audioSourceSwitch.checked = (lastAudioSource === 'system');
            }
            
            // Auto-start after a short delay to allow everything to initialize
            setTimeout(() => {
                // Starting listening automatically
                this.startListening();
            }, 1000);
        }
        
        // Save state when starting listening
        const originalStartListening = this.startListening.bind(this);
        this.startListening = () => {
            localStorage.setItem('senscript_auto_restart', 'true');
            localStorage.setItem('senscript_last_audio_source', this.currentAudioSource);
            // Saved state for auto-restart
            return originalStartListening();
        };
        
        // Clear state when stopping
        const originalStopListening = this.stopListening.bind(this);
        this.stopListening = () => {
            localStorage.removeItem('senscript_auto_restart');
            localStorage.removeItem('senscript_last_audio_source');
            // Cleared auto-restart state
            return originalStopListening();
        };
    }
    
    resetAllStates() {
        // Resetting all states
        
        // Reset flags
        this.isListening = false;
        this.shouldBeListening = false;
        this.needsRecreation = false;
        this.restartAttempts = 0;
        
        // Clear text state
        this.currentInterim = '';
        this.pendingSentence = '';
        this.transcript = '';
        
        // Clear arrays
        this.transcriptLines = [];
        this.cards = [];
        
        // Update UI
        this.updateListeningUI();
        this.updateCardCount();
        if (this.els.transcript) this.els.transcript.innerHTML = '';
        
        // Reset status indicators
        this.setStatus('speech', 'yellow');
        this.setStatus('mic', 'red');
        this.setStatus('audio', 'red');
        this.setStatus('ai', 'yellow');
        
        // All states reset
    }
    
    setupSpeechRecognition() {
        // Setting up fresh recognition
        
        // Always check support first
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            this.setStatus('speech', 'red');
            return false;
        }
        
        // Clean up any existing recognition
        if (this.recognition) {
            try {
                this.recognition.abort();
                this.recognition = null;
                // Cleaned up old recognition
            } catch (e) {
                // Old recognition already clean
            }
        }
        
        // Create fresh recognition object
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.getOptimalLanguage();
        this.recognition.maxAlternatives = 1;
        
        // Fresh recognition created
        
        // ENHANCED DEBUG: Track speech recognition lifecycle
        this.recognition.onstart = () => {
            this.isListening = true;
            this.restartAttempts = 0;
            this.updateListeningUI();
            // Recognition ACTIVE - listening for speech input
        };
        
        this.recognition.onresult = (event) => {
            // Speech detected - processing results
            this.handleSpeechResultOptimized(event);
        };
        
        // ENHANCED: Add onspeechstart and onspeechend for debugging
        this.recognition.onspeechstart = () => {
            // Audio input detected
            
            // Set a timer to check if we get results within 3 seconds
            setTimeout(() => {
                // Checking for results after 3 seconds
                const stateCheck = {
                    isListening: this.isListening,
                    shouldBeListening: this.shouldBeListening,
                    recognitionLang: this.recognition?.lang,
                    pendingSentence: this.pendingSentence,
                    transcript: this.transcript.length
                };
                
                // If no results after 3 seconds, try switching language
                if (this.pendingSentence === '' && this.transcript.length === 0) {
                    // No results in German, trying English
                    this.recognition.lang = 'en-US';
                    // Switched to English for better recognition
                }
            }, 3000);
        };
        
        this.recognition.onspeechend = () => {
            // Audio input stopped
        };
        
        this.recognition.onaudiostart = () => {
            // Microphone started capturing audio
        };
        
        this.recognition.onaudioend = () => {
            // Microphone stopped capturing audio
        };
        
        this.recognition.onnomatch = () => {
            // Speech heard but not recognized
        };
        
        this.recognition.onerror = (event) => {
            console.error(`Speech recognition error: ${event.error}`);
            
            // Handle critical errors
            if (event.error === 'not-allowed') {
                this.shouldBeListening = false;
                this.setStatus('speech', 'red');
                this.setStatus('mic', 'red');
                console.error('Microphone permission denied');
                return;
            }
            
            if (event.error === 'no-speech') {
                // No speech detected within timeout
            }
            
            // For other errors, let onend handle restart
            if (event.error !== 'no-speech') {
                // Error - will recreate recognition
                this.needsRecreation = true;
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateListeningUI();
            // Recognition stopped
            
            // Only restart if we should be listening
            if (this.shouldBeListening) {
                setTimeout(() => {
                    if (this.shouldBeListening && !this.isListening) {
                        // Recreate recognition if needed (handles corruption)
                        if (this.needsRecreation || this.restartAttempts > 5) {
                            console.log('🔄 [RECREATE] Creating fresh recognition object...');
                            this.needsRecreation = false;
                            this.restartAttempts = 0;
                            this.setupSpeechRecognition();
                            return;
                        }
                        
                        // Normal restart
                        try {
                            this.recognition.start();
                            this.restartAttempts++;
                            console.log(`🔄 [RESTART] Attempt ${this.restartAttempts}`);
                        } catch (error) {
                            console.error(`❌ [RESTART-FAIL] ${error.name} - will recreate`);
                            this.needsRecreation = true;
                        }
                    }
                }, 300); // Short delay for stability
            } else {
                this.restartAttempts = 0;
            }
        };
        
        this.setStatus('speech', 'green');
        this.restartAttempts = 0;
        this.needsRecreation = false;
        console.log('[Speech] ✅ Recognition ready');
        return true;
    }
    
    getOptimalLanguage() {
        // Start with browser's preferred language, with live switching
        const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
        console.log(`🌐 [LANGUAGE] Starting with browser language: ${browserLang}, will auto-switch based on speech`);
        
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        // Fallback to primary languages based on region
        const langPrefix = browserLang.split('-')[0];
        const regionalMapping = {
            'en': 'en-US',
            'de': 'de-DE', 
            'es': 'es-ES',
            'fr': 'fr-FR',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'nl': 'nl-NL',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ar': 'ar-SA'
        };
        
        return regionalMapping[langPrefix] || this.fallbackLang;
    }
    
    switchToNextLanguage() {
        // Cycle through top 4 most common languages for efficiency
        const topLanguages = ['en-US', 'de-DE', 'es-ES', 'fr-FR'];
        this.currentLanguageIndex = (this.currentLanguageIndex + 1) % topLanguages.length;
        this.recognition.lang = topLanguages[this.currentLanguageIndex];
        console.log(`🌐 Language switched to: ${this.recognition.lang}`);
    }
    
    handleSpeechResultOptimized(event) {
        // Processing speech results
        
        let final = '';
        let interim = '';
        
        // Process only new results for efficiency
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            
            // Result processing
            
            if (result.isFinal) {
                final += text + ' ';
            } else {
                interim = text; // Take latest interim only
            }
        }
        
        // Processing final and interim results
        
        if (final.trim() || interim.trim()) {
            // Processing text
        }
        
        // LIVE LANGUAGE DETECTION: Detect language from speech results
        if (final.trim() || interim.trim()) {
            const textToAnalyze = final.trim() || interim.trim();
            const detectedLang = this.detectLanguageFromSpeech(textToAnalyze);
            
            // Switch recognition language if different from current
            if (detectedLang !== this.recognition.lang) {
                // Language switch detected
                this.recognition.lang = detectedLang;
            }
        }
        
        // Handle final text immediately
        if (final.trim()) {
            this.pendingSentence += final;
            this.transcript += final;
            // Don't add to transcript here - let processPendingSentence handle it
            // to avoid duplication
            this.processPendingSentence();
        }
        
        // Smart interim processing for real-time splitting
        if (interim.trim()) {
            const fullText = this.pendingSentence + interim;
            
            if (this.shouldProcessNow(fullText) && this.pendingSentence.trim()) {
                this.addSplitSegmentToUI(this.pendingSentence.trim());
                this.processPendingSentence();
                interim = ''; // Clear to show split
            }
        }
        
        this.currentInterim = interim;
        this.updateAnimatedTranscript();
        
        // Reset restart attempts on successful results
        if (final.trim()) {
            this.restartAttempts = 0;
        }
    }
    
    detectLanguageFromSpeech(text) {
        // FAST language detection for live speech recognition switching
        const lower = text.toLowerCase();
        
        // German indicators (high confidence)
        const germanScore = (lower.match(/\b(der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber|wie|was|bewusstsein|rätsel|natur|größten)\b/g) || []).length;
        
        // English indicators (high confidence) 
        const englishScore = (lower.match(/\b(the|and|is|are|of|to|in|that|have|for|not|with|you|this|but|his|from|they|we|been|how|what|consciousness|mystery|nature)\b/g) || []).length;
        
        // French indicators
        const frenchScore = (lower.match(/\b(le|la|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|pouvoir|par|vouloir|faire|sur|grand|vie)\b/g) || []).length;
        
        // Quick decision based on highest score
        if (germanScore > englishScore && germanScore > frenchScore) {
            return 'de-DE';
        } else if (frenchScore > englishScore && frenchScore > germanScore) {
            return 'fr-FR';
        } else {
            return 'en-US'; // Default to English
        }
    }

    detectLanguageForText(text) {
        const lower = text.toLowerCase();
        
        // Enhanced German detection patterns
        const germanWords = /\b(der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber|wie|was|wann|wo|wer|warum|welche|dass|wenn|oder|haben|haben|werden|wurde|könnte|sollte|müssen|können|durch|über|unter|zwischen|während|gegen|ohne|seit|bis|bei|nach|vor|um|für|als|wenn|weil|obwohl|damit|sodass)\b/g;
        const germanCount = (lower.match(germanWords) || []).length;
        
        // Enhanced English detection patterns
        const englishWords = /\b(the|and|is|are|was|were|have|has|can|will|to|of|in|for|with|that|this|what|how|when|where|who|why|which|would|should|could|must|might|about|after|before|during|through|over|under|between|while|against|without|since|until|from|into|onto|upon|within|toward|across|among|beside|beyond|inside|outside|around)\b/g;
        const englishCount = (lower.match(englishWords) || []).length;
        
        // French detection patterns
        const frenchWords = /\b(le|la|les|de|du|des|et|est|sont|avec|pour|dans|sur|par|un|une|ce|cette|ces|que|qui|quoi|où|quand|comment|pourquoi|mais|ou|donc|car|ni|être|avoir|faire|aller|venir|voir|savoir|pouvoir|vouloir|dire|prendre|donner|mettre|partir|passer|rester|devenir|tenir|porter|montrer|laisser|suivre|penser|croire|paraître|connaître|comprendre|entendre|sortir|sentir|servir|vivre|mourir)\b/g;
        const frenchCount = (lower.match(frenchWords) || []).length;
        
        // Spanish detection patterns
        const spanishWords = /\b(el|la|los|las|de|del|y|es|son|con|para|en|por|un|una|este|esta|estos|estas|que|quien|qué|dónde|cuándo|cómo|por qué|pero|o|así|porque|ni|ser|estar|haber|tener|hacer|ir|venir|ver|saber|poder|querer|decir|tomar|dar|poner|salir|pasar|quedar|llegar|llevar|seguir|pensar|creer|parecer|conocer|entender|oir|sentir|servir|vivir|morir)\b/g;
        const spanishCount = (lower.match(spanishWords) || []).length;
        
        // Italian detection patterns
        const italianWords = /\b(il|la|lo|gli|le|di|del|della|dello|dei|delle|e|è|sono|con|per|in|su|da|un|una|questo|questa|questi|queste|che|chi|cosa|dove|quando|come|perché|ma|o|così|perché|né|essere|avere|fare|andare|venire|vedere|sapere|potere|volere|dire|prendere|dare|mettere|partire|passare|restare|diventare|tenere|portare|mostrare|lasciare|seguire|pensare|credere|sembrare|conoscere|capire|sentire|servire|vivere|morire)\b/g;
        const italianCount = (lower.match(italianWords) || []).length;
        
        // Russian detection patterns
        const russianWords = /\b(и|в|не|на|я|быть|что|он|с|а|как|это|она|они|мы|ты|вы|все|но|из|за|к|по|от|о|для|при|до|после|над|под|между|через|без|со|же|уже|только|еще|может|можно|нужно|должен|хотеть|знать|думать|говорить|делать|жить|работать|идти|ехать|смотреть|слушать|читать|писать|покупать|продавать)\b/g;
        const russianCount = (lower.match(russianWords) || []).length;
        
        // Portuguese detection patterns  
        const portugueseWords = /\b(o|a|os|as|de|da|do|das|dos|e|é|são|com|para|em|por|um|uma|este|esta|estes|estas|que|quem|o que|onde|quando|como|por que|mas|ou|assim|porque|nem|ser|estar|haver|ter|fazer|ir|vir|ver|saber|poder|querer|dizer|tomar|dar|pôr|sair|passar|ficar|chegar|levar|seguir|pensar|acreditar|parecer|conhecer|entender|ouvir|sentir|servir|viver|morrer)\b/g;
        const portugueseCount = (lower.match(portugueseWords) || []).length;
        
        // Greek detection patterns
        const greekWords = /\b(και|είναι|είμαι|στο|της|του|για|με|από|που|θα|να|το|τα|η|ο|οι|των|στην|στον|στα|αυτό|αυτή|αυτοί|αυτές|ότι|όταν|πώς|γιατί|αλλά|ή|έτσι|επειδή|ούτε|είμαστε|έχω|έχει|έχουν|κάνω|πάω|έρχομαι|βλέπω|ξέρω|μπορώ|θέλω|λέω|παίρνω|δίνω|βάζω|φεύγω|περνώ|μένω|φτάνω|φέρνω|ακολουθώ|σκέφτομαι|πιστεύω|φαίνομαι|γνωρίζω|καταλαβαίνω|ακούω|νιώθω|υπηρετώ|ζω|πεθαίνω)\b/g;
        const greekCount = (lower.match(greekWords) || []).length;
        
        // Dutch detection patterns
        const dutchWords = /\b(de|het|een|van|in|is|zijn|en|op|met|voor|aan|bij|uit|over|door|naar|om|als|maar|of|dat|die|dit|deze|hij|zij|wij|jullie|ze|ik|jij|u|kan|zal|hebben|zijn|worden|doen|gaan|komen|zien|weten|kunnen|willen|zeggen|nemen|geven|maken|laten|houden|brengen|denken|geloven|lijken|kennen|begrijpen|horen|voelen|leven|sterven)\b/g;
        const dutchCount = (lower.match(dutchWords) || []).length;
        
        // German-specific patterns
        const germanPatterns = [
            /\b\w+ung\b/g,  // German endings like -ung
            /\b\w+heit\b/g, // German endings like -heit
            /\b\w+keit\b/g, // German endings like -keit
            /\b\w+schaft\b/g, // German endings like -schaft
            /ä|ö|ü|ß/g      // German umlauts
        ];
        
        // French-specific patterns
        const frenchPatterns = [
            /\b\w+tion\b/g,  // French endings like -tion
            /\b\w+ment\b/g,  // French endings like -ment
            /\b\w+eur\b/g,   // French endings like -eur
            /à|é|è|ê|ë|ç|ù|û|ü|ô|ö|î|ï|ÿ/g  // French accents
        ];
        
        // Spanish-specific patterns
        const spanishPatterns = [
            /\b\w+ción\b/g,  // Spanish endings like -ción
            /\b\w+dad\b/g,   // Spanish endings like -dad
            /\b\w+mente\b/g, // Spanish endings like -mente
            /ñ|á|é|í|ó|ú|ü/g  // Spanish accents and ñ
        ];
        
        // Italian-specific patterns
        const italianPatterns = [
            /\b\w+zione\b/g, // Italian endings like -zione
            /\b\w+mente\b/g, // Italian endings like -mente
            /\b\w+tore\b/g,  // Italian endings like -tore
            /à|è|é|ì|í|ò|ó|ù|ú/g  // Italian accents
        ];
        
        // Russian-specific patterns
        const russianPatterns = [
            /\b\w+ость\b/g,  // Russian endings like -ость
            /\b\w+ение\b/g,  // Russian endings like -ение
            /\b\w+ство\b/g,  // Russian endings like -ство
            /[а-яё]/g        // Cyrillic characters
        ];
        
        // Portuguese-specific patterns
        const portuguesePatterns = [
            /\b\w+ção\b/g,   // Portuguese endings like -ção
            /\b\w+dade\b/g,  // Portuguese endings like -dade
            /\b\w+mente\b/g, // Portuguese endings like -mente
            /ã|õ|á|é|í|ó|ú|ç/g  // Portuguese accents and ç
        ];
        
        // Dutch-specific patterns
        const dutchPatterns = [
            /\b\w+heid\b/g,  // Dutch endings like -heid
            /\b\w+lijk\b/g,  // Dutch endings like -lijk
            /\b\w+ting\b/g,  // Dutch endings like -ting
            /ij|oe|aa|ee|oo|uu/g  // Dutch digraphs
        ];
        
        // Greek-specific patterns
        const greekPatterns = [
            /\b\w+σις\b/g,   // Greek endings like -σις
            /\b\w+ισμός\b/g, // Greek endings like -ισμός
            /\b\w+ότητα\b/g, // Greek endings like -ότητα
            /α|β|γ|δ|ε|ζ|η|θ|ι|κ|λ|μ|ν|ξ|ο|π|ρ|σ|τ|υ|φ|χ|ψ|ω|ά|έ|ή|ί|ό|ύ|ώ/g  // Greek alphabet and accents
        ];
        
        let germanPatternCount = 0;
        germanPatterns.forEach(pattern => {
            germanPatternCount += (lower.match(pattern) || []).length;
        });
        
        let frenchPatternCount = 0;
        frenchPatterns.forEach(pattern => {
            frenchPatternCount += (lower.match(pattern) || []).length;
        });
        
        let spanishPatternCount = 0;
        spanishPatterns.forEach(pattern => {
            spanishPatternCount += (lower.match(pattern) || []).length;
        });
        
        let italianPatternCount = 0;
        italianPatterns.forEach(pattern => {
            italianPatternCount += (lower.match(pattern) || []).length;
        });
        
        let russianPatternCount = 0;
        russianPatterns.forEach(pattern => {
            russianPatternCount += (lower.match(pattern) || []).length;
        });
        
        let portuguesePatternCount = 0;
        portuguesePatterns.forEach(pattern => {
            portuguesePatternCount += (lower.match(pattern) || []).length;
        });
        
        let dutchPatternCount = 0;
        dutchPatterns.forEach(pattern => {
            dutchPatternCount += (lower.match(pattern) || []).length;
        });
        
        let greekPatternCount = 0;
        greekPatterns.forEach(pattern => {
            greekPatternCount += (lower.match(pattern) || []).length;
        });
        
        const totalWords = lower.split(/\s+/).length;
        
        if (totalWords === 0) return { lang: 'de-DE', confidence: 0, flag: '🇩🇪' };
        
        const germanScore = ((germanCount + germanPatternCount) / totalWords) * 100;
        const englishScore = (englishCount / totalWords) * 100;
        const frenchScore = ((frenchCount + frenchPatternCount) / totalWords) * 100;
        const spanishScore = ((spanishCount + spanishPatternCount) / totalWords) * 100;
        const italianScore = ((italianCount + italianPatternCount) / totalWords) * 100;
        const russianScore = ((russianCount + russianPatternCount) / totalWords) * 100;
        const portugueseScore = ((portugueseCount + portuguesePatternCount) / totalWords) * 100;
        const dutchScore = ((dutchCount + dutchPatternCount) / totalWords) * 100;
        const greekScore = ((greekCount + greekPatternCount) / totalWords) * 100;
        
        const scores = {
            'de-DE': { score: germanScore, flag: '🇩🇪' },
            'en-US': { score: englishScore, flag: '🇺🇸' },
            'fr-FR': { score: frenchScore, flag: '🇫🇷' },
            'es-ES': { score: spanishScore, flag: '🇪🇸' },
            'it-IT': { score: italianScore, flag: '🇮🇹' },
            'ru-RU': { score: russianScore, flag: '🇷🇺' },
            'pt-PT': { score: portugueseScore, flag: '🇵🇹' },
            'nl-NL': { score: dutchScore, flag: '🇳🇱' },
            'el-GR': { score: greekScore, flag: '🇬🇷' }
        };
        
        // Find language with highest score
        let detectedLang = 'de-DE';
        let maxScore = germanScore;
        let flag = '🇩🇪';
        
        for (const [lang, data] of Object.entries(scores)) {
            if (data.score > maxScore) {
                maxScore = data.score;
                detectedLang = lang;
                flag = data.flag;
            }
        }
        
        // Language detected
        
        return { lang: detectedLang, confidence: maxScore, flag: flag };
    }

    processPendingSentence() {
        // Erweiterte Trennung nach mehreren Kriterien
        let textToProcess = this.pendingSentence;
        
        // 1. Primäre Satzzeichen (harte Trennung)
        const primaryBreaks = /([.!?])\s+/g;
        let segments = this.splitByPattern(textToProcess, primaryBreaks);
        
        // 2. Sekundäre Trennzeichen - KONTINUIERLICHER für smooth processing
        const secondaryBreaks = /([,;:])\s+/g;
        segments = segments.flatMap(segment => {
            if (segment.length > 45) { // Reduziert für kontinuierlichen Flow
                return this.splitByPattern(segment, secondaryBreaks);
            }
            return [segment];
        });
        
        // 3. Konjunktionen - nur bei wirklich langen Segmenten
        const conjunctionBreaks = /\s+(aber|doch|jedoch|außerdem|zudem|darüber hinaus|weiterhin|and|but|however|furthermore|moreover|also)\s+/gi;
        segments = segments.flatMap(segment => {
            if (segment.length > 80) { // Erhöht von 50 auf 80 für bessere Qualität
                return this.splitByPattern(segment, conjunctionBreaks);
            }
            return [segment];
        });
        
        // 4. Thematische Übergänge - nur bei sehr langen Segmenten
        const topicBreaks = /\s+(beginnen mit|schauen wir uns|betrachten wir|nun zu|jetzt|start with|let's look at|now)\s+/gi;
        segments = segments.flatMap(segment => {
            if (segment.length > 100) { // Zurück auf 100 für bessere Lesbarkeit
                return this.splitByPattern(segment, topicBreaks);
            }
            return [segment];
        });
        
        // Verarbeite alle Segmente außer dem letzten
        if (segments.length > 1) {
            for (let i = 0; i < segments.length - 1; i++) {
                const segment = segments[i].trim();
                if (segment.length > 15) {
                    // SILENT processing - nur bei langen Segmenten UI-Update
                    if (segment.length > 30) {
                        this.addSplitSegmentToUI(segment);
                    }
                    
                    // Verarbeiten für Karte
                    this.processCompleteSentence(segment);
                }
            }
            // Behalte den letzten unvollständigen Teil
            this.pendingSentence = segments[segments.length - 1].trim();
        }
        
        // KONTINUIERLICHE Frühtrennung für smooth processing (VERY AGGRESSIVE)
        if (this.pendingSentence.length > 60) { // Much more aggressive - prevent long buildup
            // Early segmentation for long sentences
            const midPoint = Math.floor(this.pendingSentence.length / 2);
            const spaceIndex = this.pendingSentence.indexOf(' ', midPoint);
            
            if (spaceIndex > -1) {
                const firstHalf = this.pendingSentence.substring(0, spaceIndex).trim();
                const secondHalf = this.pendingSentence.substring(spaceIndex).trim();
                
                if (firstHalf.length > 8) { // Lower threshold for more splitting
                    // UI Update für Emergency Split
                    this.addSplitSegmentToUI(firstHalf);
                    
                    // Verarbeiten für Karte
                    this.processCompleteSentence(firstHalf);
                }
                this.pendingSentence = secondHalf;
            } else {
                // Kein Leerzeichen gefunden, verarbeite das ganze Segment
                this.processCompleteSentence(this.pendingSentence.trim());
                this.pendingSentence = '';
            }
        }
    }
    
    splitByPattern(text, pattern) {
        const parts = text.split(pattern);
        const result = [];
        
        for (let i = 0; i < parts.length; i += 2) {
            let segment = parts[i];
            if (i + 1 < parts.length) {
                segment += parts[i + 1]; // Add back the separator
            }
            if (segment.trim()) {
                result.push(segment.trim());
            }
        }
        
        return result.length > 0 ? result : [text];
    }
    
    shouldProcessNow(text) {
        // STABLE APPROACH: Simple, reliable splitting
        const hasEndPunctuation = /[.!?]\s/.test(text);
        const tooLong = text.length > 40; // Shorter threshold
        
        const shouldProcess = hasEndPunctuation || tooLong;
        
        if (shouldProcess) {
            const reason = hasEndPunctuation ? 'sentence-end' : 'too-long';
            // Text split
        }
        
        return shouldProcess;
    }
    
    processCompleteSentence(sentence) {
        const timestamp = new Date().toLocaleTimeString();
        // SILENT processing for performance
        // Detect language for this specific sentence with switching logic
        const detection = this.detectLanguageForTextWithSwitching(sentence);
        
        // DYNAMIC LANGUAGE SWITCHING: Update per segment with LOW threshold
        if (detection.confidence > 5 && detection.lang !== this.currentLang) {
            // Language switch
            this.currentLang = detection.lang;
            if (this.recognition) {
                this.recognition.lang = detection.lang;
                // Recognition language updated
            }
        } else if (detection.confidence > 0) {
            // Keeping current language
        }
        
        // Update UI display with flag - IMMER aktualisieren, auch bei niedriger Konfidenz
        const langCodes = {
            'de-DE': 'DE',
            'en-US': 'EN', 
            'fr-FR': 'FR',
            'es-ES': 'ES',
            'it-IT': 'IT',
            'el-GR': 'GR'
        };
        
        const displayLang = langCodes[detection.lang] || langCodes[this.currentLang] || 'DE';
        const displayFlag = detection.flag || this.getLanguageFlag(this.currentLang) || '🇩🇪';
        
        // Update transcript language indicator with separate flag and text (like cards indicator)
        if (this.els.transcriptLanguageFlag) {
            this.els.transcriptLanguageFlag.textContent = displayFlag;
        }
        this.els.langCode.textContent = displayLang;
        
        // UI language display updated
        
        // Stelle sicher dass Recognition Language auch gesetzt ist
        if (this.recognition && this.currentLang) {
            this.recognition.lang = this.currentLang;
        }
        
        // UNIFIED CARD BIRTH PROCESS - Single method for all card types
        if (this.cardEngine && this.cardEngine.isTextWorthyOfCard(sentence)) {
            const segments = this.intelligentQuestionSplitting(sentence);
            
            // Process all segments using unified birth process
            segments.forEach((segment, index) => {
                setTimeout(() => {
                    this.createUnifiedCard(segment, detection);
                }, index * 200); // Staggered timing for multiple cards
            });
        }
    }
    
    /**
     * Intelligent question/aspect splitting for multi-card generation
     */
    intelligentQuestionSplitting(text) {
        // Early return for simple cases
        if (!text.includes('?') || text.length < 50) {
            return [text];
        }
        
        // Count distinct questions
        const questionCount = (text.match(/\?/g) || []).length;
        if (questionCount < 2) {
            return [text];
        }
        
        // 1. Primary splitting: Direct questions with transition words
        let segments = [];
        
        // German question patterns
        const germanSplits = text.split(/\?\s*(?=(?:Und|Außerdem|Was|Wie|Warum|Wann|Wo|Wer|Können\s+Sie|Erklären\s+Sie))/gi);
        if (germanSplits.length > 1) {
            segments = germanSplits.map(s => s.trim() + (s.includes('?') ? '' : '?')).filter(s => s.length > 15);
        }
        
        // English question patterns if German didn't work
        if (segments.length <= 1) {
            const englishSplits = text.split(/\?\s*(?=(?:And|Also|What|How|Why|When|Where|Who|Can\s+you|Explain))/gi);
            if (englishSplits.length > 1) {
                segments = englishSplits.map(s => s.trim() + (s.includes('?') ? '' : '?')).filter(s => s.length > 15);
            }
        }
        
        // 2. Advanced splitting: Topic transitions
        if (segments.length <= 1) {
            const topicSplits = text.split(/\?\s*(?=(?:Noch\s+eine\s+Frage|Another\s+question|Darüber\s+hinaus|Furthermore|Moreover))/gi);
            if (topicSplits.length > 1) {
                segments = topicSplits.map(s => s.trim() + (s.includes('?') ? '' : '?')).filter(s => s.length > 15);
            }
        }
        
        // 3. Fallback: Simple question mark splitting with context preservation
        if (segments.length <= 1 && questionCount >= 2) {
            const simpleSplits = text.split(/\?\s+(?=[A-ZÄÖÜ])/g);
            if (simpleSplits.length > 1) {
                segments = simpleSplits.map((s, i) => {
                    let segment = s.trim();
                    if (i < simpleSplits.length - 1 && !segment.includes('?')) {
                        segment += '?';
                    }
                    return segment;
                }).filter(s => s.length > 15);
            }
        }
        
        // Validation: Ensure we have meaningful segments
        if (segments.length <= 1 || segments.some(s => s.length < 10)) {
            return [text]; // Return original if splitting failed
        }
        
        console.log(`✂️ [SPLIT] ${segments.length} aspects found:`, segments.map(s => s.substring(0, 40) + '...'));
        return segments;
    }
    

    /**
     * UNIFIED CARD BIRTH PROCESS - Single method for all card creation
     * 1. Create 12px container with ready content
     * 2. Card pops to final height (only bottom card animates)
     * 3. Text fades in when fully open
     * 4. Scroll to top
     */
    async createUnifiedCard(segment, detection) {
        console.log(`🎯 [UNIFIED-BIRTH] Creating card for:`, segment.substring(0, 60) + '...');
        
        try {
            // 1. Generate content FIRST (before creating container)
            const result = await this.cardEngine.generateCard(segment, detection);
            
            if (!result || result.skip) {
                console.log(`⏭️ [UNIFIED-BIRTH] Skipped - not worthy:`, result?.reason || 'unknown');
                return;
            }
            
            // 2. Create card with content ready but hidden
            const cardData = this.prepareCardData(result, segment);
            const cardElement = this.createCardElement(cardData);
            
            // 3. Add to DOM as 12px container (content hidden)
            this.els.cardsContainer.prepend(cardElement);
            this.cards.unshift(cardData);
            
            // 4. Auto-scroll to top
            this.els.cardsContainer.scrollTop = 0;
            
            // 5. Animate height expansion (only for bottom-most new card)
            setTimeout(() => {
                cardElement.classList.remove('card-birth');
                cardElement.classList.add('card-open');
                
                // 6. Fade in text after height animation completes
                setTimeout(() => {
                    cardElement.classList.add('card-ready');
                }, 400); // After height animation
                
            }, 50); // Small delay for smooth birth
            
            this.updateCardCount();
            this.els.exportBtn.disabled = false;
            this.setStatus('ai', 'green');
            
            console.log('✅ [UNIFIED-BIRTH] Card created:', cardData.category);
            
        } catch (error) {
            console.error('❌ [UNIFIED-BIRTH] Failed:', error);
            this.setStatus('ai', 'red');
        }
    }
    
    /**
     * Prepare card data with all metadata
     */
    prepareCardData(result, originalText) {
        let cardData = result.card || result;
        
        // Add metadata
        cardData.id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        cardData.timestamp = new Date().toLocaleTimeString();
        cardData.originalText = originalText;
        cardData.source = 'card-engine';
        
        // Set card type based on current mode
        cardData.cardType = this.apiSettings.interviewMode ? 'cheat' : 'flash';
        
        // Set language flag
        if (!cardData.flag) {
            const detectedLanguage = this.detectLanguage(originalText);
            cardData.flag = this.getLanguageFlag(detectedLanguage.lang);
        }
        
        return cardData;
    }
    
    /**
     * Create card DOM element with unified birth states
     */
    createCardElement(cardData) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-birth'; // Start in birth state (12px)
        cardEl.setAttribute('data-category', cardData.category || 'DEFAULT');
        cardEl.setAttribute('data-card-type', cardData.cardType || 'flash');
        cardEl.style.cursor = 'pointer';
        
        // Generate card HTML content
        cardEl.innerHTML = this.generateCardHTML(cardData);
        
        // Set up click handler for card flipping
        cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            cardEl.classList.toggle('flipped');
        });
        
        return cardEl;
    }
    
    /**
     * Generate HTML content for card
     */
    generateCardHTML(card) {
        // Add confidence indicator, source, provider, and language flag
        const sourceCircle = card.source === 'AI' ? 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-left: 6px;"></span>' : 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #6b7280; border-radius: 50%; margin-left: 6px;"></span>';
        const confidenceText = (card.confidence && card.confidence !== 'undefined' && !isNaN(card.confidence)) ? ` ${card.confidence}%` : '';
        
        const headerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.9);">
                <div style="display: flex; align-items: center;">
                    <span>${card.category}</span>
                    ${sourceCircle}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${confidenceText ? `<span>${confidenceText}</span>` : ''}
                    <span>${card.flag || '🌐'}</span>
                    <span style="opacity: 0.7;">${card.timestamp}</span>
                </div>
            </div>
        `;
        
        const frontHTML = `
            <div class="card-front" style="margin-bottom: 16px;">
                <div style="font-size: 15px; font-weight: 600; color: rgba(255, 255, 255, 0.95); line-height: 1.4; margin-bottom: 12px;">${card.front}</div>
            </div>
        `;
        
        const backHTML = `
            <div class="card-back">
                <div style="font-size: 14px; line-height: 1.5; color: rgba(255, 255, 255, 0.85);">
                    ${card.back.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        return headerHTML + frontHTML + backHTML;
    }
    
    
    /**
     * Stop test gracefully
     */
    stopTest() {
        this.testRunning = false;
        this.testAborted = true;
        
        // Reset button state
        if (this.els.testTranscriptsBtn) {
            this.els.testTranscriptsBtn.classList.remove('active');
        }
        
        // Reset dots
        const testDots = document.querySelectorAll('.test-dot');
        testDots.forEach(dot => {
            dot.classList.remove('active', 'completed');
        });
        
        this.showTranscriptMessage('Test stopped', 'warning');
        console.log('🛑 [TEST] Test stopped by user');
    }
    
    /**
     * Visual card generation tests with progress indicator
     */
    async runVisualCardGenerationTests() {
        if (!window.TestTranscripts) {
            console.error('❌ [TEST] TestTranscripts module not loaded');
            this.showTranscriptMessage('Test module not loaded', 'error');
            return;
        }
        
        if (!this.cardEngine) {
            console.error('❌ [TEST] Card engine not initialized');
            this.showTranscriptMessage('Card engine not ready', 'error');
            return;
        }
        
        // Set test running state
        this.testRunning = true;
        this.testAborted = false;
        
        // Set button active state
        if (this.els.testTranscriptsBtn) {
            this.els.testTranscriptsBtn.classList.add('active');
        }
        
        const testTranscripts = window.TestTranscripts.getValidTestTranscripts();
        const testDots = document.querySelectorAll('.test-dot');
        
        // Reset all dots
        testDots.forEach(dot => {
            dot.classList.remove('active', 'completed');
        });
        
        this.showTranscriptMessage('Starting card generation tests...', 'info');
        
        // Check if we have API keys
        if (!this.apiSettings?.apiKeys?.openai && 
            !this.apiSettings?.apiKeys?.anthropic && 
            !this.apiSettings?.apiKeys?.deepseek) {
            this.showTranscriptMessage('Note: Add API key in Settings for actual card generation', 'warning');
        }
        
        for (let i = 0; i < Math.min(testTranscripts.length, 10); i++) {
            // Check if test was stopped
            if (this.testAborted) {
                console.log('🛑 [TEST] Test aborted at step', i + 1);
                break;
            }
            
            const test = testTranscripts[i];
            const dot = testDots[i];
            
            if (dot) {
                dot.classList.add('active');
            }
            
            // Show current test in transcript with monospace font
            this.showTranscriptMessage(`Test ${i + 1}/10: ${test.expectedCategory}`, 'test');
            this.showTranscriptMessage(test.text, 'transcript');
            
            // Log AI call status
            console.log(`🔄 [TEST-${i + 1}] Starting AI call for: "${test.text.substring(0, 50)}..."`);
            console.log(`🎯 [TEST-${i + 1}] Expected: ${test.expectedCategory}`);
            
            try {
                const detection = {
                    lang: test.language,
                    confidence: 95,
                    flag: this.cardEngine.getLanguageFlag(test.language)
                };
                
                // Use unified card creation for consistent animation
                await this.createUnifiedCard(test.text, detection);
                
                if (this.testAborted) break; // Check again after async operation
                
                this.showTranscriptMessage(`Generated card for test`, 'success');
                    
                if (dot) {
                    dot.classList.remove('active');
                    dot.classList.add('completed');
                }
                
                // Delay between tests (but check for abort)
                for (let j = 0; j < 8; j++) {
                    if (this.testAborted) break;
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error(`❌ [TEST-${i + 1}] ERROR:`, error);
                
                // Show specific error messages
                let errorMsg = error.message;
                if (errorMsg.includes('401') || errorMsg.includes('API key') || errorMsg.includes('500')) {
                    errorMsg = 'API key required';
                    this.showTranscriptMessage('Add valid API key in Settings', 'error');
                } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
                    errorMsg = 'Network error';
                } else if (errorMsg.includes('timeout')) {
                    errorMsg = 'Request timeout';
                }
                
                this.showTranscriptMessage(`Test ${i + 1} failed: ${errorMsg}`, 'error');
                
                if (dot) {
                    dot.classList.remove('active');
                }
            }
        }
        
        // Finalize test
        this.testRunning = false;
        
        // Reset button state
        if (this.els.testTranscriptsBtn) {
            this.els.testTranscriptsBtn.classList.remove('active');
        }
        
        if (!this.testAborted) {
            // Show completion
            this.showTranscriptMessage('Test sequence completed', 'success');
            setTimeout(() => {
                const completedCount = document.querySelectorAll('.test-dot.completed').length;
                this.showTranscriptMessage(`Results: ${completedCount}/10 tests generated cards`, 'info');
            }, 1000);
        }
    }
    
    /**
     * Show current test transcript in the transcript window
     */
    showTestTranscript(test, current, total) {
        if (!this.els.transcript) return;
        
        const flag = test.language === 'de-DE' ? '🇩🇪' : '🇺🇸';
        const fullText = test.text; // Show complete text, no truncation
        
        this.els.transcript.innerHTML = `
            <div class="transcript-rows enhanced">
                <div class="transcript-row line-3 current">
                    <span class="time">Test ${current}/${total}</span>
                    <span class="text">🧪 ${test.scenario} ${flag}</span>
                </div>
                <div class="transcript-row line-2 previous">
                    <span class="time">${test.expectedCategory}</span>
                    <span class="text">${test.language}</span>
                </div>
                <div class="transcript-row line-1 old test-detail">
                    <span class="time">📝</span>
                    <span class="text" style="font-size: 13px; line-height: 1.4; opacity: 0.9;">${fullText}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Show message in transcript window
     */
    showTranscriptMessage(message, type = 'info') {
        if (!this.els.transcript) return;
        
        const typeClasses = {
            'info': 'line-3 current',
            'test': 'line-2 previous', 
            'transcript': 'line-1 old test-detail',
            'success': 'line-3 current',
            'warning': 'line-3 current',
            'error': 'line-3 current'
        };
        
        const className = typeClasses[type] || 'line-3 current';
        
        this.els.transcript.innerHTML = `
            <div class="transcript-rows enhanced">
                <div class="transcript-row ${className}">
                    <span class="time">${new Date().toLocaleTimeString()}</span>
                    <span class="text">${message}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Test CheatCard generation specifically
     */
    async runCheatCardTests() {
        // Ensure CheatCard mode is active
        if (!this.apiSettings.interviewMode) {
            this.apiSettings.interviewMode = true;
            this.updateCardModeDisplay();
            console.log('🎯 [TEST] Switched to CheatCard mode for testing');
        }
        
        // Reset caches for fresh generation
        this.resetAllCaches();
        
        if (!window.TestTranscripts) {
            console.error('❌ [TEST] TestTranscripts module not loaded');
            return;
        }
        
        // Get German and English test transcripts
        const germanTests = window.TestTranscripts.getTestTranscripts({ language: 'de-DE' });
        const englishTests = window.TestTranscripts.getTestTranscripts({ language: 'en-US' });
        
        // Select 3 of each in correct order
        const selectedTests = [
            ...germanTests.slice(0, 3),
            ...englishTests.slice(0, 3)
        ];
        
        console.log('🧪 [TEST-CHEAT] Starting CheatCard tests with 6 diverse scenarios');
        console.log('📝 [TEST-CHEAT] Testing:', selectedTests.map(t => t.scenario).join(', '));
        
        let successCount = 0;
        
        for (let i = 0; i < selectedTests.length; i++) {
            const test = selectedTests[i];
            console.log(`\n🔄 [TEST-${i + 1}] Processing: ${test.scenario} (${test.language})`);
            console.log(`📝 [TEST-${i + 1}] Text: "${test.text.substring(0, 100)}..."`);
            
            // Show current test in transcript window
            this.showTestTranscript(test, i + 1, selectedTests.length);
            
            try {
                const detection = {
                    lang: test.language,
                    confidence: 95,
                    flag: this.cardEngine.getLanguageFlag(test.language)
                };
                
                // 🎯 REAL-LIFE TESTING: Use the actual live transcript processing method
                console.log(`🧪 [TEST-${i + 1}] Processing via REAL processCompleteSentence() method`);
                
                // Count cards before processing
                const cardsBefore = this.cards.length;
                
                // Call the EXACT same method used in live transcription
                // This ensures testing matches real-world behavior exactly
                this.processCompleteSentence(test.text);
                
                // Wait for async card generation to complete properly
                // Longer delay to ensure all pipeline cards are generated before next test
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Count cards after processing to track success
                const cardsAfter = this.cards.length;
                const newCardsGenerated = cardsAfter - cardsBefore;
                successCount += newCardsGenerated;
                
                console.log(`📊 [TEST-${i + 1}] Generated ${newCardsGenerated} card(s) via real-life method`);
                
                // Delay between tests for readability
                await new Promise(resolve => setTimeout(resolve, 1500));
                
            } catch (error) {
                console.error(`❌ [TEST-${i + 1}] ERROR:`, error.message);
            }
        }
        
        console.log(`\n📊 [TEST-CHEAT] Results: ${successCount}/${selectedTests.length} cards generated`);
        console.log('💡 [TEST-CHEAT] Check cards for emoji-only format (no bullet points)');
    }
    
    /**
     * Test card generation with hardcoded transcripts
     */
    async runCardGenerationTests() {
        if (!window.TestTranscripts) {
            console.error('❌ [TEST] TestTranscripts module not loaded');
            return;
        }
        
        if (!this.cardEngine) {
            console.error('❌ [TEST] Card engine not initialized');
            return;
        }
        
        console.log('🧪 [TEST] Starting card generation tests...');
        
        const testTranscripts = window.TestTranscripts.getValidTestTranscripts();
        const results = [];
        
        for (let i = 0; i < testTranscripts.length; i++) {
            const test = testTranscripts[i];
            console.log(`\n🧪 [TEST-${i + 1}/${testTranscripts.length}] Testing: "${test.text.substring(0, 50)}..."`);
            console.log(`📝 [TEST-${i + 1}] Expected category: ${test.expectedCategory}`);
            console.log(`🌍 [TEST-${i + 1}] Language: ${test.language}`);
            
            // Show current test in transcript window
            this.showTestTranscript(test, i + 1, testTranscripts.length);
            
            try {
                const startTime = Date.now();
                
                // Create language detection object
                const detection = {
                    lang: test.language,
                    confidence: 95,
                    flag: this.cardEngine.getLanguageFlag(test.language)
                };
                
                // Use unified card creation for consistent testing
                try {
                    await this.createUnifiedCard(test.text, detection);
                    const duration = Date.now() - startTime;
                    
                    const testResult = {
                        id: test.id,
                        success: true, // If createUnifiedCard doesn't throw, it succeeded
                        duration,
                        expectedCategory: test.expectedCategory,
                        actualCategory: 'Generated via unified system',
                        expectedFront: test.expectedCardFront,
                        actualFront: test.text.substring(0, 50) + '...',
                        result: 'unified-system'
                    };
                    
                    results.push(testResult);
                    console.log(`✅ [TEST-${i + 1}] PASS - Generated via unified system`);
                } catch (error) {
                    console.log(`⏭️ [TEST-${i + 1}] SKIP - ${error.message}`);
                }
                
                console.log(`⏱️ [TEST-${i + 1}] Duration: ${duration}ms`);
                
                // Delay between tests for readability and to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 1500));
                
            } catch (error) {
                console.error(`❌ [TEST-${i + 1}] ERROR:`, error);
                results.push({
                    id: test.id,
                    success: false,
                    error: error.message,
                    duration: Date.now() - startTime
                });
            }
        }
        
        // Print summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success && r.error).length;
        const skipped = results.filter(r => !r.success && !r.error).length;
        const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;
        
        console.log(`\n📊 [TEST-SUMMARY] Results:`);
        console.log(`   ✅ Successful: ${successful}/${testTranscripts.length}`);
        console.log(`   ❌ Failed: ${failed}/${testTranscripts.length}`);
        console.log(`   ⏭️ Skipped: ${skipped}/${testTranscripts.length}`);
        console.log(`   ⏱️ Average duration: ${avgDuration.toFixed(0)}ms`);
        console.log(`   📈 Success rate: ${(successful / testTranscripts.length * 100).toFixed(1)}%`);
        
        // Print card engine stats
        const engineStats = this.cardEngine.getStats();
        console.log(`\n🎯 [ENGINE-STATS] Performance:`);
        console.log(`   📝 Total requests: ${engineStats.total}`);
        console.log(`   ✅ Successful cards: ${engineStats.successfulCards}`);
        console.log(`   ⏭️ Skipped: ${engineStats.skippedCards}`);
        console.log(`   ❌ Errors: ${engineStats.errors}`);
        console.log(`   📊 Success rate: ${engineStats.successRate}`);
        console.log(`   ⏱️ Avg response time: ${engineStats.avgResponseTime.toFixed(0)}ms`);
        
        return results;
    }
    
    getLanguageFlag(langCode) {
        const flags = {
            'de-DE': '🇩🇪',
            'en-US': '🇺🇸',
            'fr-FR': '🇫🇷', 
            'es-ES': '🇪🇸',
            'it-IT': '🇮🇹'
        };
        return flags[langCode] || '🇩🇪';
    }
    
    detectLanguage(text) {
        const detection = this.detectLanguageForText(text);
        
        // SEGMENT-LEVEL LANGUAGE SWITCHING with very low threshold  
        if (detection.confidence > 3 && detection.lang !== this.currentLang) {
            console.log(`🔄 [SEGMENT-SWITCH] ${this.currentLang} → ${detection.lang} (${detection.confidence}% confidence)`);
            this.currentLang = detection.lang;
            if (this.recognition) {
                this.recognition.lang = detection.lang;
                console.log(`🎤 [RECOGNITION-UPDATE] Speech API switched to: ${detection.lang}`);
            }
        }
        
        // Update UI display with flag
        const langCodes = {
            'de-DE': 'DE',
            'en-US': 'EN', 
            'fr-FR': 'FR',
            'es-ES': 'ES',
            'it-IT': 'IT',
            'el-GR': 'GR'
        };
        // Update transcript language indicator with separate flag and text
        if (this.els.transcriptLanguageFlag) {
            this.els.transcriptLanguageFlag.textContent = detection.flag || '🌐';
        }
        this.els.langCode.textContent = langCodes[detection.lang] || 'AUTO';
        
        return detection;
    }
    
    isTextWorthyOfCard(text) {
        // VERY PERMISSIVE for debugging - accept almost everything
        const trimmed = text.trim().toLowerCase();
        
        console.log(`🔍 [WORTHY] Checking: "${text.substring(0, 60)}..." (${trimmed.length} chars)`);
        
        // Very minimal length check - reduced from 20 to 15
        if (trimmed.length < 15) {
            console.log(`❌ [WORTHY-FAIL] Too short (< 15 chars)`);
            return false;
        }
        
        // Skip only single filler words
        if (/^(ja|nein|ok|okay|hmm|äh|eh|um|uh|yes|no)$/i.test(trimmed)) {
            console.log(`❌ [WORTHY-FAIL] Single filler word`);
            return false;
        }
        
        console.log(`✅ [WORTHY-PASS] Text accepted for card generation!`);
        return true; // Accept almost everything for debugging
    }
    
    // REMOVED: Backup of original function for cleaner code
    
    /**
     * Legacy test method - now uses new card engine testing system
     */
    testCardGeneration() {
        console.log('🔄 [LEGACY-TEST] Redirecting to new card engine test system...');
        return this.runCardGenerationTests();
    }
    
    hasStrongEducationalSignals(text) {
        const trimmed = text.trim().toLowerCase();
        
        // Only create fallback cards for content with very strong educational signals
        return /\b(definition|definition|equation|formel|theorem|law|gesetz|principle|prinzip|theory|theorie)\b/i.test(trimmed) ||
               /\b\d+([.,]\d+)?\s*(years?|jahre?|billion|milliarden?|percent|prozent)\b/i.test(trimmed) ||
               (/\b(quantum|quanten|physics|physik|chemistry|chemie|biology|biologie|mathematics|mathematik)\b/i.test(trimmed) && 
                trimmed.length > 40);
    }
    
    setupAudioVisualization() {
        // Only create AudioContext if it doesn't exist and user has interacted
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioAnalyser = this.audioContext.createAnalyser();
                this.audioAnalyser.fftSize = 256;
                this.audioAnalyser.smoothingTimeConstant = 0.5; // More responsive
                
                console.log('[Audio] Visualization setup complete, context state:', this.audioContext.state);
            } catch (error) {
                console.error('[Audio] Failed to setup visualization:', error);
            }
        }
    }
    
    setupLevelDots() {
        // Initialize level dots - they're already in HTML
        this.currentActiveDots = this.currentAudioSource === 'microphone' ? 
            this.els.micLevelDots : this.els.deviceLevelDots;
        
        // Enable dots UI immediately when audio source is selected
        this.showLevelDots();
        
        // Don't start monitoring on app load - wait for user to select audio source
        console.log('[Audio] Level dots UI initialized for:', this.currentAudioSource);
    }
    
    setupInterviewMode() {
        if (!this.els.interviewMode) return;
        
        // Handle interview mode toggle
        this.els.interviewMode.addEventListener('change', (e) => {
            console.log('[Interview] Interview mode toggle changed to:', e.target.checked);
            e.stopPropagation(); // Prevent modal closing
            const isInterviewMode = e.target.checked;
            this.apiSettings.interviewMode = isInterviewMode;
            
            // Show/hide description
            if (this.els.interviewModeDescription) {
                this.els.interviewModeDescription.style.display = isInterviewMode ? 'block' : 'none';
            }
            
            // Update card title and mode indicator
            this.updateCardModeDisplay();
            
            // Automatically adjust education settings for interview mode
            if (isInterviewMode) {
                // Set to strategic settings for interviews
                this.apiSettings.education.userLevel = 1; // Beginner - need simple explanations
                this.apiSettings.education.detailLevel = 2; // Concise - quick tips
                this.apiSettings.education.exampleComplexity = 1; // Simple examples
                
                // Update sliders to reflect new values
                if (this.els.educationLevel) this.els.educationLevel.value = 1;
                if (this.els.detailLevel) this.els.detailLevel.value = 2;
                if (this.els.exampleComplexity) this.els.exampleComplexity.value = 1;
                this.updateEducationDisplay();
            }
            
            // Show/hide interview active features section
            const activeFeatures = document.getElementById('interviewActiveFeatures');
            if (activeFeatures) {
                activeFeatures.style.display = isInterviewMode ? 'block' : 'none';
            }
            
            this.saveSettingsOnly();
        });
        
        // Setup mode toggle in flashcards header
        this.setupModeToggle();
        
        // Setup example cards carousel
        this.setupExampleCards();
        
        // Add comprehensive event prevention for toggle switches
        this.setupToggleSwitchEventPrevention();
    }
    
    setupModeToggle() {
        if (!this.els.cardsModeToggle || !this.els.modeInfoButton) return;
        
        // Handle mode toggle click
        this.els.cardsModeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('[Mode] Cards mode toggle clicked');
            
            // Toggle interview mode
            const currentMode = this.apiSettings.interviewMode;
            this.apiSettings.interviewMode = !currentMode;
            
            // Update the settings checkbox to match
            if (this.els.interviewMode) {
                this.els.interviewMode.checked = this.apiSettings.interviewMode;
            }
            
            // Show/hide description in settings
            if (this.els.interviewModeDescription) {
                this.els.interviewModeDescription.style.display = this.apiSettings.interviewMode ? 'block' : 'none';
            }
            
            // Update display
            this.updateCardModeDisplay();
            
            // Apply interview mode settings
            if (this.apiSettings.interviewMode) {
                this.apiSettings.education.userLevel = 1;
                this.apiSettings.education.detailLevel = 2;
                this.apiSettings.education.exampleComplexity = 1;
            }
            
            // Save settings
            this.saveSettingsOnly();
        });
        
        // Handle info button click - opens settings to CheatCard Mode tab
        this.els.modeInfoButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('[Mode] Info button clicked - opening CheatCard Mode settings');
            
            // Open settings modal
            this.openSettings();
            
            // Switch to interview/CheatCard tab
            const interviewTab = document.querySelector('[data-tab="interview"]');
            if (interviewTab) {
                // Remove active from all tabs
                document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Activate interview tab
                interviewTab.classList.add('active');
                const interviewContent = document.getElementById('tab-interview');
                if (interviewContent) {
                    interviewContent.classList.add('active');
                }
            }
        });
        
        // Initialize display
        this.updateCardModeDisplay();
    }

    setupExampleCards() {
        const exampleCards = [
            {
                category: "MEETING TIP",
                front: "How to handle \"Can you take the lead on this?\"",
                back: "✅ Say: \"I'd be happy to coordinate this. Let me confirm the scope and timeline with everyone\"<br>❌ Avoid: \"I guess\" or immediately saying no<br>🎯 Strategy: Show enthusiasm while clarifying expectations"
            },
            {
                category: "PRESENTATION TIP",
                front: "Handling difficult Q&A questions",
                back: "✅ Say: \"That's a great question. Let me think about that for a moment...\"<br>❌ Avoid: \"I don't know\" or making something up<br>🎯 Key point: Buy time to think, then give honest, thoughtful responses"
            },
            {
                category: "INTERVIEW TIP",
                front: "How to answer \"Tell me about yourself\"?",
                back: "✅ Say: \"I'm a [role] with [X years] experience in [field]. Recently accomplished [specific achievement].\"<br>❌ Avoid: Personal life details, rambling, or \"I don't know where to start\"<br>🎯 Key point: Keep it professional, structured, and relevant to the job"
            },
            {
                category: "QUICK WIN",
                front: "Biology test: Photosynthesis equation",
                back: "✅ Remember: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂<br>🎯 Memory trick: \"Six and Six make Sugar and Six\"<br>✅ Key point: Plants use carbon dioxide and water to make glucose"
            },
            {
                category: "KEY FACTS",
                front: "Chemistry test: Periodic table trends",
                back: "✅ Atomic radius decreases left to right, increases top to bottom<br>✅ Ionization energy increases left to right, decreases top to bottom<br>🎯 Memory trick: Think of nuclear charge pulling electrons closer"
            },
            {
                category: "WHAT TO SAY",
                front: "History test: World War II causes",
                back: "✅ Say: \"Multiple factors: Treaty of Versailles harshness, economic depression, rise of totalitarian regimes\"<br>❌ Avoid: Oversimplifying to just one cause<br>🎯 Strategy: Show understanding of complex historical connections"
            },
            {
                category: "AVOID THIS",
                front: "Physics test: Common formula mistakes",
                back: "❌ Never confuse: F=ma vs F=mg (weight vs general force)<br>❌ Don't forget: Units matter! Check if answer makes sense<br>✅ Always: Draw diagrams, identify known/unknown variables first"
            },
            {
                category: "QUICK WIN",
                front: "Math test: Trigonometry memory trick",
                back: "✅ SOHCAHTOA: Sin=Opposite/Hypotenuse, Cos=Adjacent/Hypotenuse, Tan=Opposite/Adjacent<br>🎯 Memory: \"Some Old Hippie Caught Another Hippie Tripping On Acid\"<br>✅ Always draw the triangle first"
            }
        ];
        
        let currentCardIndex = 0;
        
        const prevBtn = document.getElementById('prevExampleCard');
        const nextBtn = document.getElementById('nextExampleCard');
        const cardDisplay = document.getElementById('exampleCardDisplay');
        const cardCounter = document.getElementById('cardCounter');
        
        const updateCard = () => {
            if (!cardDisplay) return;
            
            const card = exampleCards[currentCardIndex];
            cardDisplay.innerHTML = `
                <div class="card-category" style="font-size: 10px; color: #f97316; font-weight: bold; margin-bottom: 8px;">${card.category}</div>
                <div class="card-front" style="font-weight: bold; margin-bottom: 12px; font-size: 14px;">${card.front}</div>
                <div class="card-back" style="font-size: 12px; line-height: 1.4; opacity: 0.9;">${card.back}</div>
            `;
            
            if (cardCounter) {
                cardCounter.textContent = `${currentCardIndex + 1} / ${exampleCards.length}`;
            }
        };
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCardIndex = (currentCardIndex - 1 + exampleCards.length) % exampleCards.length;
                updateCard();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCardIndex = (currentCardIndex + 1) % exampleCards.length;
                updateCard();
            });
        }
        
        // Initialize with first card
        updateCard();
    }

    setupToggleSwitchEventPrevention() {
        console.log('[Toggle] Setting up toggle switch event prevention');
        
        // Add click prevention to all toggle-related elements
        const toggleLabels = document.querySelectorAll('.settings-content .toggle-label');
        const toggleSwitches = document.querySelectorAll('.settings-content .toggle-switch');
        const toggleSliders = document.querySelectorAll('.settings-content .toggle-slider');
        
        console.log(`[Toggle] Found ${toggleLabels.length} labels, ${toggleSwitches.length} switches, ${toggleSliders.length} sliders`);
        
        // Prevent clicks on toggle containers from closing modal
        [...toggleLabels, ...toggleSwitches, ...toggleSliders].forEach((element, index) => {
            element.addEventListener('click', (e) => {
                console.log(`[Toggle] Prevented modal close on toggle element ${index}`);
                e.stopPropagation();
            });
        });
        
        console.log('[Toggle] Event prevention setup complete');
    }

    setupLanguageControls() {
        console.log('[Language] Setting up language controls...');
        console.log('[Language] Elements found:', {
            autoLanguage: !!this.els.autoLanguage,
            outputLanguage: !!this.els.outputLanguage, 
            languageIndicator: !!this.els.languageIndicator
        });
        
        if (!this.els.autoLanguage || !this.els.outputLanguage || !this.els.languageIndicator) {
            console.warn('[Language] Missing required elements, skipping setup');
            return;
        }
        
        // Handle auto language toggle switch
        this.els.autoLanguage.addEventListener('change', (e) => {
            console.log('[Language] Auto language toggle changed to:', e.target.checked);
            e.stopPropagation(); // Prevent modal closing
            const isAuto = e.target.checked;
            this.apiSettings.outputLanguage.auto = isAuto;
            
            // Show/hide language selector
            if (this.els.languageSelectContainer) {
                this.els.languageSelectContainer.style.display = isAuto ? 'none' : 'block';
            }
            
            this.updateLanguageIndicator();
            this.saveSettingsOnly();
        });
        
        // Handle fixed language selection
        this.els.outputLanguage.addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent modal closing
            this.apiSettings.outputLanguage.fixed = e.target.value;
            this.updateLanguageIndicator();
            this.saveSettingsOnly();
        });
        
        // Additional event prevention for select dropdown
        this.els.outputLanguage.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal closing on click
        });
        
        this.els.outputLanguage.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Prevent modal closing on mousedown
        });
        
        // Handle language indicator click
        console.log('[Language] Setting up click event for language indicator');
        console.log('[Language] Language indicator element:', this.els.languageIndicator);
        
        if (this.els.languageIndicator) {
            // Test that element is clickable
            console.log('[Language] Language indicator clickable test:', {
                element: this.els.languageIndicator,
                style: window.getComputedStyle(this.els.languageIndicator).pointerEvents,
                cursor: window.getComputedStyle(this.els.languageIndicator).cursor
            });
            
            this.els.languageIndicator.onclick = (e) => {
                console.log('[Language] 🎯 LANGUAGE INDICATOR CLICKED!');
                console.log('[Language] 🎯 Event:', e);
                
                const dropdown = document.getElementById('languageDropdown');
                console.log('[Language] 🔍 Dropdown element:', dropdown);
                
                if (dropdown) {
                    console.log('[Language] 📏 Current dropdown display:', dropdown.style.display);
                    console.log('[Language] 📏 Computed dropdown display:', window.getComputedStyle(dropdown).display);
                    
                    const isCurrentlyVisible = dropdown.style.display === 'block';
                    dropdown.style.display = isCurrentlyVisible ? 'none' : 'block';
                    
                    // Add visual feedback to the indicator
                    if (dropdown.style.display === 'block') {
                        this.els.languageIndicator.style.background = 'rgba(255, 255, 255, 0.15)';
                        this.els.languageIndicator.style.transform = 'scale(1.05)';
                    } else {
                        this.els.languageIndicator.style.background = '';
                        this.els.languageIndicator.style.transform = '';
                    }
                    
                    console.log('[Language] 📦 Dropdown toggled to:', dropdown.style.display);
                    console.log('[Language] 📦 Dropdown now visible:', dropdown.style.display === 'block');
                } else {
                    console.error('[Language] ❌ languageDropdown element not found!');
                }
                
                // Prevent modal from closing
                e.stopPropagation();
                return false;
            };
        } else {
            console.error('[Language] ❌ languageIndicator element not found!');
            console.log('[Language] Available elements:', Object.keys(this.els));
        }
        
        // Setup language dropdown
        this.setupLanguageDropdown();
        
        // Prevent language container clicks from closing modal
        if (this.els.languageSelectContainer) {
            this.els.languageSelectContainer.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal closing
            });
        }
        
        // Initialize indicator
        this.updateLanguageIndicator();
    }
    
    updateCardModeDisplay() {
        if (!this.els.cardsModeToggle) return;
        
        // Apply flip animation based on mode
        if (this.apiSettings.interviewMode) {
            // Flip to show CheatCards (back side)
            this.els.cardsModeToggle.style.transform = 'rotateY(180deg)';
            console.log('🎯 [MODE] Switched to CheatCards mode - new cards will have emoji structure');
        } else {
            // Flip to show FlashCards (front side)
            this.els.cardsModeToggle.style.transform = 'rotateY(0deg)';
            console.log('📚 [MODE] Switched to FlashCards mode - new cards will have plain text');
        }
        
        // Reset caches to ensure fresh generation with new mode
        this.resetCachesForModeChange();
    }
    
    /**
     * Reset all caches when mode changes to ensure different card styles
     */
    resetCachesForModeChange() {
        // Clear any pending empty cards with wrong card type
        const emptyCards = document.querySelectorAll('.card.empty');
        emptyCards.forEach(card => {
            const cardId = card.getAttribute('data-card-id');
            if (cardId && this.pendingCards.has(cardId)) {
                this.pendingCards.delete(cardId);
                card.remove();
                console.log('🗑️ [MODE-CHANGE] Removed pending empty card with old card type');
            }
        });
        
        // Reset card engine cache
        if (this.cardEngine) {
            this.cardEngine.reset();
            console.log('🔄 [MODE-CHANGE] Card engine cache reset');
        }
        
        // Reset LLM conversation cache
        if (this.llmConversation) {
            this.llmConversation.resetConversationForModeChange(this.sessionId);
        }
        
        console.log('✨ [MODE-CHANGE] All caches reset - next cards will use new mode styling');
    }

    updateLanguageIndicator() {
        if (!this.els.languageFlag || !this.els.languageText) return;
        
        const languageFlags = {
            'de-DE': '🇩🇪',
            'en-US': '🇺🇸', 
            'fr-FR': '🇫🇷',
            'es-ES': '🇪🇸',
            'it-IT': '🇮🇹',
            'pt-PT': '🇵🇹',
            'nl-NL': '🇳🇱',
            'ru-RU': '🇷🇺',
            'zh-CN': '🇨🇳',
            'ja-JP': '🇯🇵',
            'ko-KR': '🇰🇷',
            'ar-SA': '🇸🇦',
            'el-GR': '🇬🇷'
        };
        
        const languageNames = {
            'de-DE': 'DE',
            'en-US': 'EN', 
            'fr-FR': 'FR',
            'es-ES': 'ES',
            'it-IT': 'IT',
            'pt-PT': 'PT',
            'nl-NL': 'NL',
            'ru-RU': 'RU',
            'zh-CN': 'ZH',
            'ja-JP': 'JP',
            'ko-KR': 'KR',
            'ar-SA': 'AR',
            'el-GR': 'GR'
        };
        
        if (this.apiSettings.outputLanguage.auto) {
            this.els.languageFlag.textContent = '🌐';
            this.els.languageText.textContent = 'AUTO';
        } else {
            const lang = this.apiSettings.outputLanguage.fixed;
            this.els.languageFlag.textContent = languageFlags[lang] || '🌐';
            this.els.languageText.textContent = languageNames[lang] || lang.split('-')[0].toUpperCase();
        }
    }
    
    setupLanguageDropdown() {
        console.log('[Language] Setting up language dropdown...');
        const dropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-dropdown-option');
        
        console.log('[Language] Dropdown found:', !!dropdown);
        console.log('[Language] Language options found:', languageOptions.length);
        console.log('[Language] Language indicator element:', !!this.els.languageIndicator);
        
        if (!dropdown) {
            console.warn('[Language] Dropdown element not found!');
            return;
        }
        
        // Handle clicking outside dropdown to close it
        document.addEventListener('click', (e) => {
            if (!this.els.languageIndicator.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                // Reset visual feedback
                this.els.languageIndicator.style.background = '';
                this.els.languageIndicator.style.transform = '';
            }
        });
        
        // Handle language option clicks
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const selectedLang = option.dataset.lang;
                console.log('[Language] Dropdown option selected:', selectedLang);
                
                if (selectedLang === 'auto') {
                    this.apiSettings.outputLanguage.auto = true;
                } else {
                    this.apiSettings.outputLanguage.auto = false;
                    this.apiSettings.outputLanguage.fixed = selectedLang;
                    
                    // NEW: Set input language default to selected card language
                    this.setInputLanguageDefault(selectedLang);
                    console.log('🌍 [LANGUAGE] Input language set to match card language:', selectedLang);
                }
                
                // Update display and save
                this.updateLanguageIndicator();
                this.saveSettingsOnly();
                
                // Close dropdown
                dropdown.style.display = 'none';
                // Reset visual feedback
                this.els.languageIndicator.style.background = '';
                this.els.languageIndicator.style.transform = '';
                
                console.log('[Language] Settings updated via dropdown');
            });
        });
        
        // Add Greek to the language flags and names if missing
        const languageFlags = {
            'de-DE': '🇩🇪',
            'en-US': '🇺🇸', 
            'fr-FR': '🇫🇷',
            'es-ES': '🇪🇸',
            'it-IT': '🇮🇹',
            'pt-PT': '🇵🇹',
            'nl-NL': '🇳🇱',
            'ru-RU': '🇷🇺',
            'zh-CN': '🇨🇳',
            'ja-JP': '🇯🇵',
            'ko-KR': '🇰🇷',
            'ar-SA': '🇸🇦',
            'el-GR': '🇬🇷'
        };
        
        const languageNames = {
            'de-DE': 'DE',
            'en-US': 'EN', 
            'fr-FR': 'FR',
            'es-ES': 'ES',
            'it-IT': 'IT',
            'pt-PT': 'PT',
            'nl-NL': 'NL',
            'ru-RU': 'RU',
            'zh-CN': 'ZH',
            'ja-JP': 'JP',
            'ko-KR': 'KR',
            'ar-SA': 'AR',
            'el-GR': 'GR'
        };
    }
    
    async connectAudioSource(stream) {
        if (!this.audioContext || !this.audioAnalyser) return;
        
        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('[Audio] Context resumed');
            }
            
            // Disconnect previous source if exists
            if (this.audioSource) {
                this.audioSource.disconnect();
            }
            
            // Connect new source
            this.audioSource = this.audioContext.createMediaStreamSource(stream);
            this.audioSource.connect(this.audioAnalyser);
            console.log('[Audio] ✅ Audio source connected to analyser');
            
            // Start monitoring audio levels
            this.monitorAudioLevels();
            console.log('[Audio] ✅ Audio monitoring started');
            
            console.log('[Audio] Source connected for visualization, context state:', this.audioContext.state);
        } catch (error) {
            console.error('[Audio] Failed to connect source:', error);
        }
    }
    
    setupSystemAudioProcessing(stream) {
        console.log('[Audio] 🔄 Setting up system audio processing for tab audio...');
        
        try {
            // Get audio tracks from the stream
            const audioTracks = stream.getAudioTracks();
            console.log('[Audio] Audio tracks found:', audioTracks.length);
            
            if (audioTracks.length > 0) {
                console.log('[Audio] 🎧 Tab audio track:', audioTracks[0].label);
                
                // Set up fresh recognition for tab audio
                if (!this.recognition) {
                    this.setupSpeechRecognition();
                }
                
                // Start Web Speech API - it might work with tab audio in Chrome
                if (this.recognition && !this.isListening) {
                    try {
                        this.recognition.start();
                        this.isListening = true;
                        this.shouldBeListening = true;
                        console.log('[Audio] ✅ Speech recognition started for tab audio');
                        
                        // Update transcript display
                        if (this.els.transcript) {
                            this.els.transcript.innerHTML = `
                                <div class="transcript-rows">
                                    <div class="transcript-row current">
                                        🔊 Tab Audio Active - Listening...
                                    </div>
                                </div>
                            `;
                        }
                    } catch (error) {
                        if (error.name === 'InvalidStateError') {
                            // Recognition already started
                            this.isListening = true;
                            console.log('[Audio] Recognition already running');
                        } else {
                            console.error('[Audio] Failed to start recognition:', error);
                        }
                    }
                }
            }
            
            // Also start audio level monitoring
            this.fallbackToAudioLevelDisplay();
            
        } catch (error) {
            console.error('[Audio] Failed to setup system audio processing:', error);
            this.fallbackToAudioLevelDisplay();
        }
    }
    
    async processSystemAudioForTranscription() {
        if (!this.shouldBeListening || this.systemAudioBuffer.length === 0) return;
        
        console.log('[SystemAudio] 🎤 Processing audio chunk for transcription...');
        
        try {
            // Take chunk of audio data (3 seconds)
            const audioChunk = this.systemAudioBuffer.splice(0, 132300);
            
            // Convert to WAV and send to server
            const wavBlob = this.createWAVFromFloat32(audioChunk, this.audioContext.sampleRate);
            
            // Send to server for transcription
            const formData = new FormData();
            formData.append('audio', wavBlob, 'system_audio.wav');
            formData.append('sessionId', this.sessionId);
            formData.append('language', this.getOptimalLanguage());
            
            const response = await fetch('/api/transcribe-system-audio', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.text && result.text.trim()) {
                    console.log('[SystemAudio] 📝 Transcribed:', result.text);
                    this.handleSystemAudioTranscription(result.text);
                }
            } else {
                console.log('[SystemAudio] ⚠️ Server transcription not available, using Web Speech API fallback');
                this.useWebSpeechAPIFallback();
            }
            
        } catch (error) {
            console.log('[SystemAudio] ⚠️ Server transcription failed, using Web Speech API fallback');
            this.useWebSpeechAPIFallback();
        }
    }
    
    useWebSpeechAPIFallback() {
        // Note: Web Speech API cannot capture system audio, only microphone
        // This function is kept for compatibility but won't work for system audio
        console.log('[SystemAudio] ⚠️ Web Speech API cannot capture system audio');
        this.fallbackToAudioLevelDisplay();
    }
    
    fallbackToAudioLevelDisplay() {
        // Audio level display for system audio
        
        // Clear any existing interval
        if (this.systemAudioInterval) {
            clearInterval(this.systemAudioInterval);
        }
        
        // Show audio levels
        this.systemAudioInterval = setInterval(() => {
            if (!this.shouldBeListening) return;
            
            if (this.audioAnalyser) {
                const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
                this.audioAnalyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                
                if (average > 10) {
                    // Reduced threshold for better sensitivity
                    
                    // Only show audio levels if no real transcription is happening
                    if (this.els.transcript && average > 50 && 
                        (!this.transcriptState || !this.transcriptState.line3.text)) {
                        const timestamp = new Date().toLocaleTimeString();
                        // Use enhanced transcript display but don't overwrite active transcription
                        if (!this.isListening || this.transcriptLines.length === 0) {
                            this.els.transcript.innerHTML = `
                                <div class="transcript-rows">
                                    <div class="transcript-row line-3 current">
                                        <span class="time">...</span>
                                        <span class="text">🔊 Tab Audio Active - Level: ${average.toFixed(1)}</span>
                                    </div>
                                    <div class="transcript-row line-2 previous">
                                        <span class="text">Listening for speech in tab audio...</span>
                                    </div>
                                    <div class="transcript-row line-1 old">
                                        <span class="time">${timestamp}</span>
                                        <span class="text">Audio detection active</span>
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
            }
        }, 500);
    }
    
    handleSystemAudioTranscription(text) {
        console.log('[SystemAudio] 📝 Processing transcribed text:', text);
        
        // Add to transcript lines
        this.addTranscriptLine(text);
        this.updateTranscriptDisplay();
        
        // Process for card generation using new card engine
        if (text.length > 15) {
            // Detect language for this text
            const detection = this.detectLanguageForText(text);
            
            // Use unified card creation system for system audio
            if (this.cardEngine && this.cardEngine.isTextWorthyOfCard(text)) {
                this.createUnifiedCard(text, detection).catch(error => {
                    console.error('❌ [UNIFIED-SYSTEM] System audio card generation failed:', error);
                    this.setStatus('ai', 'red');
                });
            }
        }
    }
    
    createWAVFromFloat32(audioData, sampleRate) {
        const buffer = new ArrayBuffer(44 + audioData.length * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + audioData.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, audioData.length * 2, true);
        
        // Convert float32 samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < audioData.length; i++) {
            const sample = Math.max(-1, Math.min(1, audioData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return new Blob([buffer], { type: 'audio/wav' });
    }
    
    monitorAudioLevels() {
        if (!this.audioAnalyser) {
            console.error('[Audio] No analyser for monitoring');
            return;
        }
        
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        console.log('[Audio] ✅ Starting audio level monitoring, buffer size:', bufferLength);
        
        const checkLevel = () => {
            // Always monitor levels, not just when recording
            if (!this.audioAnalyser) return;
            
            this.audioAnalyser.getByteFrequencyData(dataArray);
            
            // Calculate average level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            this.audioLevel = sum / bufferLength;
            
            // Update waveform visualization
            this.updateWaveform(this.audioLevel);
            
            // Detect silence (low audio level for extended period)
            if (this.audioLevel < 10) {
                if (!this.silenceTimer) {
                    this.silenceTimer = setTimeout(() => {
                        this.handleSilence();
                    }, 2000); // 2 seconds of silence
                }
            } else {
                if (this.silenceTimer) {
                    clearTimeout(this.silenceTimer);
                    this.silenceTimer = null;
                }
            }
            
            requestAnimationFrame(checkLevel);
        };
        
        checkLevel();
    }
    
    updateWaveform(level) {
        this.updateLevelDots(level);
    }
    
    updateLevelDots(level) {
        if (!this.currentActiveDots) {
            console.warn('[Audio] No active dots element found');
            return;
        }
        
        const normalizedLevel = Math.min(1, Math.max(0, level / 50)); // 0-1 range
        const dots = this.currentActiveDots.querySelectorAll('.level-dot');
        
        if (dots.length > 0) {
            // Calculate how many dots should be active (1-7 dots)
            const activeDotCount = Math.ceil(normalizedLevel * 7);
            
            
            // Update each dot based on audio level
            Array.from(dots).forEach((dot, index) => {
                if (index < activeDotCount && level > 2) { // Minimum threshold
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        } else {
            console.warn('[Audio] No level dots found in active dots container');
        }
    }
    
    async startImmediateAudioMonitoring() {
        // DEPRECATED: Don't start monitoring immediately on app load
        // Wait for user to select audio source instead
        console.log('[Audio] Waiting for user to select audio source...');
    }
    
    async startAudioMonitoringOnly() {
        // Start monitoring for the currently selected audio source
        // This will trigger permission request if not already granted
        console.log(`[Audio] Requesting ${this.currentAudioSource} permission and starting monitoring...`);
        
        try {
            if (this.currentAudioSource === 'microphone') {
                await this.startMicrophoneMonitoringOnly();
            } else if (this.currentAudioSource === 'system') {
                await this.startSystemAudioMonitoringOnly();
            }
            
            console.log(`[Audio] ✅ Permission granted and monitoring active for ${this.currentAudioSource}`);
            console.log('[Audio] 🎵 Level dots should now show real audio input!');
        } catch (error) {
            console.error(`[Audio] ❌ Permission denied or error for ${this.currentAudioSource}:`, error);
            this.setStatus(this.currentAudioSource === 'microphone' ? 'mic' : 'audio', 'red');
        }
    }
    
    async startMicrophoneMonitoringOnly() {
        // Request microphone permission and start level monitoring
        console.log('[Audio] 🎤 Requesting microphone permission...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: false, 
                    noiseSuppression: false,
                    autoGainControl: false 
                } 
            });
            await this.connectAudioSource(stream);
            this.setStatus('mic', 'green');
            console.log('[Audio] ✅ Microphone access granted - monitoring levels');
        } catch (error) {
            this.setStatus('mic', 'red');
            console.error('[Audio] ❌ Microphone permission denied or error:', error);
            throw error;
        }
    }
    
    async startSystemAudioMonitoringOnly() {
        // For system/device audio, request screen share permission
        console.log('[Audio] 🔊 Requesting screen share permission for device output mode...');
        
        try {
            // Request system audio capture (screen share with audio)
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    suppressLocalAudioPlayback: false
                },
                video: {
                    width: 1,
                    height: 1,
                    frameRate: 1
                }
            });
            
            console.log('[Audio] ✅ Got system audio stream for monitoring');
            await this.connectAudioSource(stream);
            this.setStatus('audio', 'green');
            console.log('[Audio] ✅ Device output monitoring ready - system audio visualization active');
        } catch (error) {
            this.setStatus('audio', 'red');
            console.error('[Audio] ❌ Screen share permission denied for device output mode:', error);
            
            // Show user-friendly error message
            if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                console.log('[Audio] User needs to share screen/tab with audio for device output mode');
            }
            throw error;
        }
    }
    
    showLevelDots() {
        // Update which level dots are active based on current audio source
        this.currentActiveDots = this.currentAudioSource === 'microphone' ? 
            this.els.micLevelDots : this.els.deviceLevelDots;
        
        console.log('[Audio] Level dots active for:', this.currentAudioSource);
        console.log('[Audio] Active dots element:', this.currentActiveDots);
        
        if (this.currentActiveDots) {
            const dots = this.currentActiveDots.querySelectorAll('.level-dot');
            console.log('[Audio] Found', dots.length, 'level dots in container');
        }
    }
    
    hideLevelDots() {
        if (this.currentActiveDots) {
            const dots = this.currentActiveDots.querySelectorAll('.level-dot');
            Array.from(dots).forEach(dot => dot.classList.remove('active'));
        }
    }
    
    handleSilence() {
        // Don't log silence for system audio to reduce console clutter
        if (this.currentAudioSource !== 'system') {
            console.log('[Audio] Silence detected');
        }
        
        // Process any pending sentences when silence is detected
        if (this.pendingSentence.trim().length > 10) {
            this.processCompleteSentence(this.pendingSentence.trim());
            this.pendingSentence = '';
        }
        
        // Don't stop listening on silence for system audio
        if (this.currentAudioSource === 'system' && this.shouldBeListening) {
            // Keep recognition active for system audio
            if (this.recognition && !this.isListening) {
                try {
                    this.recognition.start();
                    this.isListening = true;
                } catch (error) {
                    // Ignore if already started
                }
            }
        }
        
        // Don't update UI for silence - let the visualizer handle this
    }
    
    async loadSettings() {
        try {
            // Load saved API keys from localStorage
            const savedSettings = localStorage.getItem('senscript_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                // Merge with defaults to ensure new properties exist
                this.apiSettings = {
                    ...this.apiSettings,
                    ...settings,
                    outputLanguage: {
                        auto: true,
                        fixed: 'en-US',
                        ...settings.outputLanguage
                    }
                };
                await this.updateServerSettings();
                this.updateUIFromSettings();
                
                // Update card engine with loaded settings
                if (this.cardEngine) {
                    this.cardEngine.apiSettings = this.apiSettings;
                    console.log('🔄 [CARD-ENGINE] Settings updated');
                }
            }
        } catch (error) {
            console.error('[Settings] Failed to load:', error);
        }
    }
    
    updateUIFromSettings() {
        // Update language controls
        if (this.els.autoLanguage) {
            this.els.autoLanguage.checked = this.apiSettings.outputLanguage.auto;
        }
        if (this.els.outputLanguage) {
            this.els.outputLanguage.value = this.apiSettings.outputLanguage.fixed;
        }
        if (this.els.languageSelectContainer) {
            this.els.languageSelectContainer.style.display = 
                this.apiSettings.outputLanguage.auto ? 'none' : 'block';
        }
        this.updateLanguageIndicator();
        
        // Update interview mode controls
        if (this.els.interviewMode) {
            this.els.interviewMode.checked = this.apiSettings.interviewMode || false;
        }
        if (this.els.interviewModeDescription) {
            this.els.interviewModeDescription.style.display = 
                this.apiSettings.interviewMode ? 'block' : 'none';
        }
        this.updateCardModeDisplay();
    }
    
    async updateServerSettings() {
        try {
            const payload = {
                sessionId: this.sessionId,
                ...this.apiSettings
            };
            
            console.log('📡 [SERVER-UPDATE] Sending settings to server:');
            console.log('   SessionId:', this.sessionId);
            console.log('   Education Payload:', payload.education);
            console.log('   Full Payload:', JSON.stringify(payload, null, 2));
            
            const response = await fetch('http://localhost:3002/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('✅ [SERVER-UPDATE] Settings successfully updated on server');
                console.log('   Server response:', result);
            } else {
                console.error('❌ [SERVER-UPDATE] Server rejected settings update:', result);
            }
        } catch (error) {
            console.error('❌ [SERVER-UPDATE] Failed to update server:', error);
        }
    }
    
    async createCard(text, detection = null) {
        const timestamp = new Date().toLocaleTimeString();
        // Creating card from pre-filtered worthy text
        // Note: worthiness already checked in processCompleteSentence
        
        // Use provided detection or detect language for this text
        const detectedLanguage = detection || this.detectLanguageForText(text);
        // Detected input language
        
        // Determine output language for card generation
        let outputLanguage = detectedLanguage.lang;
        let outputFlag = detectedLanguage.flag;
        
        // Override with fixed language if not in auto mode
        if (!this.apiSettings.outputLanguage.auto) {
            outputLanguage = this.apiSettings.outputLanguage.fixed;
            const flagMap = {
                'de-DE': '🇩🇪', 'en-US': '🇺🇸', 'fr-FR': '🇫🇷', 'es-ES': '🇪🇸',
                'it-IT': '🇮🇹', 'pt-PT': '🇵🇹', 'nl-NL': '🇳🇱', 'ru-RU': '🇷🇺',
                'zh-CN': '🇨🇳', 'ja-JP': '🇯🇵', 'ko-KR': '🇰🇷', 'ar-SA': '🇸🇦', 'el-GR': '🇬🇷'
            };
            outputFlag = flagMap[outputLanguage] || '🌐';
            // Using fixed output language
        } else {
            // Using auto output language
        }
        
        // Starting AI card generation
        const queryPayload = {
            sessionId: this.sessionId,
            transcript: text,
            language: outputLanguage,  // Use output language for card generation
            textConfidence: detectedLanguage.confidence,
            languageFlag: outputFlag  // Use output flag
        };
        
        // Set AI status to processing
        this.setStatus('ai', 'yellow');
        
        try {
            const startTime = Date.now();
            console.log('📤 [CARD-API] Sending request to server:', queryPayload);
            
            // Call AI API via our server with text-specific language
            const response = await fetch('http://localhost:3002/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryPayload)
            });
            
            const responseTime = Date.now() - startTime;
            console.log(`🕰️ [CARD-API] Response received in ${responseTime}ms, status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📥 [CARD-API] Parsed response:', result);
            
            // Enhanced response validation
            if (result.success === false) {
                console.log('🚫 [CARD-API] API returned success=false:', result.reason || 'No reason provided');
                this.setStatus('ai', 'yellow');
                return;
            }
            
            if (result.skip === true) {
                console.log('⏭️ [CARD-API] Content skipped by AI:', result.reason || 'No reason provided');
                this.setStatus('ai', 'yellow');
                return;
            }
            
            // Robust card data extraction
            let cardData = result.card || result; // Handle both formats
            
            if (!cardData || (!cardData.front && !cardData.question)) {
                console.error('❌ [CARD-API] Invalid card data structure:', cardData);
                throw new Error('Invalid card data received from API');
            }
            
            // Create robust card object with multiple fallbacks
            const card = {
                id: Date.now(),
                category: cardData.category || cardData.type || 'Card',
                front: cardData.front || cardData.question || 'No question',
                back: cardData.back || cardData.answer || 'No answer', 
                confidence: parseInt(cardData.confidence) || 75,
                source: 'AI',
                provider: result.provider || 'unknown',
                language: outputLanguage,
                flag: outputFlag,
                time: new Date().toLocaleTimeString(),
                originalText: text.substring(0, 100) // Keep reference to original
            };
            
            console.log('🃏 [CARD-CREATE] Final card object:', card);
            
            // Add card to collection and render
            this.cards.unshift(card);
            this.renderCard(card);
            this.updateCardCount();
            this.els.exportBtn.disabled = false;
            this.setStatus('ai', 'green');
            
            console.log(`✅ [CARD-SUCCESS] Card created successfully! Total cards: ${this.cards.length}`);
        } catch (error) {
            console.error('💥 [CARD-ERROR] Card creation failed:', error);
            console.error('🔍 [CARD-ERROR] Error details:', {
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3),
                text: text.substring(0, 50),
                timestamp
            });
            
            // Enhanced fallback system
            if (this.hasStrongEducationalSignals(text)) {
                console.log('🔄 [CARD-FALLBACK] Creating fallback card due to API error');
                this.createFallbackCard(text, detectedLanguage, outputLanguage, outputFlag);
            } else {
                console.log('🚫 [CARD-FALLBACK] No fallback - content not educational enough');
                this.setStatus('ai', 'red');
            }
        }
    }
    
    createFallbackCard(text, detection = null, outputLanguage = null, outputFlag = null) {
        console.log('[Cards] Creating fallback card for:', text);
        
        const detectedLanguage = detection || this.detectLanguageForText(text);
        
        // Use provided output language or fall back to detected language
        const cardLanguage = outputLanguage || detectedLanguage.lang;
        const cardFlag = outputFlag || detectedLanguage.flag;
        const words = text.toLowerCase().split(' ');
        let category = 'Concept';
        let front = '';
        let back = '';
        
        // BETTER FALLBACK: Create more meaningful educational cards from any content
        if (text.length > 30) {
            // Extract key concepts and create educational flashcards
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
            
            if (sentences.length >= 2) {
                // Multi-sentence: first sentence as question, rest as answer
                category = 'Concept';
                front = sentences[0].trim().length > 80 ? 
                    sentences[0].trim().substring(0, 80) + '...' : sentences[0].trim();
                back = sentences.slice(1).join('. ').trim();
                if (back.length > 150) back = back.substring(0, 150) + '...';
            } else if (words.some(w => ['ist', 'sind', 'bedeutet', 'is', 'are', 'means', 'called', 'heißt', 'nennt'].includes(w))) {
                // Single sentence with definition words
                const defIndex = text.toLowerCase().search(/(ist|sind|bedeutet|is|are|means|called|heißt|nennt)/);
                if (defIndex > 5) {
                    category = 'Definition';
                    front = text.substring(0, defIndex).trim();
                    back = text.substring(defIndex).trim();
                    if (back.length > 120) back = back.substring(0, 120) + '...';
                } else {
                    category = 'Fact';
                    front = cardLanguage === 'de-DE' ? 'Was wurde erklärt?' : 'What was explained?';
                    back = text.length > 120 ? text.substring(0, 120) + '...' : text;
                }
            } else if (words.some(w => ['weil', 'da', 'denn', 'because', 'since', 'as', 'therefore', 'deshalb', 'daher'].includes(w))) {
                // Causal relationship
                category = 'Explanation';
                const causeIndex = text.toLowerCase().search(/(weil|da|denn|because|since|as|therefore|deshalb|daher)/);
                if (causeIndex > 0) {
                    front = text.substring(0, causeIndex).trim();
                    back = text.substring(causeIndex).trim();
                } else {
                    front = cardLanguage === 'de-DE' ? 'Erklärung:' : 'Explanation:';
                    back = text.length > 120 ? text.substring(0, 120) + '...' : text;
                }
            } else {
                // Any meaningful content becomes a fact card
                category = 'Fact';
                const words_list = text.split(' ');
                if (words_list.length > 8) {
                    // Split roughly in half for question/answer
                    const midPoint = Math.floor(words_list.length / 2);
                    front = words_list.slice(0, midPoint).join(' ');
                    back = words_list.slice(midPoint).join(' ');
                } else {
                    front = cardLanguage === 'de-DE' ? 'Wichtige Information:' : 'Key Information:';
                    back = text;
                }
            }
        } else {
            // Skip trivial fallback cards - they're not useful
            console.log('[Cards] Skipping fallback - content not educational enough');
            this.setStatus('ai', 'yellow');
            return;
        }
        
        const card = {
            id: Date.now(),
            category,
            front,
            back,
            confidence: 30, // Lower confidence for fallback
            source: 'Fallback',
            language: cardLanguage,  // Use output language for fallback card
            flag: cardFlag,          // Use output flag for fallback card
            time: new Date().toLocaleTimeString()
        };
        
        this.cards.unshift(card); // Add to beginning for latest on top
        this.renderCard(card);
        this.updateCardCount();
        this.els.exportBtn.disabled = false;
        this.setStatus('ai', 'red');
        
        console.log('[Cards] Fallback card created:', card);
    }
    
    generateSourceUrl(source, language) {
        const searchTerm = encodeURIComponent(source.title);
        
        if (source.type === 'wikipedia') {
            // Language-specific Wikipedia URLs
            const languageMap = {
                'de-DE': 'de',
                'en-US': 'en', 
                'fr-FR': 'fr',
                'es-ES': 'es',
                'it-IT': 'it',
                'ru-RU': 'ru',
                'ja-JP': 'ja',
                'zh-CN': 'zh',
                'ko-KR': 'ko',
                'pt-PT': 'pt',
                'nl-NL': 'nl',
                'ar-SA': 'ar',
                'el-GR': 'el'
            };
            
            const langCode = languageMap[language] || 'en';
            return `https://${langCode}.wikipedia.org/wiki/Special:Search?search=${searchTerm}`;
        } else {
            // Google Search with language preference
            const languageSearchMap = {
                'de-DE': 'lr=lang_de&hl=de',
                'fr-FR': 'lr=lang_fr&hl=fr',
                'es-ES': 'lr=lang_es&hl=es',
                'it-IT': 'lr=lang_it&hl=it',
                'ru-RU': 'lr=lang_ru&hl=ru',
                'ja-JP': 'lr=lang_ja&hl=ja',
                'zh-CN': 'lr=lang_zh&hl=zh',
                'ko-KR': 'lr=lang_ko&hl=ko',
                'pt-PT': 'lr=lang_pt&hl=pt',
                'nl-NL': 'lr=lang_nl&hl=nl',
                'ar-SA': 'lr=lang_ar&hl=ar',
                'el-GR': 'lr=lang_el&hl=el'
            };
            
            const langParams = languageSearchMap[language] || 'hl=en';
            return `https://www.google.com/search?q=${searchTerm}&${langParams}`;
        }
    }

    
    /**
     * Open LLM chat interface with pre-filled prompt based on card content
     */
    openLLMChat(card) {
        console.log('🔗 [INTERACTIVE] Opening LLM chat for card:', card.category, '|', card.front);
        
        // Generate contextual prompt based on card content
        const prompt = this.generateLLMPrompt(card);
        
        // Determine best LLM provider based on card provider or availability
        const targetProvider = this.selectLLMProvider(card);
        
        // Generate appropriate chat URL
        const chatUrl = this.generateChatUrl(targetProvider, prompt);
        
        // Copy prompt to clipboard and open chat
        if (chatUrl) {
            // Copy prompt to clipboard
            const decodedPrompt = decodeURIComponent(prompt);
            navigator.clipboard.writeText(decodedPrompt).then(() => {
                console.log('📋 [INTERACTIVE] Prompt copied to clipboard');
            }).catch(err => {
                console.warn('⚠️ [INTERACTIVE] Failed to copy prompt:', err);
            });
            
            // Open chat in new tab
            window.open(chatUrl, '_blank');
            console.log('✅ [INTERACTIVE] Opened chat with:', targetProvider, 'for topic:', card.front);
            
            // Show notification
            this.showNotification(`Opening ${targetProvider.toUpperCase()} chat - prompt copied to clipboard!`, 'info');
        } else {
            console.warn('⚠️ [INTERACTIVE] No available LLM provider for chat');
            this.showNotification('No LLM provider available for deep dive', 'warning');
        }
    }
    
    /**
     * Generate contextual prompt for LLM chat based on card content
     */
    generateLLMPrompt(card) {
        const category = card.category || 'General';
        const front = card.front || 'Unknown topic';
        const back = card.back || '';
        
        // Create focused prompts based on category
        const categoryPrompts = {
            'MEETING TIP': `I want to learn more about professional meeting strategies. Specifically about: "${front}"\n\nCurrent knowledge: ${back}\n\nPlease provide detailed advice, examples, and advanced techniques for handling similar situations in professional meetings.`,
            
            'PRESENTATION TIP': `Help me improve my presentation skills regarding: "${front}"\n\nWhat I know: ${back}\n\nPlease give me comprehensive guidance, practical examples, and advanced strategies for better presentations.`,
            
            'INTERVIEW TIP': `I'm preparing for job interviews and need deeper insights about: "${front}"\n\nCurrent understanding: ${back}\n\nPlease provide detailed advice, example answers, and strategies for excelling in this interview scenario.`,
            
            'QUICK WIN': `I want to master this concept quickly: "${front}"\n\nBasic info: ${back}\n\nPlease provide additional memory techniques, practice methods, and deeper understanding of this topic.`,
            
            'KEY FACTS': `Help me understand this important concept thoroughly: "${front}"\n\nCurrent knowledge: ${back}\n\nPlease explain the broader context, related concepts, and practical applications.`,
            
            'WHAT TO SAY': `I need help with communication in this scenario: "${front}"\n\nCurrent approach: ${back}\n\nPlease provide alternative phrasings, examples, and communication strategies for this situation.`,
            
            'AVOID THIS': `I want to understand and avoid these mistakes: "${front}"\n\nWhat I know: ${back}\n\nPlease explain why these mistakes happen, how to prevent them, and what to do instead.`,
            
            'CONCEPT': `Help me deeply understand this concept: "${front}"\n\nCurrent knowledge: ${back}\n\nPlease provide detailed explanations, examples, and connections to related ideas.`,
            
            'FACT': `I want to learn more about: "${front}"\n\nBasic info: ${back}\n\nPlease provide additional context, related information, and practical applications.`
        };
        
        const prompt = categoryPrompts[category] || 
            `Please help me learn more about: "${front}"\n\nCurrent knowledge: ${back}\n\nProvide detailed information, examples, and practical guidance on this topic.`;
            
        return encodeURIComponent(prompt);
    }
    
    /**
     * Select best LLM provider for chat based on card provider or availability
     */
    selectLLMProvider(card) {
        // Prefer the same provider that generated the card
        const cardProvider = card.provider || card.source;
        
        // Check if we have API keys available (client-side only)
        const hasOpenAI = this.apiSettings?.apiKeys?.openai;
        const hasAnthropic = this.apiSettings?.apiKeys?.anthropic;
        const hasDeepSeek = this.apiSettings?.apiKeys?.deepseek;
        
        // Priority order: Same provider → OpenAI → Anthropic → DeepSeek → Public interfaces
        if (cardProvider === 'openai' && hasOpenAI) return 'openai';
        if (cardProvider === 'anthropic' && hasAnthropic) return 'anthropic';
        if (cardProvider === 'deepseek' && hasDeepSeek) return 'deepseek';
        
        // Fallback to available providers
        if (hasOpenAI) return 'openai';
        if (hasAnthropic) return 'anthropic';
        if (hasDeepSeek) return 'deepseek';
        
        // Ultimate fallback to public interfaces
        return 'chatgpt-web';
    }
    
    /**
     * Generate chat URL for specific LLM provider
     */
    generateChatUrl(provider, prompt) {
        // Note: Most LLM chat interfaces don't support direct URL prompt parameters
        // We'll open the chat interface and the user can paste the prompt
        const urls = {
            'openai': `https://chat.openai.com/`,
            'anthropic': `https://claude.ai/chat`, 
            'deepseek': `https://chat.deepseek.com/`,
            'chatgpt-web': `https://chat.openai.com/`,
            'claude-web': `https://claude.ai/chat`
        };
        
        return urls[provider] || urls['chatgpt-web'];
    }
    
    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            max-width: 300px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(350px);
        `;
        
        // Set background based on type
        const backgrounds = {
            'info': 'rgba(59, 130, 246, 0.9)',
            'success': 'rgba(34, 197, 94, 0.9)',
            'warning': 'rgba(245, 158, 11, 0.9)',
            'error': 'rgba(239, 68, 68, 0.9)'
        };
        
        notification.style.background = backgrounds[type] || backgrounds['info'];
        notification.style.color = 'white';
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(350px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Reset card engine cache - useful for testing
     */
    resetCardEngine() {
        if (this.cardEngine) {
            this.cardEngine.reset();
            console.log('🔄 [RESET] Card engine cache cleared for fresh testing');
            this.showNotification('Card engine cache reset', 'success');
        }
    }
    
    /**
     * Global function to reset all caches and force fresh card generation
     */
    resetAllCaches() {
        this.resetCachesForModeChange();
        this.showNotification('All caches reset - ready for fresh card generation!', 'success');
    }
    
    updateCardCount() {
        this.els.cardCount.textContent = `${this.cards.length} cards`;
    }
    
    addSplitSegmentToUI(segment) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`📱 [${timestamp}] [LIVE-UI-ADD] Adding segment to UI immediately: "${segment.substring(0, 50)}..."`);        
        
        // Füge Split-Segment SOFORT als separate Zeile hinzu für smooth UI
        this.addTranscriptLine(segment);
        
        // SOFORTIGES UI Update für smooth splitting
        this.updateAnimatedTranscript();
        
        console.log(`✅ [${timestamp}] [LIVE-UI-UPDATED] UI updated with ${this.transcriptLines.length} total lines`);
    }
    
    updateAnimatedTranscriptImmediate() {
        // Sofortige UI-Aktualisierung ohne requestAnimationFrame Verzögerung
        const parts = [];
        const maxLinesShown = 6;
        
        // Zeige die letzten Linien mit Fade-Effekten
        const startIndex = Math.max(0, this.transcriptLines.length - maxLinesShown);
        const visibleLines = this.transcriptLines.slice(startIndex);
        
        visibleLines.forEach((line, index) => {
            const age = visibleLines.length - 1 - index;
            let className = 'transcript-line';
            
            if (age === 0) className += ' current';
            else if (age === 1) className += ' previous';
            else if (age >= 2) className += ' old';
            
            parts.push(`<div class="${className}">${line}</div>`);
        });
        
        // Zeige aktuellen Interim Text falls vorhanden (auch wenn noch nicht isListening)
        if (this.currentInterim && (this.isListening || this.shouldBeListening)) {
            parts.push(`<div class="transcript-line transcript-interim">${this.currentInterim}</div>`);
        }
        
        this.els.transcript.innerHTML = parts.join('');
        
        // Auto-scroll zu neuem Inhalt
        setTimeout(() => {
            this.els.transcript.scrollTop = this.els.transcript.scrollHeight;
        }, 10);
        
        console.log(`🔄 [UI-IMMEDIATE] UI sofort aktualisiert mit ${parts.length} Zeilen`);
    }
    
    addTranscriptLine(text) {
        // Clean and validate text first
        const cleanText = this.cleanTranscriptText(text);
        
        if (!cleanText || cleanText.length < 2) {
            console.log(`🚫 [FILTER] Text too short or empty: "${text}"`);
            return;
        }
        
        // Check for garbled/corrupted text patterns
        if (this.isTextCorrupted(cleanText)) {
            console.log(`🚫 [CORRUPTED] Skipping corrupted text: "${cleanText}"`);
            return;
        }
        
        // STABLE APPROACH: Simple, clean display  
        const displayText = cleanText.length > 80 ? cleanText.substring(0, 80) + '...' : cleanText;
        
        // Prevent duplicate lines - check if the last line is very similar
        if (this.transcriptLines.length > 0) {
            const lastLine = this.transcriptLines[this.transcriptLines.length - 1];
            const similarity = this.calculateTextSimilarity(lastLine.text, displayText);
            if (similarity > 0.75) { // Slightly lower threshold for better filtering
                console.log(`🔄 [DUPLICATE] Skipping similar line: "${displayText}"`);
                return;
            }
        }
            
        const lineData = {
            id: Date.now() + Math.random(),
            text: displayText,
            timestamp: new Date()
        };
        
        this.transcriptLines.push(lineData);
        
        // Keep only 5 lines for better transcript history
        if (this.transcriptLines.length > 5) {
            this.transcriptLines = this.transcriptLines.slice(-5);
        }
        
        console.log(`📝 [DISPLAY] Added: "${displayText}"`);
        // Use the same method as speech result handler for consistency
        this.updateAnimatedTranscript();
    }
    
    cleanTranscriptText(text) {
        if (!text) return '';
        
        // Remove extra whitespace and clean up text
        let cleaned = text.trim()
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[^\w\s\.,!?;:'"-]/g, ''); // Remove strange characters but keep punctuation
        
        return cleaned;
    }
    
    isTextCorrupted(text) {
        // Detect patterns that indicate corrupted/garbled speech recognition
        const lowercaseText = text.toLowerCase();
        
        // Pattern 1: Too many repeated words
        const words = lowercaseText.split(' ').filter(w => w.length > 2);
        const uniqueWords = new Set(words);
        const repetitionRatio = uniqueWords.size / Math.max(words.length, 1);
        if (repetitionRatio < 0.6 && words.length > 4) {
            console.log(`🔍 [CORRUPTION-CHECK] High repetition ratio: ${repetitionRatio.toFixed(2)}`);
            return true;
        }
        
        // Pattern 2: Nonsensical word combinations (common in speech recognition errors)
        const corruptedPatterns = [
            /\b(analyst get out|microphone is analyst|certain is to try)\b/,
            /\b(does microphone is|get out as a certain)\b/,
            /\b\w{1,2}\s+\w{1,2}\s+\w{1,2}\s+\w{1,2}\s+\w{1,2}\b/  // Too many short words in sequence
        ];
        
        for (const pattern of corruptedPatterns) {
            if (pattern.test(lowercaseText)) {
                console.log(`🔍 [CORRUPTION-CHECK] Matched corrupted pattern: ${pattern}`);
                return true;
            }
        }
        
        // Pattern 3: Very low ratio of real words to total words
        const commonWords = /\b(the|and|is|are|was|were|have|has|can|will|to|of|in|for|with|that|this|what|how|when|where|who|why|which|would|should|could|must|might|about|after|before|during|through|over|under|between|while|against|without|since|until|from|into|onto|upon|within|toward|across|among|beside|beyond|inside|outside|around|der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber|wie|was|wann|wo|wer|warum|welche|dass|wenn|oder|haben|werden|wurde|könnte|sollte|müssen|können)\b/gi;
        const commonWordMatches = (lowercaseText.match(commonWords) || []).length;
        const commonWordRatio = commonWordMatches / Math.max(words.length, 1);
        
        // More lenient corruption check - only reject obviously corrupted text
        if (commonWordRatio < 0.05 && words.length > 6) {
            console.log(`🔍 [CORRUPTION-CHECK] Very low common word ratio: ${commonWordRatio.toFixed(2)}`);
            return true;
        }
        
        return false;
    }
    
    calculateTextSimilarity(text1, text2) {
        // Simple similarity calculation based on common words
        const words1 = text1.toLowerCase().split(' ').filter(w => w.length > 2);
        const words2 = text2.toLowerCase().split(' ').filter(w => w.length > 2);
        
        if (words1.length === 0 || words2.length === 0) return 0;
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = Math.max(words1.length, words2.length);
        
        return commonWords.length / totalWords;
    }
    
    createReadableSegments() {
        // Combine recent transcript lines into flowing, readable segments
        const lines = [...this.transcriptLines];
        if (lines.length === 0) return [];
        
        const now = new Date();
        const MAX_AGE_MS = 5000; // 5 seconds expiration for context lines
        
        // Filter out expired lines (older than 5 seconds)
        const validLines = lines.filter(line => {
            if (!line.timestamp) return true; // Keep lines without timestamp
            const age = now - line.timestamp;
            return age <= MAX_AGE_MS;
        });
        
        console.log(`[Transcript] Filtered ${lines.length} lines to ${validLines.length} valid lines (5sec expiration)`);
        
        const segments = [];
        let currentSegment = { text: '', timestamp: null };
        let segmentLength = 0;
        const MAX_SEGMENT_LENGTH = 120; // Max characters per segment for readability
        
        // Work backwards from most recent valid lines
        for (let i = validLines.length - 1; i >= 0; i--) {
            const line = validLines[i];
            if (!line.text) continue;
            
            // Start new segment if adding this line would make it too long
            if (segmentLength > 0 && (segmentLength + line.text.length) > MAX_SEGMENT_LENGTH) {
                // Save current segment
                if (currentSegment.text) {
                    segments.unshift(currentSegment);
                }
                // Start new segment
                currentSegment = { 
                    text: line.text, 
                    timestamp: line.timestamp 
                };
                segmentLength = line.text.length;
            } else {
                // Add to current segment
                if (currentSegment.text) {
                    currentSegment.text = line.text + ' ' + currentSegment.text;
                } else {
                    currentSegment.text = line.text;
                    currentSegment.timestamp = line.timestamp;
                }
                segmentLength += line.text.length + 1; // +1 for space
            }
            
            // Limit to last 6 lines for performance
            if (validLines.length - i >= 6) break;
        }
        
        // Add the final segment
        if (currentSegment.text) {
            segments.unshift(currentSegment);
        }
        
        console.log('[Transcript] Created', segments.length, 'readable segments from', validLines.length, 'valid lines');
        return segments;
    }
    
    /**
     * Enhanced transcript display with smooth flip animations
     * Requirements:
     * 1. 3 lines stay connected and readable
     * 2. Smooth interim display with flip animations  
     * 3. Lines 1-2 stay static, move up when complete
     * 4. Line 3 gets extended by whole sentence parts
     * 5. Complete sentences become paragraphs taking lines 1-2
     */
    updateTranscriptDisplay() {
        if (!this.els.transcript) return;
        
        const container = this.els.transcript;
        const hasInterim = this.currentInterim && this.isListening;
        
        // Initialize transcript state if needed
        if (!this.transcriptState) {
            this.transcriptState = {
                line1: { text: '', timestamp: null, isStatic: true },
                line2: { text: '', timestamp: null, isStatic: true },
                line3: { text: '', timestamp: null, building: false },
                pendingComplete: null,
                lastInterim: ''
            };
        }
        
        const state = this.transcriptState;
        
        // Handle interim text changes (live typing with smooth updates)
        if (hasInterim) {
            const interimText = this.currentInterim.trim();
            
            // Check if interim text is significantly different (avoid micro-updates)
            if (Math.abs(interimText.length - state.lastInterim.length) > 3 || 
                !interimText.startsWith(state.lastInterim.substring(0, 10))) {
                
                state.line3.text = interimText + '...';
                state.line3.building = true;
                state.line3.timestamp = new Date();
                state.lastInterim = interimText;
                
                this.renderTranscriptWithAnimation('interim-update');
            }
            return;
        }
        
        // Handle completed sentences
        const readableSegments = this.createReadableSegments();
        if (readableSegments.length > 0) {
            const latestSegment = readableSegments[readableSegments.length - 1];
            
            // Check if we have a new complete sentence
            if (state.pendingComplete !== latestSegment.text && latestSegment.text) {
                state.pendingComplete = latestSegment.text;
                
                // Animate the completion: interim -> final
                if (state.line3.building) {
                    state.line3.text = latestSegment.text;
                    state.line3.building = false;
                    state.line3.timestamp = latestSegment.timestamp;
                    state.lastInterim = '';
                    
                    this.renderTranscriptWithAnimation('complete-sentence');
                    
                    // After animation, shift everything up
                    setTimeout(() => {
                        this.shiftTranscriptLinesUp(latestSegment);
                    }, 300); // Wait for flip animation
                } else {
                    // Direct addition without interim
                    state.line3.text = latestSegment.text;
                    state.line3.building = false;
                    state.line3.timestamp = latestSegment.timestamp;
                    
                    this.renderTranscriptWithAnimation('direct-add');
                    setTimeout(() => {
                        this.shiftTranscriptLinesUp(latestSegment);
                    }, 200);
                }
                return;
            }
        }
        
        // Default render for status messages
        if (!this.isListening && !this.shouldBeListening) {
            state.line1.text = '';
            state.line2.text = 'Click "Start" to begin...';
            state.line3.text = '';
            state.line3.building = false;
        } else if (this.isListening && !hasInterim && state.line3.text === '') {
            state.line1.text = '';
            state.line2.text = '🎤 Listening... speak clearly';
            state.line3.text = '';
            state.line3.building = false;
        }
        
        this.renderTranscriptWithAnimation('status-update');
    }
    
    /**
     * Shift lines up smoothly when a sentence is complete
     */
    shiftTranscriptLinesUp(newSegment) {
        const state = this.transcriptState;
        
        // Move everything up
        state.line1 = { ...state.line2 };
        state.line2 = { ...state.line3 };
        state.line3 = { text: '', timestamp: null, building: false };
        
        // Render with shift animation
        this.renderTranscriptWithAnimation('shift-up');
    }
    
    /**
     * Render transcript with smooth animations
     */
    renderTranscriptWithAnimation(animationType = 'none') {
        if (!this.els.transcript || !this.transcriptState) return;
        
        const state = this.transcriptState;
        const timeFormat = (timestamp) => {
            if (!timestamp) return '';
            return timestamp.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        };
        
        // Add animation class to container
        const container = this.els.transcript;
        if (animationType !== 'none') {
            container.classList.add(`anim-${animationType}`);
            setTimeout(() => {
                container.classList.remove(`anim-${animationType}`);
            }, 400);
        }
        
        let html = '<div class="transcript-rows enhanced">';
        
        // Line 1: Oldest/static content (faded)
        html += `<div class="transcript-row line-1 ${state.line1.isStatic ? 'static' : ''}">
                    ${state.line1.text ? 
                        `<span class="time">${timeFormat(state.line1.timestamp)}</span>
                         <span class="text">${state.line1.text}</span>` : 
                        '<span class="placeholder"></span>'}
                 </div>`;
        
        // Line 2: Previous/static content (medium opacity)  
        html += `<div class="transcript-row line-2 ${state.line2.isStatic ? 'static' : ''}">
                    ${state.line2.text ? 
                        `<span class="time">${timeFormat(state.line2.timestamp)}</span>
                         <span class="text">${state.line2.text}</span>` : 
                        '<span class="placeholder"></span>'}
                 </div>`;
        
        // Line 3: Current/building content (full opacity)
        const line3Classes = [
            'transcript-row',
            'line-3', 
            'current',
            state.line3.building ? 'building' : 'complete'
        ].join(' ');
        
        html += `<div class="${line3Classes}">
                    ${state.line3.text ? 
                        `<span class="time">${state.line3.building ? '...' : timeFormat(state.line3.timestamp)}</span>
                         <span class="text ${state.line3.building ? 'typing' : ''}">${state.line3.text}</span>` : 
                        '<span class="placeholder">Ready...</span>'}
                 </div>`;
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    /**
     * Set input language default when card language is selected
     * This ensures speech recognition uses the same language as card generation
     */
    setInputLanguageDefault(selectedLanguage) {
        console.log('🌍 [INPUT-LANG] Setting input language default to:', selectedLanguage);
        
        // Store the user's language preference
        this.preferredInputLanguage = selectedLanguage;
        
        // Update current language immediately if not in auto mode
        if (!this.apiSettings.outputLanguage.auto) {
            this.currentLang = selectedLanguage;
            
            // Update speech recognition language if active
            if (this.recognition) {
                this.recognition.lang = selectedLanguage;
                console.log('🗣️ [SPEECH] Recognition language updated to:', selectedLanguage);
                
                // Restart recognition if it's running to apply new language
                if (this.isListening) {
                    this.restartRecognitionWithNewLanguage(selectedLanguage);
                }
            }
        }
        
        // Save preference to localStorage
        localStorage.setItem('senscript_preferred_input_lang', selectedLanguage);
    }
    
    /**
     * Handle language switching during recognition with transcript conversion
     */
    handleLanguageSwitch(newLanguage, confidence) {
        if (newLanguage === this.currentLang && confidence < 80) {
            return; // Not confident enough to switch
        }
        
        const oldLanguage = this.currentLang;
        console.log('🔄 [LANG-SWITCH] Detected language change:', oldLanguage, '→', newLanguage, `(${confidence}%)`);
        
        // Update current language
        this.currentLang = newLanguage;
        
        // Update speech recognition
        if (this.recognition) {
            this.recognition.lang = newLanguage;
        }
        
        // Convert existing transcript segments to new language (conceptually)
        this.convertTranscriptSegments(oldLanguage, newLanguage);
        
        // Update UI language indicators
        this.updateLanguageIndicator();
    }
    
    /**
     * Convert already transcribed segments to new language
     * Note: This is a conceptual conversion - in practice, we update the UI
     * to indicate language switch and maintain readability
     */
    convertTranscriptSegments(fromLang, toLang) {
        console.log('🔄 [TRANSCRIPT-CONVERT] Converting transcript from', fromLang, 'to', toLang);
        
        // Update transcript state with language change indicator
        if (this.transcriptState) {
            // Add a visual indicator that language has changed
            const languageChangeIndicator = `🌍 Language switched: ${this.getLanguageFlag(fromLang)} → ${this.getLanguageFlag(toLang)}`;
            
            // Smoothly transition with language change notification
            if (this.transcriptState.line3.text === '') {
                this.transcriptState.line3.text = languageChangeIndicator;
                this.transcriptState.line3.building = false;
                this.transcriptState.line3.timestamp = new Date();
            } else {
                // Add to next available line
                this.shiftTranscriptLinesUp(null);
                this.transcriptState.line3.text = languageChangeIndicator;
                this.transcriptState.line3.building = false;
                this.transcriptState.line3.timestamp = new Date();
            }
            
            this.renderTranscriptWithAnimation('language-switch');
        }
        
        // Update existing transcript lines metadata
        this.transcriptLines.forEach(line => {
            if (!line.language || line.language === fromLang) {
                line.language = toLang;
                line.converted = true;
            }
        });
    }
    
    /**
     * Restart recognition with new language smoothly
     */
    async restartRecognitionWithNewLanguage(newLanguage) {
        console.log('🔄 [RECOGNITION-RESTART] Restarting with language:', newLanguage);
        
        try {
            // Stop current recognition
            if (this.recognition && this.isListening) {
                this.recognition.abort();
                this.isListening = false;
            }
            
            // Short delay to ensure clean restart
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Set up with new language
            this.currentLang = newLanguage;
            this.setupSpeechRecognition();
            
            // Restart if we should be listening
            if (this.shouldBeListening) {
                this.recognition.start();
                console.log('🗣️ [RECOGNITION] Restarted with new language:', newLanguage);
            }
            
        } catch (error) {
            console.error('❌ [RECOGNITION-RESTART] Failed to restart recognition:', error);
        }
    }
    
    /**
     * Enhanced language detection with switching logic
     */
    detectLanguageForTextWithSwitching(text) {
        const detection = this.detectLanguageForText(text);
        
        // Check if we should switch languages based on detection confidence
        if (detection.confidence > 75 && detection.lang !== this.currentLang) {
            this.handleLanguageSwitch(detection.lang, detection.confidence);
        }
        
        return detection;
    }
    
    splitTextForDisplay(text, maxLength) {
        if (text.length <= maxLength) {
            return [text];
        }
        
        const lines = [];
        let remaining = text;
        
        while (remaining.length > maxLength) {
            // Suche nach einem guten Trennpunkt (Leerzeichen, Komma, etc.)
            let splitIndex = maxLength;
            const searchStart = Math.max(0, maxLength - 20);
            
            for (let i = maxLength; i >= searchStart; i--) {
                const char = remaining[i];
                if (char === ' ' || char === ',' || char === ';' || char === ':') {
                    splitIndex = i;
                    break;
                }
            }
            
            lines.push(remaining.substring(0, splitIndex).trim());
            remaining = remaining.substring(splitIndex).trim();
        }
        
        if (remaining.length > 0) {
            lines.push(remaining);
        }
        
        return lines;
    }
    
    updateAnimatedTranscript() {
        console.log(`🎨 [UI-UPDATE] updateAnimatedTranscript called - interim: "${this.currentInterim}", isListening: ${this.isListening}, shouldBeListening: ${this.shouldBeListening}`);
        
        if (!this.els.transcript) {
            console.error('[Transcript] Element not found');
            return;
        }
        
        // Show recording status only when completely inactive
        if (!this.isListening && !this.shouldBeListening && this.transcriptLines.length === 0 && !this.currentInterim) {
            this.els.transcript.innerHTML = `<div class="transcript-line current">Click "Start" to begin...</div>`;
            return;
        }
        
        // Show listening status when recording started but no text yet
        if ((this.isListening || this.shouldBeListening) && this.transcriptLines.length === 0 && !this.currentInterim.trim()) {
            let listeningMessage;
            if (this.currentAudioSource === 'system') {
                listeningMessage = '🔊 Listening to device output... waiting for audio';
            } else {
                listeningMessage = '🎤 Listening to microphone... waiting for audio';
            }
            this.els.transcript.innerHTML = `<div class="transcript-line current listening">${listeningMessage}</div>`;
            return;
        }
        
        // Build content more efficiently
        const parts = [];
        
        // USER REQUESTED ORDER: Latest sentence on bottom as big line
        const visibleLines = this.transcriptLines.slice(-3); // Get last 3 lines
        
        visibleLines.forEach((line, index) => {
            let className = 'transcript-line';
            
            // USER REQUEST: Latest line should be at bottom (biggest)
            if (index === 0) {
                className += ' old'; // Top line = oldest of the 3 (smallest)
            } else if (index === 1) {
                className += ' previous'; // Middle line = middle age (medium)
            } else if (index === 2) {
                // Bottom line = newest (biggest) - this is what user wants
                className += ' current'; 
            }
            
            parts.push(`<div class="${className}">${line.text}</div>`);
        });
        
        // Add interim text (with animation only if short) - show when recording OR should be recording
        if (this.currentInterim.trim() && (this.isListening || this.shouldBeListening)) {
            console.log(`✅ [INTERIM-DISPLAY] Adding interim text to UI: "${this.currentInterim.substring(0, 40)}..."`);
            const animatedInterim = this.animateTextLetters(this.currentInterim, true);
            parts.push(`<div class="transcript-line current interim">${animatedInterim}</div>`);
        } else {
            if (this.currentInterim.trim()) {
                console.log(`❌ [INTERIM-SKIP] Interim text exists but not displayed - isListening: ${this.isListening}, shouldBeListening: ${this.shouldBeListening}`);
            }
        }
        
        // Show recording status if no content
        if (parts.length === 0 && (this.isListening || this.shouldBeListening)) {
            parts.push('<div class="transcript-line current">🎤 Listening... waiting for audio</div>');
        }
        
        // Store previous content to detect changes
        const previousContent = this.els.transcript.innerHTML;
        const newContent = parts.join('');
        
        // Update DOM
        this.els.transcript.innerHTML = newContent;
        
        // Trigger push-up animation if content changed and we have lines
        if (previousContent !== newContent && this.transcriptLines.length > 1) {
            this.triggerPushUpAnimation();
        }
        
        // Auto-scroll to bottom when new content is added
        setTimeout(() => {
            this.els.transcript.scrollTop = this.els.transcript.scrollHeight;
        }, 50);
        
        // Level dots are always active when audio source is selected
    }
    
    triggerPushUpAnimation() {
        // Add push-up class to existing lines to animate them upward
        const existingLines = this.els.transcript.querySelectorAll('.transcript-line:not(.current)');
        existingLines.forEach(line => {
            line.classList.add('push-up');
        });
        
        // Remove animation classes after animation completes (reduced from 300ms to match animation)
        setTimeout(() => {
            existingLines.forEach(line => {
                line.classList.remove('push-up');
            });
        }, 250);
        
        console.log('[Animation] Push-up animation triggered');
    }
    
    animateTextLetters(text, isInterim = false) {
        // Simplified animation for better performance
        if (isInterim && text.length < 100) {
            // Only animate short interim text
            return text.split('').map((char, index) => {
                if (char === ' ') return ' ';
                
                const delay = (index * 0.02).toFixed(2); // Faster animation
                return `<span class="transcript-letter" style="--delay: ${delay}s">${char}</span>`;
            }).join('');
        }
        
        // No animation for long text or final text
        return text;
    }
    
    updateTranscript(text) {
        // Legacy method - now handled by updateAnimatedTranscript
        this.updateAnimatedTranscript();
    }
    
    toggleListening() {
        const timestamp = new Date().toLocaleTimeString();
        // Listen toggle clicked
        
        if (this.isListening || this.shouldBeListening) {
            // Stopping listening
            this.stopListening();
        } else {
            // Starting listening
            this.startListening();
        }
    }
    
    startListening() {
        console.log('[Control] 🚀 START LISTENING CLICKED!');
        console.log('[Control] 🎯 Current audio source:', this.currentAudioSource);
        console.log('[Control] 🔍 Audio source type check:', typeof this.currentAudioSource);
        console.log('[Control] 📍 Will call:', this.currentAudioSource === 'system' ? 'startSystemAudio()' : 'startMicrophone()');
        
        // Clear transcript window when starting/restarting
        this.transcriptLines = [];
        this.currentInterim = '';
        this.pendingSentence = '';
        this.transcript = '';
        console.log('[Transcript] Cleared transcript window for fresh start');
        this.updateAnimatedTranscript();
        
        // Setup audio visualization on first user interaction (Chrome requirement)
        this.setupAudioVisualization();
        
        if (!this.recognition) {
            console.error('[Control] No recognition available');
            return;
        }
        
        // Ensure we start the correct audio source
        console.log('[Control] 🔧 Final audio source check before starting:', this.currentAudioSource);
        
        if (this.currentAudioSource === 'system') {
            console.log('[Control] ✅ Starting SYSTEM AUDIO (screen sharing)');
            this.startSystemAudio();
        } else if (this.currentAudioSource === 'microphone') {
            console.log('[Control] ✅ Starting MICROPHONE');
            this.startMicrophone();
        } else {
            console.error('[Control] ❌ Unknown audio source:', this.currentAudioSource, '- defaulting to microphone');
            this.currentAudioSource = 'microphone';
            this.startMicrophone();
        }
    }
    
    async startMicrophone() {
        console.log('[Audio] 🎤 Starting microphone...');
        
        // Clear any system stream when switching to microphone
        if (this.systemStream) {
            try {
                this.systemStream.getTracks().forEach(track => track.stop());
            } catch (e) {}
            this.systemStream = null;
        }
        
        // Show initialization state
        this.setStatus('mic', 'yellow');
        this.showInitializationMessage();
        
        // Enable level dots immediately for microphone
        this.showLevelDots();
        
        // Show guidance for microphone
        if (this.els.transcript) {
            this.els.transcript.innerHTML = `
                <div class="transcript-rows">
                    <div class="transcript-row current">
                        🎤 Setting up Microphone...
                    </div>
                    <div class="transcript-row previous">
                        Grant microphone permission if asked
                    </div>
                    <div class="transcript-row old">
                        Speak clearly into your microphone
                    </div>
                </div>
            `;
        }
        
        try {
            // CRITICAL FIX: Resume audio context first (required for Chrome)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('[Audio] Audio context resumed');
            }
            
            // Request microphone permission FIRST - this ensures permissions are granted
            console.log('[Audio] 🎤 Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: false, 
                    noiseSuppression: false,
                    autoGainControl: false 
                } 
            });
            console.log('[Audio] ✅ Microphone permission granted');
            console.log('[Audio] 📊 Stream info:', {
                active: stream.active,
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length
            });
            
            // Check if audio tracks are enabled
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                console.log('[Audio] 🎵 Audio track details:', {
                    enabled: audioTracks[0].enabled,
                    muted: audioTracks[0].muted,
                    readyState: audioTracks[0].readyState,
                    label: audioTracks[0].label
                });
                
                // Update audio status display
                this.updateAudioStatusDisplay('microphone', audioTracks[0]);
            } else {
                console.error('[Audio] ❌ No audio tracks in stream!');
                this.updateAudioStatusDisplay('microphone', null);
            }
            
            // Connect to audio visualization
            await this.connectAudioSource(stream);
            
            // ENHANCED DEBUG: Add audio level monitoring to verify microphone is working
            setTimeout(() => {
                if (this.audioAnalyser) {
                    const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
                    this.audioAnalyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    console.log('[Audio] 🎵 Microphone audio level check:', average > 0 ? `${average.toFixed(1)} (ACTIVE)` : '0 (SILENT)');
                    if (average === 0) {
                        console.warn('[Audio] ⚠️ Microphone appears to be silent - check if microphone is muted or working');
                    }
                }
            }, 1000);
            
            // NOW start speech recognition - ensure fresh recognition object
            this.shouldBeListening = true;
            
            // Update transcript to show ready
            if (this.els.transcript) {
                this.els.transcript.innerHTML = `
                    <div class="transcript-rows">
                        <div class="transcript-row current">
                            🎤 Microphone Ready - Listening...
                        </div>
                        <div class="transcript-row previous">
                            Speak and watch your words appear
                        </div>
                        <div class="transcript-row old">
                            Cards generate from complete sentences
                        </div>
                    </div>
                `;
            }
            
            // Always create fresh recognition for microphone mode
            console.log('[Audio] 🔄 Creating fresh recognition for microphone...');
            if (!this.setupSpeechRecognition()) {
                throw new Error('Failed to setup speech recognition');
            }
            
            try {
                console.log('[Audio] 🗣️ Starting fresh speech recognition...');
                console.log('[Audio] 📊 About to call recognition.start() with state:', {
                    recognitionExists: !!this.recognition,
                    shouldBeListening: this.shouldBeListening,
                    isListening: this.isListening,
                    microphoneActive: stream.active
                });
                
                this.recognition.start();
                console.log('[Audio] ✅ Speech recognition start() called successfully');
                
                // Set a timeout to check if it actually started
                setTimeout(() => {
                    if (!this.isListening && this.shouldBeListening) {
                        console.error('[Audio] ⚠️ Recognition failed to start after 2s, retrying...');
                        this.setupSpeechRecognition();
                        if (this.recognition) {
                            try {
                                this.recognition.start();
                                console.log('[Audio] 🔄 Speech recognition restarted after timeout');
                            } catch (e) {
                                console.error('[Audio] Retry also failed:', e);
                            }
                        }
                    }
                }, 2000);
                
            } catch (recError) {
                console.error('[Audio] Speech recognition failed to start:', recError.name, recError.message);
                // Try recreating recognition object
                this.setupSpeechRecognition();
                if (this.recognition) {
                    try {
                        this.recognition.start();
                        console.log('[Audio] 🔄 Speech recognition restarted after recreation');
                    } catch (retryError) {
                        console.error('[Audio] Retry failed:', retryError.name, retryError.message);
                    }
                }
            }
            
            this.setStatus('mic', 'green');
            console.log('[Audio] ✅ Microphone fully initialized and recording');
            
        } catch (error) {
            console.error('[Audio] Microphone initialization failed:', error);
            this.setStatus('mic', 'red');
            this.shouldBeListening = false;
            
            // Update audio status to show disconnected
            this.updateAudioStatusDisplay('microphone', null);
            this.updateListeningUI();
            
            // Show user-friendly error message
            if (this.els.transcript) {
                this.els.transcript.innerHTML = `<div class="transcript-line current">❌ Microphone access denied. Click "Start" and allow microphone access.</div>`;
            }
        }
    }
    
    async startSystemAudio() {
        console.log('[Audio] 🔊 Starting system/device audio...');
        
        // Stop any existing listening first
        if (this.isListening) {
            try {
                this.recognition.stop();
                this.isListening = false;
            } catch (error) {
                // Ignore errors when stopping
            }
        }
        
        // Show initialization state
        this.setStatus('audio', 'yellow');
        this.showInitializationMessage();
        
        // Enable level dots immediately for device output
        this.showLevelDots();
        
        try {
            // CRITICAL FIX: Resume audio context first (required for Chrome)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('[Audio] Audio context resumed');
            }
            
            // Check if we already have a system stream from the toggle
            let stream = this.systemStream;
            
            if (!stream || !stream.active) {
                // No existing stream, request one
                console.log('[Audio] 🖥️ Requesting system audio capture...');
                
                // Show guidance
                if (this.els.transcript) {
                    this.els.transcript.innerHTML = `
                        <div class="transcript-rows">
                            <div class="transcript-row current">
                                🖥️ Opening screen share dialog...
                            </div>
                            <div class="transcript-row previous">
                                1️⃣ Select a browser tab
                            </div>
                            <div class="transcript-row old">
                                2️⃣ Check "Share tab audio" ☑️
                            </div>
                        </div>
                    `;
                }
                
                stream = await navigator.mediaDevices.getDisplayMedia({
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false,
                        suppressLocalAudioPlayback: false
                    },
                    video: {
                        width: 1,
                        height: 1,
                        frameRate: 1
                    }
                });
                
                // Store the new stream
                this.systemStream = stream;
            } else {
                console.log('[Audio] ✅ Using existing system stream - no new permission needed');
            }
            
            console.log('[Audio] ✅ Got system audio stream');
            console.log('[Audio] 📊 System stream info:', {
                active: stream.active,
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length
            });
            
            // Update audio status display for system audio
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                this.updateAudioStatusDisplay('system', audioTracks[0]);
            } else {
                this.updateAudioStatusDisplay('system', null);
            }
            
            // Connect to visualizer
            await this.connectAudioSource(stream);
            
            // ENHANCED DEBUG: Add audio level monitoring for system audio
            setTimeout(() => {
                if (this.audioAnalyser) {
                    const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
                    this.audioAnalyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    console.log('[Audio] 🎵 System audio level check:', average > 0 ? `${average.toFixed(1)} (ACTIVE)` : '0 (SILENT)');
                    if (average === 0) {
                        console.warn('[Audio] ⚠️ System audio appears to be silent - check if audio is playing or permissions granted');
                    }
                }
            }, 1000);
            
            // DEVICE OUTPUT MODE: Process system audio directly
            console.log('[Audio] 🔊 DEVICE OUTPUT MODE: Processing system audio stream...');
            console.log('[Audio] 📢 System audio captured for both visualization and recognition');
            console.log('[Audio] 🎧 Works with headphones - no speakers needed');
            
            this.shouldBeListening = true;
            
            // Set up system audio processing for speech recognition
            this.setupSystemAudioProcessing(stream);
            
            // Update UI to show device output mode is active
            this.updateListeningUI();
            if (this.els.transcript) {
                const captureInfo = this.analyzeCaptureSource(stream);
                
                this.els.transcript.innerHTML = `
                    <div class="transcript-rows">
                        <div class="transcript-row current">
                            Listening: ${captureInfo.name}
                        </div>
                        <div class="transcript-row previous">
                            ${captureInfo.type} - Audio levels active
                        </div>
                        <div class="transcript-row old">
                            Speech transcribes automatically
                        </div>
                    </div>
                `;
            }
            
            this.setStatus('audio', 'green');   // System audio working
            this.setStatus('speech', 'green');  // System audio processing active
            this.setStatus('mic', 'red');       // Not using microphone
            console.log('[Audio] ✅ Device output mode: System audio processing active');
            
        } catch (error) {
            console.error('[Audio] System audio error:', error);
            
            // Update audio status to show disconnected
            this.updateAudioStatusDisplay('system', null);
            
            // Show user instruction for system audio
            if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                console.log('[Audio] System audio not available - user needs to share screen/tab with audio');
                alert('To capture device output:\n1. Click "Share" when prompted\n2. Choose "Chrome Tab" or "Entire Screen"\n3. Check "Share audio" checkbox\n4. Click Share');
            }
            
            this.setStatus('audio', 'red');
            // Fallback to microphone
            await this.startMicrophone();
        }
    }
    
    stopListening() {
        const timestamp = new Date().toLocaleTimeString();
        // Stopping listening process
        
        this.shouldBeListening = false;
        // shouldBeListening set to FALSE
        
        if (this.recognition) {
            // Stopping speech recognition
            try {
                this.recognition.abort(); // Use abort for immediate stop
                // Speech recognition aborted
            } catch (e) {
                console.warn(`🎤 [${timestamp}] [STOP] Error stopping recognition:`, e);
            }
        }
        
        if (this.systemStream) {
            // Stopping system audio stream
            this.systemStream.getTracks().forEach(track => track.stop());
            this.systemStream = null;
        }
        
        if (this.audioSource) {
            // Disconnecting audio source
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        // Clean up system audio processing
        if (this.systemAudioInterval) {
            // Stopping system audio processing
            clearInterval(this.systemAudioInterval);
            this.systemAudioInterval = null;
        }
        
        if (this.audioProcessor) {
            // Disconnecting audio processor
            this.audioProcessor.disconnect();
            this.audioProcessor = null;
        }
        
        if (this.systemAudioBuffer) {
            this.systemAudioBuffer = [];
        }
        
        // All recording processes stopped
        
        // Reset audio status display
        this.updateAudioStatusDisplay(this.currentAudioSource, null);
    }
    
    updateListeningUI() {
        console.log(`[UI] Updating recording UI - isListening: ${this.isListening}, shouldBeListening: ${this.shouldBeListening}`);
        
        if (this.isListening) {
            this.els.recordDot.classList.add('pulse');
            this.els.recordText.textContent = 'Listening...';
            
            // Update mobile record button UI
            if (this.els.mobileRecordBtn) {
                const mobileDot = this.els.mobileRecordBtn.querySelector('.record-dot');
                if (mobileDot) mobileDot.classList.add('pulse');
                const mobileText = this.els.mobileRecordBtn.querySelector('span:not(.record-dot)');
                if (mobileText) mobileText.textContent = 'Listening...';
                this.els.mobileRecordBtn.classList.add('recording');
            }
            
            // Mobile record button: circle to square when recording
            const mobileRecordButton = document.querySelector('.app-header .record-button');
            if (mobileRecordButton) {
                mobileRecordButton.classList.add('recording');
            }
        } else {
            this.els.recordDot.classList.remove('pulse');
            this.els.recordText.textContent = 'Start';
            
            // Update mobile record button UI
            if (this.els.mobileRecordBtn) {
                const mobileDot = this.els.mobileRecordBtn.querySelector('.record-dot');
                if (mobileDot) mobileDot.classList.remove('pulse');
                const mobileText = this.els.mobileRecordBtn.querySelector('span:not(.record-dot)');
                if (mobileText) mobileText.textContent = 'Start';
                this.els.mobileRecordBtn.classList.remove('recording');
            }
            
            // Mobile record button: back to circle when stopped
            const mobileRecordButton = document.querySelector('.app-header .record-button');
            if (mobileRecordButton) {
                mobileRecordButton.classList.remove('recording');
            }
        }
    }
    
    analyzeCaptureSource(stream) {
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        // Get video track settings for analysis
        const videoTrack = videoTracks[0];
        const audioTrack = audioTracks[0];
        
        let captureInfo = {
            icon: '',
            name: 'Screen Capture',
            type: 'Screen'
        };
        
        if (videoTrack) {
            const settings = videoTrack.getSettings();
            
            console.log('[Audio] Video track settings:', settings);
            console.log('[Audio] Video track label:', videoTrack.label);
            
            // Analyze the video track label for capture type hints
            const label = videoTrack.label.toLowerCase();
            
            // Extract meaningful name from video track label
            const rawLabel = videoTrack.label;
            
            if (label.includes('tab')) {
                captureInfo.type = 'Tab';
                // Extract tab title: "YouTube - Video Title - Tab" -> "YouTube - Video Title"
                const cleaned = rawLabel.replace(/\s*-?\s*tab\s*$/i, '').trim();
                captureInfo.name = cleaned || 'Browser Tab';
                
            } else if (label.includes('window')) {
                captureInfo.type = 'Window';
                // Extract window title: "Zoom Meeting - Window" -> "Zoom Meeting"
                const cleaned = rawLabel.replace(/\s*-?\s*window\s*$/i, '').trim();
                captureInfo.name = cleaned || 'Application Window';
                
            } else if (label.includes('screen') || label.includes('desktop') || label.includes('monitor')) {
                captureInfo.type = 'Screen';
                captureInfo.name = 'Entire Screen';
                
            } else {
                // Generic - clean up the label
                captureInfo.name = rawLabel.replace(/\s*-?\s*(capture|shared)\s*$/i, '').trim() || 'Screen';
                captureInfo.type = 'Screen';
            }
        }
        
        // Use audio track for better name extraction if available
        if (audioTrack && audioTrack.label && audioTrack.label !== 'Tab audio capture') {
            const audioLabel = audioTrack.label.replace(/\s*audio\s*capture\s*$/i, '').trim();
            if (audioLabel.length > 3) {
                captureInfo.name = audioLabel;
            }
        }
        
        // Final cleanup
        if (captureInfo.name.length > 50) {
            captureInfo.name = captureInfo.name.substring(0, 47) + '...';
        }
        
        // Log the final analysis
        console.log('[Audio] Capture analysis result:', captureInfo);
        
        return captureInfo;
    }
    
    updateAudioStatusDisplay(sourceType, audioTrack) {
        const audioInputInfo = document.getElementById('audioInputInfo');
        if (!audioInputInfo) return;
        
        if (!audioTrack) {
            audioInputInfo.textContent = 'Not connected';
            audioInputInfo.style.opacity = '0.7';
            return;
        }
        
        // Create descriptive status based on source type and track info
        let statusText = '';
        let deviceName = audioTrack.label || 'Unknown device';
        
        if (sourceType === 'microphone') {
            statusText = `🎤 ${deviceName}`;
            if (audioTrack.muted) {
                statusText += ' (muted)';
            } else if (audioTrack.readyState === 'live') {
                statusText += ' - Active';
            }
        } else if (sourceType === 'system') {
            statusText = `🔊 System audio`;
            if (audioTrack.readyState === 'live') {
                statusText += ' - Active';
            }
        }
        
        audioInputInfo.textContent = statusText;
        audioInputInfo.style.opacity = audioTrack.readyState === 'live' ? '1' : '0.7';
        
        console.log('[Audio] Status updated:', statusText);
    }
    
    setupAudioSourceToggle() {
        const toggleOptions = this.els.audioSourceSwitch.querySelectorAll('.toggle-option');
        
        console.log('[Toggle] Found', toggleOptions.length, 'toggle options');
        toggleOptions.forEach((option, index) => {
            console.log(`[Toggle] Option ${index}: data-value="${option.dataset.value}", text="${option.textContent.trim()}"`);
        });
        
        toggleOptions.forEach(option => {
            option.onclick = async () => {
                const newSource = option.dataset.value;
                console.log('[UI] Audio source toggle clicked:', newSource);
                
                if (newSource !== this.currentAudioSource) {
                    // Stop any current listening first
                    if (this.shouldBeListening || this.isListening) {
                        this.stopListening();
                    }
                    
                    // Clean up streams when switching away
                    if (this.currentAudioSource === 'system' && this.systemStream) {
                        try {
                            this.systemStream.getTracks().forEach(track => track.stop());
                        } catch (e) {}
                        this.systemStream = null;
                    }
                    
                    // Update UI immediately
                    this.currentAudioSource = newSource;
                    this.updateToggleUI();
                    this.showLevelDots();
                    
                    // If switching to device output, immediately trigger permission
                    if (newSource === 'system') {
                        // Show guidance in transcript window
                        if (this.els.transcript) {
                            this.els.transcript.innerHTML = `
                                <div class="transcript-rows">
                                    <div class="transcript-row current">
                                        🖥️ Setting up Device Output...
                                    </div>
                                    <div class="transcript-row previous">
                                        1️⃣ Click "Start" to open screen share
                                    </div>
                                    <div class="transcript-row old">
                                        2️⃣ Select a tab and check "Share tab audio"
                                    </div>
                                </div>
                            `;
                        }
                        
                        // Auto-start to trigger permission immediately
                        console.log('[UI] Auto-triggering tab audio permission...');
                        try {
                            const stream = await navigator.mediaDevices.getDisplayMedia({
                                audio: {
                                    echoCancellation: false,
                                    noiseSuppression: false,
                                    autoGainControl: false
                                },
                                video: {
                                    width: 1,
                                    height: 1
                                }
                            });
                            
                            // Success - we got the stream
                            console.log('[UI] Screen share permission granted');
                            this.systemStream = stream;
                            
                            // Analyze what was captured
                            const captureInfo = this.analyzeCaptureSource(stream);
                            
                            // Update guidance with specific capture type
                            if (this.els.transcript) {
                                this.els.transcript.innerHTML = `
                                    <div class="transcript-rows">
                                        <div class="transcript-row current">
                                            ${captureInfo.type}: ${captureInfo.name}
                                        </div>
                                        <div class="transcript-row previous">
                                            Connected - Click Start to listen
                                        </div>
                                        <div class="transcript-row old">
                                            Audio levels show when sound plays
                                        </div>
                                    </div>
                                `;
                            }
                            
                            // Connect audio for visualization
                            await this.connectAudioSource(stream);
                            
                        } catch (error) {
                            console.log('[UI] User cancelled or error:', error);
                            // User cancelled - switch back to microphone
                            this.currentAudioSource = 'microphone';
                            this.updateToggleUI();
                            this.showLevelDots();
                            
                            if (this.els.transcript) {
                                this.els.transcript.innerHTML = `
                                    <div class="transcript-rows">
                                        <div class="transcript-row current">
                                            ❌ Tab audio setup cancelled
                                        </div>
                                        <div class="transcript-row previous">
                                            Switched back to Microphone
                                        </div>
                                        <div class="transcript-row old">
                                            Try again or use microphone mode
                                        </div>
                                    </div>
                                `;
                            }
                        }
                    } else {
                        // Switching to microphone - show appropriate message
                        if (this.els.transcript) {
                            this.els.transcript.innerHTML = `
                                <div class="transcript-rows">
                                    <div class="transcript-row current">
                                        🎤 Microphone Mode Active
                                    </div>
                                    <div class="transcript-row previous">
                                        Click "Start" to begin listening
                                    </div>
                                    <div class="transcript-row old">
                                        Speak clearly into your microphone
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
            };
        });
        
        console.log('[UI] Audio source toggle initialized');
    }
    
    updateToggleUI() {
        const toggleOptions = this.els.audioSourceSwitch.querySelectorAll('.toggle-option');
        
        toggleOptions.forEach(option => {
            if (option.dataset.value === this.currentAudioSource) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        console.log('[UI] Toggle updated for:', this.currentAudioSource);
    }
    
    handleSourceChange() {
        // Legacy function - now handled by toggle switch
        this.updateToggleUI();
    }
    
    toggleTheme() {
        console.log('[Theme] Toggling theme');
        
        this.isLight = !this.isLight;
        
        const screens = [this.els.screen1, this.els.screen2, this.els.screen3, this.els.screen4];
        
        if (this.isLight) {
            screens.forEach(screen => {
                if (screen) {
                    screen.classList.remove('glass-dark');
                    screen.classList.add('glass-light');
                }
            });
            this.els.logo.src = 'assets/images/logo-black.svg';
            this.els.themeCircle.classList.remove('dark');
            this.els.themeCircle.classList.add('light');
            
            // Update mobile theme circle
            const mobileThemeCircle = document.getElementById('mobileThemeCircle');
            if (mobileThemeCircle) {
                mobileThemeCircle.classList.remove('dark');
                mobileThemeCircle.classList.add('light');
            }
        } else {
            screens.forEach(screen => {
                if (screen) {
                    screen.classList.remove('glass-light');
                    screen.classList.add('glass-dark');
                }
            });
            this.els.logo.src = 'assets/images/logo-white.svg';
            this.els.themeCircle.classList.remove('light');
            this.els.themeCircle.classList.add('dark');
            
            // Update mobile theme circle
            const mobileThemeCircle = document.getElementById('mobileThemeCircle');
            if (mobileThemeCircle) {
                mobileThemeCircle.classList.remove('light');
                mobileThemeCircle.classList.add('dark');
            }
        }
        
        // Apply theme to body for inversion effects
        if (this.isLight) {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
        
        console.log('[Theme] Switched to:', this.isLight ? 'light' : 'dark');
    }
    
    async checkMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.setStatus('mic', 'green');
            console.log('[System] Microphone OK');
        } catch {
            this.setStatus('mic', 'red');
            console.log('[System] Microphone FAILED');
        }
    }
    
    setStatus(type, color) {
        const el = this.els[type + 'Status'];
        if (el) {
            el.className = `status-dot ${color}`;
        }
    }
    
    showInitialGuidance() {
        // Show guidance based on selected audio source
        if (this.els.transcript) {
            if (this.currentAudioSource === 'system') {
                this.els.transcript.innerHTML = `
                    <div class="transcript-rows">
                        <div class="transcript-row current">
                            🖥️ Device Output Mode Selected
                        </div>
                        <div class="transcript-row previous">
                            Click "Start" to select a browser tab
                        </div>
                        <div class="transcript-row old">
                            Enable "Share tab audio" for transcription
                        </div>
                    </div>
                `;
            } else {
                this.els.transcript.innerHTML = `
                    <div class="transcript-rows">
                        <div class="transcript-row current">
                            🎤 Welcome to SenScript
                        </div>
                        <div class="transcript-row previous">
                            Click "Start" to begin listening
                        </div>
                        <div class="transcript-row old">
                            Flashcards generate from your speech
                        </div>
                    </div>
                `;
            }
        }
    }
    
    showInitializationMessage() {
        // Show initialization message in transcript
        let initMessage;
        if (this.currentAudioSource === 'system') {
            initMessage = '🔄 Initializing device output capture...';
        } else {
            initMessage = '🔄 Initializing microphone access...';
        }
        
        if (this.els.transcript) {
            this.els.transcript.innerHTML = `<div class="transcript-line current">${initMessage}</div>`;
        }
        
        // Clear message after 2 seconds and update UI
        setTimeout(() => {
            this.updateAnimatedTranscript();
        }, 2000);
    }
    
    showSettings() {
        this.openSettings();
    }
    
    async openSettings() {
        console.log('[Settings] Opening settings modal');
        
        // Load available models
        await this.loadAvailableModels();
        
        // Load current settings
        this.els.openaiKey.value = this.apiSettings.apiKeys.openai || '';
        this.els.anthropicKey.value = this.apiSettings.apiKeys.anthropic || '';
        this.els.deepseekKey.value = this.apiSettings.apiKeys.deepseek || '';
        this.els.useFallback.checked = this.apiSettings.useFallback;
        
        // Load education settings with fallback defaults
        if (!this.apiSettings.education) {
            this.apiSettings.education = {
                userLevel: 3,
                detailLevel: 3,
                exampleComplexity: 3
            };
        }
        
        this.els.educationLevel.value = this.apiSettings.education.userLevel || 3;
        this.els.detailLevel.value = this.apiSettings.education.detailLevel || 3;
        this.els.exampleComplexity.value = this.apiSettings.education.exampleComplexity || 3;
        this.updateEducationDisplay();
        
        // Load usage stats
        await this.loadUsageStats();
        
        this.els.settingsModal.style.display = 'flex';
    }
    
    closeSettings() {
        console.log('[Settings] Closing settings modal');
        this.els.settingsModal.style.display = 'none';
    }
    
    updateEducationDisplay() {
        const educationLevels = [
            'Complete beginner with no prior knowledge',
            'Basic learner with minimal background', 
            'General audience with some education',
            'Advanced student with good background',
            'Expert/professional with deep knowledge'
        ];
        
        const detailLevels = [
            'Very brief, one-sentence explanations',
            'Concise explanations with key points only', 
            'Moderate detail with context and examples',
            'Detailed explanations with multiple aspects',
            'Comprehensive coverage with nuances'
        ];
        
        const exampleLevels = [
            'Everyday analogies and simple comparisons',
            'Basic real-world examples everyone knows',
            'Practical examples from common experience', 
            'Technical examples with some complexity',
            'Academic examples with precise terminology'
        ];
        
        const levelNames = ['Beginner', 'Basic', 'Balanced', 'Advanced', 'Expert'];
        const detailNames = ['Brief', 'Concise', 'Moderate', 'Detailed', 'Comprehensive'];
        const exampleNames = ['Simple', 'Basic', 'Real-world', 'Technical', 'Academic'];
        
        const eduLevel = parseInt(this.els.educationLevel.value);
        const detLevel = parseInt(this.els.detailLevel.value);
        const exLevel = parseInt(this.els.exampleComplexity.value);
        
        this.els.educationLevelValue.textContent = levelNames[eduLevel - 1];
        this.els.educationLevelDesc.textContent = educationLevels[eduLevel - 1];
        
        this.els.detailLevelValue.textContent = detailNames[detLevel - 1];
        this.els.detailLevelDesc.textContent = detailLevels[detLevel - 1];
        
        this.els.exampleComplexityValue.textContent = exampleNames[exLevel - 1];
        this.els.exampleComplexityDesc.textContent = exampleLevels[exLevel - 1];
    }
    
    async loadAvailableModels() {
        try {
            const response = await fetch('http://localhost:3002/api/models');
            const models = await response.json();
            
            let html = '';
            
            // Add auto-select option
            html += `
                <div class="model-button ${this.apiSettings.selectedModel === 'auto' ? 'selected' : ''}" data-model="auto">
                    <div class="model-name">🚀 Auto (Fastest)</div>
                    <div class="model-cost">Race all APIs</div>
                </div>
            `;
            
            // Add provider models
            Object.entries(models).forEach(([provider, modelList]) => {
                modelList.forEach(model => {
                    const modelId = `${provider}:${model.id}`;
                    const isSelected = this.apiSettings.selectedModel === modelId;
                    
                    html += `
                        <div class="model-button ${isSelected ? 'selected' : ''}" data-model="${modelId}">
                            <div class="model-name">${model.name}</div>
                            <div class="model-cost">${model.cost}</div>
                        </div>
                    `;
                });
            });
            
            this.els.modelGrid.innerHTML = html;
            
            // Add click handlers
            this.els.modelGrid.querySelectorAll('.model-button').forEach(btn => {
                btn.onclick = () => {
                    // Remove selected from all
                    this.els.modelGrid.querySelectorAll('.model-button').forEach(b => 
                        b.classList.remove('selected')
                    );
                    // Add selected to clicked
                    btn.classList.add('selected');
                    this.apiSettings.selectedModel = btn.dataset.model;
                };
            });
            
        } catch (error) {
            console.error('[Settings] Failed to load models:', error);
        }
    }
    
    async loadUsageStats() {
        try {
            const response = await fetch(`http://localhost:3002/api/usage?sessionId=${this.sessionId}`);
            const stats = await response.json();
            
            this.els.totalCalls.textContent = stats.global?.totalCalls || 0;
            this.els.totalTokens.textContent = stats.global?.totalTokens || 0;
            this.els.cardsGenerated.textContent = this.cards.length;
            
            // Calculate average response time
            if (stats.global?.byProvider) {
                const avgTimes = Object.values(stats.global.byProvider)
                    .map(p => p.avgResponseTime)
                    .filter(t => t > 0);
                    
                if (avgTimes.length > 0) {
                    const avgResponse = avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length;
                    this.els.avgResponseTime.textContent = Math.round(avgResponse) + 'ms';
                }
            }
            
        } catch (error) {
            console.error('[Settings] Failed to load usage stats:', error);
        }
    }
    
    async saveSettingsAndClose() {
        console.log('[Settings] Saving settings and closing modal...');
        await this.saveSettingsOnly();
        this.closeSettings();
        
        // Show success message
        this.els.saveSettings.textContent = '✅ Saved!';
        setTimeout(() => {
            this.els.saveSettings.textContent = '💾 Save Settings';
        }, 2000);
    }
    
    async saveSettingsOnly() {
        console.log('[Settings] Auto-saving settings (keeping modal open)...');
        
        this.apiSettings.apiKeys = {
            openai: this.els.openaiKey.value.trim(),
            anthropic: this.els.anthropicKey.value.trim(),
            deepseek: this.els.deepseekKey.value.trim()
        };
        this.apiSettings.useFallback = this.els.useFallback.checked;
        this.apiSettings.education = {
            userLevel: parseInt(this.els.educationLevel.value),
            detailLevel: parseInt(this.els.detailLevel.value),
            exampleComplexity: parseInt(this.els.exampleComplexity.value)
        };
        
        console.log('🎓 [AUTO-SAVE] Education settings updated:');
        console.log('   User Level:', this.apiSettings.education.userLevel, '(1=Beginner, 5=Expert)');
        console.log('   Detail Level:', this.apiSettings.education.detailLevel, '(1=Brief, 5=Comprehensive)');
        console.log('   Example Complexity:', this.apiSettings.education.exampleComplexity, '(1=Simple, 5=Academic)');
        console.log('   Full apiSettings object:', JSON.stringify(this.apiSettings, null, 2));
        
        // Save to localStorage
        localStorage.setItem('senscript_settings', JSON.stringify(this.apiSettings));
        
        // Update server
        await this.updateServerSettings();
    }
    
    // Legacy method for backward compatibility
    async saveSettings() {
        return this.saveSettingsAndClose();
    }
    
    exportCards() {
        if (this.cards.length === 0) return;
        
        const data = {
            cards: [...this.cards].reverse(), // Export in chronological order (oldest first)
            exported: new Date().toISOString(),
            total: this.cards.length,
            settings: {
                currentMode: this.apiSettings.interviewMode ? 'cheat' : 'flash',
                outputLanguage: this.apiSettings.outputLanguage,
                education: this.apiSettings.education,
                interviewMode: this.apiSettings.interviewMode
            },
            metadata: {
                cardTypes: {
                    cheat: this.cards.filter(c => c.cardType === 'cheat').length,
                    flash: this.cards.filter(c => c.cardType === 'flash').length
                }
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senscript-cards-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('[Export] Exported', this.cards.length, 'cards');
    }
    
    exportTranscript() {
        if (this.fullTranscriptLog.length === 0) {
            console.log('[Export] No transcript content to export');
            return;
        }
        
        const data = {
            transcript: this.fullTranscriptLog,
            exported: new Date().toISOString(),
            totalLines: this.fullTranscriptLog.length,
            sessionId: this.sessionId,
            language: this.currentLang,
            duration: Math.round((Date.now() - this.startTime) / 1000) + ' seconds'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senscript-transcript-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('[Export] Exported', this.fullTranscriptLog.length, 'transcript lines');
    }
    
    // Memory Management for Long Sessions
    startMemoryCleanup() {
        // Clean up memory every 2 minutes during active sessions
        this.memoryCleanupInterval = setInterval(() => {
            this.performMemoryCleanup();
        }, 120000); // 2 minutes
        
        console.log('🧹 [MEMORY] Memory cleanup scheduler started (every 2 minutes)');
    }
    
    performMemoryCleanup() {
        const timestamp = new Date().toLocaleTimeString();
        let cleaned = false;
        
        // Clean transcript lines (keep last 5)
        if (this.transcriptLines.length > 5) {
            this.transcriptLines = this.transcriptLines.slice(-5);
            cleaned = true;
        }
        
        // Clean cards array (keep last 10) 
        if (this.cards.length > 10) {
            this.cards = this.cards.slice(0, 10);
            cleaned = true;
        }
        
        // Clean full transcript log if it gets too large (keep last 100)
        if (this.fullTranscriptLog.length > 100) {
            this.fullTranscriptLog = this.fullTranscriptLog.slice(-100);
            cleaned = true;
        }
        
        // Clear pending sentence if too long (safety measure)
        if (this.pendingSentence.length > 500) {
            this.pendingSentence = '';
            cleaned = true;
        }
        
        if (cleaned) {
            console.log(`🧹 [${timestamp}] [MEMORY-CLEANUP] Performed automatic cleanup to prevent overflow`);
        }
        
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                console.log(`♻️ [${timestamp}] [GC] Forced garbage collection`);
            } catch (e) {
                // Ignore errors - gc() only available in development
            }
        }
    }
    
    stopMemoryCleanup() {
        if (this.memoryCleanupInterval) {
            clearInterval(this.memoryCleanupInterval);
            this.memoryCleanupInterval = null;
            console.log('🧹 [MEMORY] Memory cleanup scheduler stopped');
        }
    }
    
    // System Theme Detection
    detectSystemTheme() {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            console.log('🌙 [THEME] System prefers dark theme');
            return 'dark';
        } else {
            console.log('☀️ [THEME] System prefers light theme');  
            return 'light';
        }
    }
    
    // Apply system theme on startup
    applySystemTheme() {
        const systemTheme = this.detectSystemTheme();
        this.isLight = systemTheme === 'light';
        document.body.className = this.isLight ? 'light' : '';
        
        console.log(`🎨 [THEME] Applied system theme: ${systemTheme}`);
        this.updateThemeUI();
    }
    
    // Setup Modal Tabs
    setupModalTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.onclick = () => {
                // Remove active from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active to clicked tab
                button.classList.add('active');
                const targetTab = document.getElementById(`tab-${button.dataset.tab}`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
                
                console.log(`[MODAL] Switched to tab: ${button.dataset.tab}`);
            };
        });
        
        // Setup theme options
        this.setupThemeOptions();
    }
    
    switchToTab(tabName) {
        console.log(`[Modal] Switching to tab: ${tabName}`);
        
        // Remove active from all tabs
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active to target tab
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetContent = document.getElementById(`tab-${tabName}`);
        
        if (targetButton) targetButton.classList.add('active');
        if (targetContent) targetContent.classList.add('active');
    }
    
    // Setup Theme Selection Options
    setupThemeOptions() {
        const themeOptions = document.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.onclick = () => {
                // Remove selected from all options
                themeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected to clicked option
                option.classList.add('selected');
                
                const selectedTheme = option.dataset.theme;
                console.log(`🎨 [THEME] User selected: ${selectedTheme}`);
                
                // Apply theme immediately
                this.applySelectedTheme(selectedTheme);
            };
        });
        
        // Mark current theme as selected on startup
        this.updateThemeSelection();
    }
    
    // Apply Selected Theme
    applySelectedTheme(theme) {
        if (theme === 'system') {
            this.applySystemTheme();
        } else if (theme === 'dark') {
            this.isLight = false;
            document.body.className = '';
        } else if (theme === 'light') {
            this.isLight = true;
            document.body.className = 'light';
        }
        
        this.themePreference = theme;
        this.updateThemeUI();
        
        // Save theme preference
        localStorage.setItem('senscript_theme', theme);
    }
    
    // Update Theme Selection in Modal
    updateThemeSelection() {
        const savedTheme = localStorage.getItem('senscript_theme') || 'system';
        const themeOption = document.querySelector(`[data-theme="${savedTheme}"]`);
        
        if (themeOption) {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
            themeOption.classList.add('selected');
        }
        
        // Apply the saved/default theme
        this.applySelectedTheme(savedTheme);
    }
    
    // Update Theme UI Elements  
    updateThemeUI() {
        // Update theme toggle button if it exists
        const themeCircle = document.getElementById('themeCircle');
        if (themeCircle) {
            themeCircle.className = `theme-circle ${this.isLight ? 'light' : 'dark'}`;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[App] DOM loaded, starting SenScript...');
        window.senscript = new SenScript();
    });
} else {
    console.log('[App] DOM already loaded, starting SenScript...');
    window.senscript = new SenScript();
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('[Error]', e.error);
});