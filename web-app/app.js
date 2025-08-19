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
        this.audioContext = null;
        this.audioAnalyser = null;
        this.audioSource = null;
        this.silenceTimer = null;
        this.audioLevel = 0;
        this.processingCard = false;
        this.apiSettings = {
            apiKeys: {},
            selectedModel: 'auto',
            useFallback: true
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
            themeBtn: document.getElementById('themeBtn'),
            themeCircle: document.getElementById('themeCircle'),
            exportBtn: document.getElementById('exportBtn'),
            exportTranscriptBtn: document.getElementById('exportTranscriptBtn'),
            audioSourceSwitch: document.getElementById('audioSourceSwitch'),
            langCode: document.getElementById('langCodeTranscript'),
            langConf: document.getElementById('langConfTranscript'),
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
            deviceLevelDots: document.getElementById('deviceLevelDots')
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
        
        this.els.themeBtn.onclick = () => {
            console.log('[UI] Theme button clicked');
            this.toggleTheme();
        };
        
        // Mobile theme button
        const mobileThemeBtn = document.getElementById('mobileThemeBtn');
        if (mobileThemeBtn) {
            mobileThemeBtn.onclick = () => {
                console.log('[UI] Mobile theme button clicked');
                this.toggleTheme();
            };
        }
        
        // Mobile settings button - removed per user request
        
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
        
        this.els.saveSettings.onclick = () => {
            this.saveSettings();
        };
        
        // Close modal when clicking outside
        this.els.settingsModal.onclick = (e) => {
            if (e.target === this.els.settingsModal) {
                this.closeSettings();
            }
        };
        
        // Local duplicate prevention for API efficiency
        this.recentTexts = new Set(); // Track recent texts to avoid duplicates
        this.DUPLICATE_TIMEOUT = 10000; // Clear duplicates after 10 seconds
        
        this.setupSpeechRecognition();
        this.checkMicrophone();
        this.setupAudioVisualization();
        this.setupLevelDots();
        this.loadSettings();
        
        // Ensure clean state after all setup
        this.isListening = false;
        this.shouldBeListening = false;
        this.updateListeningUI();
        
        console.log('[SenScript] Ready!');
    }
    
    setupSpeechRecognition() {
        console.log('[Speech] Setting up recognition...');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('[Speech] Not supported');
            this.setStatus('speech', 'red');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        // Start with fallback language for auto-detection
        this.recognition.lang = this.fallbackLang;
        this.recognition.maxAlternatives = 3; // Get more alternatives
        
        console.log(`🎤 [SETUP] Multi-language recognition starting with: ${this.recognition.lang}`);
        console.log(`🌐 [SETUP] Auto-detection mode: ${this.currentLang}`);
        console.log(`🌐 [SETUP] Supported languages:`, this.supportedLanguages.slice(0, 6).join(', '), '...');
        console.log(`🌐 [SETUP] Browser languages: ${navigator.languages?.join(', ') || 'N/A'}`);
        
        this.recognition.onstart = () => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`\n🎤 [${timestamp}] [SPEECH-START] Speech recognition started with language: ${this.recognition.lang}`);
            console.log(`🔴 [${timestamp}] [STATUS] Listening: TRUE`);
            console.log(`🌍 [${timestamp}] [LANG-INFO] System language: ${this.currentLang}, Recognition language: ${this.recognition.lang}`);
            console.log(`🎙️ [${timestamp}] [DEBUG] Transcript should start appearing now...`);
            this.isListening = true;
            this.updateListeningUI();
            // Force transcript UI update when speech recognition starts
            this.updateAnimatedTranscript();
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            const timestamp = new Date().toLocaleTimeString();
            console.error(`❌ [${timestamp}] [SPEECH-ERROR] Error:`, event.error);
            
            // Handle specific errors - more robust recovery
            if (event.error === 'not-allowed') {
                console.error('[Speech] Microphone access denied');
                this.setStatus('speech', 'red');
                this.shouldBeListening = false;
                this.updateListeningUI();
            } else if (event.error === 'no-speech') {
                console.log(`⚠️ [${timestamp}] [NO-SPEECH] No speech detected - this is normal, continuing to listen`);
                // This is completely normal, don't change shouldBeListening
                // The system will restart automatically in onend
            } else if (event.error === 'aborted') {
                console.log(`⚠️ [${timestamp}] [ABORTED] Recognition aborted - checking if we should restart...`);
                // Only stop if user explicitly stopped, otherwise keep trying
                if (!this.shouldBeListening) {
                    console.log(`🛑 [${timestamp}] [ABORTED-STOP] User stopped, not restarting`);
                } else {
                    console.log(`🔄 [${timestamp}] [ABORTED-CONTINUE] Still should be listening, will restart`);
                }
            } else if (event.error === 'network') {
                console.warn(`🌐 [${timestamp}] [NETWORK-ERROR] Network issue - will retry with different language`);
                // Network errors shouldn't stop us completely
                this.tryNextLanguage();
            } else if (event.error === 'service-not-allowed') {
                console.warn(`🚫 [${timestamp}] [SERVICE-ERROR] Speech service issue - will retry`);
                // Service errors are temporary, keep trying
            } else {
                console.warn(`⚠️ [${timestamp}] [UNKNOWN-ERROR] Unknown error "${event.error}" - staying robust, will retry`);
                // For any other error, stay robust and keep trying
            }
        };
        
        this.recognition.onend = () => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`\n🔇 [${timestamp}] [SPEECH-END] Speech recognition ended`);
            console.log(`⚪ [${timestamp}] [STATUS] Listening: FALSE`);
            console.log(`🔄 [${timestamp}] [CHECK] shouldBeListening: ${this.shouldBeListening}`);
            
            this.isListening = false;
            this.updateListeningUI();
            
            // Only restart if we should still be recording
            if (this.shouldBeListening) {
                console.log(`🔄 [${timestamp}] [RESTART] Auto-restarting recognition in 150ms...`);
                // Initialize retry counter if not exists
                if (!this.restartAttempts) this.restartAttempts = 0;
                
                setTimeout(() => {
                    try {
                        // Reset recognition state to prevent corruption
                        this.currentInterim = '';
                        
                        // Try next language if multiple failed attempts or no success recently
                        if (this.restartAttempts > 2 || this.transcriptLines.length === 0) {
                            this.tryNextLanguage();
                            this.restartAttempts = 0; // Reset counter after language change
                        }
                        
                        this.recognition.start();
                        this.restartAttempts++;
                        console.log(`🎤 [${new Date().toLocaleTimeString()}] [RESTART-SUCCESS] Recognition restarted with ${this.recognition.lang} (attempt ${this.restartAttempts})`);
                    } catch (error) {
                        console.error(`❌ [${new Date().toLocaleTimeString()}] [RESTART-FAILED] Restart failed (attempt ${this.restartAttempts}):`, error);
                        
                        // Don't give up immediately - try a few more times with delays
                        if (this.restartAttempts < 5) {
                            console.log(`🔄 [${new Date().toLocaleTimeString()}] [RETRY] Will retry in ${this.restartAttempts * 500}ms...`);
                            setTimeout(() => {
                                if (this.shouldBeListening) {
                                    this.recognition.onend(); // Recursive retry
                                }
                            }, this.restartAttempts * 500);
                        } else {
                            console.error(`💥 [${new Date().toLocaleTimeString()}] [GIVE-UP] Too many failed attempts, stopping`);
                            this.shouldBeListening = false;
                            this.updateListeningUI();
                            this.restartAttempts = 0;
                        }
                    }
                }, 150);
            } else {
                console.log(`🛑 [${timestamp}] [STOPPED] SenScript stopped - not restarting\n`);
                this.restartAttempts = 0; // Reset counter when user stops
            }
        };
        
        this.setStatus('speech', 'green');
        console.log('[Speech] Ready');
        
        // Initialize language cycling for auto-detection
        this.currentLanguageIndex = 0;
        this.failedAttempts = 0;
    }
    
    tryNextLanguage() {
        // Cycle through supported languages for better detection
        if (this.failedAttempts < this.supportedLanguages.length) {
            this.currentLanguageIndex = (this.currentLanguageIndex + 1) % this.supportedLanguages.length;
            const nextLang = this.supportedLanguages[this.currentLanguageIndex];
            console.log(`🌐 [LANG-SWITCH] Trying language: ${nextLang} (attempt ${this.failedAttempts + 1})`);
            this.recognition.lang = nextLang;
            this.failedAttempts++;
        } else {
            // Reset to fallback language
            console.log(`🌐 [LANG-RESET] Resetting to fallback: ${this.fallbackLang}`);
            this.recognition.lang = this.fallbackLang;
            this.failedAttempts = 0;
        }
    }
    
    handleSpeechResult(event) {
        const timestamp = new Date().toLocaleTimeString();
        let final = '';
        let interim = '';
        
        // Enhanced logging to debug English problem
        console.log(`🎤 [SPEECH-EVENT] Processing ${event.results.length} results, resultIndex: ${event.resultIndex}`);
        console.log(`🎤 [SPEECH-LANG] Current recognition language: ${this.recognition?.lang || 'undefined'}`);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            const confidence = result[0].confidence;
            
            console.log(`📝 [RESULT-${i}] Text: "${text}" | Final: ${result.isFinal} | Confidence: ${confidence?.toFixed(2) || 'N/A'}`);
            
            if (result.isFinal) {
                final += text + ' ';
                console.log(`✅ [FINAL] "${text}" (Lang: ${this.currentLang})`);
            } else {
                interim += text;
                console.log(`⏳ [INTERIM] "${text}"`);
            }
        }
        
        if (final.trim()) {
            // Add to pending sentence accumulation
            this.pendingSentence += final;
            this.transcript += final;
            this.addTranscriptLine(final.trim());
            
            // Check for sentence boundaries immediately
            this.processPendingSentence();
        }
        
        // REAL-TIME SPLITTING: Check interim results for early processing  
        if (interim.trim()) {
            const fullCurrentText = this.pendingSentence + interim;
            
            // Check if we should process NOW based on current interim + pending
            if (this.shouldProcessNow(fullCurrentText)) {
                // SOFORT visuell splitten während dem Sprechen
                if (this.pendingSentence.trim()) {
                    console.log(`🔥 [${timestamp}] [LIVE-SPLIT] INTERIM TRIGGERED SPLIT: "${this.pendingSentence.substring(0, 40)}..."`);
                    console.log(`🎯 [${timestamp}] [LIVE-SPLIT] Current pending length: ${this.pendingSentence.length}, interim: ${interim.length}`);
                    
                    // ZUERST: Segment zum UI hinzufügen (bevor processPendingSentence es löscht)
                    this.addSplitSegmentToUI(this.pendingSentence.trim());
                    
                    // CRITICAL: Clear interim text after split so split segments remain visible!
                    console.log(`✂️ [${timestamp}] [LIVE-SPLIT] Clearing interim to show split segments`);
                    interim = ''; // Clear interim so UI shows split segments, not ongoing block
                }
                
                // DANN: Normale Verarbeitung (wird pendingSentence zurücksetzen)
                this.processPendingSentence();
            } else {
                console.log(`⏳ [${timestamp}] [INTERIM-WAIT] Not ready to split yet: pending=${this.pendingSentence.length}, interim=${interim.length}`);
            }
        }
        
        // Update interim display (simplified - no complex processing during interim)
        this.currentInterim = interim;
        
        console.log(`📋 [${timestamp}] [INTERIM-DISPLAY] Set interim text: "${interim.substring(0, 30)}..." (length: ${interim.length})`);
        console.log(`📊 [${timestamp}] [UI-STATE] Lines stored: ${this.transcriptLines.length}, pending: ${this.pendingSentence.length}`);
        console.log(`🔍 [${timestamp}] [DEBUG] isListening: ${this.isListening}, shouldBeListening: ${this.shouldBeListening}`);
        
        // IMMEDIATE UI update for live transcript feeling
        console.log(`🔄 [${timestamp}] [UI-FORCE-UPDATE] Forcing UI update with interim: "${interim}"`);
        this.updateAnimatedTranscript();
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
        
        const totalWords = lower.split(/\s+/).length;
        
        if (totalWords === 0) return { lang: 'de-DE', confidence: 0, flag: '🇩🇪' };
        
        const germanScore = ((germanCount + germanPatternCount) / totalWords) * 100;
        const englishScore = (englishCount / totalWords) * 100;
        const frenchScore = ((frenchCount + frenchPatternCount) / totalWords) * 100;
        const spanishScore = ((spanishCount + spanishPatternCount) / totalWords) * 100;
        const italianScore = ((italianCount + italianPatternCount) / totalWords) * 100;
        
        const scores = {
            'de-DE': { score: germanScore, flag: '🇩🇪' },
            'en-US': { score: englishScore, flag: '🇺🇸' },
            'fr-FR': { score: frenchScore, flag: '🇫🇷' },
            'es-ES': { score: spanishScore, flag: '🇪🇸' },
            'it-IT': { score: italianScore, flag: '🇮🇹' }
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
            'it-IT': 'IT'
        };
        
        const displayLang = langCodes[detection.lang] || langCodes[this.currentLang] || 'DE';
        const displayFlag = detection.flag || this.getLanguageFlag(this.currentLang) || '🇩🇪';
        
        // Aktualisiere BEIDE Sprachanzeigen: Karten UND Transcript
        this.els.langCode.textContent = `${displayFlag} ${displayLang}`;
        this.els.langConf.textContent = detection.confidence > 0 ? `${detection.confidence.toFixed(0)}%` : '';
        
        console.log(`🌍 [${timestamp}] [UI-UPDATE] Sprachanzeige aktualisiert: ${displayFlag} ${displayLang} (${detection.confidence}%)`);
        
        // Stelle sicher dass Recognition Language auch gesetzt ist
        if (this.recognition && this.currentLang) {
            this.recognition.lang = this.currentLang;
        }
        
        // Create card immediately if sentence is worthy - NO BATCHING for speed!
        if (this.isTextWorthyOfCard(sentence)) {
            console.log(`🎯 [${timestamp}] [WORTHY] Text passed worthiness check - creating card IMMEDIATELY...`);
            this.createCard(sentence, detection);
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
            'it-IT': 'IT'
        };
        this.els.langCode.textContent = `${detection.flag || ''} ${langCodes[detection.lang] || 'DE'}`;
        this.els.langConf.textContent = detection.confidence > 0 ? `${detection.confidence.toFixed(0)}%` : '';
        
        return detection;
    }
    
    isTextWorthyOfCard(text) {
        // STABLE APPROACH: Simple, reliable filtering
        const trimmed = text.trim().toLowerCase();
        
        console.log(`🔍 [WORTHY] "${text.substring(0, 40)}..." (${trimmed.length} chars)`);
        
        // Simple length check
        if (trimmed.length < 20) {
            console.log(`❌ Too short`);
            return false;
        }
        
        // Simple filler check
        if (/^(ja|nein|ok|okay|hmm|äh|eh|um|uh|yes|no|well|the|and|but|that|this)$/i.test(trimmed)) {
            console.log(`❌ Filler word`);
            return false;
        }
        
        console.log(`✅ [WORTHY-PASS] Text accepted for card generation!`);
        return true; // Accept almost everything for testing
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
    
    setupLevelDots() {
        // Initialize level dots - they're already in HTML
        this.currentActiveDots = this.currentAudioSource === 'microphone' ? 
            this.els.micLevelDots : this.els.deviceLevelDots;
        
        // Enable dots UI immediately when audio source is selected
        this.showLevelDots();
        
        // Don't start monitoring on app load - wait for user to select audio source
        console.log('[Audio] Level dots UI initialized for:', this.currentAudioSource);
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
        // For system/device audio, we still need mic for Web Speech API
        console.log('[Audio] 🔊 Requesting microphone permission for device output mode...');
        
        try {
            // Get mic for speech recognition AND visualization (since Web Speech API needs mic)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: false, 
                    noiseSuppression: false 
                } 
            });
            await this.connectAudioSource(stream);
            this.setStatus('audio', 'green');
            console.log('[Audio] ✅ Device output mode ready (capturing system audio, using mic for speech recognition)');
        } catch (error) {
            this.setStatus('audio', 'red');
            console.error('[Audio] ❌ Permission denied for device output mode:', error);
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
                this.apiSettings = JSON.parse(savedSettings);
                await this.updateServerSettings();
            }
        } catch (error) {
            console.error('[Settings] Failed to load:', error);
        }
    }
    
    async updateServerSettings() {
        try {
            const response = await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    ...this.apiSettings
                })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('[Settings] Updated on server');
            }
        } catch (error) {
            console.error('[Settings] Failed to update server:', error);
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
        const textLanguage = detection || this.detectLanguageForText(text);
        console.log(`🌍 [${timestamp}] [CARD-LANG] Detected language: ${textLanguage.lang} ${textLanguage.flag || ''} (${textLanguage.confidence}% confidence)`);
        console.log(`🤖 [${timestamp}] [CARD-AI] Starting AI card generation...`);
        
        // Log the query being sent
        const queryPayload = {
            sessionId: this.sessionId,
            transcript: text,
            language: textLanguage.lang,
            textConfidence: textLanguage.confidence,
            languageFlag: textLanguage.flag
        };
        console.log(`📤 [${timestamp}] [API-QUERY] Sending to /api/generate-card:`);
        console.log(JSON.stringify(queryPayload, null, 2));
        
        // Set AI status to processing
        this.setStatus('ai', 'yellow');
        
        try {
            const startTime = Date.now();
            
            // Call OpenAI API via our server with text-specific language
            const response = await fetch('http://localhost:3001/api/generate-card', {
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
                    language: textLanguage.lang,
                    flag: textLanguage.flag,
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
                this.createFallbackCard(text, textLanguage);
            } else {
                console.log(`🚫 [${timestamp}] [NO-FALLBACK] API error but content not educational enough for fallback`);
                this.setStatus('ai', 'red');
            }
        }
    }
    
    createFallbackCard(text, detection = null) {
        console.log('[Cards] Creating fallback card for:', text);
        
        const textLanguage = detection || this.detectLanguageForText(text);
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
                    front = textLanguage.lang === 'de-DE' ? 'Was wurde erklärt?' : 'What was explained?';
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
                    front = textLanguage.lang === 'de-DE' ? 'Erklärung:' : 'Explanation:';
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
                    front = textLanguage.lang === 'de-DE' ? 'Wichtige Information:' : 'Key Information:';
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
            language: textLanguage.lang,
            flag: textLanguage.flag,
            time: new Date().toLocaleTimeString()
        };
        
        this.cards.unshift(card); // Add to beginning for latest on top
        this.renderCard(card);
        this.updateCardCount();
        this.els.exportBtn.disabled = false;
        this.setStatus('ai', 'red');
        
        console.log('[Cards] Fallback card created:', card);
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
        
        cardEl.innerHTML = `
            <div class="card-header">${card.category || 'Card'}${languageFlag} • ${card.time}${sourceCircle}${confidenceText}</div>
            <div class="card-front">${card.front || 'No question'}</div>
            <div class="card-back">${card.back || 'No answer'}</div>
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
        
        // Keep max 8 cards visible
        const cards = this.els.cardsContainer.children;
        if (cards.length > 8) {
            this.els.cardsContainer.removeChild(cards[cards.length - 1]);
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
        
        if (commonWordRatio < 0.1 && words.length > 3) {
            console.log(`🔍 [CORRUPTION-CHECK] Low common word ratio: ${commonWordRatio.toFixed(2)}`);
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
    
    updateTranscriptDisplay() {
        if (!this.els.transcript) return;
        
        // Show recording status only when NOT attempting to record
        if (!this.isListening && !this.shouldBeListening && this.transcriptLines.length === 0 && !this.currentInterim) {
            this.els.transcript.innerHTML = `<div class="transcript-line current">Click "Start" to begin...</div>`;
            return;
        }
        
        // Show listening status when recording started but no text yet
        if ((this.isListening || this.shouldBeListening) && this.transcriptLines.length === 0) {
            this.els.transcript.innerHTML = `<div class="transcript-line current listening">🎤 Listening... waiting for audio</div>`;
            return;
        }
        
        const parts = [];
        
        // Simple display: latest + 2 fading
        this.transcriptLines.forEach((line, index) => {
            const age = this.transcriptLines.length - 1 - index; 
            
            let className = 'transcript-line';
            if (age === 2) className += ' fadeout';      // Oldest
            else if (age === 1) className += ' previous'; // Middle 
            else className += ' current';                 // Latest
            
            parts.push(`<div class="${className}">${line.text}</div>`);
        });
        
        // Add interim text if speaking
        if (this.currentInterim && this.isListening) {
            const interimDisplay = this.currentInterim.length > 60 ? 
                this.currentInterim.substring(0, 60) + '...' : this.currentInterim;
            parts.push(`<div class="transcript-line interim">${interimDisplay}</div>`);
        }
        
        this.els.transcript.innerHTML = parts.join('');
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
        
        // CORRECT ORDER: Show only last 3 lines with proper age styling
        const visibleLines = this.transcriptLines.slice(-3); // Get last 3 lines
        
        visibleLines.forEach((line, index) => {
            let className = 'transcript-line';
            
            if (index === 0) {
                className += ' old'; // Top line = oldest of the 3 (smallest)
            } else if (index === 1) {
                className += ' previous'; // Middle line = middle age (medium) - CORRECTED
            } else if (index === 2 && !this.currentInterim) {
                className += ' current'; // Bottom line = newest (biggest) - CORRECTED
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
            // Start speech recognition FIRST (this was working before)
            this.shouldBeListening = true;
            
            if (this.recognition && !this.isListening) {
                this.recognition.start();
                console.log('[Audio] 🗣️ Speech recognition started successfully');
            }
            
            // Get microphone stream for visualization (secondary)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                await this.connectAudioSource(stream);
                this.setStatus('mic', 'green');
                console.log('[Audio] Visualization connected successfully');
            } catch (vizError) {
                console.warn('[Audio] Visualization failed, but speech recognition should work:', vizError);
                // Still set mic to green if speech recognition works
                if (this.isListening) {
                    this.setStatus('mic', 'green');
                }
            }
            
        } catch (error) {
            console.error('[Audio] Microphone error:', error);
            this.setStatus('mic', 'red');
            this.shouldBeListening = false;
            this.updateListeningUI();
        }
    }
    
    async startSystemAudio() {
        console.log('[Audio] Starting system/device audio...');
        
        // Enable level dots immediately for device output
        this.showLevelDots();
        
        try {
            // Try to get screen share with audio (this can capture tab audio)
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
            
            console.log('[Audio] Got system audio stream');
            this.systemStream = stream;
            
            // Connect to visualizer
            await this.connectAudioSource(stream);
            
            // For system audio, we need to create a speech recognition from the audio context
            this.shouldBeListening = true;
            
            // Since Web Speech API doesn't work with custom streams,
            // we'll need to simultaneously capture microphone for speech recognition
            // while using system audio for visualization only
            try {
                if (this.recognition && !this.isListening) {
                    // Start speech recognition on microphone in parallel
                    this.recognition.start();
                    console.log('[Audio] Started parallel microphone for speech recognition');
                }
            } catch (micError) {
                console.warn('[Audio] Could not start microphone for speech recognition:', micError);
                // Continue with system audio only (visualization only)
            }
            
            this.setStatus('audio', 'green');
            
        } catch (error) {
            console.error('[Audio] System audio error:', error);
            
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
        
        if (this.recognition && this.isListening) {
            console.log(`🎤 [${timestamp}] [STOP] Stopping speech recognition...`);
            this.recognition.stop();
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
        
        console.log(`✅ [${timestamp}] [STOP-COMPLETE] All recording processes stopped\n`);
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
        
        // Load usage stats
        await this.loadUsageStats();
        
        this.els.settingsModal.style.display = 'flex';
    }
    
    closeSettings() {
        this.els.settingsModal.style.display = 'none';
    }
    
    async loadAvailableModels() {
        try {
            const response = await fetch('http://localhost:3001/api/models');
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
            const response = await fetch(`http://localhost:3001/api/usage?sessionId=${this.sessionId}`);
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