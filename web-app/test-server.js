const express = require('express');
const multer = require('multer');

const app = express();
const port = 3004;

// Simple multer setup
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }
});

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Test routes
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ 
        message: 'External server working!',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/transcribe', upload.single('audio'), (req, res) => {
    console.log('Transcribe endpoint hit!');
    console.log('File received:', !!req.file);
    console.log('File size:', req.file ? req.file.size : 'none');
    console.log('Metadata:', req.body.metadata);
    
    // Simulate Whisper API response for testing
    const mockResponse = {
        text: "This is a test transcription from the external server. The audio file was successfully processed.",
        language: "en",
        duration: parseFloat(JSON.parse(req.body.metadata || '{}').duration) || 10,
        segments: [
            {
                id: 0,
                start: 0.0,
                end: 5.0,
                text: "This is a test transcription from the external server.",
                avg_logprob: -0.3,
                words: [
                    { word: "This", start: 0.0, end: 0.2, probability: 0.99 },
                    { word: "is", start: 0.2, end: 0.35, probability: 0.98 },
                    { word: "a", start: 0.35, end: 0.4, probability: 0.97 },
                    { word: "test", start: 0.4, end: 0.7, probability: 0.96 }
                ]
            },
            {
                id: 1,
                start: 5.0,
                end: 10.0,
                text: "The audio file was successfully processed.",
                avg_logprob: -0.2,
                words: [
                    { word: "The", start: 5.0, end: 5.15, probability: 0.99 },
                    { word: "audio", start: 5.15, end: 5.5, probability: 0.98 }
                ]
            }
        ]
    };
    
    res.json(mockResponse);
});

// Start server
app.listen(port, () => {
    console.log(`🧪 External test server running on http://localhost:${port}`);
    console.log(`Test endpoints:`);
    console.log(`  GET  http://localhost:${port}/api/test`);
    console.log(`  POST http://localhost:${port}/api/transcribe`);
});