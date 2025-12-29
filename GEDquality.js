/**
 * GEDquality - Express.js Web Application
 * A GEDCOM file integrity checker for genealogical data
 *
 * @author Steve Turley
 * @version 1.0.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Import the data model classes
const GedReader = require('./GEDCOM/GedReader');
const GedcomIntegrityChecker = require('./utils/GedcomIntegrityChecker');

// Configure multer for file uploads to temporary directory
const upload = multer({
    dest: path.join(os.tmpdir(), 'gedquality-uploads'),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Store uploaded file temporarily
let uploadedFile = null;

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

// Helper function to fix filename encoding issues
function fixFilenameEncoding(filename) {
    try {
        // Check if the filename is already properly encoded (doesn't contain invalid UTF-8 patterns)
        if (!filename.includes('Ã')) {
            return filename;
        }

        // Convert from Latin-1 to UTF-8 by treating each character as a byte
        const bytes = [];
        for (let i = 0; i < filename.length; i++) {
            bytes.push(filename.charCodeAt(i) & 0xFF);
        }

        // Convert bytes to UTF-8 string
        const result = Buffer.from(bytes).toString('utf8');

        // Validate that the result is sensible UTF-8
        // If it contains replacement characters, fall back to original
        if (result.includes('�')) {
            console.warn('Encoding fix resulted in replacement characters, using original filename');
            return filename;
        }

        return result;
    } catch (error) {
        // If conversion fails, return original filename
        console.warn('Failed to fix filename encoding:', error);
        return filename;
    }
}

// API route to handle GEDCOM file upload
app.post('/api/upload-gedcom', upload.single('gedcom'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Fix encoding of the original filename
        const fixedFilename = fixFilenameEncoding(req.file.originalname);

        // Store the uploaded file info
        uploadedFile = {
            originalName: fixedFilename,
            path: req.file.path,
            size: req.file.size
        };

        res.json({
            success: true,
            fileName: fixedFilename,
            message: 'GEDCOM file uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to upload GEDCOM file: ' + error.message
        });
    }
});

// API route to handle integrity check
app.post('/api/check', async (req, res) => {
    try {
        // Check if file is uploaded
        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a GEDCOM file first'
            });
        }

        // Process the GEDCOM file
        let gedModel;
        try {
            const gedReader = new GedReader();
            gedModel = gedReader.read(uploadedFile.path);
        } catch (error) {
            console.error('Error processing GEDCOM file:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process GEDCOM file: ' + error.message
            });
        }

        // Run integrity checks
        let integrityReport;
        try {
            const checker = new GedcomIntegrityChecker(gedModel);
            integrityReport = checker.checkIntegrity();
        } catch (error) {
            console.error('Error running integrity checks:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to run integrity checks: ' + error.message
            });
        }

        // Generate formatted results
        const results = formatResults(uploadedFile.originalName, integrityReport);

        // Clean up uploaded file after processing
        cleanupUploadedFile();

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error('Error in check endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Processing failed: ' + error.message
        });
    }
});

/**
 * Format integrity report as human-readable text
 */
function formatResults(filename, report) {
    const { summary, warnings, errors } = report;

    let result = `
=== GEDquality Integrity Report ===
GEDCOM File: ${filename}
Timestamp: ${new Date().toISOString()}

=== File Summary ===
Total Entries: ${summary.totalEntries}
Total People: ${summary.totalPeople}
Total Families: ${summary.totalFamilies}

=== Entries ===
Entry Labels: ${summary.entryLabels.join(', ')}

=== Entry Details ===`;

    for (const [entry, details] of Object.entries(summary.entryDetails)) {
        result += `\n  ${entry}: ${details.people} people, ${details.families} families`;
    }

    result += `\n\n=== Integrity Check Results ===
Total Warnings: ${summary.warningCount}
Total Errors: ${summary.errorCount}
`;

    if (warnings.length === 0 && errors.length === 0) {
        result += `\n✅ No integrity issues found! The GEDCOM file appears to be well-formed.`;
    } else {
        // Group warnings by type
        const warningsByType = {};
        for (const warning of warnings) {
            if (!warningsByType[warning.type]) {
                warningsByType[warning.type] = [];
            }
            warningsByType[warning.type].push(warning);
        }

        // Format warnings by category
        const typeLabels = {
            'family_membership': 'People Not in Families',
            'page_consistency': 'Page Consistency Issues',
            'invalid_date_format': 'Invalid Date Formats',
            'birth_after_death': 'Birth After Death',
            'excessive_lifespan': 'Excessive Lifespans (>120 years)',
            'child_before_marriage': 'Children Born Before Marriage',
            'child_after_mother_death': 'Children Born After Mother\'s Death',
            'mother_too_old': 'Mother Over 50 at Child\'s Birth',
            'unusual_given_name': 'Unusual Given Names',
            'gender_mismatch': 'Gender Mismatches',
            'missing_source': 'Missing Source References',
            'surname_mismatch': 'Surname Mismatches (Child vs Father)',
            'inconsistent_child_surnames': 'Inconsistent Sibling Surnames'
        };

        for (const [type, typeWarnings] of Object.entries(warningsByType)) {
            const label = typeLabels[type] || type;
            result += `\n\n--- ${label} (${typeWarnings.length}) ---`;

            for (const warning of typeWarnings) {
                result += `\n  • ${warning.message}`;

                // Add additional details for specific types
                if (type === 'page_consistency' && warning.details) {
                    for (const [page, people] of Object.entries(warning.details)) {
                        result += `\n    Page ${page}: ${people.map(p => p.name).join(', ')}`;
                    }
                }
            }
        }

        // Format errors
        if (errors.length > 0) {
            result += `\n\n--- Errors (${errors.length}) ---`;
            for (const error of errors) {
                result += `\n  • ${error.message}`;
            }
        }
    }

    result += `\n\n=== Analysis Summary ===`;
    if (summary.warningCount === 0 && summary.errorCount === 0) {
        result += `\n✅ Excellent data quality - no issues detected`;
    } else if (summary.warningCount < 5) {
        result += `\n✓ Good data quality with minor issues`;
    } else if (summary.warningCount < 15) {
        result += `\n⚠ Acceptable data quality with some issues to review`;
    } else {
        result += `\n⚠ Significant data quality issues detected - please review`;
    }

    result += `\n\nProcessing completed successfully.`;

    return result.trim();
}

// Helper function to clean up uploaded file
function cleanupUploadedFile() {
    try {
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        // Reset the uploaded file
        uploadedFile = null;
    } catch (error) {
        console.error('Error cleaning up uploaded file:', error);
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('GEDquality Server Started on port ' + PORT);
});

module.exports = app;
