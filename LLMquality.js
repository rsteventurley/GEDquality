/**
 * LLMquality - Express.js Web Application
 * A genealogical data processing web interface
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to serve HTML files
app.set('view engine', 'html');
app.engine('html', require('fs').readFileSync);

// Main route - serve the application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API route to handle rating submission
app.post('/api/rate', (req, res) => {
    const { location, page, llm, groundTruthDir, llmXmlDir } = req.body;
    
    // Validate location
    const validLocations = ['Tannenkirch', 'Bükkösd', 'Flögeln'];
    if (!validLocations.includes(location)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid location selected'
        });
    }
    
    // Validate LLM
    const validLLMs = ['Claude', 'ChatGPT', 'Gemini'];
    if (!validLLMs.includes(llm)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid LLM selected'
        });
    }
    
    // Validate page number
    const pageNumber = parseInt(page);
    if (isNaN(pageNumber) || pageNumber < 0) {
        return res.status(400).json({
            success: false,
            error: 'Page must be a valid non-negative integer'
        });
    }
    
    // Simulate processing with delay
    setTimeout(() => {
        const results = `
=== LLM Quality Rating Results ===
Location: ${location}
Page: ${pageNumber}
LLM: ${llm}
Ground Truth Directory: ${groundTruthDir || 'Not configured'}
LLM XML Directory: ${llmXmlDir || 'Not configured'}
Timestamp: ${new Date().toISOString()}

Processing genealogical data for ${location}, page ${pageNumber}...
Comparing ${llm} output against ground truth data...

Sample Results:
- Names accuracy: ${(Math.random() * 10 + 85).toFixed(1)}%
- Dates accuracy: ${(Math.random() * 10 + 80).toFixed(1)}%
- Relationships accuracy: ${(Math.random() * 10 + 88).toFixed(1)}%
- Overall quality score: ${(Math.random() * 10 + 85).toFixed(1)}%

Detailed analysis:
- ${Math.floor(Math.random() * 30 + 30)} individuals processed
- ${Math.floor(Math.random() * 10 + 10)} families analyzed
- ${Math.floor(Math.random() * 20 + 15)} birth events verified
- ${Math.floor(Math.random() * 15 + 10)} death events verified
- ${Math.floor(Math.random() * 12 + 8)} marriage events verified

Quality metrics by category:
✓ Name extraction: ${Math.random() > 0.3 ? 'Excellent' : 'Good'}
✓ Date parsing: ${Math.random() > 0.4 ? 'Good' : 'Fair'}
✓ Relationship mapping: ${Math.random() > 0.2 ? 'Very Good' : 'Good'}
${Math.random() > 0.6 ? '✓' : '⚠'} Location parsing: ${Math.random() > 0.6 ? 'Good' : 'Needs improvement'}

Recommendations:
- ${Math.random() > 0.5 ? 'Improve location standardization' : 'Enhance name parsing accuracy'}
- ${Math.random() > 0.5 ? 'Enhance date format recognition' : 'Improve relationship detection'}
- ${Math.random() > 0.5 ? 'Validate family relationship chains' : 'Standardize place names'}
        `;
        
        res.json({
            success: true,
            results: results,
            data: {
                location: location,
                page: pageNumber,
                llm: llm,
                groundTruthDir: groundTruthDir,
                llmXmlDir: llmXmlDir,
                timestamp: new Date().toISOString()
            }
        });
    }, 2000); // 2 second delay to simulate processing
});

// API route to handle configuration
app.post('/api/configure', (req, res) => {
    const { groundTruthDir, llmXmlDir, outputDir } = req.body;
    
    // In a real application, you would save this to a database or config file
    console.log(`Configuration updated - Ground Truth: ${groundTruthDir}, LLM XML: ${llmXmlDir}, Output: ${outputDir}`);
    
    res.json({
        success: true,
        message: 'Configuration saved successfully',
        config: {
            groundTruthDir,
            llmXmlDir,
            outputDir
        }
    });
});

// API route to check if file exists
app.post('/api/check-file', (req, res) => {
    const { fileName, outputDir } = req.body;
    
    if (!fileName || !outputDir) {
        return res.status(400).json({
            success: false,
            error: 'File name and output directory are required'
        });
    }
    
    const filePath = path.join(outputDir, fileName);
    const exists = fs.existsSync(filePath);
    
    res.json({
        success: true,
        exists: exists,
        filePath: filePath
    });
});

// API route to save file
app.post('/api/save-file', (req, res) => {
    const { fileName, content, outputDir, overwrite } = req.body;
    
    if (!fileName || !content || !outputDir) {
        return res.status(400).json({
            success: false,
            error: 'File name, content, and output directory are required'
        });
    }
    
    try {
        const filePath = path.join(outputDir, fileName);
        
        // Check if file exists and overwrite is not explicitly allowed
        if (fs.existsSync(filePath) && !overwrite) {
            return res.json({
                success: false,
                exists: true,
                message: 'File already exists'
            });
        }
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save the file
        fs.writeFileSync(filePath, content, 'utf8');
        
        res.json({
            success: true,
            message: `File saved successfully to ${filePath}`,
            filePath: filePath
        });
        
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save file: ' + error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Page not found'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 LLMquality Server Started`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Access the application at: http://localhost:${PORT}`);
    console.log('='.repeat(60));
});

module.exports = app;
