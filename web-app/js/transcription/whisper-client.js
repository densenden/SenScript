/**
 * Whisper API Client
 * Handles OpenAI Whisper transcription with advanced features
 * Optimized for educational content and card generation
 */

class WhisperClient {
    constructor(app) {
        this.app = app;
        
        // API configuration - Real OpenAI Whisper API
        this.baseUrl = 'https://api.openai.com/v1';
        this.transcriptionEndpoint = '/audio/transcriptions';
        
        // Request queue and timing
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 500; // Prevent API flooding
        
        // Usage tracking
        this.totalRequests = 0;
        this.totalMinutesTranscribed = 0;
        this.totalCost = 0;
        
        // Context-aware prompting for different content types (define first)
        this.contentContexts = {
            meeting: "Business meeting with technical discussions, decisions, and action items.",
            lecture: "Educational lecture with technical concepts, definitions, and examples.",
            presentation: "Professional presentation with data, insights, and explanations.",
            conference: "Conference talk with industry expertise and technical terminology.",
            interview: "Interview format with questions, answers, and detailed responses."
        };
        
        // Language-specific optimizations
        this.languageOptimizations = {
            'en': { temperature: 0.0, prompt_weight: 1.0 },
            'de': { temperature: 0.1, prompt_weight: 1.2 },
            'fr': { temperature: 0.1, prompt_weight: 1.1 },
            'es': { temperature: 0.1, prompt_weight: 1.1 },
            'zh': { temperature: 0.2, prompt_weight: 1.3 },
            'ja': { temperature: 0.2, prompt_weight: 1.3 }
        };
        
        // Advanced Whisper settings (after contexts are defined)
        this.whisperSettings = {
            model: 'whisper-1',
            response_format: 'verbose_json', // Get timestamps, confidence, segments
            temperature: 0.0, // Maximum determinism for educational content
            language: null, // Auto-detect for multilingual support
            prompt: this.getContextualPrompt()
            // Note: timestamp_granularities is handled dynamically in the request
        };
        
        console.log('🎯 [WhisperClient] Initialized for professional transcription');
    }
    
    /**
     * Get contextual prompt optimized for current content type
     */
    getContextualPrompt(contentType = 'meeting') {
        const basePrompt = `This is professional ${this.contentContexts[contentType] || this.contentContexts.meeting}
Please provide accurate transcription with proper punctuation, capitalization, and formatting.
Remove filler words (um, uh, ah, like) when they don't add meaning.
Preserve technical terms, proper nouns, and specialized vocabulary.
Use appropriate formatting for lists, questions, and emphasis.`;

        return basePrompt;
    }
    
    /**
     * Auto-detect content type from audio metadata and context
     */
    detectContentType(metadata) {
        // Simple heuristics - can be enhanced with ML
        const source = metadata.source || '';
        const duration = metadata.duration || 0;
        
        if (duration > 1800) return 'lecture'; // >30 minutes likely lecture
        if (source.includes('presentation')) return 'presentation';
        if (source.includes('interview')) return 'interview';
        if (source.includes('conference')) return 'conference';
        
        return 'meeting'; // Default
    }
    
    /**
     * Main transcription method - sends audio to Whisper API
     */
    async transcribeAudio(audioBlob, metadata = {}) {
        console.log('🎯 [WhisperClient] === TRANSCRIPTION REQUEST ===');
        console.log('📊 [WhisperClient] Audio size:', (audioBlob.size / 1024).toFixed(1), 'KB');
        console.log('⏱️ [WhisperClient] Duration:', metadata.duration || 'unknown', 'seconds');
        console.log('🎤 [WhisperClient] Source:', metadata.source || 'unknown');
        
        try {
            // Add to queue to prevent overwhelming the API
            const request = {
                audioBlob,
                metadata,
                timestamp: Date.now()
            };
            
            this.requestQueue.push(request);
            
            // Process queue
            if (!this.isProcessingQueue) {
                await this.processRequestQueue();
            }
            
        } catch (error) {
            console.warn('⚠️ [WhisperClient] Whisper transcription failed, Web Speech API continues:', error.message);
            // Don't show error to user - Whisper is supplementary to Web Speech API
        }
    }
    
    /**
     * Process queued transcription requests
     */
    async processRequestQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        console.log(`🔄 [WhisperClient] Processing ${this.requestQueue.length} queued requests`);
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            // Rate limiting
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                const delay = this.minRequestInterval - timeSinceLastRequest;
                console.log(`⏳ [WhisperClient] Rate limiting: waiting ${delay}ms`);
                await this.sleep(delay);
            }
            
            try {
                await this.sendTranscriptionRequest(request.audioBlob, request.metadata);
            } catch (error) {
                console.warn('⚠️ [WhisperClient] Whisper request failed, continuing with Web Speech API:', error.message);
            }
            
            this.lastRequestTime = Date.now();
        }
        
        this.isProcessingQueue = false;
        console.log('✅ [WhisperClient] Queue processing complete');
    }
    
    /**
     * Send individual transcription request to server
     */
    async sendTranscriptionRequest(audioBlob, metadata) {
        console.log('📤 [WhisperClient] Sending transcription request...');
        
        try {
            // Detect content type and optimize prompt
            const contentType = this.detectContentType(metadata);
            const contextualPrompt = this.getContextualPrompt(contentType);
            
            // Create FormData with valid Whisper API parameters
            const formData = new FormData();
            
            // Generate correct filename based on MIME type
            const filename = this.generateAudioFilename(audioBlob.type);
            formData.append('file', audioBlob, filename);
            console.log(`📁 [WhisperClient] File: ${filename} (${audioBlob.type}, ${(audioBlob.size / 1024).toFixed(1)}KB)`);
            formData.append('model', this.whisperSettings.model);
            formData.append('response_format', this.whisperSettings.response_format);
            formData.append('temperature', this.whisperSettings.temperature);
            formData.append('prompt', contextualPrompt);
            
            // Add timestamp granularities correctly (only for verbose_json format)
            if (this.whisperSettings.response_format === 'verbose_json') {
                formData.append('timestamp_granularities[]', 'word');
            }
            
            // Language-specific optimization
            if (this.whisperSettings.language) {
                // Convert from app format (en-US) to OpenAI ISO-639-1 format (en)
                const iso639Language = this.convertToISO639(this.whisperSettings.language);
                
                const langOpt = this.languageOptimizations[iso639Language];
                if (langOpt) {
                    formData.set('temperature', langOpt.temperature);
                }
                formData.append('language', iso639Language);
                console.log(`🌐 [WhisperClient] Language: ${this.whisperSettings.language} → ${iso639Language}`);
            }
            
            console.log('🎯 [WhisperClient] Content type:', contentType);
            console.log('📝 [WhisperClient] Using contextual prompt for', contentType);
            console.log('📦 [WhisperClient] FormData prepared with parameters:');
            
            // Log all form data parameters for debugging
            for (let pair of formData.entries()) {
                if (pair[0] === 'file') {
                    console.log(`  ${pair[0]}: [File object, size: ${pair[1].size} bytes, type: "${pair[1].type}", name: "${pair[1].name}"]`);
                    
                    // Additional file format debugging
                    console.log(`  ➤ File validation: type="${pair[1].type}", name="${pair[1].name}"`);
                    console.log(`  ➤ Size check: ${pair[1].size} bytes (${(pair[1].size / 1024).toFixed(2)} KB)`);
                    
                    // Check if the file type is in the supported list
                    const supportedFormats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];
                    const fileExtension = pair[1].name.split('.').pop();
                    console.log(`  ➤ Extension "${fileExtension}" supported: ${supportedFormats.includes(fileExtension)}`);
                } else {
                    console.log(`  ${pair[0]}: ${pair[1]}`);
                }
            }
            
            // Note: metadata is handled separately and not sent to OpenAI API
            
            // Make request with API key
            const apiKey = await this.getApiKey();
            const response = await fetch(this.baseUrl + this.transcriptionEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });
            
            if (!response.ok) {
                // Get detailed error information from the response
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorBody = await response.text();
                    console.error('❌ [WhisperClient] Full error response:', errorBody);
                    if (errorBody) {
                        try {
                            const errorJson = JSON.parse(errorBody);
                            if (errorJson.error && errorJson.error.message) {
                                errorMessage += ` - ${errorJson.error.message}`;
                            }
                        } catch (parseError) {
                            errorMessage += ` - ${errorBody}`;
                        }
                    }
                } catch (bodyError) {
                    console.error('❌ [WhisperClient] Could not read error response:', bodyError);
                }
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            console.log('✅ [WhisperClient] Transcription response received');
            
            // Process the response
            await this.processTranscriptionResponse(result, metadata);
            
            // Update usage stats
            this.updateUsageStats(metadata.duration || 10, result);
            
        } catch (error) {
            console.error('❌ [WhisperClient] Request failed:', error);
            
            // Don't show errors to user for Whisper failures - Web Speech API is primary
            console.warn('ℹ️ [WhisperClient] Whisper transcription failed, but Web Speech API continues working');
            
            if (error.message.includes('413')) {
                console.warn('⚠️ [WhisperClient] Audio file too large for Whisper API');
            } else if (error.message.includes('429')) {
                console.warn('⚠️ [WhisperClient] Whisper API rate limited');
            } else if (error.message.includes('could not be decoded')) {
                console.warn('⚠️ [WhisperClient] Audio format issue - MediaRecorder compatibility problem');
            } else {
                console.warn('⚠️ [WhisperClient] Whisper API error:', error.message);
            }
            
            // Don't throw error - let transcription continue with Web Speech API
            return;
        }
    }
    
    /**
     * Process Whisper API response and send to transcript system
     */
    async processTranscriptionResponse(result, metadata) {
        console.log('📝 [WhisperClient] === PROCESSING WHISPER RESPONSE ===');
        console.log('🎯 [WhisperClient] Detected language:', result.language);
        console.log('📊 [WhisperClient] Duration:', result.duration, 'seconds');
        console.log('📄 [WhisperClient] Text length:', result.text?.length || 0, 'characters');
        
        try {
            // Extract key information
            const transcriptionData = {
                text: result.text || '',
                language: result.language,
                duration: result.duration,
                segments: result.segments || [],
                words: this.extractWords(result.segments || []),
                metadata: {
                    ...metadata,
                    whisperDuration: result.duration,
                    detectedLanguage: result.language,
                    confidence: this.calculateAverageConfidence(result.segments || [])
                }
            };
            
            // Log detailed information
            console.log(`🔤 [WhisperClient] Words extracted: ${transcriptionData.words.length}`);
            console.log(`📋 [WhisperClient] Segments: ${transcriptionData.segments.length}`);
            console.log(`📊 [WhisperClient] Avg confidence: ${transcriptionData.metadata.confidence.toFixed(2)}`);
            
            // Filter educational content before sending to transcript system
            if (this.isEducationalContent(transcriptionData.text)) {
                console.log('🎓 [WhisperClient] Educational content detected - sending to transcript system');
                await this.sendToTranscriptSystem(transcriptionData);
            } else {
                console.log('⏭️ [WhisperClient] Non-educational content - skipping card generation');
                // Still show in transcript but mark as non-educational
                transcriptionData.metadata.educational = false;
                await this.sendToTranscriptSystem(transcriptionData);
            }
            
        } catch (error) {
            console.error('❌ [WhisperClient] Failed to process response:', error);
        }
    }
    
    /**
     * Extract word-level data from segments
     */
    extractWords(segments) {
        const words = [];
        
        segments.forEach(segment => {
            if (segment.words && Array.isArray(segment.words)) {
                segment.words.forEach(word => {
                    words.push({
                        word: word.word,
                        start: word.start,
                        end: word.end,
                        probability: word.probability || 0.5
                    });
                });
            }
        });
        
        return words;
    }
    
    /**
     * Calculate average confidence from segments
     */
    calculateAverageConfidence(segments) {
        if (segments.length === 0) return 0.5;
        
        const totalConfidence = segments.reduce((sum, segment) => {
            return sum + (segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.5);
        }, 0);
        
        return totalConfidence / segments.length;
    }
    
    /**
     * Check if content is educational/worthy of card generation
     */
    isEducationalContent(text) {
        if (!text || text.length < 30) return false;
        
        const lowerText = text.toLowerCase();
        
        // Educational keywords
        const educationalKeywords = [
            'what', 'how', 'why', 'define', 'explain', 'describe', 'understand',
            'learn', 'teach', 'example', 'because', 'means', 'refers to',
            'important', 'key', 'concept', 'principle', 'theory', 'method',
            'process', 'system', 'function', 'structure', 'purpose',
            // German equivalents
            'was', 'wie', 'warum', 'erklären', 'verstehen', 'lernen',
            'beispiel', 'weil', 'bedeutet', 'wichtig', 'konzept'
        ];
        
        // Count educational signals
        const educationalCount = educationalKeywords.reduce((count, keyword) => {
            return count + (lowerText.split(keyword).length - 1);
        }, 0);
        
        // Check for question patterns
        const questionPatterns = [
            /what\s+is\s+/gi,
            /how\s+do\s+/gi,
            /why\s+does\s+/gi,
            /was\s+ist\s+/gi,
            /wie\s+funktioniert\s+/gi
        ];
        
        const hasQuestions = questionPatterns.some(pattern => pattern.test(text));
        
        // Check for technical terms
        const hasTechnicalTerms = /\b[A-Z]{2,}\b/.test(text) || // Acronyms
                                 /\d+%/.test(text) || // Percentages
                                 /\$\d+/.test(text); // Dollar amounts
        
        const isEducational = educationalCount >= 2 || hasQuestions || hasTechnicalTerms;
        
        console.log(`🎓 [WhisperClient] Educational analysis: keywords=${educationalCount}, questions=${hasQuestions}, technical=${hasTechnicalTerms} → ${isEducational}`);
        
        return isEducational;
    }
    
    /**
     * Send transcription data to transcript system
     */
    async sendToTranscriptSystem(transcriptionData) {
        if (!this.app.transcriptSystem) {
            console.error('❌ [WhisperClient] Transcript system not available');
            return;
        }
        
        console.log('📨 [WhisperClient] Sending to transcript system...');
        
        try {
            // Send to unified transcript system
            await this.app.transcriptSystem.processWhisperTranscription(transcriptionData);
            
        } catch (error) {
            console.error('❌ [WhisperClient] Failed to send to transcript system:', error);
        }
    }
    
    /**
     * Update usage statistics
     */
    updateUsageStats(duration, result) {
        this.totalRequests++;
        this.totalMinutesTranscribed += duration / 60;
        this.totalCost = this.totalMinutesTranscribed * 0.006;
        
        console.log(`📊 [WhisperClient] Usage: ${this.totalRequests} requests, ${this.totalMinutesTranscribed.toFixed(2)} min, $${this.totalCost.toFixed(4)}`);
        
        // Update UI if available
        this.updateUsageDisplay();
        
        // Save to localStorage for persistence
        this.saveUsageStats();
    }
    
    /**
     * Update usage display in UI
     */
    updateUsageDisplay() {
        const usageElement = document.getElementById('whisperUsage');
        if (usageElement) {
            usageElement.innerHTML = `
                <span class="usage-minutes">${this.totalMinutesTranscribed.toFixed(1)}min</span>
                <span class="usage-cost">$${this.totalCost.toFixed(4)}</span>
            `;
        }
    }
    
    /**
     * Save usage stats to localStorage
     */
    saveUsageStats() {
        try {
            const stats = {
                requests: this.totalRequests,
                minutes: this.totalMinutesTranscribed,
                cost: this.totalCost,
                lastUpdated: Date.now()
            };
            
            localStorage.setItem('whisper_usage', JSON.stringify(stats));
        } catch (error) {
            console.error('❌ [WhisperClient] Failed to save usage stats:', error);
        }
    }
    
    /**
     * Load usage stats from localStorage
     */
    loadUsageStats() {
        try {
            const saved = localStorage.getItem('whisper_usage');
            if (saved) {
                const stats = JSON.parse(saved);
                this.totalRequests = stats.requests || 0;
                this.totalMinutesTranscribed = stats.minutes || 0;
                this.totalCost = stats.cost || 0;
                
                console.log(`📊 [WhisperClient] Loaded usage: ${this.totalMinutesTranscribed.toFixed(2)}min, $${this.totalCost.toFixed(4)}`);
                this.updateUsageDisplay();
            }
        } catch (error) {
            console.error('❌ [WhisperClient] Failed to load usage stats:', error);
        }
    }
    
    /**
     * Show error to user
     */
    showError(message) {
        console.error('❌ [WhisperClient] Error:', message);
        
        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
            this.app.transcriptSystem.ui.showErrorState(message);
        }
    }
    
    /**
     * Utility: Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get client statistics
     */
    getStats() {
        return {
            totalRequests: this.totalRequests,
            totalMinutesTranscribed: this.totalMinutesTranscribed,
            totalCost: this.totalCost,
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessingQueue
        };
    }
    
    /**
     * Set language for transcription
     */
    setLanguage(languageCode) {
        this.whisperSettings.language = languageCode;
        console.log(`🌐 [WhisperClient] Language set to: ${languageCode}`);
    }
    
    /**
     * Convert from app language format (en-US, de-DE) to OpenAI ISO-639-1 format (en, de)
     */
    convertToISO639(languageCode) {
        if (!languageCode || languageCode === 'auto') {
            return null; // Let OpenAI auto-detect
        }
        
        // Map common app formats to ISO-639-1
        const languageMap = {
            'en-US': 'en',
            'en-GB': 'en',
            'de-DE': 'de',
            'fr-FR': 'fr',
            'es-ES': 'es',
            'it-IT': 'it',
            'pt-PT': 'pt',
            'nl-NL': 'nl',
            'ru-RU': 'ru',
            'zh-CN': 'zh',
            'ja-JP': 'ja',
            'ko-KR': 'ko',
            'ar-SA': 'ar',
            'el-GR': 'el',
            'sv-SE': 'sv',
            'no-NO': 'no',
            'fi-FI': 'fi'
        };
        
        // Return mapped language or extract first part (en-US -> en)
        return languageMap[languageCode] || languageCode.split('-')[0];
    }
    
    /**
     * Generate appropriate filename based on MIME type
     */
    generateAudioFilename(mimeType) {
        // Map MIME types to file extensions (using OpenAI supported extensions)
        const mimeToExt = {
            'audio/mp4': 'mp4',        // OpenAI supports mp4 directly
            'audio/mpeg': 'mp3',       // Standard MP3
            'audio/mp3': 'mp3',        // Alternative MP3 MIME
            'audio/wav': 'wav',        // WAV format
            'audio/x-wav': 'wav',      // Alternative WAV MIME
            'audio/webm': 'webm',      // WebM (keep for compatibility)
            'audio/webm;codecs=opus': 'webm',
            'audio/ogg': 'ogg',        // OGG format
            'audio/flac': 'flac'       // FLAC format
        };
        
        // Get extension from MIME type or default to mp4 (most compatible)
        const extension = mimeToExt[mimeType] || mimeToExt[mimeType?.split(';')[0]] || 'mp4';
        
        return `audio.${extension}`;
    }
    
    /**
     * Reset usage statistics
     */
    resetStats() {
        this.totalRequests = 0;
        this.totalMinutesTranscribed = 0;
        this.totalCost = 0;
        
        localStorage.removeItem('whisper_usage');
        this.updateUsageDisplay();
        
        console.log('🔄 [WhisperClient] Usage statistics reset');
    }
    
    /**
     * Get OpenAI API key from settings or server environment
     */
    async getApiKey() {
        // Try settings manager first
        const settings = this.app.settingsManager?.settings;
        if (settings && settings.apiKeys && settings.apiKeys.openai) {
            return settings.apiKeys.openai;
        }
        
        // Try localStorage (backward compatibility)
        let apiKey = localStorage.getItem('openai_api_key');
        if (apiKey) {
            // Migrate from localStorage to settings
            if (this.app.settingsManager) {
                this.app.settingsManager.updateSetting('apiKeys.openai', apiKey);
                localStorage.removeItem('openai_api_key');
            }
            return apiKey;
        }
        
        // Try to get API key from server environment
        try {
            console.log('🔑 [WhisperClient] Fetching API keys from server environment...');
            const response = await fetch('/api/keys');
            if (response.ok) {
                const keys = await response.json();
                if (keys.openai) {
                    console.log('✅ [WhisperClient] Got OpenAI API key from server environment');
                    return keys.openai;
                }
            }
        } catch (error) {
            console.warn('⚠️ [WhisperClient] Could not fetch API keys from server:', error.message);
        }
        
        // Final fallback
        console.warn('⚠️ [WhisperClient] No API key found in settings or server environment');
        throw new Error('Please set your OpenAI API key in Settings → AI & API → OpenAI API Key, or configure OPENAI_API_KEY environment variable');
    }
}

// Export to window
window.WhisperClient = WhisperClient;