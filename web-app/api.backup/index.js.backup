// Vercel serverless function entry point - with static file serving
const fs = require('fs');
const path = require('path');

// MIME types for static files
const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json'
    };
    return types[ext] || 'application/octet-stream';
};

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
        
        // Handle static files (assets/, *.js, *.css, etc.)
        if (req.url.match(/\.(svg|png|jpg|jpeg|gif|js|css|json)$/)) {
            // Remove leading slash and resolve path relative to project root
            const relativePath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
            const filePath = path.join(__dirname, '..', relativePath);
            
            console.log(`Serving static file: ${req.url} -> ${filePath}`);
            
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error(`Static file not found: ${filePath}`, err.message);
                    // Try alternative paths
                    const altPath = path.join(__dirname, relativePath);
                    console.log(`Trying alternative path: ${altPath}`);
                    
                    fs.readFile(altPath, (err2, data2) => {
                        if (err2) {
                            console.error(`Alternative path also failed: ${altPath}`, err2.message);
                            return res.status(404).json({ 
                                error: 'File not found',
                                path: req.url,
                                attempted: [filePath, altPath]
                            });
                        }
                        
                        const mimeType = getMimeType(altPath);
                        res.setHeader('Content-Type', mimeType);
                        res.setHeader('Cache-Control', 'public, max-age=31536000');
                        res.status(200).send(data2);
                    });
                    return;
                }
                
                const mimeType = getMimeType(filePath);
                res.setHeader('Content-Type', mimeType);
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
                res.status(200).send(data);
            });
            return;
        }
        
        // Serve index.html for all other routes (SPA)
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
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache HTML for 1 hour
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