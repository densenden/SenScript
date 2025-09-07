/**
 * Intelligent Segmentation System
 * Fixes fragmented transcripts by using speech-aware segmentation
 * instead of rigid time-based chunking
 */

export class IntelligentSegmentationSystem {
    constructor(transcriptSystem) {
        this.transcriptSystem = transcriptSystem;
        this.app = transcriptSystem.app;
        
        // Segmentation parameters
        this.minSegmentLength = 15; // Minimum words before considering a segment
        this.maxSegmentLength = 50; // Maximum words per segment
        this.silenceThreshold = 2000; // 2 seconds of silence to finalize
        this.punctuationWeight = 1.5; // Weight for sentence-ending punctuation
        
        // State tracking
        this.currentBuffer = [];
        this.lastSpeechTime = Date.now();
        this.silenceTimer = null;
        this.isBuffering = false;
        
        // Speech pattern detection
        this.sentenceEnders = /[.!?]/;
        this.pauseIndicators = /[,;:]/;
        
        console.log('🧠 [IntelligentSegmentation] Initialized with smart transcript chunking');
    }
    
    /**
     * Process incoming speech with intelligent segmentation
     */
    processSpeechInput(speechData) {
        const { text, isFinal, timestamp = Date.now() } = speechData;
        
        if (!text || text.trim().length === 0) {
            return;
        }
        
        // Reset silence tracking
        this.lastSpeechTime = timestamp;
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        
        // Add to current buffer
        this.currentBuffer.push({
            text: text.trim(),
            timestamp,
            isFinal,
            confidence: speechData.confidence || 0.8
        });
        
        console.log(`🧠 [IntelligentSegmentation] Added to buffer: "${text.substring(0, 30)}..." (${isFinal ? 'final' : 'interim'})`);
        
        // Check if we should segment
        if (isFinal) {
            this.evaluateForSegmentation();
        }
        
        // Start silence timer for natural breaks
        this.startSilenceTimer();
        
        // Update interim display
        this.updateInterimDisplay();
    }
    
    /**
     * Evaluate whether to create a segment based on content analysis
     */
    evaluateForSegmentation() {
        const bufferText = this.getBufferText();
        const wordCount = this.getWordCount(bufferText);
        
        console.log(`🧠 [IntelligentSegmentation] Evaluating buffer: ${wordCount} words, "${bufferText.substring(0, 50)}..."`);
        
        // Force segment if buffer is too long
        if (wordCount >= this.maxSegmentLength) {
            console.log(`🧠 [IntelligentSegmentation] Force segment: too long (${wordCount} words)`);
            this.finalizeCurrentSegment('max_length_reached');
            return true;
        }
        
        // Check for natural segment boundaries
        const segmentScore = this.calculateSegmentScore(bufferText);
        console.log(`🧠 [IntelligentSegmentation] Segment score: ${segmentScore.toFixed(2)}`);
        
        // Segment if we have a good natural break and minimum content
        if (segmentScore >= 1.0 && wordCount >= this.minSegmentLength) {
            console.log(`🧠 [IntelligentSegmentation] Natural segment: score ${segmentScore.toFixed(2)}, ${wordCount} words`);
            this.finalizeCurrentSegment('natural_break');
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate how suitable the current buffer is for segmentation
     * Higher scores = better segment boundaries
     */
    calculateSegmentScore(text) {
        let score = 0;
        
        // Strong indicators: sentence-ending punctuation
        const sentences = text.match(this.sentenceEnders);
        if (sentences) {
            score += sentences.length * this.punctuationWeight;
        }
        
        // Medium indicators: clause breaks
        const clauses = text.match(this.pauseIndicators);
        if (clauses) {
            score += clauses.length * 0.5;
        }
        
        // Word count factor (sweet spot around 20-30 words)
        const wordCount = this.getWordCount(text);
        if (wordCount >= 20 && wordCount <= 35) {
            score += 0.5;
        }
        
        // Penalize very short segments
        if (wordCount < this.minSegmentLength) {
            score *= 0.3;
        }
        
        return score;
    }
    
    /**
     * Start timer for silence-based segmentation
     */
    startSilenceTimer() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }
        
        this.silenceTimer = setTimeout(() => {
            const bufferText = this.getBufferText();
            const wordCount = this.getWordCount(bufferText);
            
            if (wordCount >= this.minSegmentLength) {
                console.log(`🧠 [IntelligentSegmentation] Silence timeout: finalizing ${wordCount} words`);
                this.finalizeCurrentSegment('silence_break');
            } else if (wordCount > 0) {
                console.log(`🧠 [IntelligentSegmentation] Silence timeout: buffer too short (${wordCount} words), extending timer`);
                // Extend timer for short content
                this.startSilenceTimer();
            }
        }, this.silenceThreshold);
    }
    
    /**
     * Finalize the current segment and add to UI
     */
    finalizeCurrentSegment(reason = 'unknown') {
        if (this.currentBuffer.length === 0) {
            return;
        }
        
        const bufferText = this.getBufferText();
        const wordCount = this.getWordCount(bufferText);
        const duration = this.getBufferDuration();\n        const firstTimestamp = this.currentBuffer[0]?.timestamp || Date.now();\n        \n        // Don't create segments that are too short unless they're complete sentences\n        if (wordCount < 3 && !this.sentenceEnders.test(bufferText)) {\n            console.log(`🧠 [IntelligentSegmentation] Skipping tiny fragment: \"${bufferText}\" (${wordCount} words)`);\n            return;\n        }\n        \n        console.log(`🧠 [IntelligentSegmentation] 📝 Finalizing segment (${reason}):`);\n        console.log(`  📊 Words: ${wordCount}, Duration: ${duration}ms`);\n        console.log(`  📝 Text: \"${bufferText.substring(0, 100)}...\"`);\n        \n        // Create segment object\n        const segment = {\n            text: bufferText,\n            timestamp: new Date(firstTimestamp).toLocaleTimeString('en-US', {\n                hour12: false,\n                hour: '2-digit',\n                minute: '2-digit',\n                second: '2-digit'\n            }),\n            duration: Math.min(duration, 12000), // Cap display duration\n            wordCount,\n            segmentationReason: reason,\n            cardCreated: false\n        };\n        \n        // Add to UI using the improved system\n        if (this.transcriptSystem.ui) {\n            this.transcriptSystem.ui.addFinalizedSegment(segment);\n        }\n        \n        // Clear buffer\n        this.currentBuffer = [];\n        \n        // Clear timers\n        if (this.silenceTimer) {\n            clearTimeout(this.silenceTimer);\n            this.silenceTimer = null;\n        }\n        \n        // Trigger card generation for substantial segments\n        if (wordCount >= 15 && this.transcriptSystem.cardSystem) {\n            console.log(`🧠 [IntelligentSegmentation] 🃏 Triggering card generation for ${wordCount}-word segment`);\n            setTimeout(() => {\n                this.transcriptSystem.cardSystem.processTranscriptSegment(segment);\n            }, 500);\n        }\n    }\n    \n    /**\n     * Update interim display with current buffer\n     */\n    updateInterimDisplay() {\n        const bufferText = this.getBufferText();\n        const wordCount = this.getWordCount(bufferText);\n        \n        if (this.transcriptSystem.ui && bufferText) {\n            // Show progress indicators\n            const progressInfo = this.getSegmentProgress();\n            \n            this.transcriptSystem.ui.updateInterimText({\n                text: bufferText,\n                wordCount,\n                progress: progressInfo,\n                readyToSegment: wordCount >= this.minSegmentLength\n            });\n        }\n    }\n    \n    /**\n     * Get progress indicators for current segment\n     */\n    getSegmentProgress() {\n        const bufferText = this.getBufferText();\n        const wordCount = this.getWordCount(bufferText);\n        const score = this.calculateSegmentScore(bufferText);\n        \n        let status = 'building';\n        if (wordCount >= this.minSegmentLength && score >= 1.0) {\n            status = 'ready';\n        } else if (wordCount >= this.maxSegmentLength) {\n            status = 'full';\n        }\n        \n        return {\n            wordCount,\n            minWords: this.minSegmentLength,\n            maxWords: this.maxSegmentLength,\n            score: score.toFixed(1),\n            status\n        };\n    }\n    \n    /**\n     * Helper methods\n     */\n    getBufferText() {\n        return this.currentBuffer\n            .map(item => item.text)\n            .join(' ')\n            .replace(/\\s+/g, ' ')\n            .trim();\n    }\n    \n    getWordCount(text) {\n        return text ? text.trim().split(/\\s+/).length : 0;\n    }\n    \n    getBufferDuration() {\n        if (this.currentBuffer.length === 0) return 0;\n        const start = this.currentBuffer[0].timestamp;\n        const end = this.currentBuffer[this.currentBuffer.length - 1].timestamp;\n        return Math.max(end - start, 1000); // Minimum 1 second\n    }\n    \n    /**\n     * Force finalization (called when stopping transcription)\n     */\n    forceFinalization() {\n        if (this.currentBuffer.length > 0) {\n            console.log('🧠 [IntelligentSegmentation] Force finalizing remaining buffer on stop');\n            this.finalizeCurrentSegment('transcription_stopped');\n        }\n    }\n    \n    /**\n     * Clear all buffers and timers\n     */\n    reset() {\n        this.currentBuffer = [];\n        if (this.silenceTimer) {\n            clearTimeout(this.silenceTimer);\n            this.silenceTimer = null;\n        }\n        console.log('🧠 [IntelligentSegmentation] Reset completed');\n    }\n}