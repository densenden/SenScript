// Intelligent Conversation-based LLM Manager
// Maintains context across calls to reduce API costs by 90%+

class LLMConversation {
    constructor(provider) {
        this.provider = provider;
        this.conversations = new Map(); // Track conversations per session
        this.systemPrompt = null;
        this.maxContextSize = 10; // Keep last 10 exchanges
        this.tokenEstimate = 0;
    }
    
    getSystemPrompt() {
        if (!this.systemPrompt) {
            this.systemPrompt = `You are SenScript's intelligent flashcard generator, optimized for creating actionable study cards from educational and professional content.

PRIORITY: Generate exactly 1 card per worthy transcript segment. Never skip valid educational content.

TARGET CATEGORIES (use these specific names):
- "MEETING TIP" - Professional meeting strategies and responses
- "PRESENTATION TIP" - Public speaking and presentation advice  
- "INTERVIEW TIP" - Job interview preparation and answers
- "QUICK WIN" - Easy-to-remember facts, formulas, memory tricks
- "KEY FACTS" - Important educational concepts and principles
- "WHAT TO SAY" - Specific phrases, responses, or explanations
- "AVOID THIS" - Common mistakes and what not to do
- "CONCEPT" - Complex ideas requiring deeper understanding
- "FACT" - Straightforward factual information

CARD REQUIREMENTS:
1. Use SPECIFIC categories from the list above (not generic ones)
2. Create practical, actionable content
3. Always generate a card for educational content - be generous, not restrictive

CARD STYLE - Choose based on mode in user message:
- CHEAT CARD MODE: ALWAYS use ONLY emojis (🎯, ⚡, 📝) without bullet points. Keep each line under 15 words. Make scannable and actionable.
- FLASH CARD MODE: NEVER use emojis or bullet points. Write in complete paragraph form with detailed explanations.

JSON FORMAT:
{
  "category": "EXACT category name from list above",
  "front": "Clear question or scenario (what the user needs to know)",
  "back": "[Format based on requested card mode - structured bullets for cheat cards, plain text for flash cards]",
  "confidence": 85-95 (be confident for educational content),
  "cardType": "cheat" or "flash" (based on mode in user message),
  "skip": false
}

SKIP ONLY IF:
- Pure filler words (um, ah, okay, yes, no)
- Incomplete sentences with no educational value
- Repetitive greetings or social pleasantries

LANGUAGE: Always respond in the same language as the input transcript.`;
        }
        return this.systemPrompt;
    }
    
    async processTranscript(sessionId, transcript, language, languageFlag, cardMode = null, outputLanguage = null, selectedModel = 'auto') {
        // Get or create conversation for this session
        let conversation = this.conversations.get(sessionId);
        
        if (!conversation) {
            conversation = this.createNewConversation(language, selectedModel);
            this.conversations.set(sessionId, conversation);
        }
        
        // Update language if changed
        if (language !== conversation.currentLanguage) {
            this.updateConversationLanguage(conversation, language, languageFlag);
        }
        
        // Get current card mode from parameter or session
        const isCheatMode = cardMode === 'cheat' || (cardMode === null && this.getCardMode());
        const modeInstruction = isCheatMode ? 
            'CHEAT CARD MODE - MANDATORY: Use ONLY emojis for structure (🎯, ⚡, 📝). NO bullet points or dots. Each emoji line should be actionable and memorable.' :
            'FLASH CARD MODE - MANDATORY: Use plain text paragraphs without emojis or bullet points. Write in complete sentences with detailed explanations.';

        // Determine output language instruction
        const outputLangInstruction = outputLanguage && outputLanguage !== language 
            ? `\n\nIMPORTANT: Generate the flashcard content in ${this.getLanguageName(outputLanguage)} language, not ${this.getLanguageName(language)}.`
            : '';

        // Add user message with transcript
        const userMessage = {
            role: 'user',
            content: `New transcript segment (${this.getLanguageName(language)}):
"${transcript}"

CARD MODE: ${modeInstruction}

FORMAT EXAMPLE for ${isCheatMode ? 'CHEAT' : 'FLASH'} cards:
${isCheatMode ? 
`"back": "🎯 Main concept with clear action\n⚡ Memory trick or tip\n📝 Quick practical advice"` :
`"back": "Detailed explanation in paragraph form. Provide comprehensive information with clear reasoning and examples. Write in complete sentences without bullet points or emojis."`}

MANDATORY: Select the most appropriate category from this EXACT list:
- MEETING TIP (for professional meeting advice)
- PRESENTATION TIP (for public speaking)  
- INTERVIEW TIP (for job interviews)
- QUICK WIN (for memory tricks, formulas, mnemonics)
- KEY FACTS (for educational concepts)
- WHAT TO SAY (for specific phrases/responses)
- AVOID THIS (for common mistakes)
- CONCEPT (for complex ideas only)
- FACT (for simple factual info only)

Use the EXACT category name. Include "cardType": "${isCheatMode ? 'cheat' : 'flash'}" in response.${outputLangInstruction}

Generate a flashcard if ANY educational value exists. MODE: ${isCheatMode ? 'CHEAT' : 'FLASH'}`
        };
        
        conversation.messages.push(userMessage);
        
        // Trim conversation if too long (keep system + last N exchanges)
        this.trimConversation(conversation);
        
        try {
            // Call the appropriate provider with full conversation
            const response = await this.callProviderWithConversation(
                conversation.provider,
                conversation.messages
            );
            
            // Add assistant response to conversation
            conversation.messages.push({
                role: 'assistant',
                content: JSON.stringify(response)
            });
            
            // Update metrics
            conversation.totalCalls++;
            if (!response.skip) {
                conversation.cardsGenerated++;
            }
            
            // Include provider info in response
            response.provider = conversation.provider;
            return response;
            
        } catch (error) {
            // Silent error - will be handled by caller
            // On error, reset conversation
            this.conversations.delete(sessionId);
            throw error;
        }
    }
    
    createNewConversation(language, selectedModel = 'auto') {
        return {
            id: Date.now(),
            provider: this.selectOptimalProvider(selectedModel),
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt()
                }
            ],
            currentLanguage: language,
            totalCalls: 0,
            cardsGenerated: 0,
            startTime: Date.now()
        };
    }
    
    updateConversationLanguage(conversation, language, languageFlag) {
        conversation.currentLanguage = language;
        
        // Add a system message about language change
        conversation.messages.push({
            role: 'system',
            content: `Language switched to ${this.getLanguageName(language)} ${languageFlag || ''}. Continue responding in this language.`
        });
    }
    
    trimConversation(conversation) {
        // Keep system prompt + last N user/assistant pairs
        const systemMessages = conversation.messages.filter(m => m.role === 'system');
        const otherMessages = conversation.messages.filter(m => m.role !== 'system');
        
        if (otherMessages.length > this.maxContextSize * 2) {
            // Keep last N exchanges (N user + N assistant messages)
            const keepMessages = otherMessages.slice(-this.maxContextSize * 2);
            conversation.messages = [...systemMessages, ...keepMessages];
            
            // Add context marker
            conversation.messages.splice(systemMessages.length, 0, {
                role: 'system',
                content: '[Previous context trimmed for efficiency]'
            });
        }
    }
    
    selectOptimalProvider(selectedModel = 'auto') {
        // If specific model is selected, use it
        if (selectedModel !== 'auto') {
            const provider = this.provider.providers[selectedModel];
            if (!provider || !provider.enabled) {
                console.warn(`[LLM] Selected model '${selectedModel}' not available, falling back to auto selection`);
                // Fall through to auto selection
            } else {
                console.log(`[LLM] Using selected provider: ${selectedModel}`);
                return selectedModel;
            }
        }
        
        // Auto selection - choose based on performance metrics
        console.log('[LLM] Auto-selecting optimal provider based on performance');
        const enabledProviders = Object.entries(this.provider.providers)
            .filter(([_, config]) => config.enabled);
        
        if (enabledProviders.length === 0) {
            throw new Error('No LLM providers enabled');
        }
        
        // Sort by response time (fastest first) and failures (least first)
        enabledProviders.sort(([nameA, configA], [nameB, configB]) => {
            // Prioritize providers with response time data
            if (configA.responseTime && !configB.responseTime) return -1;
            if (!configA.responseTime && configB.responseTime) return 1;
            
            // Compare by response time if both have data
            if (configA.responseTime && configB.responseTime) {
                return configA.responseTime - configB.responseTime;
            }
            
            // Otherwise compare by failure count
            return configA.failures - configB.failures;
        });
        
        const selectedProvider = enabledProviders[0][0];
        console.log(`[LLM] Optimal provider selected: ${selectedProvider}`);
        return selectedProvider; // Return provider name
    }
    
    async callProviderWithConversation(providerName, messages) {
        const provider = this.provider.providers[providerName];
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (providerName) {
                case 'openai':
                    result = await this.callOpenAIConversation(provider, messages);
                    break;
                case 'anthropic':
                    result = await this.callAnthropicConversation(provider, messages);
                    break;
                case 'deepseek':
                    result = await this.callDeepSeekConversation(provider, messages);
                    break;
                default:
                    throw new Error(`Unknown provider: ${providerName}`);
            }
            
            // Update provider metrics
            provider.responseTime = Date.now() - startTime;
            provider.failures = 0;
            
            return result;
            
        } catch (error) {
            provider.failures++;
            throw error;
        }
    }
    
    async callOpenAIConversation(provider, messages) {
        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${provider.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: messages,
                max_tokens: 250, // Increased for comprehensive cards
                temperature: 0.3  // Lower for consistency
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            // Silent parse error - expected for some responses
        }
        
        return { skip: true, reason: 'Parse error' };
    }
    
    async callAnthropicConversation(provider, messages) {
        // Convert messages format for Anthropic
        const anthropicMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role,
                content: m.content
            }));
        
        const systemPrompt = messages
            .filter(m => m.role === 'system')
            .map(m => m.content)
            .join('\n');
        
        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: {
                'x-api-key': provider.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                system: systemPrompt,
                messages: anthropicMessages,
                max_tokens: 250,
                temperature: 0.3
            })
        });
        
        if (!response.ok) {
            throw new Error(`Anthropic error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.content[0].text.trim();
        
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            // Silent parse error - expected for some responses
        }
        
        return { skip: true, reason: 'Parse error' };
    }
    
    async callDeepSeekConversation(provider, messages) {
        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${provider.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: messages,
                max_tokens: 250,
                temperature: 0.3
            })
        });
        
        if (!response.ok) {
            throw new Error(`DeepSeek error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            // Silent parse error - expected for some responses
        }
        
        return { skip: true, reason: 'Parse error' };
    }
    
    getLanguageName(languageCode) {
        const names = {
            'de-DE': 'German',
            'en-US': 'English',
            'fr-FR': 'French',
            'es-ES': 'Spanish',
            'it-IT': 'Italian',
            'pt-PT': 'Portuguese',
            'nl-NL': 'Dutch',
            'sv-SE': 'Swedish',
            'no-NO': 'Norwegian',
            'fi-FI': 'Finnish',
            'da-DK': 'Danish',
            'ru-RU': 'Russian',
            'zh-CN': 'Chinese',
            'ja-JP': 'Japanese',
            'ko-KR': 'Korean',
            'ar-SA': 'Arabic',
            'el-GR': 'Greek'
        };
        return names[languageCode] || 'Unknown';
    }
    
    getSessionMetrics(sessionId) {
        const conversation = this.conversations.get(sessionId);
        if (!conversation) return null;
        
        const duration = Date.now() - conversation.startTime;
        const efficiency = conversation.cardsGenerated / conversation.totalCalls;
        
        return {
            provider: conversation.provider,
            totalCalls: conversation.totalCalls,
            cardsGenerated: conversation.cardsGenerated,
            efficiency: (efficiency * 100).toFixed(1) + '%',
            duration: Math.round(duration / 1000) + 's',
            contextSize: conversation.messages.length
        };
    }
    
    clearSession(sessionId) {
        this.conversations.delete(sessionId);
    }
    
    getCardMode() {
        // Try to get the current mode from the app instance
        // In interview mode (CheatCards), return true for cheat mode
        if (typeof window !== 'undefined' && window.app) {
            return window.app.apiSettings?.interviewMode || false;
        }
        return false;
    }
    
    /**
     * Reset conversation when mode changes to ensure fresh generation
     */
    resetConversationForModeChange(sessionId) {
        if (this.conversations.has(sessionId)) {
            console.log('🔄 [MODE-CHANGE] Resetting conversation for fresh card generation');
            this.conversations.delete(sessionId);
        }
    }

    clearAllSessions() {
        this.conversations.clear();
    }
}

module.exports = LLMConversation;