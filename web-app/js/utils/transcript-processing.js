/**
 * Transcript Processing Utilities
 */

class TranscriptProcessing {
    static splitIntoSentences(text) {
        // Split by sentence ending punctuation
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }
    
    static cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s.,!?-]/g, '')
            .trim();
    }
    
    static isValidSentence(text) {
        return text.length > 10 && text.split(' ').length > 3;
    }
}

window.TranscriptProcessing = TranscriptProcessing;