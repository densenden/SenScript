/**
 * SenScript Universal Card Generation Engine
 * 🎯 GOAL NUMBER 1: MAXIMUM SPEED
 * 
 * Robust, universal card generation system optimized for speed
 * Works with any transcript input, any language, any content type
 */

class CardGenerationEngine {
    constructor(apiSettings, sessionId) {
        this.apiSettings = apiSettings;
        this.sessionId = sessionId;
        
        // Performance optimization: Cache recent requests to prevent duplicates
        this.recentRequests = new Map();
        this.requestCacheTimeout = 30000; // 30 seconds
        
        // Processing queue for batching requests
        this.processingQueue = [];
        this.isProcessing = false;
        
        // Card generation statistics
        this.stats = {
            totalRequests: 0,
            successfulCards: 0,
            skippedCards: 0,
            errors: 0,
            avgResponseTime: 0
        };
        
        console.log('🎯 [CARD-ENGINE] Initialized with speed-first optimization');
    }
    
    /**
     * Universal text worthiness check
     * Optimized for speed - single pass, minimal computation
     */
    isTextWorthyOfCard(text) {
        if (!text || typeof text !== 'string') return false;
        
        const trimmed = text.trim();
        const length = trimmed.length;
        
        // Speed-optimized checks in order of computational cost
        
        // 1. Length check (fastest)
        if (length < 15) return false;
        if (length > 2000) return false; // Increased limit for real transcripts
        
        // 2. Character type check (fast) - expanded for multilingual support
        const alphaNumericRatio = (trimmed.match(/[a-zA-Z0-9äöüÄÖÜßàâçéèêëïîôùûüÿñáíóúñÀÂÇÉÈÊËÏÎÔÙÛÜŸÑÁÍÓÚÑ]/g) || []).length / length;
        if (alphaNumericRatio < 0.25) return false; // Lowered threshold for more punctuation
        
        // 3. Content patterns (medium cost) 
        const lowerText = trimmed.toLowerCase();
        
        // Skip single filler words/phrases
        const fillerPatterns = /^(ja|nein|ok|okay|hmm|äh|eh|um|uh|yes|no|right|exactly|sure)$/i;
        if (fillerPatterns.test(lowerText)) return false;
        
        // Skip repetitive patterns
        if (/(.{1,10})\1{3,}/.test(trimmed)) return false; // Repeated patterns
        
        // 4. Universal content quality indicators (language-independent)
        const qualityIndicators = [
            // Structural complexity
            /[.!?][^.!?]*[.!?]/, // Multiple sentences
            /[,:;]\s+\w/, // Complex punctuation usage
            /\([^)]+\)/, // Parenthetical explanations
            /[""][^""]*[""]/, // Quoted content
            
            // Numerical and technical content
            /\b\d+[%°$€£¥]\b|\b\d{4}\b|\b\d+[.,]\d+\b/, // Numbers, dates, percentages
            /\b\d+\s*[-–—]\s*\d+\b/, // Ranges
            /\b[A-Z]{2,}\b/, // Acronyms
            
            // Educational discourse patterns
            /\w+[:]\s*\w+/, // Definitions or explanations
            /\b\w+[.,]\s+\w+[.,]\s+\w+/, // Lists or sequences
            /\s+[-•]\s+/, // Bullet points or dashes
            
            // Content depth indicators
            length > 100, // Longer content is more likely educational
            /\w{8,}/.test(trimmed), // Contains complex words
            (trimmed.split(/\s+/).length > 15), // More than 15 words
            
            // Sentence variety
            /[.!?].*[.!?].*[.!?]/, // Three or more sentences
        ];
        
        const qualityScore = qualityIndicators.filter(indicator => 
            typeof indicator === 'boolean' ? indicator : indicator.test(trimmed)
        ).length;
        
        // Accept if it has enough quality indicators
        if (qualityScore >= 3) return true;
        
        // 5. Final fallback: Basic structure check
        const hasBasicStructure = /[.!?:;,]/.test(trimmed) && length >= 30;
        return hasBasicStructure;
    }
    
    /**
     * Fast duplicate detection using text fingerprinting
     */
    getTextFingerprint(text) {
        // Create a fast, collision-resistant fingerprint
        const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
        const words = normalized.split(' ').filter(w => w.length > 2);
        const keyWords = words.slice(0, 5).join('|'); // First 5 significant words
        return keyWords + '|' + words.length;
    }
    
    /**
     * Check if we've recently processed similar text
     */
    isDuplicateRequest(text) {
        const fingerprint = this.getTextFingerprint(text);
        const now = Date.now();
        
        if (this.recentRequests.has(fingerprint)) {
            const timestamp = this.recentRequests.get(fingerprint);
            if (now - timestamp < this.requestCacheTimeout) {
                return true; // Recent duplicate
            }
        }
        
        // Add to cache
        this.recentRequests.set(fingerprint, now);
        
        // Cleanup old entries periodically
        if (this.recentRequests.size > 100) {
            const cutoff = now - this.requestCacheTimeout;
            for (const [key, timestamp] of this.recentRequests.entries()) {
                if (timestamp < cutoff) {
                    this.recentRequests.delete(key);
                }
            }
        }
        
        return false;
    }
    
    /**
     * Main card generation method - fast, robust, universal
     */
    async generateCard(text, languageDetection = null) {
        const startTime = Date.now();
        this.stats.totalRequests++;
        
        try {
            // Step 1: Fast worthiness check
            if (!this.isTextWorthyOfCard(text)) {
                console.log('⏭️ [CARD-ENGINE] Text not worthy, skipping');
                this.stats.skippedCards++;
                return { success: false, reason: 'not_worthy', skip: true };
            }
            
            // Step 2: Duplicate detection
            if (this.isDuplicateRequest(text)) {
                console.log('⏭️ [CARD-ENGINE] Duplicate request detected, skipping');
                this.stats.skippedCards++;
                return { success: false, reason: 'duplicate', skip: true };
            }
            
            // Step 3: Language processing
            const language = this.determineOutputLanguage(languageDetection);
            
            // Step 4: Generate card via API
            const cardData = await this.callCardAPI(text, language);
            
            // Step 5: Post-process and validate
            if (cardData && cardData.success !== false && !cardData.skip) {
                this.stats.successfulCards++;
                const responseTime = Date.now() - startTime;
                this.updateAverageResponseTime(responseTime);
                
                console.log(`✅ [CARD-ENGINE] Card generated in ${responseTime}ms`);
                console.log(`🎯 [CARD-ENGINE] Card data:`, cardData);
                return cardData;
            } else {
                this.stats.skippedCards++;
                const reason = cardData?.reason || cardData?.error || 'api_declined';
                console.log(`⏭️ [CARD-ENGINE] Card skipped: ${reason}`);
                console.log(`🔍 [CARD-ENGINE] Full response:`, cardData);
                return { success: false, reason, skip: true };
            }
            
        } catch (error) {
            this.stats.errors++;
            console.error('❌ [CARD-ENGINE] Generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Determine output language efficiently
     */
    determineOutputLanguage(detection) {
        if (!this.apiSettings.outputLanguage.auto && this.apiSettings.outputLanguage.fixed) {
            return {
                lang: this.apiSettings.outputLanguage.fixed,
                confidence: 100,
                source: 'fixed'
            };
        }
        
        if (detection && detection.lang && detection.confidence > 50) {
            return {
                lang: detection.lang,
                confidence: detection.confidence,
                source: 'detected'
            };
        }
        
        // Fallback to English
        return {
            lang: 'en-US',
            confidence: 80,
            source: 'fallback'
        };
    }
    
    /**
     * Fast, optimized API call with retry logic
     */
    async callCardAPI(text, language) {
        // Get current mode from the app instance
        const currentMode = (typeof window !== 'undefined' && window.app) ? 
            (window.app.apiSettings?.interviewMode ? 'cheat' : 'flash') : 'flash';
            
        const payload = {
            sessionId: this.sessionId,
            transcript: text,
            language: language.lang,
            textConfidence: language.confidence,
            languageFlag: this.getLanguageFlag(language.lang),
            cardMode: currentMode // Add current mode to payload
        };
        
        const maxRetries = 2;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch('http://localhost:3002/api/generate-card', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log(`📥 [CARD-ENGINE] API response:`, result);
                return result;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ [CARD-ENGINE] API attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    // Exponential backoff: 500ms, 1000ms
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                }
            }
        }
        
        throw new Error(`API failed after ${maxRetries} attempts: ${lastError.message}`);
    }
    
    /**
     * Get language flag efficiently
     */
    getLanguageFlag(langCode) {
        const flagMap = {
            'de-DE': '🇩🇪', 'en-US': '🇺🇸', 'fr-FR': '🇫🇷', 'es-ES': '🇪🇸',
            'it-IT': '🇮🇹', 'pt-PT': '🇵🇹', 'nl-NL': '🇳🇱', 'ru-RU': '🇷🇺',
            'zh-CN': '🇨🇳', 'ja-JP': '🇯🇵', 'ko-KR': '🇰🇷', 'ar-SA': '🇸🇦',
            'el-GR': '🇬🇷'
        };
        return flagMap[langCode] || '🌐';
    }
    
    /**
     * Update performance statistics
     */
    updateAverageResponseTime(responseTime) {
        if (this.stats.successfulCards === 1) {
            this.stats.avgResponseTime = responseTime;
        } else {
            this.stats.avgResponseTime = (
                (this.stats.avgResponseTime * (this.stats.successfulCards - 1) + responseTime) / 
                this.stats.successfulCards
            );
        }
    }
    
    /**
     * Get performance statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.recentRequests.size,
            successRate: this.stats.totalRequests > 0 ? 
                (this.stats.successfulCards / this.stats.totalRequests * 100).toFixed(1) + '%' : '0%'
        };
    }
    
    /**
     * Clear caches and reset (for testing)
     */
    reset() {
        this.recentRequests.clear();
        this.stats = {
            totalRequests: 0,
            successfulCards: 0,
            skippedCards: 0,
            errors: 0,
            avgResponseTime: 0
        };
        console.log('🔄 [CARD-ENGINE] Reset completed');
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardGenerationEngine;
} else {
    window.CardGenerationEngine = CardGenerationEngine;
}