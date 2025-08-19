// SenScript - Simple Working Version
class SenScript {
    constructor() {
        console.log('[SenScript] Initializing...');
        
        this.recognition = null;
        this.isRecording = false;
        this.shouldBeRecording = false;
        this.transcript = '';
        this.transcriptLines = [];
        this.currentInterim = '';
        this.pendingSentence = '';  // Accumulate blocks into sentences
        this.cards = [];
        this.isLight = false;
        this.currentLang = 'de-DE';
        this.lastSentenceProcessed = 0;  // Timestamp of last sentence processing
        
        this.init();
    }
    
    init() {
        console.log('[SenScript] Setting up UI...');
        
        // Get elements
        this.els = {
            recordBtn: document.getElementById('recordBtn'),
            recordDot: document.getElementById('recordDot'),
            recordText: document.getElementById('recordText'),
            transcript: document.getElementById('transcript'),
            cardsContainer: document.getElementById('cardsContainer'),
            cardCount: document.getElementById('cardCount'),
            themeBtn: document.getElementById('themeBtn'),
            themeCircle: document.getElementById('themeCircle'),
            exportBtn: document.getElementById('exportBtn'),
            audioSource: document.getElementById('audioSource'),
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
            audioStatus: document.getElementById('audioStatus')
        };
        
        // Add event listeners
        this.els.recordBtn.onclick = () => {
            console.log('[UI] Record button clicked');
            this.toggleRecording();
        };
        
        this.els.themeBtn.onclick = () => {
            console.log('[UI] Theme button clicked');
            this.toggleTheme();
        };
        
        this.els.exportBtn.onclick = () => {
            this.exportCards();
        };
        
        this.els.audioSource.onchange = () => {
            console.log('[UI] Audio source changed');
            this.handleSourceChange();
        };
        
        this.setupSpeechRecognition();
        this.checkMicrophone();
        
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
        this.recognition.lang = this.currentLang;
        
        this.recognition.onstart = () => {
            console.log('[Speech] Started');
            this.isRecording = true;
            this.updateRecordingUI();
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[Speech] Error:', event.error);
        };
        
        this.recognition.onend = () => {
            console.log('[Speech] Ended');
            this.isRecording = false;
            this.updateRecordingUI();
            
            if (this.shouldBeRecording) {
                setTimeout(() => {
                    console.log('[Speech] Restarting...');
                    this.recognition.start();
                }, 100);
            }
        };
        
        this.setStatus('speech', 'green');
        console.log('[Speech] Ready');
    }
    
    handleSpeechResult(event) {
        let final = '';
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            
            if (result.isFinal) {
                final += text + ' ';
                console.log('[Speech] Final:', text);
            } else {
                interim += text;
            }
        }
        
        if (final.trim()) {
            // Add to pending sentence accumulation
            this.pendingSentence += final;
            this.transcript += final;
            this.addTranscriptLine(final.trim());
            
            // Check for sentence boundaries
            this.processPendingSentence();
        }
        
        // Update interim display
        this.currentInterim = interim;
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
        // Check for sentence boundaries
        const sentenceEnders = /[.!?]\s+/;
        const sentences = this.pendingSentence.split(sentenceEnders);
        
        // Process complete sentences
        if (sentences.length > 1) {
            for (let i = 0; i < sentences.length - 1; i++) {
                const sentence = sentences[i].trim();
                if (sentence.length > 10) {
                    console.log('[Sentence] Processing complete sentence:', sentence);
                    this.processCompleteSentence(sentence);
                }
            }
            // Keep the last incomplete part
            this.pendingSentence = sentences[sentences.length - 1];
        }
        
        // Also process if pending sentence is getting long (fallback)
        if (this.pendingSentence.length > 200) {
            console.log('[Sentence] Processing long pending sentence:', this.pendingSentence.substring(0, 50) + '...');
            this.processCompleteSentence(this.pendingSentence.trim());
            this.pendingSentence = '';
        }
    }
    
    processCompleteSentence(sentence) {
        // Detect language for this specific sentence
        const detection = this.detectLanguageForText(sentence);
        
        // Update global language for speech recognition if confidence is high
        if (detection.confidence > 20 && detection.lang !== this.currentLang) {
            console.log('[Language] Switching speech recognition to:', detection.lang);
            this.currentLang = detection.lang;
            this.recognition.lang = detection.lang;
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
        
        // Create card if sentence is worthy
        if (this.isTextWorthyOfCard(sentence)) {
            console.log('[Cards] Creating card for sentence:', sentence.substring(0, 50) + '...');
            this.createCard(sentence, detection);
        }
    }
    
    detectLanguage(text) {
        const detection = this.detectLanguageForText(text);
        
        // Update global language for speech recognition if confidence is high
        if (detection.confidence > 20 && detection.lang !== this.currentLang) {
            console.log('[Language] Switching speech recognition to:', detection.lang);
            this.currentLang = detection.lang;
            this.recognition.lang = detection.lang;
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
        const trimmed = text.trim().toLowerCase();
        
        // Too short or empty
        if (trimmed.length < 15) {
            console.log('[Filter] Text too short:', trimmed);
            return false;
        }
        
        // Incomplete sentences or fragments
        const incompletePatterns = [
            /^(eine|ein|der|die|das|und|oder|aber|ich|wir|du|sie|er|es)\s+(deutsche|englische|italienische|französische)\s+(oder|und)\s+(eine?|der|die|das)?$/,
            /^(a|an|the|and|or|but|i|we|you|they|he|she|it)\s+\w+\s+(or|and)\s+(a|an|the)?$/,
            /^(ja|nein|ok|okay|hmm|äh|eh|well|yes|no|um|uh|mhm|ähem)$/i,
            /^\w{1,4}$/,  // Very short words
            /^[^a-zA-ZäöüÄÖÜß]*$/,  // No actual letters
            /^(heute|morgen|gestern|now|today|tomorrow|yesterday)\s*$/i  // Time references only
        ];
        
        for (const pattern of incompletePatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Incomplete/trivial text detected:', trimmed);
                return false;
            }
        }
        
        // Check for specific content types that deserve cards
        const questionPatterns = [
            /\b(was bedeutet|what does|wie funktioniert|how does|warum|why|wie|how|wann|when|wo|where|wer|who|welche|which)\b/i,
            /\?\s*$/,  // Ends with question mark
            /(fragt|asks|frage|question):/i  // Someone asks
        ];
        
        const technicalPatterns = [
            /\b(quanten|quantum|superposition|verschränkung|entanglement|heisenberg|wellenfunktion|wave function|interferenz|interference|teilchen|particle|unschärfe|uncertainty)\b/i,
            /\b(technologie|technology|software|algorithm|framework|methode|method|prozess|process|system|strategie|strategy|business|marketing)\b/i,
            /\b(professor|doktor|dr\.|phd|wissenschaft|science|forschung|research|studie|study|experiment|analyse|analysis)\b/i
        ];
        
        const definitionPatterns = [
            /\b(definiere|define|erkläre|explain|bedeutet|means|ist\s+(ein|eine|der|die|das)|is\s+(a|an|the))\b/i,
            /\b(bezeichnet|refers\s+to|nennt\s+man|called|heißt|named)\b/i
        ];
        
        const conceptPatterns = [
            /\b(behandeln|discuss|besprechen|talk\s+about|analysieren|analyze|untersuchen|examine|betrachten|consider)\b/i,
            /.+[,;].+/,  // Complex sentences with multiple clauses
            /.{50,}/     // Long descriptive content
        ];
        
        // Check for questions first
        for (const pattern of questionPatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Question detected:', trimmed.substring(0, 50) + '...');
                return true;
            }
        }
        
        // Check for technical terms
        for (const pattern of technicalPatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Technical content detected:', trimmed.substring(0, 50) + '...');
                return true;
            }
        }
        
        // Check for definitions
        for (const pattern of definitionPatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Definition detected:', trimmed.substring(0, 50) + '...');
                return true;
            }
        }
        
        // Check for complex concepts
        for (const pattern of conceptPatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Concept detected:', trimmed.substring(0, 50) + '...');
                return true;
            }
        }
        
        console.log('[Filter] Text not worthy of card:', trimmed.substring(0, 50) + '...');
        return false;
    }
    
    async createCard(text, detection = null) {
        console.log('[Cards] Evaluating text for card creation:', text);
        
        // Pre-filter: Check if text is worthy of a card
        if (!this.isTextWorthyOfCard(text)) {
            console.log('[Cards] Text filtered out - no card created');
            return;
        }
        
        // Use provided detection or detect language for this text
        const textLanguage = detection || this.detectLanguageForText(text);
        console.log(`[Cards] Creating AI-powered card in ${textLanguage.lang} ${textLanguage.flag || ''} (${textLanguage.confidence}% confidence)`);
        
        // Set AI status to processing
        this.setStatus('ai', 'yellow');
        
        try {
            // Call OpenAI API via our server with text-specific language
            const response = await fetch('/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcript: text,
                    language: textLanguage.lang,
                    textConfidence: textLanguage.confidence,
                    languageFlag: textLanguage.flag
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Create card from AI response
                const card = {
                    id: Date.now(),
                    category: result.card.category,
                    front: result.card.front,
                    back: result.card.back,
                    confidence: result.card.confidence || 0,
                    source: 'AI',
                    language: textLanguage.lang,
                    flag: textLanguage.flag,
                    time: new Date().toLocaleTimeString()
                };
                
                this.cards.push(card);
                this.renderCard(card);
                this.updateCardCount();
                this.els.exportBtn.disabled = false;
                this.setStatus('ai', 'green');
                
                console.log('[Cards] AI card created:', card.category, `(${card.confidence}% confidence)`);
            } else {
                console.warn('[Cards] AI generation failed, using fallback');
                this.createFallbackCard(text, textLanguage);
            }
        } catch (error) {
            console.error('[Cards] Error calling AI API:', error);
            this.createFallbackCard(text, textLanguage);
        }
    }
    
    createFallbackCard(text, detection = null) {
        console.log('[Cards] Creating fallback card for:', text);
        
        const textLanguage = detection || this.detectLanguageForText(text);
        const words = text.toLowerCase().split(' ');
        let category = 'Fact';
        let front = '';
        let back = text;
        
        // Simple pattern detection (fallback)
        if (words.some(w => ['was', 'wie', 'wann', 'wo', 'wer', 'what', 'how', 'when', 'where', 'who'].includes(w))) {
            category = 'Question';
            front = textLanguage.lang === 'de-DE' ? 'Frage aus Gespräch' : 'Question from conversation';
        } else if (words.some(w => ['ist', 'sind', 'bedeutet', 'is', 'are', 'means'].includes(w))) {
            category = 'Definition';
            front = textLanguage.lang === 'de-DE' ? 'Definition' : 'Definition';
        } else {
            category = 'Concept';
            front = textLanguage.lang === 'de-DE' ? 'Konzept' : 'Concept';
        }
        
        const card = {
            id: Date.now(),
            category,
            front,
            back,
            confidence: 50,
            source: 'Fallback',
            language: textLanguage.lang,
            flag: textLanguage.flag,
            time: new Date().toLocaleTimeString()
        };
        
        this.cards.push(card);
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
            <div class="card-header">${card.category}${languageFlag} • ${card.time}${sourceCircle}${confidenceText}</div>
            <div class="card-front">${card.front}</div>
            <div class="card-back">${card.back}</div>
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
    
    addTranscriptLine(text) {
        const lineData = {
            id: Date.now(),
            text: text,
            timestamp: new Date()
        };
        
        this.transcriptLines.push(lineData);
        
        // Keep max 4 lines for smooth animation
        if (this.transcriptLines.length > 4) {
            this.transcriptLines.shift();
        }
        
        console.log('[Transcript] Added line:', text);
    }
    
    updateAnimatedTranscript() {
        if (!this.isRecording && this.transcriptLines.length === 0) {
            this.els.transcript.innerHTML = '<div class="transcript-line current">Click "Start" to begin...</div>';
            return;
        }
        
        let html = '';
        
        // Render stored lines with different states
        this.transcriptLines.forEach((line, index) => {
            const isLast = index === this.transcriptLines.length - 1;
            const isPrevious = index === this.transcriptLines.length - 2;
            
            let className = 'transcript-line';
            if (isLast && !this.currentInterim) {
                className += ' current';
            } else if (isPrevious) {
                className += ' previous';
            } else {
                className += ' old';
            }
            
            const animatedText = this.animateTextLetters(line.text);
            html += `<div class="${className}">${animatedText}</div>`;
        });
        
        // Add interim text with sound wave animation
        if (this.currentInterim.trim()) {
            const animatedInterim = this.animateTextLetters(this.currentInterim, true);
            html += `<div class="transcript-line current transcript-interim">${animatedInterim}</div>`;
        }
        
        this.els.transcript.innerHTML = html;
    }
    
    animateTextLetters(text, isInterim = false) {
        return text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            
            const delay = (index * 0.05).toFixed(2);
            const className = isInterim ? 'transcript-letter' : '';
            const style = isInterim ? `--delay: ${delay}s` : '';
            
            return `<span class="${className}" style="${style}">${char}</span>`;
        }).join('');
    }
    
    updateTranscript(text) {
        // Legacy method - now handled by updateAnimatedTranscript
        this.updateAnimatedTranscript();
    }
    
    toggleRecording() {
        console.log('[Control] Toggle recording. Current:', this.isRecording);
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        console.log('[Control] Starting...');
        
        if (!this.recognition) {
            console.error('[Control] No recognition available');
            return;
        }
        
        const source = this.els.audioSource.value;
        
        if (source === 'system') {
            this.startSystemAudio();
        } else {
            this.startMicrophone();
        }
    }
    
    async startMicrophone() {
        console.log('[Audio] Starting microphone...');
        
        try {
            this.shouldBeRecording = true;
            this.recognition.start();
        } catch (error) {
            console.error('[Audio] Microphone error:', error);
        }
    }
    
    async startSystemAudio() {
        console.log('[Audio] Starting system audio...');
        
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: false
            });
            
            console.log('[Audio] Got system audio stream');
            this.systemStream = stream;
            
            this.shouldBeRecording = true;
            this.recognition.start();
        } catch (error) {
            console.error('[Audio] System audio error:', error);
            // Fallback to microphone
            await this.startMicrophone();
        }
    }
    
    stopRecording() {
        console.log('[Control] Stopping...');
        
        this.shouldBeRecording = false;
        
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
        
        if (this.systemStream) {
            this.systemStream.getTracks().forEach(track => track.stop());
            this.systemStream = null;
        }
    }
    
    updateRecordingUI() {
        if (this.isRecording) {
            this.els.recordDot.classList.add('pulse');
            this.els.recordText.textContent = 'Stop';
        } else {
            this.els.recordDot.classList.remove('pulse');
            this.els.recordText.textContent = 'Start';
        }
    }
    
    handleSourceChange() {
        if (this.isRecording) {
            this.stopRecording();
            setTimeout(() => this.startRecording(), 100);
        }
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
        a.download = `senscript-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('[Export] Exported', this.cards.length, 'cards');
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