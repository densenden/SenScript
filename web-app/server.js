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
async function generateFlashcard(transcript, language, languageFlag) {
    const languageNames = {
        'de-DE': 'German',
        'en-US': 'English',
        'fr-FR': 'French', 
        'es-ES': 'Spanish',
        'it-IT': 'Italian'
    };
    
    const languageName = languageNames[language] || 'German';
    
    const prompt = `You are an intelligent assistant for online meetings and conversations. Create an educational flashcard from this transcript snippet to help the user understand key concepts and excel in their meeting.

Transcript: "${transcript}"
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
                const { transcript, language, languageFlag } = JSON.parse(body);
                
                console.log('[API] Generating card for:', transcript.substring(0, 50) + '...', 'Language:', language, languageFlag || '');
                
                const cardData = await generateFlashcard(transcript, language, languageFlag);
                
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