// SenScript - Simple Working Version
// GOAL NUMBER 1: CARD CREATION SPEED
class SenScript {
    constructor() {
        console.log('[SenScript] Initializing...');
        
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
        this.themePreference = this.detectSystemTheme();
        // Support for 12 major languages
        this.supportedLanguages = [
            'de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT', 'pt-PT', 
            'nl-NL', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA'
        ];
        
        // Start with auto-detection
        this.currentLang = 'auto';
        this.fallbackLang = navigator.language || 'de-DE';
        console.log('[Language] Multi-language mode enabled, fallback:', this.fallbackLang);
        this.lastSentenceProcessed = 0;  // Timestamp of last sentence processing
        this.sessionId = `session_${Date.now()}`;
        
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
        console.log('[SenScript] Setting up UI...');
        
        // Get elements
        this.els = {
            recordBtn: document.getElementById('recordBtn'),
            mobileRecordBtn: document.getElementById('mobileRecordBtn'),
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
            cardsMainTitle: document.getElementById('cardsMainTitle'),
            cardsModeIndicator: document.getElementById('cardsModeIndicator'),
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
            console.log('[UI] Listen button clicked');
            this.toggleListening();
        };
        
        // Mobile listen button  
        if (this.els.mobileRecordBtn) {
            this.els.mobileRecordBtn.onclick = () => {
                console.log('[UI] Mobile listen button clicked');
                this.toggleListening();
            };
        }
        
        // Mobile settings button
        if (this.els.mobileSettingsBtn) {
            this.els.mobileSettingsBtn.onclick = () => {
                console.log('[UI] Mobile settings button clicked');
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
        
        // Close modal when clicking outside
        this.els.settingsModal.onclick = (e) => {
            if (e.target === this.els.settingsModal) {
                console.log('[Settings] Modal background clicked - closing');
                this.closeSettings();
            }
        };
        
        // Prevent settings content clicks from closing modal
        if (this.els.settingsContent) {
            this.els.settingsContent.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal closing
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
        
        console.log('[SenScript] Ready!');
    }
    
    setupAutoRestart() {
        console.log('[AutoRestart] Setting up auto-restart functionality');
        
        // Check if we should auto-restart based on saved state
        const autoRestart = localStorage.getItem('senscript_auto_restart');
        const lastAudioSource = localStorage.getItem('senscript_last_audio_source');
        
        if (autoRestart === 'true' && lastAudioSource) {
            console.log(`[AutoRestart] Auto-restarting with ${lastAudioSource} after page reload`);
            
            // Set the audio source
            this.currentAudioSource = lastAudioSource;
            
            // Update UI to reflect the audio source
            if (this.els.audioSourceSwitch) {
                this.els.audioSourceSwitch.checked = (lastAudioSource === 'system');
            }
            
            // Auto-start after a short delay to allow everything to initialize
            setTimeout(() => {
                console.log('[AutoRestart] Starting listening automatically...');
                this.startListening();
            }, 1000);
        }
        
        // Save state when starting listening
        const originalStartListening = this.startListening.bind(this);
        this.startListening = () => {
            localStorage.setItem('senscript_auto_restart', 'true');
            localStorage.setItem('senscript_last_audio_source', this.currentAudioSource);
            console.log(`[AutoRestart] Saved state: ${this.currentAudioSource}`);
            return originalStartListening();
        };
        
        // Clear state when stopping
        const originalStopListening = this.stopListening.bind(this);
        this.stopListening = () => {
            localStorage.removeItem('senscript_auto_restart');
            localStorage.removeItem('senscript_last_audio_source');
            console.log('[AutoRestart] Cleared auto-restart state');
            return originalStopListening();
        };
    }
    
    resetAllStates() {
        console.log('[Reset] 🔄 Resetting all states...');
        
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
        
        console.log('[Reset] ✅ All states reset');
    }
    
    setupSpeechRecognition() {
        console.log('[Speech] 🔧 Setting up fresh recognition...');
        
        // Always check support first
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('[Speech] ❌ Speech Recognition not supported');
            this.setStatus('speech', 'red');
            return false;
        }
        
        // Clean up any existing recognition
        if (this.recognition) {
            try {
                this.recognition.abort();
                this.recognition = null;
                console.log('[Speech] 🧹 Cleaned up old recognition');
            } catch (e) {
                console.log('[Speech] 🧹 Old recognition already clean');
            }
        }
        
        // Create fresh recognition object
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.getOptimalLanguage();
        this.recognition.maxAlternatives = 1;
        
        console.log(`🎤 [SETUP] Fresh recognition created for: ${this.recognition.lang}`);
        
        // ENHANCED DEBUG: Track speech recognition lifecycle
        this.recognition.onstart = () => {
            this.isListening = true;
            this.restartAttempts = 0;
            this.updateListeningUI();
            console.log(`✅ [START] Recognition ACTIVE - listening for speech input`);
            console.log(`📊 [DEBUG] Recognition state:`, {
                continuous: this.recognition.continuous,
                interimResults: this.recognition.interimResults,
                lang: this.recognition.lang,
                shouldBeListening: this.shouldBeListening
            });
        };
        
        this.recognition.onresult = (event) => {
            console.log(`📝 [RESULT] Speech detected! Processing ${event.results.length} results`);
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                console.log(`   Result ${i}: "${result[0].transcript}" (final: ${result.isFinal})`);
            }
            this.handleSpeechResultOptimized(event);
        };
        
        // ENHANCED: Add onspeechstart and onspeechend for debugging
        this.recognition.onspeechstart = () => {
            console.log(`🗣️  [SPEECH-START] Audio input detected!`);
            
            // Set a timer to check if we get results within 3 seconds
            setTimeout(() => {
                console.log(`⏰ [RESULT-CHECK] 3 seconds after speech start - checking for results...`);
                console.log(`📊 [STATE-CHECK]:`, {
                    isListening: this.isListening,
                    shouldBeListening: this.shouldBeListening,
                    recognitionLang: this.recognition?.lang,
                    pendingSentence: this.pendingSentence,
                    transcript: this.transcript.length
                });
                
                // If no results after 3 seconds, try switching language
                if (this.pendingSentence === '' && this.transcript.length === 0) {
                    console.log(`🔄 [LANGUAGE-FIX] No results in German, trying English...`);
                    this.recognition.lang = 'en-US';
                    console.log(`🌐 [LANGUAGE-SWITCH] Switched to English for better recognition`);
                }
            }, 3000);
        };
        
        this.recognition.onspeechend = () => {
            console.log(`🔇 [SPEECH-END] Audio input stopped`);
        };
        
        this.recognition.onaudiostart = () => {
            console.log(`🎵 [AUDIO-START] Microphone started capturing audio`);
        };
        
        this.recognition.onaudioend = () => {
            console.log(`🔇 [AUDIO-END] Microphone stopped capturing audio`);
        };
        
        this.recognition.onnomatch = () => {
            console.log(`❓ [NO-MATCH] Speech heard but not recognized`);
        };
        
        this.recognition.onerror = (event) => {
            console.error(`❌ [ERROR] ${event.error}`);
            
            // Handle critical errors
            if (event.error === 'not-allowed') {
                this.shouldBeListening = false;
                this.setStatus('speech', 'red');
                this.setStatus('mic', 'red');
                console.error('🚫 [ERROR] Microphone permission denied!');
                return;
            }
            
            if (event.error === 'no-speech') {
                console.warn('🔇 [WARNING] No speech detected within timeout');
            }
            
            // For other errors, let onend handle restart
            if (event.error !== 'no-speech') {
                console.warn(`⚠️ [ERROR] ${event.error} - will recreate recognition`);
                this.needsRecreation = true;
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateListeningUI();
            console.log(`🛑 [END] Recognition stopped`);
            
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
        console.log(`🎯 [RESULT-HANDLER] Processing speech results - resultIndex: ${event.resultIndex}, total results: ${event.results.length}`);
        
        let final = '';
        let interim = '';
        
        // Process only new results for efficiency
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            
            console.log(`   Result ${i}: "${text}" (final: ${result.isFinal})`);
            
            if (result.isFinal) {
                final += text + ' ';
            } else {
                interim = text; // Take latest interim only
            }
        }
        
        console.log(`🎯 [RESULT-SUMMARY] Final: "${final.trim()}", Interim: "${interim.trim()}"`);
        
        if (final.trim() || interim.trim()) {
            console.log(`📝 [PROCESSING] About to process text...`);
        }
        
        // LIVE LANGUAGE DETECTION: Detect language from speech results
        if (final.trim() || interim.trim()) {
            const textToAnalyze = final.trim() || interim.trim();
            const detectedLang = this.detectLanguageFromSpeech(textToAnalyze);
            
            // Switch recognition language if different from current
            if (detectedLang !== this.recognition.lang) {
                console.log(`🌐 [LIVE-LANG] Detected ${detectedLang}, switching from ${this.recognition.lang}`);
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
        
        console.log(`[Language] Text: "${text.substring(0, 30)}..." - ${detectedLang} ${flag} (${maxScore.toFixed(0)}%)`);
        
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
            console.log('[Segment] Kontinuierliche Früh-Trennung (>60 chars) - PREVENTING LONG SENTENCES');
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
            console.log(`🎯 [SPLIT] ${reason} at ${text.length} chars`);
        }
        
        return shouldProcess;
    }
    
    processCompleteSentence(sentence) {
        const timestamp = new Date().toLocaleTimeString();
        // SILENT processing for performance
        // Detect language for this specific sentence
        const detection = this.detectLanguageForText(sentence);
        
        // DYNAMIC LANGUAGE SWITCHING: Update per segment with LOW threshold
        if (detection.confidence > 5 && detection.lang !== this.currentLang) {
            console.log(`🔄 [LANG-SWITCH] ${this.currentLang} → ${detection.lang} (${detection.confidence}% confidence)`);
            this.currentLang = detection.lang;
            if (this.recognition) {
                this.recognition.lang = detection.lang;
                console.log(`🎤 [SPEECH-UPDATE] Recognition language switched to: ${detection.lang}`);
            }
        } else if (detection.confidence > 0) {
            console.log(`🌍 [LANG-KEEP] Staying with ${this.currentLang} (detected: ${detection.lang} at ${detection.confidence}%)`);
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
        
        console.log(`🌍 [${timestamp}] [UI-UPDATE] Sprachanzeige aktualisiert: ${displayFlag} ${displayLang} (${detection.confidence}%)`);
        
        // Stelle sicher dass Recognition Language auch gesetzt ist
        if (this.recognition && this.currentLang) {
            this.recognition.lang = this.currentLang;
        }
        
        // Create card immediately if sentence is worthy - NON-BLOCKING for continuous speech!
        if (this.isTextWorthyOfCard(sentence)) {
            console.log(`🎯 [${timestamp}] [WORTHY] Text passed worthiness check - creating card ASYNCHRONOUSLY...`);
            // Run card creation in background without blocking speech recognition
            this.createCard(sentence, detection).catch(error => {
                console.error(`❌ [${timestamp}] [CARD-ERROR] Background card creation failed:`, error);
                this.setStatus('ai', 'red');
            });
        } else {
            console.log(`🚫 [${timestamp}] [NOT-WORTHY] Text failed worthiness check - no card created`);
        }
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
            
            this.saveSettings();
        });
        
        // Setup example cards carousel
        this.setupExampleCards();
    }

    setupExampleCards() {
        const exampleCards = [
            {
                category: "INTERVIEW TIP",
                front: "How to answer \"Tell me about yourself\"?",
                back: "✅ Say: \"I'm a [role] with [X years] experience in [field]. Recently accomplished [specific achievement].\"<br>❌ Avoid: Personal life details, rambling, or \"I don't know where to start\"<br>🎯 Key point: Keep it professional, structured, and relevant to the job"
            },
            {
                category: "WHAT TO SAY",
                front: "When teacher asks: \"What is machine learning?\"",
                back: "✅ Say: \"It's when computers learn patterns from data to make predictions, like how Netflix suggests movies\"<br>❌ Avoid: \"I don't know\" or overly technical jargon<br>🎯 Key point: Use simple analogies everyone understands"
            },
            {
                category: "KEY FACTS", 
                front: "Python programming quick facts for interviews",
                back: "✅ Python is interpreted, dynamically typed, and great for data science<br>✅ Created by Guido van Rossum in 1991<br>✅ Used by Google, Instagram, Netflix<br>🎯 Mention: \"I appreciate Python's readability and extensive libraries\""
            },
            {
                category: "AVOID THIS",
                front: "Salary negotiation - What NOT to say",
                back: "❌ Never say: \"I'll take whatever you offer\" or \"Money isn't important\"<br>❌ Avoid: Asking about salary in the first interview<br>✅ Instead: \"I'm looking for a fair market rate for this role\"<br>🎯 Strategy: Let them make the first offer"
            },
            {
                category: "QUICK WIN",
                front: "Math test: Quadratic formula shortcut",
                back: "✅ Remember: \"x equals negative b, plus or minus the square root of b squared minus 4ac, all over 2a\"<br>🎯 Memory trick: \"A Bee Can't See\" (a, b², c)<br>✅ Always check: Does your answer make sense in the original equation?"
            },
            {
                category: "INTERVIEW TIP",
                front: "How to handle \"What's your biggest weakness?\"",
                back: "✅ Say: \"I sometimes focus too much on details, but I've learned to set time limits for perfectionism\"<br>❌ Avoid: \"I have no weaknesses\" or actual dealbreakers<br>🎯 Strategy: Pick a real weakness you're actively improving"
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

    setupLanguageControls() {
        if (!this.els.autoLanguage || !this.els.outputLanguage || !this.els.languageIndicator) return;
        
        // Handle auto language checkbox
        this.els.autoLanguage.addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent modal closing
            const isAuto = e.target.checked;
            this.apiSettings.outputLanguage.auto = isAuto;
            
            // Show/hide language selector
            if (this.els.languageSelectContainer) {
                this.els.languageSelectContainer.style.display = isAuto ? 'none' : 'block';
            }
            
            this.updateLanguageIndicator();
            this.saveSettings();
        });
        
        // Handle fixed language selection
        this.els.outputLanguage.addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent modal closing
            this.apiSettings.outputLanguage.fixed = e.target.value;
            this.updateLanguageIndicator();
            this.saveSettings();
        });
        
        // Additional event prevention for select dropdown
        this.els.outputLanguage.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal closing on click
        });
        
        this.els.outputLanguage.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Prevent modal closing on mousedown
        });
        
        // Handle language indicator click
        this.els.languageIndicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = document.getElementById('languageDropdown');
            if (dropdown) {
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
                console.log('[Language] Dropdown', isVisible ? 'hidden' : 'shown');
            }
        });
        
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
        if (!this.els.cardsMainTitle || !this.els.cardsModeIndicator) return;
        
        if (this.apiSettings.interviewMode) {
            this.els.cardsMainTitle.textContent = 'Interview Test Companion';
            this.els.cardsModeIndicator.textContent = '';
        } else {
            this.els.cardsMainTitle.textContent = 'AI Flashcards';
            this.els.cardsModeIndicator.textContent = '';
        }
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
            this.els.languageFlag.textContent = '🔄';
            this.els.languageText.textContent = 'AUTO';
        } else {
            const lang = this.apiSettings.outputLanguage.fixed;
            this.els.languageFlag.textContent = languageFlags[lang] || '🌐';
            this.els.languageText.textContent = languageNames[lang] || lang.split('-')[0].toUpperCase();
        }
    }
    
    setupLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-dropdown-option');
        
        if (!dropdown) return;
        
        // Handle clicking outside dropdown to close it
        document.addEventListener('click', (e) => {
            if (!this.els.languageIndicator.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
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
                }
                
                // Update display and save
                this.updateLanguageIndicator();
                this.saveSettings();
                
                // Close dropdown
                dropdown.style.display = 'none';
                
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
        console.log('[Audio] 🔄 Setting up system audio processing for speech recognition...');
        
        try {
            // Create audio processing pipeline for system audio transcription
            console.log('[Audio] 🎧 System audio transcription active...');
            
            // Use modern approach instead of deprecated ScriptProcessorNode
            // For now, use the Web Speech API fallback immediately since AudioWorkletNode 
            // would require a separate worklet file
            console.log('[Audio] 🎧 Using immediate Web Speech API for system audio transcription...');
            
            // Buffer for tracking audio activity
            this.systemAudioBuffer = [];
            this.lastProcessTime = Date.now();
            
            // Start Web Speech API immediately for system audio transcription
            this.useWebSpeechAPIFallback();
            
            console.log('[Audio] ✅ System audio transcription pipeline active');
            
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
        console.log('[SystemAudio] 🔄 Using Web Speech API as fallback...');
        
        // Start Web Speech API in parallel to capture any leaking system audio through mic
        if (!this.recognition) {
            this.setupSpeechRecognition();
        }
        
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                console.log('[SystemAudio] ✅ Web Speech API fallback started');
            } catch (error) {
                console.log('[SystemAudio] ⚠️ Web Speech API fallback failed:', error);
                this.fallbackToAudioLevelDisplay();
            }
        }
    }
    
    fallbackToAudioLevelDisplay() {
        console.log('[SystemAudio] 📊 Falling back to audio level display only');
        
        // Show audio levels as before
        this.systemAudioInterval = setInterval(() => {
            if (!this.shouldBeListening) return;
            
            if (this.audioAnalyser) {
                const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
                this.audioAnalyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                
                if (average > 20) {
                    console.log('[SystemAudio] 🎵 Audio level:', average.toFixed(1));
                    
                    if (this.els.transcript && average > 30) {
                        const timestamp = new Date().toLocaleTimeString();
                        this.els.transcript.innerHTML = `
                            <div class="transcript-rows">
                                <div class="transcript-row current">
                                    🔊 Audio detected at ${timestamp}
                                </div>
                                <div class="transcript-row previous">
                                    Level: ${average.toFixed(1)} - No transcription available
                                </div>
                                <div class="transcript-row old">
                                    Switch to microphone for speech-to-text
                                </div>
                            </div>
                        `;
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
        
        // Process for card generation if long enough
        if (text.length > 15) {
            this.processTextForCards(text);
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
        console.log('[Audio] Silence detected');
        
        // Process any pending sentences when silence is detected
        if (this.pendingSentence.trim().length > 10) {
            this.processCompleteSentence(this.pendingSentence.trim());
            this.pendingSentence = '';
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
        console.log(`\n🔄 [${timestamp}] [CARD-START] Evaluating text for card creation:`);
        console.log(`📝 FULL TEXT: "${text}"`);
        console.log(`📏 Length: ${text.length} chars`);
        
        // Pre-filter: Check if text is worthy of a card
        if (!this.isTextWorthyOfCard(text)) {
            console.log(`❌ [${timestamp}] [CARD-FILTERED] Text filtered out - no card created`);
            console.log(`🚫 Reason: Failed worthiness check\n`);
            return;
        }
        
        // Use provided detection or detect language for this text
        const detectedLanguage = detection || this.detectLanguageForText(text);
        console.log(`🌍 [${timestamp}] [CARD-LANG] Detected input language: ${detectedLanguage.lang} ${detectedLanguage.flag || ''} (${detectedLanguage.confidence}% confidence)`);
        
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
            console.log(`🎨 [${timestamp}] [CARD-LANG] Using FIXED output language: ${outputLanguage} ${outputFlag} (overriding detected ${detectedLanguage.lang})`);
        } else {
            console.log(`🎨 [${timestamp}] [CARD-LANG] Using AUTO output language: ${outputLanguage} ${outputFlag} (matching input)`);
        }
        
        console.log(`🤖 [${timestamp}] [CARD-AI] Starting AI card generation...`);
        
        // Log the query being sent
        const queryPayload = {
            sessionId: this.sessionId,
            transcript: text,
            language: outputLanguage,  // Use output language for card generation
            textConfidence: detectedLanguage.confidence,
            languageFlag: outputFlag  // Use output flag
        };
        console.log(`📤 [${timestamp}] [API-QUERY] Sending to /api/generate-card:`);
        console.log('   Transcript:', text.substring(0, 50) + '...');
        console.log('   Output Language:', outputLanguage, outputFlag);
        console.log('   SessionId:', this.sessionId);
        console.log('🎓 [API-QUERY] Current Education Settings for this call:');
        console.log('   User Level:', this.apiSettings.education?.userLevel || 'UNDEFINED');
        console.log('   Detail Level:', this.apiSettings.education?.detailLevel || 'UNDEFINED');
        console.log('   Example Complexity:', this.apiSettings.education?.exampleComplexity || 'UNDEFINED');
        console.log('   Full queryPayload:', JSON.stringify(queryPayload, null, 2));
        
        // Set AI status to processing
        this.setStatus('ai', 'yellow');
        
        try {
            const startTime = Date.now();
            
            // Call OpenAI API via our server with text-specific language
            const response = await fetch('http://localhost:3002/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryPayload)
            });
            
            const result = await response.json();
            const responseTime = Date.now() - startTime;
            
            console.log(`📥 [${timestamp}] [API-RESPONSE] Response received in ${responseTime}ms:`);
            console.log(JSON.stringify(result, null, 2));
            
            if (result.success && !result.skip) {
                console.log(`🎯 [${timestamp}] [CARD-PARSE] Parsing AI response...`);
                console.log(`📋 Raw card data:`, result.card);
                
                // Create card from AI response with null checking
                const card = {
                    id: Date.now(),
                    category: result.card?.category || 'Card',
                    front: result.card?.front || 'No question',
                    back: result.card?.back || 'No answer',
                    confidence: result.card?.confidence || 0,
                    source: 'AI',
                    language: outputLanguage,  // Use output language for the card
                    flag: outputFlag,          // Use output flag for the card
                    time: new Date().toLocaleTimeString()
                };
                
                console.log(`📊 [${timestamp}] [CARD-OBJECT] Final card object created:`);
                console.log(JSON.stringify(card, null, 2));
                
                this.cards.unshift(card); // Add to beginning for latest on top
                this.renderCard(card);
                this.updateCardCount();
                this.els.exportBtn.disabled = false;
                this.setStatus('ai', 'green');
                
                console.log(`✅ [${timestamp}] [CARD-SUCCESS] AI card created and rendered!`);
                console.log(`🏷️  Category: ${card.category}`);
                console.log(`🎯 Confidence: ${card.confidence}%`);
                console.log(`📄 Front: "${card.front}"`);
                console.log(`📋 Back: "${card.back}"`);
                console.log(`🎉 Total cards: ${this.cards.length}\n`);
            } else {
                console.log(`⚠️  [${timestamp}] [CARD-SKIPPED] AI generation failed or skipped`);
                console.log(`🚫 Reason: ${result.skip ? 'Content skipped by AI' : 'API failure'}`);
                if (result.reason) {
                    console.log(`💭 AI Reason: ${result.reason}`);
                }
                console.log('');
                this.setStatus('ai', 'yellow');
            }
        } catch (error) {
            console.error(`💥 [${timestamp}] [API-ERROR] Error calling AI API:`, error);
            console.error(`🔍 Error details:`, error.message);
            
            // Only create fallback for truly educational content
            if (this.hasStrongEducationalSignals(text)) {
                console.log(`🔄 [${timestamp}] [FALLBACK] Creating fallback card due to API error...`);
                this.createFallbackCard(text, detectedLanguage, outputLanguage, outputFlag);
            } else {
                console.log(`🚫 [${timestamp}] [NO-FALLBACK] API error but content not educational enough for fallback`);
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

    renderCard(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card new-card';
        
        // Add confidence indicator, source, and language flag
        const sourceCircle = card.source === 'AI' ? 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-left: 6px;"></span>' : 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #6b7280; border-radius: 50%; margin-left: 6px;"></span>';
        const confidenceText = card.confidence ? ` ${card.confidence}%` : '';
        const languageFlag = card.flag ? ` ${card.flag}` : '';
        
        // Generate source link if available
        let sourceHtml = '';
        if (card.source && card.source.title) {
            const sourceUrl = this.generateSourceUrl(card.source, card.language);
            const sourceIcon = card.source.type === 'wikipedia' ? '📖' : '🔍';
            sourceHtml = `<div class="card-source">
                <a href="${sourceUrl}" target="_blank" rel="noopener" class="source-link">
                    ${sourceIcon} Learn more
                </a>
            </div>`;
        }
        
        cardEl.innerHTML = `
            <div class="card-header">${card.category || 'Card'}${languageFlag} • ${card.time}${sourceCircle}${confidenceText}</div>
            <div class="card-front">${card.front || 'No question'}</div>
            <div class="card-back">${card.back || 'No answer'}</div>
            ${sourceHtml}
        `;
        
        // Push existing cards down before adding new one
        const existingCards = Array.from(this.els.cardsContainer.children);
        existingCards.forEach(existingCard => {
            existingCard.classList.add('push-down');
        });
        
        // Insert new card at top
        if (this.els.cardsContainer.firstChild) {
            this.els.cardsContainer.insertBefore(cardEl, this.els.cardsContainer.firstChild);
        } else {
            this.els.cardsContainer.innerHTML = '';
            this.els.cardsContainer.appendChild(cardEl);
        }
        
        // Remove push-down class after animation
        setTimeout(() => {
            existingCards.forEach(existingCard => {
                existingCard.classList.remove('push-down');
            });
            cardEl.classList.remove('new-card');
        }, 800);
        
        // Enhanced memory management for continuous operation
        const cards = this.els.cardsContainer.children;
        if (cards.length > 8) {
            this.els.cardsContainer.removeChild(cards[cards.length - 1]);
        }
        
        // Clean up cards array to prevent memory bloat during long sessions
        if (this.cards.length > 12) {
            this.cards = this.cards.slice(0, 10); // Keep latest 10 cards in memory
            console.log('🧹 [MEMORY] Cards array cleaned, kept latest 10');
        }
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
    
    updateTranscriptDisplay() {
        if (!this.els.transcript) return;
        
        // THREE-ROW STRUCTURE: Create flowing, readable transcript
        let html = '<div class="transcript-rows">';
        
        const timeFormat = (timestamp) => {
            if (!timestamp) return '';
            return timestamp.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        };
        
        // IMPROVED: Create readable segments by combining related lines
        const readableSegments = this.createReadableSegments();
        
        // Ensure we have exactly 3 display segments
        while (readableSegments.length < 3) {
            readableSegments.unshift({ text: '', timestamp: null });
        }
        const displaySegments = readableSegments.slice(-3);
        
        // ROW 1: Oldest segment (faded out)
        const oldSegment = displaySegments[0];
        html += `<div class="transcript-row old">
                    ${oldSegment.text ? `<span class="time">${timeFormat(oldSegment.timestamp)}</span>
                                       <span class="text">${oldSegment.text}</span>` : ''}
                 </div>`;
        
        // ROW 2: Previous segment (medium opacity)
        const prevSegment = displaySegments[1];
        html += `<div class="transcript-row previous">
                    ${prevSegment.text ? `<span class="time">${timeFormat(prevSegment.timestamp)}</span>
                                        <span class="text">${prevSegment.text}</span>` : ''}
                 </div>`;
        
        // ROW 3: Current segment (full opacity)
        const currentSegment = displaySegments[2];
        const hasInterim = this.currentInterim && this.isListening;
        
        if (hasInterim) {
            // Show interim text (live typing)
            html += `<div class="transcript-row current interim">
                        <span class="time">...</span>
                        <span class="text">${this.currentInterim}...</span>
                     </div>`;
        } else if (currentSegment.text) {
            // Show latest completed segment
            html += `<div class="transcript-row current">
                        <span class="time">${timeFormat(currentSegment.timestamp)}</span>
                        <span class="text">${currentSegment.text}</span>
                     </div>`;
        } else if (!this.isListening && !this.shouldBeListening) {
            // Show start message when not listening
            html += `<div class="transcript-row current">
                        <span class="text">Click "Start" to begin...</span>
                     </div>`;
        } else {
            // Show listening status when recording but no text yet
            html += `<div class="transcript-row current listening">
                        <span class="text">🎤 Listening... waiting for audio</span>
                     </div>`;
        }
        
        html += '</div>';
        this.els.transcript.innerHTML = html;
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
        console.log(`\n🎛️  [${timestamp}] [TOGGLE] Listen toggle clicked`);
        console.log(`🔍 [DEBUG] Audio setup check:`, {
            hasAudioContext: !!this.audioContext,
            audioContextState: this.audioContext?.state,
            hasRecognition: !!this.recognition,
            currentSource: this.currentAudioSource
        });
        console.log(`📊 [${timestamp}] [STATE] isListening: ${this.isListening}, shouldBeListening: ${this.shouldBeListening}`);
        console.log(`🔍 [${timestamp}] [DEBUG] Recognition exists: ${!!this.recognition}, Language: ${this.recognition?.lang || 'undefined'}`);
        
        if (this.isListening || this.shouldBeListening) {
            console.log(`🛑 [${timestamp}] [ACTION] Stopping listening...`);
            console.log(`💡 [${timestamp}] [TIP] Click again to restart listening`);
            this.stopListening();
        } else {
            console.log(`▶️  [${timestamp}] [ACTION] Starting listening...`);
            console.log(`🎤 [${timestamp}] [TIP] System will now continuously listen for speech`);
            this.startListening();
        }
    }
    
    startListening() {
        console.log('[Control] Starting...', 'Source:', this.currentAudioSource);
        
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
        
        if (this.currentAudioSource === 'system') {
            this.startSystemAudio();
        } else {
            this.startMicrophone();
        }
    }
    
    async startMicrophone() {
        console.log('[Audio] 🎤 Starting microphone...');
        console.log('[Audio] 🔍 State check:', {
            hasRecognition: !!this.recognition,
            isListening: this.isListening,
            shouldBeListening: this.shouldBeListening,
            hasAudioContext: !!this.audioContext
        });
        
        // Show initialization state
        this.setStatus('mic', 'yellow');
        this.showInitializationMessage();
        
        // Enable level dots immediately for microphone
        this.showLevelDots();
        
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
            
            // Try to get screen share with audio (this can capture tab audio)
            console.log('[Audio] 🖥️ Requesting system audio capture...');
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
            
            this.systemStream = stream;
            
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
                this.els.transcript.innerHTML = `
                    <div class="transcript-rows">
                        <div class="transcript-row current">
                            🔊 Processing device audio...
                        </div>
                        <div class="transcript-row previous">
                            Ready for speech recognition
                        </div>
                        <div class="transcript-row old">
                            
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
        console.log(`\n🛑 [${timestamp}] [STOP] Stopping listening process...`);
        
        this.shouldBeListening = false;
        console.log(`🔴 [${timestamp}] [FLAG] shouldBeListening set to FALSE`);
        
        if (this.recognition) {
            console.log(`🎤 [${timestamp}] [STOP] Stopping speech recognition...`);
            try {
                this.recognition.abort(); // Use abort for immediate stop
                console.log(`🎤 [${timestamp}] [STOP] Speech recognition aborted`);
            } catch (e) {
                console.warn(`🎤 [${timestamp}] [STOP] Error stopping recognition:`, e);
            }
        }
        
        if (this.systemStream) {
            console.log(`🔊 [${timestamp}] [STOP] Stopping system audio stream...`);
            this.systemStream.getTracks().forEach(track => track.stop());
            this.systemStream = null;
        }
        
        if (this.audioSource) {
            console.log(`🎧 [${timestamp}] [STOP] Disconnecting audio source...`);
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        // Clean up system audio processing
        if (this.systemAudioInterval) {
            console.log(`🔊 [${timestamp}] [STOP] Stopping system audio processing...`);
            clearInterval(this.systemAudioInterval);
            this.systemAudioInterval = null;
        }
        
        if (this.audioProcessor) {
            console.log(`🔊 [${timestamp}] [STOP] Disconnecting audio processor...`);
            this.audioProcessor.disconnect();
            this.audioProcessor = null;
        }
        
        if (this.systemAudioBuffer) {
            this.systemAudioBuffer = [];
        }
        
        console.log(`✅ [${timestamp}] [STOP-COMPLETE] All recording processes stopped\n`);
        
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
        
        toggleOptions.forEach(option => {
            option.onclick = () => {
                const newSource = option.dataset.value;
                if (newSource !== this.currentAudioSource) {
                    console.log('[UI] Switching audio source to:', newSource);
                    this.currentAudioSource = newSource;
                    this.updateToggleUI();
                    
                    // Update level dots for new source
                    this.showLevelDots();
                    
                    // IMMEDIATELY start audio monitoring for the new source
                    this.startAudioMonitoringOnly();
                    
                    // Simple restart if recording
                    if (this.shouldBeListening) {
                        this.stopListening();
                        setTimeout(() => {
                            this.startListening();
                            // Force UI update after source switch
                            setTimeout(() => this.updateAnimatedTranscript(), 200);
                        }, 100);
                    } else {
                        // Update UI even if not recording to show source change
                        this.updateAnimatedTranscript();
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
    
    async saveSettings() {
        console.log('[Settings] Saving settings...');
        
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
        
        console.log('🎓 [SETTINGS-SAVE] Education settings updated:');
        console.log('   User Level:', this.apiSettings.education.userLevel, '(1=Beginner, 5=Expert)');
        console.log('   Detail Level:', this.apiSettings.education.detailLevel, '(1=Brief, 5=Comprehensive)');
        console.log('   Example Complexity:', this.apiSettings.education.exampleComplexity, '(1=Simple, 5=Academic)');
        console.log('   Full apiSettings object:', JSON.stringify(this.apiSettings, null, 2));
        
        // Save to localStorage
        localStorage.setItem('senscript_settings', JSON.stringify(this.apiSettings));
        
        // Update server
        await this.updateServerSettings();
        
        this.closeSettings();
        
        // Show success message
        this.els.saveSettings.textContent = '✅ Saved!';
        setTimeout(() => {
            this.els.saveSettings.textContent = '💾 Save Settings';
        }, 2000);
    }
    
    exportCards() {
        if (this.cards.length === 0) return;
        
        const data = {
            cards: this.cards,
            exported: new Date().toISOString(),
            total: this.cards.length
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