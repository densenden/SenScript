const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');
const path = require('path');

// Load environment variables (works differently in serverless)
try {
    require('dotenv').config();
} catch (error) {
    console.log('[ENV] dotenv not available in serverless environment - using process.env directly');
}

// Import existing modules with error handling
let LLMProvider, LLMConversation;
try {
    LLMProvider = require('./llm-providers');
    LLMConversation = require('./llm-conversation');
} catch (error) {
    console.error('[ERROR] Failed to load LLM modules:', error.message);
    throw new Error('Required modules not found');
}

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase client with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[Warning] Supabase environment variables not configured - using placeholder values');
    console.log('For production, configure: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Import education settings with robust error handling
let SENSCRIPT_CONFIG = {
    EDUCATION: {
        USER_LEVEL: 1,
        DETAIL_LEVEL: 5,  
        EXAMPLE_COMPLEXITY: 3
    }
};

try {
    const settingsModule = require('./settings-config.js');
    if (settingsModule && settingsModule.SENSCRIPT_CONFIG) {
        SENSCRIPT_CONFIG = settingsModule.SENSCRIPT_CONFIG;
        console.log('[Config] Loaded education settings:', SENSCRIPT_CONFIG.EDUCATION || 'Default');
    } else {
        console.log('[Config] settings-config.js found but no SENSCRIPT_CONFIG export');
    }
} catch (error) {
    console.log('[Config] settings-config.js not found or error loading, using defaults:', error.message);
}

// Initialize LLM system with error handling
let llmProvider, llmConversation;
try {
    llmProvider = new LLMProvider();
    llmConversation = new LLMConversation(llmProvider, SENSCRIPT_CONFIG.EDUCATION);
    console.log('[LLM] System initialized successfully');
} catch (error) {
    console.error('[ERROR] Failed to initialize LLM system:', error.message);
    console.log('[LLM] Server will start but LLM features may not work');
}

// Clerk JWT token verification
const verifyClerkToken = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token' });
    }
    
    try {
        // For development, we'll use a simple decode (in production, verify with Clerk SDK)
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        req.clerkUserId = payload.sub || payload.userId;
        
        // Get user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', req.clerkUserId)
            .single();
            
        if (error && error.code !== 'PGRST116') {
            console.error('Database error during auth:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Validation schemas
const settingsSchema = z.object({
    autoStartListening: z.boolean().optional(),
    defaultCardType: z.enum(['flash', 'cheat']).optional(),
    language: z.string().optional(),
    selectedModel: z.string().optional(),
    useFallback: z.boolean().optional(),
    outputLanguage: z.object({
        auto: z.boolean(),
        fixed: z.string().optional()
    }).optional(),
    education: z.object({
        userLevel: z.number().min(1).max(5).optional(),
        detailLevel: z.number().min(1).max(5).optional(),
        exampleComplexity: z.number().min(1).max(5).optional()
    }).optional()
});

const usagePingSchema = z.object({
    seconds: z.number().min(0).max(300),
    source: z.string().default('web'),
    meta: z.any().optional()
});

// Default settings
const DEFAULT_SETTINGS = {
    autoStartListening: false,
    defaultCardType: 'flash',
    language: 'auto',
    selectedModel: 'auto',
    useFallback: true,
    outputLanguage: { auto: true },
    education: {
        userLevel: 1,
        detailLevel: 5,
        exampleComplexity: 3
    }
};

// Rate limiting map
const rateLimitMap = new Map();

// Simple rate limiter
const rateLimit = (userId, limit = 1, windowMs = 15000) => {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);
    
    if (!userLimit) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (now > userLimit.resetTime) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (userLimit.count >= limit) {
        return false;
    }
    
    userLimit.count++;
    return true;
};

// API Routes

// Get user settings
app.get('/api/settings', verifyClerkToken, async (req, res) => {
    try {
        // Return default settings for now
        res.json(DEFAULT_SETTINGS);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update user settings
app.patch('/api/settings', verifyClerkToken, async (req, res) => {
    try {
        const validated = settingsSchema.parse(req.body);
        
        // Get current settings
        const current = await prisma.userSettings.findUnique({
            where: { userId: req.userId }
        });
        
        const currentData = current ? JSON.parse(current.data) : DEFAULT_SETTINGS;
        const newData = { ...currentData, ...validated };
        
        // Compute diff for audit
        const diff = {
            added: {},
            removed: {},
            updated: {}
        };
        
        Object.keys(validated).forEach(key => {
            if (currentData[key] === undefined) {
                diff.added[key] = validated[key];
            } else if (JSON.stringify(currentData[key]) !== JSON.stringify(validated[key])) {
                diff.updated[key] = { from: currentData[key], to: validated[key] };
            }
        });
        
        // Upsert settings
        const updated = await prisma.userSettings.upsert({
            where: { userId: req.userId },
            update: { data: JSON.stringify(newData) },
            create: {
                userId: req.userId,
                data: JSON.stringify(newData)
            }
        });
        
        // Create audit record
        await prisma.settingsAudit.create({
            data: {
                userId: req.userId,
                diff: JSON.stringify(diff),
                ip: req.ip,
                userAgent: req.headers['user-agent']
            }
        });
        
        res.json(newData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid settings', details: error.errors });
        }
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Usage ping endpoint
app.post('/api/usage/ping', verifyClerkToken, async (req, res) => {
    try {
        // Rate limiting
        if (!rateLimit(req.userId)) {
            return res.status(429).json({ error: 'Too many requests' });
        }
        
        const validated = usagePingSchema.parse(req.body);
        const minutes = Math.floor(validated.seconds / 60);
        
        if (minutes <= 0) {
            return res.json({ success: true, minutes: 0 });
        }
        
        // Get today's date at UTC midnight
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        // Atomically upsert daily usage
        await prisma.usageDaily.upsert({
            where: {
                userId_date: {
                    userId: req.userId,
                    date: today
                }
            },
            update: {
                minutes: { increment: minutes }
            },
            create: {
                userId: req.userId,
                date: today,
                minutes
            }
        });
        
        // Create or extend listening session if significant time
        if (validated.seconds >= 60) {
            const recentSession = await prisma.listeningSession.findFirst({
                where: {
                    userId: req.userId,
                    source: validated.source,
                    endedAt: null
                },
                orderBy: { startedAt: 'desc' }
            });
            
            if (recentSession && (Date.now() - recentSession.startedAt.getTime() < 5 * 60 * 1000)) {
                // Extend existing session
                await prisma.listeningSession.update({
                    where: { id: recentSession.id },
                    data: {
                        minutes: { increment: minutes },
                        endedAt: new Date()
                    }
                });
            } else {
                // Create new session
                await prisma.listeningSession.create({
                    data: {
                        userId: req.userId,
                        source: validated.source,
                        startedAt: new Date(Date.now() - validated.seconds * 1000),
                        endedAt: new Date(),
                        minutes,
                        meta: validated.meta ? JSON.stringify(validated.meta) : null
                    }
                });
            }
        }
        
        res.json({ success: true, minutes });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid usage data', details: error.errors });
        }
        console.error('Error recording usage:', error);
        res.status(500).json({ error: 'Failed to record usage' });
    }
});

// Get usage summary (temporarily without auth for development)
app.get('/api/usage/summary', async (req, res) => {
    try {
        const range = req.query.range || 'day';
        const now = new Date();
        
        // Return mock data for development
        const mockData = {
            day: {
                totalCalls: 15,
                totalTokens: 2400,
                cardsGenerated: 8,
                avgResponseTime: 850
            },
            week: {
                totalCalls: 78,
                totalTokens: 12100,
                cardsGenerated: 42,
                avgResponseTime: 920
            },
            month: {
                totalCalls: 245,
                totalTokens: 38500,
                cardsGenerated: 156,
                avgResponseTime: 780
            }
        };
        
        res.json(mockData[range] || mockData.day);
    } catch (error) {
        console.error('Error fetching usage summary:', error);
        res.status(500).json({ error: 'Failed to fetch usage summary' });
    }
});

// Generate card endpoint (temporarily without auth for development)
app.post('/api/generate-card', async (req, res) => {
    try {
        const { transcript, language, languageFlag, cardMode } = req.body;
        
        // Check if LLM system is initialized
        if (!llmProvider || !llmConversation) {
            return res.status(500).json({
                success: false,
                error: "LLM system not initialized. Server may be starting up.",
                details: "Please try again in a few seconds"
            });
        }
        
        // Check if any API keys are available
        const enabledProviders = llmProvider.getEnabledProviders();
        if (enabledProviders.length === 0) {
            return res.status(503).json({
                success: false,
                error: "No LLM API keys configured. Please add valid API keys to your .env file.",
                details: "Configure OPENAI_API_KEY, ANTHROPIC_API_KEY, or DEEPSEEK_API_KEY"
            });
        }
        
        // Use default settings for development
        const userSettings = DEFAULT_SETTINGS;
        
        const startTime = Date.now();
        const result = await llmConversation.processTranscript(
            'dev-user', // Use a default user ID for development
            transcript,
            userSettings.outputLanguage?.fixed || language,
            languageFlag,
            cardMode || userSettings.defaultCardType || 'flash',
            userSettings.outputLanguage,
            userSettings.selectedModel || 'auto'
        );
        
        // Track time as listening minutes
        const processingSeconds = Math.floor((Date.now() - startTime) / 1000);
        
        if (result && !result.skip) {
            res.json({
                success: true,
                card: result
            });
        } else {
            res.json({
                success: true,
                skip: true
            });
        }
    } catch (error) {
        console.error('Error generating card:', error);
        
        // Provide more helpful error messages
        let errorMessage = error.message;
        if (error.message.includes('401') || error.message.includes('Authentication')) {
            errorMessage = "Invalid API key. Please check your LLM provider API keys in .env file.";
        } else if (error.message.includes('403')) {
            errorMessage = "API access forbidden. Please check your API key permissions.";
        } else if (error.message.includes('429')) {
            errorMessage = "Rate limit exceeded. Please try again later.";
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            originalError: error.message
        });
    }
});

// Get available AI models
app.get('/api/models', (req, res) => {
    try {
        const enabledProviders = llmProvider.getEnabledProviders();
        const models = {};
        
        if (enabledProviders.includes('openai')) {
            models.openai = [
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost: '$0.002/1K tokens' },
                { id: 'gpt-4', name: 'GPT-4', cost: '$0.03/1K tokens' },
                { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', cost: '$0.01/1K tokens' }
            ];
        }
        
        if (enabledProviders.includes('anthropic')) {
            models.anthropic = [
                { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', cost: '$0.00025/1K tokens' },
                { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', cost: '$0.003/1K tokens' },
                { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', cost: '$0.015/1K tokens' }
            ];
        }
        
        if (enabledProviders.includes('deepseek')) {
            models.deepseek = [
                { id: 'deepseek-chat', name: 'DeepSeek Chat', cost: '$0.00014/1K tokens' }
            ];
        }
        
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch models' });
    }
});

// Public endpoint to get Clerk publishable key
app.get('/api/auth/config', (req, res) => {
    const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    console.log('[Server] Auth config requested');
    console.log('[Server] Publishable key length:', publishableKey ? publishableKey.length : 'NONE');
    console.log('[Server] Publishable key (first 20 chars):', publishableKey ? publishableKey.substring(0, 20) : 'NO_KEY');
    console.log('[Server] Publishable key (last 5 chars):', publishableKey ? publishableKey.slice(-5) : 'NO_KEY');
    
    res.json({
        publishableKey: publishableKey
    });
});

// User sync endpoint for Clerk authentication
app.post('/api/users/sync', verifyClerkToken, async (req, res) => {
    try {
        const { clerkUserId, email, firstName, lastName, profileImageUrl } = req.body;
        
        if (!clerkUserId || !email) {
            return res.status(400).json({ error: 'Missing required fields: clerkUserId, email' });
        }
        
        // Upsert user in database
        const { data: user, error } = await supabase
            .rpc('upsert_user_from_clerk', {
                clerk_id: clerkUserId,
                email_addr: email,
                first_n: firstName || null,
                last_n: lastName || null,
                profile_img: profileImageUrl || null
            });
            
        if (error) {
            console.error('Failed to sync user:', error);
            return res.status(500).json({ error: 'Failed to sync user with database' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('User sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User settings endpoint
app.get('/api/user/settings', verifyClerkToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', req.user.id)
            .single();
            
        if (error && error.code !== 'PGRST116') {
            console.error('Failed to get user settings:', error);
            return res.status(500).json({ error: 'Failed to retrieve settings' });
        }
        
        // Return default settings if none exist
        if (!settings) {
            const defaultSettings = {
                auto_start_listening: false,
                default_card_type: 'flash',
                language: 'auto',
                selected_model: 'auto',
                use_fallback: true,
                output_language: { auto: true },
                education_settings: {
                    userLevel: 1,
                    detailLevel: 5,
                    exampleComplexity: 3
                }
            };
            return res.json(defaultSettings);
        }
        
        res.json({
            auto_start_listening: settings.auto_start_listening,
            default_card_type: settings.default_card_type,
            language: settings.language,
            selected_model: settings.selected_model,
            use_fallback: settings.use_fallback,
            output_language: settings.output_language,
            education_settings: settings.education_settings,
            api_keys: settings.api_keys
        });
    } catch (error) {
        console.error('Settings retrieval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user settings endpoint
app.patch('/api/user/settings', verifyClerkToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const updates = req.body;
        
        // Convert camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.autoStartListening !== undefined) dbUpdates.auto_start_listening = updates.autoStartListening;
        if (updates.defaultCardType !== undefined) dbUpdates.default_card_type = updates.defaultCardType;
        if (updates.language !== undefined) dbUpdates.language = updates.language;
        if (updates.selectedModel !== undefined) dbUpdates.selected_model = updates.selectedModel;
        if (updates.useFallback !== undefined) dbUpdates.use_fallback = updates.useFallback;
        if (updates.outputLanguage !== undefined) dbUpdates.output_language = updates.outputLanguage;
        if (updates.educationSettings !== undefined) dbUpdates.education_settings = updates.educationSettings;
        if (updates.apiKeys !== undefined) dbUpdates.api_keys = updates.apiKeys;
        
        const { data: settings, error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: req.user.id,
                ...dbUpdates
            })
            .select()
            .single();
            
        if (error) {
            console.error('Failed to update user settings:', error);
            return res.status(500).json({ error: 'Failed to update settings' });
        }
        
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cross-app usage tracking endpoint
app.post('/api/usage/record', verifyClerkToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { minutes, source = 'web-app', sessionId, metadata } = req.body;
        
        if (!minutes || minutes <= 0) {
            return res.status(400).json({ error: 'Invalid minutes value' });
        }
        
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Record usage in Supabase
        const { error } = await supabase
            .from('usage_records')
            .insert({
                user_id: req.user.id,
                minutes_used: minutes,
                source: source,
                session_id: sessionId,
                metadata: metadata || {},
                billing_period_start: periodStart.toISOString(),
                billing_period_end: periodEnd.toISOString()
            });
            
        if (error) {
            console.error('Failed to record usage:', error);
            return res.status(500).json({ error: 'Failed to record usage' });
        }
        
        res.json({ success: true, minutes });
    } catch (error) {
        console.error('Usage recording error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for SPA (serves index.html for all non-API routes)
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`🔐 SenScript Web App with Auth running at http://localhost:${port}`);
    console.log('📱 Open this URL in Chrome to test the application');
    console.log('🎤 Make sure to allow microphone permissions when prompted');
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\nShutting down web-app server...');
    process.exit();
});