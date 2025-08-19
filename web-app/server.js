const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config();

const LLMProvider = require('./llm-providers');
const LLMConversation = require('./llm-conversation');

const port = process.env.PORT || 3002;
const webAppDir = __dirname;

// Initialize LLM system
const llmProvider = new LLMProvider();
const llmConversation = new LLMConversation(llmProvider);

// User settings storage (in production, use database)
const userSettings = new Map();

// Usage tracking
const usageStats = {
    totalTokens: 0,
    totalCalls: 0,
    byProvider: {},
    bySession: new Map()
};

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

// Get or create user settings
function getUserSettings(sessionId) {
    if (!userSettings.has(sessionId)) {
        userSettings.set(sessionId, {
            apiKeys: {},
            selectedModel: 'auto',
            useFallback: true
        });
    }
    return userSettings.get(sessionId);
}

// Apply user API keys if provided
function applyUserKeys(sessionId) {
    const settings = getUserSettings(sessionId);
    
    // Override provider keys with user keys if provided
    if (settings.apiKeys.openai) {
        llmProvider.providers.openai.apiKey = settings.apiKeys.openai;
        llmProvider.providers.openai.enabled = true;
    }
    if (settings.apiKeys.anthropic) {
        llmProvider.providers.anthropic.apiKey = settings.apiKeys.anthropic;
        llmProvider.providers.anthropic.enabled = true;
    }
    if (settings.apiKeys.deepseek) {
        llmProvider.providers.deepseek.apiKey = settings.apiKeys.deepseek;
        llmProvider.providers.deepseek.enabled = true;
    }
    
    // Use fallback keys if enabled and no user keys
    if (settings.useFallback) {
        if (!settings.apiKeys.openai && process.env.FALLBACK_OPENAI_KEY) {
            llmProvider.providers.openai.apiKey = process.env.FALLBACK_OPENAI_KEY;
            llmProvider.providers.openai.enabled = true;
        }
        if (!settings.apiKeys.anthropic && process.env.FALLBACK_ANTHROPIC_KEY) {
            llmProvider.providers.anthropic.apiKey = process.env.FALLBACK_ANTHROPIC_KEY;
            llmProvider.providers.anthropic.enabled = true;
        }
        if (!settings.apiKeys.deepseek && process.env.FALLBACK_DEEPSEEK_KEY) {
            llmProvider.providers.deepseek.apiKey = process.env.FALLBACK_DEEPSEEK_KEY;
            llmProvider.providers.deepseek.enabled = true;
        }
    }
    
    // Apply selected model
    if (settings.selectedModel && settings.selectedModel !== 'auto') {
        const [provider, model] = settings.selectedModel.split(':');
        if (provider && model) {
            llmProvider.providers[provider].model = model;
        }
    }
}

// Track usage for reporting
function trackUsage(sessionId, provider, tokens, responseTime) {
    usageStats.totalTokens += tokens;
    usageStats.totalCalls++;
    
    if (!usageStats.byProvider[provider]) {
        usageStats.byProvider[provider] = {
            calls: 0,
            tokens: 0,
            avgResponseTime: 0
        };
    }
    
    const providerStats = usageStats.byProvider[provider];
    providerStats.calls++;
    providerStats.tokens += tokens;
    providerStats.avgResponseTime = 
        (providerStats.avgResponseTime * (providerStats.calls - 1) + responseTime) / providerStats.calls;
    
    // Track per session
    if (!usageStats.bySession.has(sessionId)) {
        usageStats.bySession.set(sessionId, {
            calls: 0,
            tokens: 0,
            started: Date.now()
        });
    }
    
    const sessionStats = usageStats.bySession.get(sessionId);
    sessionStats.calls++;
    sessionStats.tokens += tokens;
}

// Estimate tokens (rough approximation)
function estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}

// Intelligent flashcard generation with conversation context
async function generateFlashcard(sessionId, transcript, language, languageFlag) {
    // Apply user settings
    applyUserKeys(sessionId);
    
    const startTime = Date.now();

    try {
        // Use conversation-based approach for efficiency
        const result = await llmConversation.processTranscript(
            sessionId,
            transcript,
            language,
            languageFlag
        );
        
        // Track usage
        const responseTime = Date.now() - startTime;
        const estimatedTokens = estimateTokens(transcript) + 150; // Input + output estimate
        trackUsage(sessionId, result.provider || 'unknown', estimatedTokens, responseTime);
        
        // Skip trivial content
        if (result.skip) {
            console.log('[LLM] Skipped trivial content:', result.reason);
            return null;
        }
        
        console.log('[LLM] Card generated:', result.category, `(${result.confidence}% confidence)`);
        return result;
    } catch (error) {
        console.error('[OpenAI] Error:', error.message);
        throw error;
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoint for updating user settings
    if (pathname === '/api/settings' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { sessionId, apiKeys, selectedModel, useFallback } = JSON.parse(body);
                const settings = getUserSettings(sessionId || 'default');
                
                if (apiKeys) settings.apiKeys = apiKeys;
                if (selectedModel !== undefined) settings.selectedModel = selectedModel;
                if (useFallback !== undefined) settings.useFallback = useFallback;
                
                userSettings.set(sessionId || 'default', settings);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, settings }));
                
                console.log('[API] Settings updated for session:', sessionId || 'default');
            } catch (error) {
                console.error('[API] Settings error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }
    
    // API endpoint for usage statistics
    if (pathname === '/api/usage' && req.method === 'GET') {
        const sessionId = parsedUrl.query.sessionId || 'default';
        const sessionStats = usageStats.bySession.get(sessionId);
        const conversationMetrics = llmConversation.getSessionMetrics(sessionId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            global: {
                totalTokens: usageStats.totalTokens,
                totalCalls: usageStats.totalCalls,
                byProvider: usageStats.byProvider
            },
            session: sessionStats || null,
            conversation: conversationMetrics,
            providers: llmProvider.getMetrics()
        }));
        return;
    }
    
    // API endpoint for available models
    if (pathname === '/api/models' && req.method === 'GET') {
        const models = {
            openai: [
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fastest)', cost: '$' },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Balanced)', cost: '$$' },
                { id: 'gpt-4o', name: 'GPT-4o (Best)', cost: '$$$' }
            ],
            anthropic: [
                { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fastest)', cost: '$' },
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Best)', cost: '$$' }
            ],
            deepseek: [
                { id: 'deepseek-chat', name: 'DeepSeek Chat (Cheapest)', cost: '$' },
                { id: 'deepseek-coder', name: 'DeepSeek Coder (Technical)', cost: '$' }
            ]
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(models));
        return;
    }
    
    // API endpoint for flashcard generation
    if (pathname === '/api/generate-card' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { sessionId, transcript, language, languageFlag } = JSON.parse(body);
                
                const session = sessionId || 'default';
                console.log('[API] Processing for session:', session, transcript.substring(0, 50) + '...', 'Language:', language);
                
                const cardData = await generateFlashcard(session, transcript, language, languageFlag);
                
                if (cardData) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        card: cardData
                    }));
                } else {
                    // Content was skipped as trivial
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        skip: true
                    }));
                }
            } catch (error) {
                console.error('[API] Error generating card:', error.message);
                
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message,
                    fallback: true
                }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = path.join(webAppDir, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(port, () => {
    console.log(`🌐 SenScript Web App running at http://localhost:${port}`);
    console.log('📱 Open this URL in Chrome to test the application');
    console.log('🎤 Make sure to allow microphone permissions when prompted');
});