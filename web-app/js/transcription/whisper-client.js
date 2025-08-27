/**
 * Whisper API Client
 * Handles OpenAI Whisper transcription with advanced features
 * Optimized for educational content and card generation
 */

class WhisperClient {
    constructor(app) {
        this.app = app;
        
        // API configuration
        this.baseUrl = window.location.origin;
        this.transcriptionEndpoint = '/api/transcribe';
        
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
            prompt: this.getContextualPrompt(),
            // Advanced features
            timestamp_granularities: ['word', 'segment'], // Both word and segment timestamps
            word_timestamps: true // Enable word-level timing
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
            console.error('❌ [WhisperClient] Transcription failed:', error);
            this.showError('Transcription error: ' + error.message);
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
                console.error('❌ [WhisperClient] Request failed:', error);
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
            
            // Create FormData with advanced Whisper features
            const formData = new FormData();
            formData.append('audio', audioBlob, `audio_${Date.now()}.webm`);
            formData.append('model', this.whisperSettings.model);
            formData.append('response_format', this.whisperSettings.response_format);
            formData.append('temperature', this.whisperSettings.temperature);
            formData.append('prompt', contextualPrompt);
            formData.append('timestamp_granularities[]', 'word');
            formData.append('timestamp_granularities[]', 'segment');
            
            // Language-specific optimization
            if (this.whisperSettings.language) {
                const langOpt = this.languageOptimizations[this.whisperSettings.language];
                if (langOpt) {
                    formData.set('temperature', langOpt.temperature);
                }
                formData.append('language', this.whisperSettings.language);
            }
            
            console.log('🎯 [WhisperClient] Content type:', contentType);
            console.log('📝 [WhisperClient] Using contextual prompt for', contentType);
            
            // Add metadata
            formData.append('metadata', JSON.stringify({
                duration: metadata.duration || 10,
                source: metadata.source || 'unknown',
                timestamp: metadata.timestamp || Date.now()
            }));
            
            // Make request
            const response = await fetch(this.baseUrl + this.transcriptionEndpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ [WhisperClient] Transcription response received');
            
            // Process the response
            await this.processTranscriptionResponse(result, metadata);
            
            // Update usage stats
            this.updateUsageStats(metadata.duration || 10, result);
            
        } catch (error) {
            console.error('❌ [WhisperClient] Request failed:', error);
            
            if (error.message.includes('413')) {
                this.showError('Audio file too large. Try shorter recording segments.');
            } else if (error.message.includes('429')) {
                this.showError('Too many requests. Slowing down transcription rate.');
            } else {
                this.showError('Transcription failed: ' + error.message);
            }
            
            throw error;
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
}

// Export to window
window.WhisperClient = WhisperClient;