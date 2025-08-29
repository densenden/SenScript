/**
 * Card Engine Module
 * Handles AI-powered flashcard generation
 */

class CardEngine {
    constructor(app) {
        this.app = app;
        this.recentTexts = new Set();
        this.duplicateTimeout = 10000; // 10 seconds
        this.interviewMode = false; // Default to flashcard mode
        
        this.initialize();
    }
    
    initialize() {
        console.log('[CardEngine] Initializing card engine...');
        this.setupInterviewModeToggle();
        this.setupCardsModeToggle();
        
        // Initialize cards placeholder
        this.updateCardsPlaceholder();
    }
    
    setupInterviewModeToggle() {
        const interviewModeElement = document.getElementById('interviewMode');
        if (!interviewModeElement) {
            console.warn('[CardEngine] Interview mode toggle not found');
            return;
        }
        
        interviewModeElement.addEventListener('change', (e) => {
            e.stopPropagation();
            this.interviewMode = e.target.checked;
            console.log('[CardEngine] Interview mode changed to:', this.interviewMode);
            
            // Update mode display
            this.updateModeDisplay();
            
            // Show/hide description
            const description = document.getElementById('interviewModeDescription');
            if (description) {
                description.style.display = this.interviewMode ? 'block' : 'none';
            }
        });
    }
    
    setupCardsModeToggle() {
        const cardsModeToggle = document.getElementById('cardsModeToggle');
        if (!cardsModeToggle) {
            console.warn('[CardEngine] Cards mode toggle not found');
            return;
        }
        
        cardsModeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('[CardEngine] Cards mode toggle clicked');
            
            // Toggle interview mode
            this.interviewMode = !this.interviewMode;
            
            // Update UI elements
            const interviewModeCheckbox = document.getElementById('interviewMode');
            if (interviewModeCheckbox) {
                interviewModeCheckbox.checked = this.interviewMode;
            }
            
            this.updateModeDisplay();
            
            // Show/hide description
            const description = document.getElementById('interviewModeDescription');
            if (description) {
                description.style.display = this.interviewMode ? 'block' : 'none';
            }
            
            console.log('[CardEngine] Mode toggled to:', this.interviewMode ? 'CheatCard' : 'FlashCard');
            
            // Update cards placeholder message
            this.updateCardsPlaceholder();
        });
    }
    
    updateModeDisplay() {
        // Update the visual toggle state
        const cardsModeToggle = document.getElementById('cardsModeToggle');
        if (cardsModeToggle) {
            cardsModeToggle.classList.toggle('flipped', this.interviewMode);
        }
        
        // Update container class for styling
        const cardsContainer = this.app.els.cardsContainer;
        if (cardsContainer) {
            if (this.interviewMode) {
                cardsContainer.classList.add('cheat-card-mode');
                cardsContainer.classList.remove('flash-card-mode');
            } else {
                cardsContainer.classList.add('flash-card-mode');
                cardsContainer.classList.remove('cheat-card-mode');
            }
        }
        
        // Update body class for global styling
        if (this.interviewMode) {
            document.body.classList.add('cheat-card-mode');
            document.body.classList.remove('flash-card-mode');
        } else {
            document.body.classList.add('flash-card-mode');
            document.body.classList.remove('cheat-card-mode');
        }
        
        console.log('[CardEngine] Mode display updated:', this.interviewMode ? 'CheatCard' : 'FlashCard');
        
        // Refresh existing cards to apply new styling
        this.refreshExistingCards();
    }
    
    /**
     * Refresh existing cards in the DOM to apply current mode styling
     */
    refreshExistingCards() {
        if (!this.app.cards || this.app.cards.length === 0) {
            return;
        }
        
        const cardElements = this.app.els.cardsContainer.querySelectorAll('.card');
        console.log(`[CardEngine] Refreshing ${cardElements.length} existing cards for ${this.interviewMode ? 'CheatCard' : 'FlashCard'} mode`);
        
        cardElements.forEach((cardElement, index) => {
            const cardData = this.app.cards[index];
            if (cardData) {
                // Update the card's cardType to match current mode
                cardData.cardType = this.interviewMode ? 'cheat' : 'flash';
                
                // Regenerate and update the card's HTML content
                cardElement.innerHTML = this.generateCardHTML(cardData);
                
                // Update the data attribute for consistency
                cardElement.setAttribute('data-card-type', cardData.cardType);
                
                // Reapply click handlers
                this.setupCardClickHandler(cardElement, cardData);
            }
        });
        
        console.log(`[CardEngine] Successfully refreshed ${cardElements.length} cards`);
    }
    
    async processText(text, detection = null) {
        // Check if text is worthy of card generation (delegate to transcript processor if available)
        if (this.app.transcriptProcessor && !this.app.transcriptProcessor.isTextWorthyOfCard(text)) {
            console.log('[CardEngine] Text not worthy according to transcript processor');
            this.addRejectedTextToTranscript(text, detection, 'transcript processor filter');
            return;
        } else if (!this.app.transcriptProcessor && !this.isTextWorthyOfCard(text)) {
            console.log('[CardEngine] Text not worthy according to card engine');
            this.addRejectedTextToTranscript(text, detection, 'card engine filter');
            return;
        }
        
        // Prevent duplicates with improved hashing
        const textHash = this.createTextHash(text);
        if (this.recentTexts.has(textHash)) {
            console.log('[CardEngine] Skipping duplicate text (hash match)');
            return;
        }
        
        // Add to recent texts and remove after timeout
        this.recentTexts.add(textHash);
        setTimeout(() => this.recentTexts.delete(textHash), this.duplicateTimeout);
        
        // Generate card with language detection
        await this.generateCard(text, detection);
    }
    
    /**
     * Create a hash for text to better detect duplicates
     */
    createTextHash(text) {
        // Simple hash based on normalized text content
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')    // Normalize spaces
            .trim()
            .substring(0, 100);      // Use first 100 chars for hash
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
    
    async generateCard(text, detection = null) {
        try {
            console.log(`🎯 [CardEngine] === GENERATING ${this.interviewMode ? 'CHEAT' : 'FLASH'} CARD ===`);
            console.log(`🎯 [CardEngine] Text:`, text.substring(0, 50) + '...');
            console.log(`🎯 [CardEngine] Interview mode:`, this.interviewMode);
            console.log(`🎯 [CardEngine] Language detection:`, detection);
            
            // Use the restored CardGenerator with proper mode flag and detection
            if (!this.app.cardGenerator) {
                console.error('❌ [CardEngine] CardGenerator not initialized');
                return;
            }
            
            // Generate card using AI-powered generator with language detection
            const card = await this.app.cardGenerator.generateFromText(text, this.interviewMode, detection);
            
            if (!card) {
                console.log('⏭️ [CardEngine] Card generation returned null (likely skipped by AI)');
                return;
            }
            
            console.log(`🃏 [CardEngine] ${card.cardType === 'cheat' ? 'CheatCard' : 'FlashCard'} created successfully:`, card);
            
            // === SOPHISTICATED CARD BIRTH PROCESS (from legacy) ===
            await this.createUnifiedCardWithBirthAnimation(card);
            
            console.log(`✅ [CardEngine] Card birth process completed (${this.app.cards.length} total)`);
            
        } catch (error) {
            console.error('💥 [CardEngine] Failed to generate card:', error);
            console.error('🔍 [CardEngine] Error details:', {
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3),
                text: text.substring(0, 50),
                interviewMode: this.interviewMode,
                detection: detection
            });
        }
    }
    
    /**
     * SOPHISTICATED CARD BIRTH PROCESS - Restored from legacy app.js
     * 1. Create 12px container with ready content
     * 2. Card pops to final height (only top card animates)
     * 3. Text fades in when fully open
     * 4. Scroll to top
     */
    async createUnifiedCardWithBirthAnimation(cardData) {
        console.log(`🎯 [UNIFIED-BIRTH] Creating card for: ${cardData.category}`);
        
        try {
            // 1. Create empty 12px container
            const cardElement = this.createEmptyContainer(cardData.cardType);
            
            // 2. Add empty 12px container to DOM (prepend for newest on top)
            this.app.els.cardsContainer.prepend(cardElement);
            this.app.cards.unshift(cardData); // Add to beginning of array
            
            // 3. Auto-scroll to top to see the birth animation
            this.app.els.cardsContainer.scrollTop = 0;
            console.log('👶 [PIPELINE] Born as 12px empty container');
            
            // 4. Breeding animation (slight shake/preparation)
            setTimeout(() => {
                console.log('🥚 [PIPELINE] Breeding animation - preparing to grow');
                cardElement.classList.add('card-breeding');
                
                // 5. Start height expansion after breeding
                setTimeout(() => {
                    console.log('🎬 [PIPELINE] Growing to full height');
                    cardElement.classList.remove('card-birth', 'card-breeding');
                    cardElement.classList.add('card-open');
                    
                    // 6. Add content and fade in after growth completes
                    setTimeout(() => {
                        console.log('📝 [PIPELINE] Adding content and fading in');
                        cardElement.innerHTML = this.generateCardHTML(cardData);
                        cardElement.classList.add('card-ready');
                        this.setupCardClickHandler(cardElement, cardData);
                    }, 400); // After height animation
                    
                }, 200); // Breeding duration
                
            }, 500); // Time to see empty 12px container
            
            // Update card count and enable export
            this.updateCardCount();
            if (this.app.els.exportBtn) {
                this.app.els.exportBtn.disabled = false;
            }
            
            // Update transcript status line with new card count
            if (this.app.transcriptSystem?.ui?.updateStatusLine) {
                this.app.transcriptSystem.ui.updateStatusLine();
            }
            
            console.log('✅ [UNIFIED-BIRTH] Card birth animation started:', cardData.category);
            
        } catch (error) {
            console.error('❌ [UNIFIED-BIRTH] Failed:', error);
        }
    }
    
    /**
     * Create empty card container for birth animation
     */
    createEmptyContainer(cardType) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-birth'; // Start in birth state (12px)
        cardEl.setAttribute('data-card-type', cardType || 'flash');
        
        // Empty container - no content yet
        cardEl.innerHTML = '';
        
        return cardEl;
    }
    
    /**
     * Generate HTML content for fully grown card (restored from legacy)
     * Includes sophisticated header with category, source indicator, confidence, language flag, and timestamp
     */
    generateCardHTML(cardData) {
        // Format timestamp for display
        const timeDisplay = cardData.time || new Date().toLocaleTimeString();
        
        // Source indicator (no percentage)
        const sourceCircle = cardData.source === 'AI' ? 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>' : 
            '<span style="display: inline-block; width: 8px; height: 8px; background: #6b7280; border-radius: 50%;"></span>';
        
        // Detect if this is a CheatCard to format content appropriately
        const isCheatCard = cardData.cardType === 'cheat';
        const cardTypeDisplay = isCheatCard ? 'CHEATCARD' : 'FLASHCARD';
        
        // Format the back content based on card type
        let formattedBack = cardData.back || 'No content available';
        if (isCheatCard) {
            // CheatCards should preserve emoji formatting (🎯, ⚡, 📝)
            formattedBack = formattedBack.replace(/\n/g, '<br>');
        } else {
            // FlashCards should show as paragraphs
            formattedBack = formattedBack.replace(/\n/g, '<br>');
        }
        
        return `
            <div class="card-header">
                <div class="card-type">${cardData.category || 'CONCEPT'}</div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; opacity: 0.7;">
                    ${sourceCircle}
                    <span>${cardData.flag || '🌐'}</span>
                    <span class="card-type-indicator" style="font-weight: 600; color: ${isCheatCard ? '#f59e0b' : '#3b82f6'};">${cardTypeDisplay}</span>
                    <span>${timeDisplay}</span>
                </div>
            </div>
            
            <div class="card-title" style="margin-bottom: 16px; font-weight: 600;">${cardData.front || 'No title'}</div>
            
            <div class="card-content ${isCheatCard ? 'cheat-content' : 'flash-content'}">
                <div class="card-answer-content">
                    ${formattedBack}
                </div>
            </div>
            
            <div class="card-source" style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; opacity: 0.6;">
                ${cardData.provider ? `${cardData.provider} • ` : ''}${cardData.source || 'AI'}${cardData.originalText ? ` • "${cardData.originalText.substring(0, 40)}..."` : ''}
            </div>
        `;
    }
    
    /**
     * Set up click handler for card interactions (no flipping needed)
     */
    setupCardClickHandler(cardElement, cardData) {
        // Cards now show all content by default - no need for flipping
        // Could add other interactions here if needed (like copy, star, etc.)
        cardElement.style.cursor = 'default';
    }
    
    extractCheatCategory(text) {
        // Simple category detection for cheat cards
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('meeting') || lowerText.includes('negotiate')) {
            return 'MEETING TIP';
        } else if (lowerText.includes('present') || lowerText.includes('speaking')) {
            return 'PRESENTATION TIP';
        } else if (lowerText.includes('interview') || lowerText.includes('job')) {
            return 'INTERVIEW TIP';
        } else if (lowerText.includes('quick') || lowerText.includes('tip')) {
            return 'QUICK WIN';
        } else if (lowerText.includes('avoid') || lowerText.includes('don\'t')) {
            return 'AVOID THIS';
        } else if (lowerText.includes('say') || lowerText.includes('phrase')) {
            return 'WHAT TO SAY';
        } else {
            return 'KEY FACTS';
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
        
        // Update card count with proper categorization
        this.updateCardCount();
        
        // Simple display update without animation (birth animation is handled separately)
        console.log(`🎨 [CardEngine] Updating display with ${this.app.cards.length} cards`);
    }
    
    /**
     * Add rejected text to transcript with visual indicator
     */
    addRejectedTextToTranscript(text, detection, reason) {
        console.log(`[CardEngine] Adding rejected text to transcript: "${text.substring(0, 30)}..." (${reason})`);
        
        // Create sentence object for the rejected text
        const rejectedSentence = {
            text: text,
            timestamp: new Date().toLocaleTimeString(),
            language: detection || { flag: '🌐', code: 'auto' },
            confidence: 0.5
        };
        
        // Add to transcript UI with rejection indicator
        if (this.app.transcriptSystem && this.app.transcriptSystem.ui) {
            this.app.transcriptSystem.ui.addRejectedSentence(rejectedSentence, reason);
        }
    }
    
    updateCardCount() {
        if (!this.app.els.cardCount) return;
        
        const totalCards = this.app.cards.length;
        const cheatCards = this.app.cards.filter(c => c.cardType === 'cheat').length;
        const flashCards = this.app.cards.filter(c => c.cardType === 'flash').length;
        
        if (totalCards === 0) {
            this.app.els.cardCount.textContent = '0 cards';
        } else if (flashCards > 0 && cheatCards > 0) {
            this.app.els.cardCount.textContent = `${totalCards} cards (${flashCards} flash + ${cheatCards} cheat)`;
        } else if (cheatCards > 0) {
            this.app.els.cardCount.textContent = `${totalCards} cheat cards`;
        } else {
            this.app.els.cardCount.textContent = `${totalCards} flash cards`;
        }
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
        
        // Switch to cheat card mode for testing
        const wasInInterviewMode = this.interviewMode;
        this.interviewMode = true;
        this.updateModeDisplay();
        
        // Update checkbox to reflect mode change
        const interviewModeCheckbox = document.getElementById('interviewMode');
        if (interviewModeCheckbox) {
            interviewModeCheckbox.checked = true;
        }
        
        console.log('✅ Switched to CheatCard mode for testing');
        
        // Run tests with cheat card mode enabled
        this.runCardGenerationTests();
        
        // Note: Don't switch back automatically - let user see the results
        console.log('🎯 CheatCard tests completed - staying in CheatCard mode');
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
    
    /**
     * Update cards placeholder message based on current mode
     */
    updateCardsPlaceholder() {
        const cardsTypeMessage = document.getElementById('cardsTypeMessage');
        if (cardsTypeMessage) {
            const cardType = this.interviewMode ? 'CheatCards' : 'Flashcards';
            cardsTypeMessage.textContent = `${cardType} will appear here`;
            
            console.log('[CardEngine] Updated placeholder to:', cardType);
        }
    }
}

window.CardEngine = CardEngine;