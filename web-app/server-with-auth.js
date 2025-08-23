const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const path = require('path');
require('dotenv').config();

// Import existing modules
const LLMProvider = require('./llm-providers');
const LLMConversation = require('./llm-conversation');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve the auth-enabled HTML file as the default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-with-auth.html'));
});

// Static files (excluding index.html to avoid conflicts)
app.use(express.static(__dirname));

// Import education settings
let SENSCRIPT_CONFIG = {};
try {
    const { SENSCRIPT_CONFIG: config } = require('./settings-config.js');
    SENSCRIPT_CONFIG = config;
    console.log('[Config] Loaded education settings:', config.EDUCATION || 'Default');
} catch (error) {
    console.log('[Config] Using default settings');
    SENSCRIPT_CONFIG = {
        EDUCATION: {
            USER_LEVEL: 1,
            DETAIL_LEVEL: 5,  
            EXAMPLE_COMPLEXITY: 3
        }
    };
}

// Initialize LLM system
const llmProvider = new LLMProvider();
const llmConversation = new LLMConversation(llmProvider, SENSCRIPT_CONFIG.EDUCATION);

// Clerk webhook endpoint to verify JWT tokens (server-side)
const { Webhook } = require('svix');
const verifyClerkToken = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No authorization token' });
    }
    
    try {
        // For development, we'll use a simple decode (in production, verify with Clerk SDK)
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        req.userId = payload.sub || payload.userId;
        next();
    } catch (error) {
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
        const settings = await prisma.userSettings.findUnique({
            where: { userId: req.userId }
        });
        
        const data = settings ? JSON.parse(settings.data) : DEFAULT_SETTINGS;
        res.json(data);
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

// Get usage summary
app.get('/api/usage/summary', verifyClerkToken, async (req, res) => {
    try {
        const range = req.query.range || 'day';
        const now = new Date();
        let startDate = new Date();
        
        switch (range) {
            case 'day':
                startDate.setUTCHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                startDate.setUTCHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setUTCHours(0, 0, 0, 0);
                break;
        }
        
        const usage = await prisma.usageDaily.aggregate({
            where: {
                userId: req.userId,
                date: { gte: startDate }
            },
            _sum: { minutes: true }
        });
        
        const sessions = await prisma.listeningSession.count({
            where: {
                userId: req.userId,
                startedAt: { gte: startDate }
            }
        });
        
        res.json({
            range,
            totalMinutes: usage._sum.minutes || 0,
            totalSessions: sessions,
            startDate,
            endDate: now
        });
    } catch (error) {
        console.error('Error fetching usage summary:', error);
        res.status(500).json({ error: 'Failed to fetch usage summary' });
    }
});

// Generate card endpoint (with auth)
app.post('/api/generate-card', verifyClerkToken, async (req, res) => {
    try {
        const { transcript, language, languageFlag, cardMode } = req.body;
        
        // Get user settings
        const settings = await prisma.userSettings.findUnique({
            where: { userId: req.userId }
        });
        
        const userSettings = settings ? JSON.parse(settings.data) : DEFAULT_SETTINGS;
        
        // Apply user settings to LLM
        if (userSettings.education) {
            // Update education settings for this user's session
            // This would need to be implemented in your LLMConversation class
        }
        
        const startTime = Date.now();
        const result = await llmConversation.processTranscript(
            req.userId,
            transcript,
            userSettings.outputLanguage?.fixed || language,
            languageFlag,
            cardMode || userSettings.defaultCardType || 'flash',
            userSettings.outputLanguage
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Public endpoint to get Clerk publishable key
app.get('/api/auth/config', (req, res) => {
    res.json({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    });
});

// Start server
app.listen(port, () => {
    console.log(`🔐 SenScript Web App with Auth running at http://localhost:${port}`);
    console.log('📱 Open this URL in Chrome to test the application');
    console.log('🎤 Make sure to allow microphone permissions when prompted');
});

// Cleanup on exit
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});