// Vercel serverless function entry point - NO EXPRESS
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    try {
        // Handle API routes
        if (req.url.startsWith('/api/health')) {
            return res.status(200).json({ 
                status: 'OK', 
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                message: 'SenScript serverless function is working'
            });
        }
        
        if (req.url.startsWith('/api/generate-card')) {
            return res.status(503).json({
                success: false,
                error: "Simplified serverless function. Use local development for full features.",
                details: "Run 'npm start' locally for complete LLM functionality"
            });
        }
        
        if (req.url.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        
        // Serve index.html for all other routes
        const indexPath = path.join(__dirname, '..', 'index.html');
        
        fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading index.html:', err);
                return res.status(500).json({ 
                    error: 'Failed to load application',
                    details: err.message 
                });
            }
            
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(data);
        });
        
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};