/**
 * Card Engine Module
 * Handles AI-powered flashcard generation
 */

class CardEngine {
    constructor(app) {
        this.app = app;
        this.recentTexts = new Set();
        this.duplicateTimeout = 10000; // 10 seconds
        
        this.initialize();
    }
    
    initialize() {
        console.log('[CardEngine] Initializing card engine...');
        // Card engine initialized
    }
    
    processText(text) {
        // Check if text is worthy of card generation
        if (!this.isTextWorthyOfCard(text)) {
            return;
        }
        
        // Prevent duplicates
        if (this.recentTexts.has(text)) {
            console.log('[CardEngine] Skipping duplicate text');
            return;
        }
        
        // Add to recent texts and remove after timeout
        this.recentTexts.add(text);
        setTimeout(() => this.recentTexts.delete(text), this.duplicateTimeout);
        
        // Generate card
        this.generateCard(text);
    }
    
    isTextWorthyOfCard(text) {
        // Basic criteria for card worthiness
        if (!text || text.length < 10) return false;
        if (text.split(' ').length < 3) return false;
        
        // Check for educational signals
        const educationalKeywords = [
            'define', 'explain', 'what is', 'how does', 'why', 'because',
            'example', 'such as', 'including', 'means', 'refers to'
        ];
        
        const lowerText = text.toLowerCase();
        return educationalKeywords.some(keyword => lowerText.includes(keyword));
    }
    
    async generateCard(text) {
        try {
            console.log('[CardEngine] Generating card for:', text.substring(0, 50) + '...');
            
            // Mock card generation (replace with actual AI integration)
            const card = {
                id: Date.now() + Math.random(),
                type: 'concept',
                front: this.extractQuestion(text),
                back: this.extractAnswer(text),
                source: text,
                timestamp: Date.now(),
                confidence: 0.8
            };
            
            // Add to cards array
            this.app.cards.push(card);
            
            // Update UI
            this.updateCardsDisplay();
            
            console.log('[CardEngine] Card generated successfully');
            
        } catch (error) {
            console.error('[CardEngine] Failed to generate card:', error);
        }
    }
    
    extractQuestion(text) {
        // Simple question extraction
        const sentences = text.split(/[.!?]+/);
        for (const sentence of sentences) {
            if (sentence.includes('what') || sentence.includes('how') || sentence.includes('why')) {
                return sentence.trim() + '?';
            }
        }
        
        // Fallback: create question from first meaningful phrase
        const words = text.split(' ').slice(0, 8);
        return `What about ${words.join(' ')}?`;
    }
    
    extractAnswer(text) {
        // Simple answer extraction
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    updateCardsDisplay() {
        if (!this.app.els.cardsContainer) return;
        
        // Update card count
        if (this.app.els.cardCount) {
            this.app.els.cardCount.textContent = this.app.cards.length;
        }
        
        // Render cards (simplified)
        const cardsHtml = this.app.cards.map(card => `
            <div class="card" data-id="${card.id}">
                <div class="card-front">${card.front}</div>
                <div class="card-back">${card.back}</div>
            </div>
        `).join('');
        
        this.app.els.cardsContainer.innerHTML = cardsHtml;
    }
    
    // Test functions
    runCardGenerationTests() {
        console.log('🧪 Running card generation tests...');
        
        if (!window.TestTranscripts) {
            console.error('❌ TestTranscripts not loaded');
            return;
        }
        
        const testTexts = window.TestTranscripts.getValidTestTranscripts();
        
        testTexts.forEach((test, index) => {
            setTimeout(() => {
                console.log(`🧪 Test ${index + 1}:`, test.text.substring(0, 50) + '...');
                this.processText(test.text);
            }, index * 1000);
        });
        
        console.log(`✅ Started ${testTexts.length} card generation tests`);
    }
    
    runCheatCardTests() {
        console.log('🎯 Running CheatCard tests...');
        // Implement CheatCard specific tests
        this.runCardGenerationTests(); // For now, use same tests
    }
    
    resetAllCaches() {
        console.log('♻️ Resetting all caches...');
        this.recentTexts.clear();
        this.app.cards = [];
        this.updateCardsDisplay();
    }
    
    getStats() {
        return {
            totalCards: this.app.cards.length,
            recentTextsCount: this.recentTexts.size,
            lastCardTimestamp: this.app.cards.length > 0 
                ? this.app.cards[this.app.cards.length - 1].timestamp 
                : null
        };
    }
}

window.CardEngine = CardEngine;