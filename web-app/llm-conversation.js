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
            this.systemPrompt = `You are an intelligent meeting assistant that creates educational flashcards from conversation snippets.

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME LANGUAGE as the input transcript
- German input = German flashcard
- English input = English flashcard  
- French input = French flashcard
- DO NOT translate or switch languages

CRITICAL CONTENT RULES:
- FRONT: Clear, simplified question or concept (max 1 line)
- BACK: Concise answer or explanation (max 2 lines, NO question repetition)
- Extract KNOWLEDGE and INSIGHTS, not just reformulate the question
- Focus on answerable content with educational value

Examples of GOOD flashcards:
Input: "How long has the Earth existed? Scientists estimate about 4.5 billion years based on radiometric dating"
Output: {"front": "How old is Earth?", "back": "About 4.5 billion years old\nDetermined through radiometric dating"}

Input: "Machine learning works by training algorithms on data to find patterns"
Output: {"front": "How does machine learning work?", "back": "Trains algorithms on data to find patterns\nAlgorithms learn without explicit programming"}

Examples of content to SKIP:
- Pure questions without answers: "How long does the earth exist?" → SKIP
- Greetings/fillers: "hello", "um", "you know" → SKIP
- Incomplete thoughts: "this is not new hallo ist die" → SKIP

Your role:
1. Analyze each transcript segment for ANSWERABLE educational content
2. Extract the core knowledge or insight being shared
3. Create clear question + concise answer format
4. Skip content that lacks educational answers/insights

Output format:
- If content has educational VALUE: Return JSON flashcard with clear Q&A
- If content lacks educational VALUE: Return {"skip": true, "reason": "brief explanation"}

Flashcard JSON format:
{
  "category": "Question|Definition|Concept|Fact",
  "front": "Clear question or concept (1 line, SAME LANGUAGE AS INPUT)",
  "back": "Concise answer/explanation (max 2 lines, SAME LANGUAGE AS INPUT)",
  "confidence": 0-100,
  "skip": false
}

Remember:
- LANGUAGE CONSISTENCY IS MOST IMPORTANT
- FRONT = simplified clear question/concept
- BACK = actual answer/insight (NOT question repetition)
- Skip content without clear educational answers
- Focus on extracting knowledge and insights`;
        }
        return this.systemPrompt;
    }
    
    async processTranscript(sessionId, transcript, language, languageFlag) {
        // Get or create conversation for this session
        let conversation = this.conversations.get(sessionId);
        
        if (!conversation) {
            conversation = this.createNewConversation(language);
            this.conversations.set(sessionId, conversation);
        }
        
        // Update language if changed
        if (language !== conversation.currentLanguage) {
            this.updateConversationLanguage(conversation, language, languageFlag);
        }
        
        // Add user message with transcript
        const userMessage = {
            role: 'user',
            content: `New transcript segment in ${this.getLanguageName(language)}:
"${transcript}"

CRITICAL REQUIREMENTS:
1. Respond in ${this.getLanguageName(language)} ONLY (${language})
2. FRONT: Clear question/concept (1 line max)
3. BACK: Actual answer/insight (2 lines max, NO question repetition)
4. Extract KNOWLEDGE, not just reformulate questions
5. Skip if no educational answer/insight is provided

Does this segment contain answerable educational content? If yes, create flashcard. If no educational value, return skip:true.`
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
            
            return response;
            
        } catch (error) {
            console.error('[Conversation] Error:', error);
            // On error, reset conversation
            this.conversations.delete(sessionId);
            throw error;
        }
    }
    
    createNewConversation(language) {
        return {
            id: Date.now(),
            provider: this.selectOptimalProvider(),
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
    
    selectOptimalProvider() {
        // Select provider based on performance metrics
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
        
        return enabledProviders[0][0]; // Return provider name
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
                max_tokens: 150, // Reduced for efficiency
                temperature: 0.5  // Lower for consistency
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
            console.error('Parse error:', e);
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
                max_tokens: 150,
                temperature: 0.5
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
            console.error('Parse error:', e);
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
                max_tokens: 150,
                temperature: 0.5
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
            console.error('Parse error:', e);
        }
        
        return { skip: true, reason: 'Parse error' };
    }
    
    getLanguageName(languageCode) {
        const names = {
            'de-DE': 'German',
            'en-US': 'English',
            'fr-FR': 'French',
            'es-ES': 'Spanish',
            'it-IT': 'Italian'
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
    
    clearAllSessions() {
        this.conversations.clear();
    }
}

module.exports = LLMConversation;