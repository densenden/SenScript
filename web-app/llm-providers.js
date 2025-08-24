// LLM Provider Abstraction Layer
// Supports OpenAI, Anthropic, and DeepSeek with automatic fastest responder selection

class LLMProvider {
    constructor() {
        this.providers = {
            openai: {
                name: 'OpenAI',
                enabled: !!process.env.OPENAI_API_KEY,
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                responseTime: null,
                failures: 0
            },
            anthropic: {
                name: 'Anthropic',
                enabled: !!process.env.ANTHROPIC_API_KEY,
                apiKey: process.env.ANTHROPIC_API_KEY,
                model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
                endpoint: 'https://api.anthropic.com/v1/messages',
                responseTime: null,
                failures: 0
            },
            deepseek: {
                name: 'DeepSeek',
                enabled: !!process.env.DEEPSEEK_API_KEY,
                apiKey: process.env.DEEPSEEK_API_KEY,
                model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
                endpoint: 'https://api.deepseek.com/v1/chat/completions',
                responseTime: null,
                failures: 0
            }
        };
        
        // Track performance metrics
        this.metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            averageResponseTime: 0
        };
        
        console.log('[LLM] Initialized providers:', this.getEnabledProviders());
    }
    
    getEnabledProviders() {
        return Object.entries(this.providers)
            .filter(([_, config]) => config.enabled)
            .map(([name, _]) => name);
    }
    
    async generateFlashcard(transcript, language, languageFlag, selectedModel = 'auto') {
        const enabledProviders = this.getEnabledProviders();
        
        if (enabledProviders.length === 0) {
            throw new Error('No LLM providers configured. Please set API keys in .env file.');
        }
        
        const startTime = Date.now();
        let result;
        
        try {
            if (selectedModel === 'auto') {
                // Race all enabled providers for fastest response
                console.log('[LLM] Auto mode: Racing all providers for fastest response');
                const promises = enabledProviders.map(provider => 
                    this.callProvider(provider, transcript, language, languageFlag)
                );
                result = await Promise.race(promises);
            } else {
                // Use specific provider
                if (!enabledProviders.includes(selectedModel)) {
                    throw new Error(`Selected model '${selectedModel}' is not available. Available: ${enabledProviders.join(', ')}`);
                }
                console.log(`[LLM] Using selected model: ${selectedModel}`);
                result = await this.callProvider(selectedModel, transcript, language, languageFlag);
            }
            
            const responseTime = Date.now() - startTime;
            
            // Update metrics
            this.metrics.totalCalls++;
            this.metrics.successfulCalls++;
            this.metrics.averageResponseTime = 
                (this.metrics.averageResponseTime * (this.metrics.successfulCalls - 1) + responseTime) / 
                this.metrics.successfulCalls;
            
            console.log(`[LLM] Response from ${result.provider} in ${responseTime}ms`);
            return result;
            
        } catch (error) {
            console.error('[LLM] Provider failed:', error);
            throw error;
        }
    }
    
    async callProvider(providerName, transcript, language, languageFlag) {
        const provider = this.providers[providerName];
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (providerName) {
                case 'openai':
                    result = await this.callOpenAI(provider, transcript, language, languageFlag);
                    break;
                case 'anthropic':
                    result = await this.callAnthropic(provider, transcript, language, languageFlag);
                    break;
                case 'deepseek':
                    result = await this.callDeepSeek(provider, transcript, language, languageFlag);
                    break;
                default:
                    throw new Error(`Unknown provider: ${providerName}`);
            }
            
            // Update provider metrics
            const responseTime = Date.now() - startTime;
            provider.responseTime = responseTime;
            provider.failures = 0;
            
            return {
                ...result,
                provider: providerName,
                responseTime
            };
            
        } catch (error) {
            provider.failures++;
            console.error(`[LLM] ${providerName} failed:`, error.message);
            throw error;
        }
    }
    
    getPrompt(language, languageFlag) {
        const languageNames = {
            'de-DE': 'German',
            'en-US': 'English',
            'fr-FR': 'French',
            'es-ES': 'Spanish',
            'it-IT': 'Italian'
        };
        
        const languageName = languageNames[language] || 'German';
        
        return `You are an intelligent assistant for online meetings and conversations. Create an educational flashcard from this transcript snippet to help the user understand key concepts and excel in their meeting.

Detected Language: ${languageName} ${languageFlag || ''}

CRITICAL LANGUAGE INSTRUCTION: 
- Respond EXCLUSIVELY in ${languageName} 
- Match the exact language of the input transcript
- DO NOT translate or switch languages
- Maintain the same linguistic style and terminology

CONTENT ANALYSIS:
1. Identify the primary content type:
   - Question: Direct questions or requests for explanation
   - Definition: Technical terms, concepts, or explanations
   - Concept: Complex ideas, theories, or processes
   - Fact: Statements, data, or specific information

2. Create educational content:
   - For QUESTIONS: Provide comprehensive, accurate answers with context
   - For DEFINITIONS: Explain terms clearly with examples and applications
   - For CONCEPTS: Break down complex ideas into understandable parts
   - For FACTS: Expand with related information and implications

3. Academic/Professional Focus:
   - Include relevant technical details
   - Add practical applications
   - Mention related concepts
   - Provide context for understanding

Return only valid JSON:
{
  "category": "Question|Definition|Concept|Fact",
  "front": "Clear, concise question or term (in ${languageName})",
  "back": "Detailed, educational explanation with examples and context (in ${languageName})",
  "confidence": 85
}`;
    }
    
    async callOpenAI(provider, transcript, language, languageFlag) {
        const prompt = this.getPrompt(language, languageFlag);
        
        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${provider.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { role: 'user', content: `${prompt}\n\nTranscript: "${transcript}"` }
                ],
                max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 200,
                temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Failed to parse OpenAI response');
    }
    
    async callAnthropic(provider, transcript, language, languageFlag) {
        const prompt = this.getPrompt(language, languageFlag);
        
        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: {
                'x-api-key': provider.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { 
                        role: 'user', 
                        content: `${prompt}\n\nTranscript: "${transcript}"`
                    }
                ],
                max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 200,
                temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE) || 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.content[0].text.trim();
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Failed to parse Anthropic response');
    }
    
    async callDeepSeek(provider, transcript, language, languageFlag) {
        const prompt = this.getPrompt(language, languageFlag);
        
        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${provider.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { role: 'user', content: `${prompt}\n\nTranscript: "${transcript}"` }
                ],
                max_tokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS) || 200,
                temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE) || 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Failed to parse DeepSeek response');
    }
    
    getMetrics() {
        const providerStats = Object.entries(this.providers)
            .filter(([_, config]) => config.enabled)
            .map(([name, config]) => ({
                name: config.name,
                avgResponseTime: config.responseTime,
                failures: config.failures
            }));
        
        return {
            ...this.metrics,
            providers: providerStats
        };
    }
}

module.exports = LLMProvider;