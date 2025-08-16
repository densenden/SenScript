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
        this.cards = [];
        this.isLight = false;
        this.currentLang = 'de-DE';
        
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
            langCode: document.getElementById('langCode'),
            langConf: document.getElementById('langConf'),
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
            this.transcript += final;
            this.addTranscriptLine(final.trim());
            this.detectLanguage(final);
            
            // Create card if enough words
            const words = final.trim().split(' ');
            if (words.length >= 3) {
                console.log('[Cards] Creating card for:', final.trim());
                this.createCard(final.trim());
            }
        }
        
        // Update interim display
        this.currentInterim = interim;
        this.updateAnimatedTranscript();
    }
    
    detectLanguage(text) {
        const lower = text.toLowerCase();
        
        // Simple German detection
        const germanWords = /\b(der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber)\b/g;
        const germanCount = (lower.match(germanWords) || []).length;
        
        // Simple English detection
        const englishWords = /\b(the|and|is|are|was|were|have|has|can|will|to|of|in|for|with|that|this)\b/g;
        const englishCount = (lower.match(englishWords) || []).length;
        
        const totalWords = lower.split(/\s+/).length;
        
        if (totalWords > 0) {
            const germanConf = (germanCount / totalWords) * 100;
            const englishConf = (englishCount / totalWords) * 100;
            
            const newLang = germanConf > englishConf ? 'de-DE' : 'en-US';
            const conf = Math.max(germanConf, englishConf);
            
            if (conf > 10 && newLang !== this.currentLang) {
                console.log('[Language] Switching to:', newLang);
                this.currentLang = newLang;
                this.recognition.lang = newLang;
            }
            
            this.els.langCode.textContent = newLang === 'de-DE' ? 'DE' : 'EN';
            this.els.langConf.textContent = conf > 0 ? `${conf.toFixed(0)}%` : '';
        }
    }
    
    isTextWorthyOfCard(text) {
        const trimmed = text.trim().toLowerCase();
        
        // Too short or empty
        if (trimmed.length < 10) {
            console.log('[Filter] Text too short:', trimmed);
            return false;
        }
        
        // Incomplete sentences or fragments
        const incompletePatterns = [
            /^(eine|ein|der|die|das|und|oder|aber|ich|wir|du|sie|er|es)\s+(deutsche|englische|italienische|französische)\s+(oder|und)\s+(eine?|der|die|das)?$/,
            /^(a|an|the|and|or|but|i|we|you|they|he|she|it)\s+\w+\s+(or|and)\s+(a|an|the)?$/,
            /^(ja|nein|ok|okay|hmm|äh|eh|well|yes|no|um|uh)$/,
            /^\w{1,3}$/,  // Very short words
            /^[^a-zA-ZäöüÄÖÜß]*$/  // No actual letters
        ];
        
        for (const pattern of incompletePatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Incomplete/trivial text detected:', trimmed);
                return false;
            }
        }
        
        // Check for question words, technical terms, or explanatory content
        const worthyPatterns = [
            // Questions
            /\b(was|wie|wann|wo|wer|warum|welche|what|how|when|where|who|why|which|explain|define)\b/i,
            // Technical/business terms
            /\b(technologie|software|business|marketing|strategie|prozess|system|methode|technology|process|strategy|method|algorithm|framework)\b/i,
            // Explanatory content
            /\b(bedeutet|heißt|ist|sind|funktioniert|works|means|refers|indicates|involves|includes)\b/i,
            // Complex sentences with multiple clauses
            /.+[,;].+/,
            // Long descriptive content
            /.{30,}/
        ];
        
        for (const pattern of worthyPatterns) {
            if (pattern.test(trimmed)) {
                console.log('[Filter] Worthy content detected:', trimmed.substring(0, 50) + '...');
                return true;
            }
        }
        
        console.log('[Filter] Text not worthy of card:', trimmed);
        return false;
    }
    
    async createCard(text) {
        console.log('[Cards] Evaluating text for card creation:', text);
        
        // Pre-filter: Check if text is worthy of a card
        if (!this.isTextWorthyOfCard(text)) {
            console.log('[Cards] Text filtered out - no card created');
            return;
        }
        
        console.log('[Cards] Creating AI-powered card for worthy content');
        
        // Set AI status to processing
        this.setStatus('ai', 'yellow');
        
        try {
            // Call OpenAI API via our server
            const response = await fetch('/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcript: text,
                    language: this.currentLang
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
                this.createFallbackCard(text);
            }
        } catch (error) {
            console.error('[Cards] Error calling AI API:', error);
            this.createFallbackCard(text);
        }
    }
    
    createFallbackCard(text) {
        console.log('[Cards] Creating fallback card for:', text);
        
        const words = text.toLowerCase().split(' ');
        let category = 'Fact';
        let front = '';
        let back = text;
        
        // Simple pattern detection (fallback)
        if (words.some(w => ['was', 'wie', 'wann', 'wo', 'wer', 'what', 'how', 'when', 'where', 'who'].includes(w))) {
            category = 'Question';
            front = this.currentLang === 'de-DE' ? 'Frage aus Gespräch' : 'Question from conversation';
        } else if (words.some(w => ['ist', 'sind', 'bedeutet', 'is', 'are', 'means'].includes(w))) {
            category = 'Definition';
            front = this.currentLang === 'de-DE' ? 'Definition' : 'Definition';
        } else {
            category = 'Concept';
            front = this.currentLang === 'de-DE' ? 'Konzept' : 'Concept';
        }
        
        const card = {
            id: Date.now(),
            category,
            front,
            back,
            confidence: 50,
            source: 'Fallback',
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
        
        // Add confidence indicator and source
        const sourceCircle = card.source === 'AI' ? 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-left: 6px;"></span>' : 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #6b7280; border-radius: 50%; margin-left: 6px;"></span>';
        const confidenceText = card.confidence ? ` ${card.confidence}%` : '';
        
        cardEl.innerHTML = `
            <div class="card-header">${card.category} • ${card.time}${sourceCircle}${confidenceText}</div>
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