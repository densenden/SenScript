/**
 * Language Detection Utilities
 */

class LanguageDetection {
    static detectLanguage(text) {
        const lower = text.toLowerCase();
        
        // German indicators
        const germanScore = (lower.match(/\b(der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber|wie|was)\b/g) || []).length;
        
        // English indicators  
        const englishScore = (lower.match(/\b(the|and|is|are|of|to|in|that|have|for|not|with|you|this|but|his|from|they|we|been|how|what)\b/g) || []).length;
        
        // French indicators
        const frenchScore = (lower.match(/\b(le|la|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus)\b/g) || []).length;
        
        if (germanScore > englishScore && germanScore > frenchScore) {
            return { lang: 'de-DE', confidence: germanScore, flag: '🇩🇪' };
        } else if (frenchScore > englishScore && frenchScore > germanScore) {
            return { lang: 'fr-FR', confidence: frenchScore, flag: '🇫🇷' };
        } else {
            return { lang: 'en-US', confidence: englishScore, flag: '🇺🇸' };
        }
    }
}

window.LanguageDetection = LanguageDetection;