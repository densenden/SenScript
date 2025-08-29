/**
 * Card Generator Module - Full AI-Powered Implementation
 * Restored from legacy app.js with CheatCard vs FlashCard modes
 */

class CardGenerator {
    constructor(app) {
        this.app = app;
        this.sessionId = this.generateSessionId();
    }
    
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }
    
    async generateFromText(text, isCheatMode = false, detection = null) {
        console.log(`🎯 [CardGenerator] Generating ${isCheatMode ? 'CheatCard' : 'FlashCard'} from:`, text.substring(0, 50) + '...');
        
        // Use provided detection or detect language for proper card generation
        const detectedLanguage = detection || this.detectLanguage(text);
        console.log('🌐 [CardGenerator] Language info:', detectedLanguage);
        
        // Get output language settings
        const { outputLanguage, outputFlag } = this.getOutputLanguage(detectedLanguage);
        
        // Set AI status to processing
        this.setStatus('ai', 'yellow');
        
        try {
            // Create payload based on mode
            const queryPayload = {
                sessionId: this.sessionId,
                transcript: text,
                language: outputLanguage,
                textConfidence: detectedLanguage.confidence,
                languageFlag: outputFlag,
                cardMode: isCheatMode ? 'cheat' : 'flash', // Fixed parameter name to match server
                cardType: isCheatMode ? 'tip' : 'concept'
            };
            
            console.log('📤 [CardGenerator] Sending API request:', queryPayload);
            
            const startTime = Date.now();
            const response = await fetch('/api/generate-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryPayload)
            });
            
            const responseTime = Date.now() - startTime;
            console.log(`⏱️ [CardGenerator] Response received in ${responseTime}ms, status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📥 [CardGenerator] API response:', result);
            
            // Handle different response types
            if (result.success === false) {
                console.log('🚫 [CardGenerator] API returned success=false:', result.reason || 'No reason provided');
                this.setStatus('ai', 'yellow');
                return null;
            }
            
            if (result.skip === true) {
                console.log('⏭️ [CardGenerator] Content skipped by AI:', result.reason || 'No reason provided');
                this.setStatus('ai', 'yellow');
                return null;
            }
            
            // Extract card data from API response
            let cardData = result.card || result;
            
            if (!cardData || (!cardData.front && !cardData.question)) {
                console.error('❌ [CardGenerator] Invalid card data structure:', cardData);
                throw new Error('Invalid card data received from API');
            }
            
            // Get provider from the card data itself (should be included by LLM conversation)
            const actualProvider = cardData.provider || result.provider || 'unknown';
            
            // Create card object with proper legacy format
            const card = {
                id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                category: cardData.category || this.determineCategory(cardData, isCheatMode),
                front: cardData.front || cardData.question || 'No question',
                back: cardData.back || cardData.answer || 'No answer',
                confidence: parseInt(cardData.confidence) || 75,
                skip: false,
                provider: actualProvider,
                cardType: isCheatMode ? 'cheat' : 'flash',
                source: 'card-engine',
                language: outputLanguage,
                flag: outputFlag,
                timestamp: new Date().toLocaleTimeString(),
                originalText: text.substring(0, 150),
                time: new Date().toLocaleTimeString()
            };
            
            console.log(`🃏 [CardGenerator] ${isCheatMode ? 'CheatCard' : 'FlashCard'} created:`, card);
            this.setStatus('ai', 'green');
            
            return card;
            
        } catch (error) {
            console.error('💥 [CardGenerator] Card generation failed:', error);
            console.error('🔍 [CardGenerator] Error details:', {
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3),
                text: text.substring(0, 50),
                timestamp: Date.now()
            });
            
            this.setStatus('ai', 'red');
            
            // Fallback to local generation
            return this.generateFallbackCard(text, isCheatMode, outputLanguage, outputFlag);
        }
    }
    
    determineCategory(cardData, isCheatMode) {
        if (isCheatMode) {
            // CheatCard categories
            if (cardData.category) return cardData.category;
            
            const text = (cardData.front + ' ' + cardData.back).toLowerCase();
            
            if (text.includes('meeting') || text.includes('negotiate')) {
                return 'MEETING TIP';
            } else if (text.includes('present') || text.includes('speaking')) {
                return 'PRESENTATION TIP';
            } else if (text.includes('interview') || text.includes('job')) {
                return 'INTERVIEW TIP';
            } else if (text.includes('quick') || text.includes('tip')) {
                return 'QUICK WIN';
            } else if (text.includes('avoid') || text.includes('don\'t')) {
                return 'AVOID THIS';
            } else if (text.includes('say') || text.includes('phrase')) {
                return 'WHAT TO SAY';
            } else {
                return 'KEY FACTS';
            }
        } else {
            // FlashCard categories
            return cardData.category || cardData.type || 'CONCEPT';
        }
    }
    
    generateFallbackCard(text, isCheatMode, outputLanguage, outputFlag) {
        console.log(`🔄 [CardGenerator] Generating fallback ${isCheatMode ? 'CheatCard' : 'FlashCard'}`);
        
        const words = text.toLowerCase().split(' ');
        let category, front, back;
        
        if (isCheatMode) {
            // CheatCard fallback logic
            if (words.some(w => ['tip', 'trick', 'advice', 'suggestion'].includes(w))) {
                category = 'QUICK WIN';
                front = this.extractTipTitle(text);
                back = this.extractTipContent(text);
            } else if (words.some(w => ['avoid', 'don\'t', 'never', 'stop'].includes(w))) {
                category = 'AVOID THIS';
                front = 'What to avoid:';
                back = text.length > 120 ? text.substring(0, 120) + '...' : text;
            } else {
                category = 'KEY FACTS';
                front = 'Important point:';
                back = text.length > 120 ? text.substring(0, 120) + '...' : text;
            }
        } else {
            // FlashCard fallback logic (from legacy app.js)
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
            
            if (sentences.length >= 2) {
                category = 'CONCEPT';
                front = sentences[0].trim().length > 80 ? 
                    sentences[0].trim().substring(0, 80) + '...' : sentences[0].trim();
                back = sentences.slice(1).join('. ').trim();
                if (back.length > 150) back = back.substring(0, 150) + '...';
            } else if (words.some(w => ['ist', 'sind', 'bedeutet', 'is', 'are', 'means', 'called'].includes(w))) {
                category = 'DEFINITION';
                const defIndex = text.toLowerCase().search(/(ist|sind|bedeutet|is|are|means|called)/);
                if (defIndex > 5) {
                    front = text.substring(0, defIndex).trim();
                    back = text.substring(defIndex).trim();
                    if (back.length > 120) back = back.substring(0, 120) + '...';
                } else {
                    front = outputLanguage === 'de-DE' ? 'Was wurde erklärt?' : 'What was explained?';
                    back = text.length > 120 ? text.substring(0, 120) + '...' : text;
                }
            } else {
                category = 'FACT';
                front = outputLanguage === 'de-DE' ? 'Wichtige Information:' : 'Key Information:';
                back = text.length > 120 ? text.substring(0, 120) + '...' : text;
            }
        }
        
        const card = {
            id: Date.now() + Math.random(),
            cardType: isCheatMode ? 'cheat' : 'flash',
            category,
            type: isCheatMode ? 'tip' : 'concept',
            front,
            back,
            confidence: 30, // Lower confidence for fallback
            source: 'Fallback',
            language: outputLanguage,
            flag: outputFlag,
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString()
        };
        
        console.log(`🔄 [CardGenerator] Fallback ${isCheatMode ? 'CheatCard' : 'FlashCard'} created:`, card);
        return card;
    }
    
    extractTipTitle(text) {
        const sentences = text.split(/[.!?]+/);
        return sentences[0].trim().length > 60 ? 
            sentences[0].trim().substring(0, 60) + '...' : sentences[0].trim();
    }
    
    extractTipContent(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length > 1 ? 
            sentences.slice(1).join('. ').trim() : 
            text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    detectLanguage(text) {
        if (window.LanguageDetection) {
            return window.LanguageDetection.detectLanguage(text);
        }
        
        // Fallback detection
        const lowerText = text.toLowerCase();
        const germanWords = (lowerText.match(/\\b(der|die|das|und|ist|sind|ich|wir|ein|eine|zu|von|mit|auf|nicht|auch|kann|aber|wie|was)\\b/g) || []).length;
        const englishWords = (lowerText.match(/\\b(the|and|is|are|of|to|in|that|have|for|not|with|you|this|but|his|from|they|we|been|how|what)\\b/g) || []).length;
        
        if (germanWords > englishWords) {
            return { lang: 'de-DE', confidence: germanWords, flag: '🇩🇪' };
        } else {
            return { lang: 'en-US', confidence: englishWords, flag: '🇺🇸' };
        }
    }
    
    getOutputLanguage(detectedLanguage) {
        // Check app settings for output language preference
        if (this.app.settings && !this.app.settings.autoLanguage) {
            // Use fixed output language
            const outputLanguage = this.app.settings.cardOutputLanguage || 'en-US';
            const flagMap = {
                'de-DE': '🇩🇪', 'en-US': '🇺🇸', 'fr-FR': '🇫🇷', 'es-ES': '🇪🇸',
                'it-IT': '🇮🇹', 'pt-PT': '🇵🇹', 'nl-NL': '🇳🇱', 'ru-RU': '🇷🇺'
            };
            const outputFlag = flagMap[outputLanguage] || '🌐';
            
            return { outputLanguage, outputFlag };
        } else {
            // Use auto-detected language
            return {
                outputLanguage: detectedLanguage.lang,
                outputFlag: detectedLanguage.flag
            };
        }
    }
    
    setStatus(type, status) {
        // Update UI status indicator if it exists
        const statusElement = document.querySelector(`.status-${type}`);
        if (statusElement) {
            statusElement.className = `status-${type} status-${status}`;
        }
    }
}

window.CardGenerator = CardGenerator;