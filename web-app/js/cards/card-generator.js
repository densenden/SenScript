/**
 * Card Generator Module
 * Handles AI-powered card generation
 */

class CardGenerator {
    constructor(app) {
        this.app = app;
    }
    
    async generateFromText(text) {
        // This would integrate with actual AI services
        console.log('[CardGenerator] Generating card from:', text.substring(0, 50) + '...');
        
        // Mock implementation
        return {
            front: this.extractQuestion(text),
            back: this.extractAnswer(text),
            type: 'concept',
            confidence: 0.8
        };
    }
    
    extractQuestion(text) {
        const sentences = text.split(/[.!?]+/);
        for (const sentence of sentences) {
            if (sentence.includes('what') || sentence.includes('how') || sentence.includes('why')) {
                return sentence.trim() + '?';
            }
        }
        
        const words = text.split(' ').slice(0, 8);
        return `What about ${words.join(' ')}?`;
    }
    
    extractAnswer(text) {
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
}

window.CardGenerator = CardGenerator;