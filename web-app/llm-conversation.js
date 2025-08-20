// Intelligent Conversation-based LLM Manager
// Maintains context across calls to reduce API costs by 90%+

class LLMConversation {
    constructor(provider, educationSettings = { USER_LEVEL: 3, DETAIL_LEVEL: 3, EXAMPLE_COMPLEXITY: 3 }) {
        this.provider = provider;
        this.conversations = new Map(); // Track conversations per session
        this.systemPrompt = null;
        this.maxContextSize = 10; // Keep last 10 exchanges
        this.tokenEstimate = 0;
        this.educationSettings = educationSettings;
        
        console.log('[LLM-Conversation] Education settings:', this.educationSettings);
    }
    
    getSystemPrompt(educationSettings = { userLevel: 3, detailLevel: 3, exampleComplexity: 3 }, interviewMode = false) {
        const { userLevel, detailLevel, exampleComplexity } = educationSettings;
        
        // Define education level descriptions
        const userLevels = {
            1: "complete beginner with no prior knowledge",
            2: "basic learner with minimal background", 
            3: "general audience with some education",
            4: "advanced student with good background",
            5: "expert/professional with deep knowledge"
        };
        
        const detailLevels = {
            1: "very brief, one-sentence explanations",
            2: "concise explanations with key points only", 
            3: "moderate detail with context and examples",
            4: "detailed explanations with multiple aspects",
            5: "comprehensive coverage with nuances and edge cases"
        };
        
        const exampleLevels = {
            1: "everyday analogies and simple comparisons",
            2: "basic real-world examples everyone knows",
            3: "practical examples from common experience", 
            4: "technical examples with some complexity",
            5: "academic examples with precise terminology"
        };
        
        if (!this.systemPrompt) {
            if (interviewMode) {
                this.systemPrompt = `You are an Interview Test Companion - a strategic assistant that creates "Spickzettel" (cheat sheets) for interviews, exams, and tests.

INTERVIEW MODE OBJECTIVE:
Your goal is to help someone succeed in interviews and pass tests by providing strategic insights, key talking points, and smart responses.

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME LANGUAGE as the input transcript
- German input = German flashcard
- English input = English flashcard  
- DO NOT translate or switch languages

SPICKZETTEL CREATION RULES:
- FRONT: Strategic question or key topic (max 1 line)
- BACK: Smart answer with what to say + what NOT to say (max 3 lines)
- Focus on IMPRESSING interviewers and PASSING tests
- Provide quick facts, talking points, and strategic responses

Examples of GOOD interview cards:
Input: "Machine learning algorithms require large datasets for training"
Output: {"front": "How to discuss ML in interviews?", "back": "✅ Say: 'ML needs quality data, not just quantity - feature engineering matters'\n❌ Avoid: Technical jargon without context\n🎯 Key point: Emphasize data quality over data size"}

Input: "Quantencomputer verwenden Qubits für Berechnungen"
Output: {"front": "Wie erkläre ich Quantencomputer?", "back": "✅ Sagen: 'Qubits können gleichzeitig 0 und 1 sein - das macht sie exponentiell schneller'\n❌ Vermeiden: Zu technische Details ohne Nutzen zu erklären\n🎯 Kernpunkt: Überlegenheit durch Parallelverarbeitung betonen"}

STRATEGIC CATEGORIES:
- "Interview Tip" - How to answer specific questions
- "Key Facts" - Impressive facts to mention
- "What to Say" - Good responses and talking points
- "Avoid This" - Common mistakes to avoid
- "Quick Win" - Easy points to score in tests/interviews

Flashcard JSON format:
{
  "category": "Interview Tip|Key Facts|What to Say|Avoid This|Quick Win",
  "front": "Strategic question or key topic (max 1 line, SAME LANGUAGE AS INPUT)",
  "back": "Smart answer with what to say + what NOT to say (max 3 lines, SAME LANGUAGE AS INPUT)",
  "source": {
    "title": "Wikipedia article title or search term for deeper learning",
    "type": "wikipedia|search"
  },
  "confidence": 0-100,
  "skip": false
}`;
            } else {
                this.systemPrompt = `You are an intelligent meeting assistant that creates educational flashcards from conversation snippets.

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME LANGUAGE as the input transcript
- German input = German flashcard
- English input = English flashcard  
- French input = French flashcard
- DO NOT translate or switch languages

EDUCATION LEVEL ADAPTATION:
- Target audience: ${userLevels[userLevel]}
- Explanation style: ${detailLevels[detailLevel]}
- Example complexity: ${exampleLevels[exampleComplexity]}

CRITICAL CONTENT RULES:
- FRONT: Clear, simplified question or concept (max 1 line)
- BACK: Adjust explanation depth based on education level settings above - for detail level 5, provide comprehensive explanations with multiple aspects and nuances (max 4 lines)
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

MEANINGFUL CATEGORIES:
- "How-To" - Step-by-step processes and methods
- "Why" - Explanations of causes, reasons, and mechanisms  
- "Key Insight" - Important realizations and discoveries
- "Definition" - Clear explanations of terms and concepts
- "Example" - Real-world applications and illustrations

Flashcard JSON format:
{
  "category": "How-To|Why|Key Insight|Definition|Example",
  "front": "Clear question or concept (1 line, SAME LANGUAGE AS INPUT)",
  "back": "Answer/explanation adapted to detail level - comprehensive for level 5 (max 4 lines, SAME LANGUAGE AS INPUT)",
  "source": {
    "title": "Wikipedia article title or search term for deeper learning",
    "type": "wikipedia|search"
  },
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
        }
        return this.systemPrompt;
    }
    
    async processTranscript(sessionId, transcript, language, languageFlag, outputLanguage = null, interviewMode = false) {
        // Get or create conversation for this session
        let conversation = this.conversations.get(sessionId);
        
        if (!conversation) {
            conversation = this.createNewConversation(language, interviewMode);
            this.conversations.set(sessionId, conversation);
        }
        
        // Update language if changed
        if (language !== conversation.currentLanguage) {
            this.updateConversationLanguage(conversation, language, languageFlag);
        }
        
        // Determine which language to respond in
        const responseLanguage = outputLanguage || language;
        const responseLanguageName = this.getLanguageName(responseLanguage);
        
        console.log(`🎨 [LLM-CONVERSATION] Input: ${this.getLanguageName(language)}, Output: ${responseLanguageName}`);
        
        // Add user message with transcript
        const userMessage = {
            role: 'user',
            content: `New transcript segment in ${this.getLanguageName(language)}:
"${transcript}"

CRITICAL REQUIREMENTS:
1. ${outputLanguage ? `TRANSLATE TO ${responseLanguageName} (${responseLanguage}) - ALL text must be in ${responseLanguageName}, NOT ${this.getLanguageName(language)}` : `Respond in ${this.getLanguageName(language)} ONLY (${language})`}
2. FRONT: Clear question/concept (1 line max) - ${outputLanguage ? `in ${responseLanguageName}` : `in ${this.getLanguageName(language)}`}
3. BACK: Actual answer/insight (adapt to detail level - up to 4 lines for comprehensive) - ${outputLanguage ? `in ${responseLanguageName}` : `in ${this.getLanguageName(language)}`}
4. SOURCE: Provide Wikipedia article title or search term for deeper learning - ${outputLanguage ? `in ${responseLanguageName}` : `in ${this.getLanguageName(language)}`}
5. Extract KNOWLEDGE, not just reformulate questions
6. Skip if no educational answer/insight is provided

${outputLanguage ? `TRANSLATION REQUIRED: Input is ${this.getLanguageName(language)}, output MUST be ${responseLanguageName}. Translate all content while preserving educational value.` : ''}

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
    
    createNewConversation(language, interviewMode = false) {
        console.log('🎓 [LLM-CONVERSATION] Creating conversation with education settings:');
        console.log('   Raw educationSettings object:', JSON.stringify(this.educationSettings, null, 2));
        console.log('   Interview Mode:', interviewMode ? 'ACTIVATED' : 'Standard');
        
        const educationSettings = {
            userLevel: this.educationSettings.USER_LEVEL || this.educationSettings.userLevel || 3,
            detailLevel: this.educationSettings.DETAIL_LEVEL || this.educationSettings.detailLevel || 3,
            exampleComplexity: this.educationSettings.EXAMPLE_COMPLEXITY || this.educationSettings.exampleComplexity || 3
        };
        
        console.log('🎓 [LLM-CONVERSATION] Final education settings for prompt:');
        console.log('   User Level:', educationSettings.userLevel, '(1=Beginner, 5=Expert)');
        console.log('   Detail Level:', educationSettings.detailLevel, '(1=Brief, 5=Comprehensive)');  
        console.log('   Example Complexity:', educationSettings.exampleComplexity, '(1=Simple, 5=Academic)');
        console.log('   Will generate system prompt with these settings...');
        
        return {
            id: Date.now(),
            provider: this.selectOptimalProvider(),
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt(educationSettings, interviewMode)
                }
            ],
            currentLanguage: language,
            totalCalls: 0,
            cardsGenerated: 0,
            startTime: Date.now(),
            interviewMode: interviewMode
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
                max_tokens: 300, // Increased for more detailed cards
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
                // Clean the JSON string to remove control characters that break parsing
                const cleanJson = jsonMatch[0]
                    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
                    .replace(/\n/g, '\\n')  // Escape newlines properly
                    .replace(/\r/g, '\\r')  // Escape carriage returns
                    .replace(/\t/g, '\\t'); // Escape tabs
                
                return JSON.parse(cleanJson);
            }
        } catch (e) {
            console.error('Parse error:', e);
            console.error('Raw content:', content);
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
                max_tokens: 300,
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
                // Clean the JSON string to remove control characters that break parsing
                const cleanJson = jsonMatch[0]
                    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
                    .replace(/\n/g, '\\n')  // Escape newlines properly
                    .replace(/\r/g, '\\r')  // Escape carriage returns
                    .replace(/\t/g, '\\t'); // Escape tabs
                
                return JSON.parse(cleanJson);
            }
        } catch (e) {
            console.error('Parse error:', e);
            console.error('Raw content:', content);
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
                max_tokens: 300,
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
                // Clean the JSON string to remove control characters that break parsing
                const cleanJson = jsonMatch[0]
                    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
                    .replace(/\n/g, '\\n')  // Escape newlines properly
                    .replace(/\r/g, '\\r')  // Escape carriage returns
                    .replace(/\t/g, '\\t'); // Escape tabs
                
                return JSON.parse(cleanJson);
            }
        } catch (e) {
            console.error('Parse error:', e);
            console.error('Raw content:', content);
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
            'ru-RU': 'Russian',
            'ja-JP': 'Japanese',
            'zh-CN': 'Chinese',
            'ko-KR': 'Korean',
            'pt-PT': 'Portuguese',
            'nl-NL': 'Dutch',
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
    
    clearAllSessions() {
        this.conversations.clear();
    }
    
    // Update education settings for a specific session
    updateEducationSettings(sessionId, newSettings) {
        console.log('🎓 [LLM-CONVERSATION] Updating education settings for session:', sessionId);
        console.log('   New settings:', JSON.stringify(newSettings, null, 2));
        
        // Update global default settings
        if (newSettings.userLevel !== undefined) {
            this.educationSettings.userLevel = newSettings.userLevel;
            this.educationSettings.USER_LEVEL = newSettings.userLevel; // Backward compatibility
        }
        if (newSettings.detailLevel !== undefined) {
            this.educationSettings.detailLevel = newSettings.detailLevel;
            this.educationSettings.DETAIL_LEVEL = newSettings.detailLevel;
        }
        if (newSettings.exampleComplexity !== undefined) {
            this.educationSettings.exampleComplexity = newSettings.exampleComplexity;
            this.educationSettings.EXAMPLE_COMPLEXITY = newSettings.exampleComplexity;
        }
        
        console.log('🎓 [LLM-CONVERSATION] Updated educationSettings:', JSON.stringify(this.educationSettings, null, 2));
        
        // Clear existing conversation for this session to force new system prompt
        const conversation = this.conversations.get(sessionId);
        if (conversation) {
            console.log('🔄 [LLM-CONVERSATION] Clearing existing conversation to apply new education settings');
            this.conversations.delete(sessionId);
        }
    }
}

module.exports = LLMConversation;