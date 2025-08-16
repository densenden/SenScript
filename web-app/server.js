const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config();

const port = process.env.PORT || 3002;
const webAppDir = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

// OpenAI API integration
async function generateFlashcard(transcript, language) {
    const prompt = `You are an intelligent assistant for business meetings. Analyze this conversation transcript and create a comprehensive learning flashcard.

Transcript: "${transcript}"

CRITICAL LANGUAGE INSTRUCTION: 
- Detect the language of the input transcript
- Respond ONLY in that exact same language 
- If input is in German, respond in German
- If input is in English, respond in English
- DO NOT translate to any other language
- DO NOT change the language of the input

Instructions:
- For questions: Provide thorough answers with context, facts, and practical insights
- For definitions: Explain concepts with examples and related information  
- For factual information: Expand with additional context and connections
- Explain any technical terms or business concepts mentioned
- Make responses informative and actionable for business/professional contexts
- Keep the front brief but make the back rich with valuable information

Return only valid JSON in this format:
{
  "category": "Question|Definition|Concept|Fact",
  "front": "Brief question or term (same language as input)",
  "back": "Comprehensive answer with facts, context, and practical insights (same language as input)", 
  "confidence": 85
}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 200,
                temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        console.log('[OpenAI] Raw response:', content);
        
        // Try to extract and clean JSON
        let jsonString = content;
        
        // Remove markdown code blocks if present
        jsonString = jsonString.replace(/```json\s*|\s*```/g, '');
        
        // Find JSON object
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonString = jsonMatch[0];
        }
        
        try {
            const result = JSON.parse(jsonString);
            console.log('[OpenAI] Parsed successfully:', result.category);
            return result;
        } catch (parseError) {
            console.error('[OpenAI] JSON parse error:', parseError.message);
            console.error('[OpenAI] Content was:', content);
            throw new Error('Failed to parse JSON response from OpenAI');
        }
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

    // API endpoint for flashcard generation
    if (pathname === '/api/generate-card' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { transcript, language } = JSON.parse(body);
                
                console.log('[API] Generating card for:', transcript.substring(0, 50) + '...');
                
                const cardData = await generateFlashcard(transcript, language);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    card: cardData
                }));
                
                console.log('[API] Card generated:', cardData.category);
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