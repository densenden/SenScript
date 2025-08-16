// SenScript Chrome Web App
class SenScriptApp {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcriptChunks = [];
        this.flashcards = [];
        this.currentTranscript = '';
        
        this.initializeUI();
        this.initializeSpeechRecognition();
        this.checkSystemStatus();
        
        console.log('🎙️ SenScript Web App initialized');
    }

    initializeUI() {
        this.elements = {
            recordBtn: document.getElementById('recordBtn'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            transcriptDisplay: document.getElementById('transcriptDisplay'),
            cardsContainer: document.getElementById('cardsContainer'),
            cardsCount: document.getElementById('cardsCount'),
            speechStatus: document.getElementById('speechStatus'),
            aiStatus: document.getElementById('aiStatus'),
            micStatus: document.getElementById('micStatus'),
            exportBtn: document.getElementById('exportBtn')
        };

        // Event listeners
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.elements.exportBtn.addEventListener('click', () => this.exportCards());

        console.log('✅ UI initialized');
    }

    async initializeSpeechRecognition() {
        console.log('🔧 Initializing speech recognition...');
        
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition not supported');
            this.updateStatus('speech', 'offline');
            return;
        }

        console.log('✅ Speech recognition supported');
        this.updateStatus('speech', 'online');

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            // Event handlers
            this.recognition.onstart = () => {
                console.log('🎤 Recording started');
                this.isRecording = true;
                this.updateRecordingUI(true);
            };

            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };

            this.recognition.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);
                this.handleSpeechError(event);
            };

            this.recognition.onend = () => {
                console.log('⏹️ Recording ended');
                this.isRecording = false;
                this.updateRecordingUI(false);
                
                // Auto-restart if we expect to be recording
                if (this.shouldBeRecording) {
                    setTimeout(() => this.startRecording(), 100);
                }
            };

            console.log('✅ Speech recognition configured');
        } catch (error) {
            console.error('❌ Error setting up speech recognition:', error);
            this.updateStatus('speech', 'offline');
        }
    }

    async checkSystemStatus() {
        console.log('🔍 Checking system status...');

        // Check microphone access
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microphone access granted');
            this.updateStatus('mic', 'online');
            
            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('❌ Microphone access denied:', error);
            this.updateStatus('mic', 'offline');
        }

        // Check AI API (mock for now)
        // In a real implementation, you'd check if OpenAI API key is configured
        this.updateStatus('ai', 'online');
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        console.log('🔴 Starting recording...');
        
        if (!this.recognition) {
            console.error('❌ Speech recognition not available');
            return;
        }

        try {
            this.shouldBeRecording = true;
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error starting recording:', error);
            this.handleSpeechError({ error: 'start-failed' });
        }
    }

    stopRecording() {
        console.log('⏹️ Stopping recording...');
        
        this.shouldBeRecording = false;
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    handleSpeechResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        // Update current transcript
        if (finalTranscript) {
            this.currentTranscript += finalTranscript;
            this.processTranscriptForCards(finalTranscript.trim());
        }

        // Update UI with latest text
        const displayText = (this.currentTranscript + interimTranscript).trim();
        this.updateTranscriptDisplay(displayText);

        console.log('📝 Transcript update:', { finalTranscript, interimTranscript });
    }

    handleSpeechError(event) {
        console.error('❌ Speech error:', event.error);
        
        let errorMessage = 'Recording error occurred';
        
        switch (event.error) {
            case 'network':
                errorMessage = 'Network connection required';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone access denied';
                this.updateStatus('mic', 'offline');
                break;
            case 'no-speech':
                errorMessage = 'No speech detected';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not working';
                this.updateStatus('mic', 'offline');
                break;
        }

        this.elements.statusText.textContent = errorMessage;
        this.updateStatus('speech', 'offline');
    }

    updateTranscriptDisplay(text) {
        if (!text) {
            this.elements.transcriptDisplay.innerHTML = `
                <div class="transcript-placeholder">
                    <div class="pulse-indicator"></div>
                    <span>Listening for speech...</span>
                </div>
            `;
            return;
        }

        // Split into lines for better display
        const words = text.split(' ');
        const maxWordsPerLine = 6;
        
        let currentLine = '';
        let previousLine = '';

        if (words.length <= maxWordsPerLine) {
            currentLine = text;
        } else {
            const recentWords = words.slice(-maxWordsPerLine);
            const previousWords = words.slice(-maxWordsPerLine * 2, -maxWordsPerLine);
            
            currentLine = recentWords.join(' ');
            previousLine = previousWords.join(' ');
        }

        this.elements.transcriptDisplay.innerHTML = `
            <div class="transcript-text">
                ${previousLine ? `<div class="transcript-line previous-line">${previousLine}</div>` : ''}
                <div class="transcript-line current-line">${currentLine}</div>
            </div>
        `;
    }

    async processTranscriptForCards(text) {
        console.log('🤖 Processing transcript for cards:', text);

        // Mock AI card generation for now
        // In real implementation, this would call OpenAI API
        if (text.length > 20) {
            const mockCard = this.generateMockCard(text);
            this.addFlashcard(mockCard);
        }
    }

    generateMockCard(text) {
        // Simple mock card generation based on transcript
        const cardTypes = ['fact', 'definition', 'concept', 'process'];
        const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        
        return {
            id: Date.now().toString(),
            front: `What was mentioned about "${text.split(' ').slice(0, 3).join(' ')}"?`,
            back: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            category: cardType,
            timestamp: Date.now()
        };
    }

    addFlashcard(card) {
        this.flashcards.push(card);
        this.updateCardsDisplay();
        this.elements.exportBtn.disabled = false;
        
        console.log('🃏 Added flashcard:', card);
    }

    updateCardsDisplay() {
        const count = this.flashcards.length;
        this.elements.cardsCount.textContent = `${count} card${count !== 1 ? 's' : ''}`;

        if (count === 0) {
            this.elements.cardsContainer.innerHTML = `
                <div class="cards-placeholder">
                    <div class="cards-icon">🃏</div>
                    <span>Flashcards will appear as AI analyzes your transcript</span>
                </div>
            `;
            return;
        }

        // Show recent cards (last 3)
        const recentCards = this.flashcards.slice(-3);
        
        this.elements.cardsContainer.innerHTML = recentCards.map(card => `
            <div class="flashcard" data-card-id="${card.id}">
                <div class="card-header">
                    <span class="card-category">${card.category}</span>
                </div>
                <div class="card-content">
                    <div class="card-front">${card.front}</div>
                    <div class="card-back">${card.back}</div>
                </div>
            </div>
        `).join('');
    }

    updateRecordingUI(isRecording) {
        const btn = this.elements.recordBtn;
        const dot = this.elements.statusDot;
        const text = this.elements.statusText;

        if (isRecording) {
            btn.classList.add('recording');
            btn.querySelector('.record-text').textContent = 'Stop';
            dot.classList.add('recording');
            text.textContent = 'Recording...';
        } else {
            btn.classList.remove('recording');
            btn.querySelector('.record-text').textContent = 'Start';
            dot.classList.remove('recording');
            text.textContent = 'Ready';
        }
    }

    updateStatus(service, status) {
        const statusElement = this.elements[service + 'Status'];
        if (statusElement) {
            statusElement.className = `status-indicator ${status}`;
        }
        
        console.log(`📊 Status update: ${service} = ${status}`);
    }

    exportCards() {
        if (this.flashcards.length === 0) return;

        const data = {
            cards: this.flashcards,
            exportedAt: new Date().toISOString(),
            totalCards: this.flashcards.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senscript-cards-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('💾 Cards exported:', this.flashcards.length);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.senscript = new SenScriptApp();
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});