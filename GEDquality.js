/**
 * GEDquality - Express.js Web Application
 * A GEDCOM file integrity checker for genealogical data
 *
 * @author Steve Turley
 * @version 1.1.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Import the data model classes
const GedReader = require('./GEDCOM/GedReader');
const GedcomIntegrityChecker = require('./utils/GedcomIntegrityChecker');

// Configure multer for file uploads to temporary directory
const upload = multer({
    dest: path.join(os.tmpdir(), 'gedquality-uploads'),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, ext === '.ged');
    }
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

const uploadedFiles = new Map(); // fileId → { path, originalName, size, expires }

// Middleware
app.use(helmet());
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
app.post('/api/upload-gedcom', uploadLimiter, upload.single('gedcom'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fixedFilename = fixFilenameEncoding(req.file.originalname);
        const fileId = crypto.randomUUID();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        uploadedFiles.set(fileId, {
            path: req.file.path,
            originalName: fixedFilename,
            size: req.file.size,
            expires
        });

        res.json({
            success: true,
            fileId,
            fileName: fixedFilename,
            message: 'GEDCOM file uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload GEDCOM file'
        });
    }
});

// API route to handle integrity check
app.post('/api/check', uploadLimiter, async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a GEDCOM file first'
            });
        }

        const fileInfo = uploadedFiles.get(fileId);

        if (!fileInfo || Date.now() > fileInfo.expires) {
            if (fileInfo) cleanupUploadedFile(fileId);
            return res.status(400).json({
                success: false,
                error: 'Upload not found or expired. Please upload again.'
            });
        }

        // Process the GEDCOM file
        let gedModel;
        try {
            const gedReader = new GedReader();
            gedModel = gedReader.read(fileInfo.path);
        } catch (error) {
            console.error('Error processing GEDCOM file:', error);
            cleanupUploadedFile(fileId);
            return res.status(500).json({
                success: false,
                error: 'Failed to process GEDCOM file'
            });
        }

        // Run integrity checks
        let integrityReport;
        try {
            const checker = new GedcomIntegrityChecker(gedModel);
            integrityReport = checker.checkIntegrity();
        } catch (error) {
            console.error('Error running integrity checks:', error);
            cleanupUploadedFile(fileId);
            return res.status(500).json({
                success: false,
                error: 'Failed to run integrity checks'
            });
        }

        const results = formatResults(fileInfo.originalName, integrityReport);
        cleanupUploadedFile(fileId);

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error('Error in check endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Processing failed'
        });
    }
});

/**
 * Format integrity report as human-readable text
 */
function formatResults(filename, report) {
    const { summary, warnings, errors } = report;

    let result = `
╔════════════════════════════════════════════════════════════════════════════╗
║                    GEDquality Integrity Report                             ║
╚════════════════════════════════════════════════════════════════════════════╝

File: ${filename}
Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}

────────────────────────────────────────────────────────────────────────────
FILE SUMMARY
────────────────────────────────────────────────────────────────────────────

Total OFB Entries: ${summary.totalEntries}
Total People: ${summary.totalPeople}
Total Families: ${summary.totalFamilies}

Entry Numbers: ${summary.entryLabels.join(', ')}

Entry Breakdown:`;

    for (const [entry, details] of Object.entries(summary.entryDetails)) {
        result += `\n  Entry ${entry.padEnd(6)} → ${details.people} people in ${details.families} ${details.families === 1 ? 'family' : 'families'}`;
    }

    result += `\n
────────────────────────────────────────────────────────────────────────────
INTEGRITY CHECK RESULTS
────────────────────────────────────────────────────────────────────────────

Total Issues Found: ${summary.warningCount + summary.errorCount}
  • Warnings: ${summary.warningCount}
  • Errors: ${summary.errorCount}
`;

    if (warnings.length === 0 && errors.length === 0) {
        result += `
✅ EXCELLENT! No integrity issues detected.

Your GEDCOM file appears to be well-formed with no data quality problems.
All dates are valid, relationships are properly linked, and names are consistent.
`;
    } else {
        // Group warnings by type
        const warningsByType = {};
        for (const warning of warnings) {
            if (!warningsByType[warning.type]) {
                warningsByType[warning.type] = [];
            }
            warningsByType[warning.type].push(warning);
        }

        // Format warnings by category with helpful descriptions
        const typeInfo = {
            'page_consistency': {
                label: 'Family Entry Consistency Issues',
                icon: '📋',
                description: 'Families with members from different OFB entries',
                action: 'ACTION: Verify family relationships and ensure all family members belong to the correct entry'
            },
            'family_membership': {
                label: 'People Not in Families',
                icon: '👥',
                description: 'People who are not linked to any family',
                action: 'ACTION: Link these people to their family or verify standalone entries'
            },
            'invalid_date_format': {
                label: 'Invalid Date Formats',
                icon: '📅',
                description: 'Dates that do not follow GEDCOM standards',
                action: 'ACTION: Correct date formats in your genealogy software'
            },
            'birth_after_death': {
                label: 'Birth After Death',
                icon: '⚠️',
                description: 'People recorded as born after they died',
                action: 'ACTION: Fix date errors - likely transcription mistakes'
            },
            'excessive_lifespan': {
                label: 'Excessive Lifespans',
                icon: '⏳',
                description: 'People who lived longer than 120 years',
                action: 'ACTION: Verify dates - likely wrong century or duplicate people'
            },
            'child_before_marriage': {
                label: 'Children Born Before Marriage',
                icon: '👶',
                description: 'Children born before parents\' marriage date',
                action: 'ACTION: Verify dates or check for common-law marriages'
            },
            'child_after_mother_death': {
                label: 'Children Born After Mother\'s Death',
                icon: '⚠️',
                description: 'Children born after their mother died',
                action: 'ACTION: Fix date errors or check for stepmother situations'
            },
            'mother_too_old': {
                label: 'Mother Over 50 at Birth',
                icon: '👵',
                description: 'Mothers who gave birth after age 50',
                action: 'ACTION: Verify dates or check for grandmother misidentification'
            },
            'unusual_given_name': {
                label: 'Unusual Given Names',
                icon: '📝',
                description: 'Names not common in German-speaking regions',
                action: 'ACTION: Verify spelling against original documents'
            },
            'gender_mismatch': {
                label: 'Gender Mismatches',
                icon: '⚧',
                description: 'Gender does not match the given name',
                action: 'ACTION: Check for transcription errors or data entry mistakes'
            },
            'missing_source': {
                label: 'Missing Source References',
                icon: '📄',
                description: 'People without OFB entry source citations',
                action: 'ACTION: Add SOUR records with entry numbers'
            },
            'surname_mismatch': {
                label: 'Surname Mismatches',
                icon: '👨‍👧',
                description: 'Children with different surnames than father',
                action: 'ACTION: Verify or document adoption/remarriage/naming customs'
            },
            'inconsistent_child_surnames': {
                label: 'Inconsistent Sibling Surnames',
                icon: '👧‍👦',
                description: 'Siblings with different surnames',
                action: 'ACTION: Verify or document half-siblings/adoption situations'
            }
        };

        // Sort warning types by severity (critical first)
        const criticalTypes = ['birth_after_death', 'excessive_lifespan', 'child_after_mother_death',
                              'page_consistency', 'family_membership'];
        const sortedTypes = Object.keys(warningsByType).sort((a, b) => {
            const aIsCritical = criticalTypes.includes(a);
            const bIsCritical = criticalTypes.includes(b);
            if (aIsCritical && !bIsCritical) return -1;
            if (!aIsCritical && bIsCritical) return 1;
            return 0;
        });

        for (const type of sortedTypes) {
            const typeWarnings = warningsByType[type];
            const info = typeInfo[type] || {
                label: type,
                icon: '•',
                description: '',
                action: ''
            };

            result += `\n
${info.icon} ${info.label.toUpperCase()} (${typeWarnings.length})
${'-'.repeat(76)}`;

            if (info.description) {
                result += `\n${info.description}`;
            }

            result += `\n`;

            // Standard formatting for all warning types
            for (const warning of typeWarnings) {
                result += `\n  • ${warning.message}`;
            }

            if (info.action && typeWarnings.length <= 10) {
                result += `\n\n${info.action}`;
            }
        }

        // Format errors (if any)
        if (errors.length > 0) {
            result += `\n
🛑 CRITICAL ERRORS (${errors.length})
${'-'.repeat(76)}`;
            for (const error of errors) {
                result += `\n  • ${error.message}`;
            }
        }
    }

    // Quality assessment with specific guidance
    result += `\n
────────────────────────────────────────────────────────────────────────────
OVERALL DATA QUALITY ASSESSMENT
────────────────────────────────────────────────────────────────────────────
`;

    if (summary.warningCount === 0 && summary.errorCount === 0) {
        result += `
✅ EXCELLENT DATA QUALITY

Your GEDCOM file has no detectable issues. The data appears to be:
  • Properly structured with all family links
  • Free of date inconsistencies
  • Complete with source references
  • Consistent in naming conventions

You may proceed with confidence in your data quality.
`;
    } else if (summary.warningCount < 5) {
        result += `
✓ GOOD DATA QUALITY

Your GEDCOM file has minor issues that should be reviewed. The data is
generally reliable with a few items to verify.

RECOMMENDATION: Review the warnings above, verify against source documents,
and correct any genuine errors in your genealogy software.
`;
    } else if (summary.warningCount < 15) {
        result += `
⚠ ACCEPTABLE DATA QUALITY WITH ISSUES

Your GEDCOM file has several data quality issues that warrant attention.
While the file is usable, these issues may affect data reliability.

RECOMMENDATION: Prioritize fixing date logic errors and missing family links.
Review other warnings and correct errors systematically.
`;
    } else {
        result += `
⚠ SIGNIFICANT DATA QUALITY ISSUES

Your GEDCOM file has numerous data quality problems that should be addressed
before proceeding with publication or analysis.

RECOMMENDATION:
  1. Focus on critical issues (date errors, missing links) first
  2. Verify data against original source documents
  3. Make corrections in your genealogy software
  4. Re-export GEDCOM and run GEDquality again
  5. Repeat until issue count is reduced significantly
`;
    }

    result += `
────────────────────────────────────────────────────────────────────────────

Processing completed successfully.
Click "Help" for guidance on interpreting and fixing issues.
`;

    return result.trim();
}

function cleanupUploadedFile(fileId) {
    const fileInfo = uploadedFiles.get(fileId);
    if (fileInfo) {
        try { fs.unlinkSync(fileInfo.path); } catch (_) {}
        uploadedFiles.delete(fileId);
    }
}

setInterval(() => {
    const now = Date.now();
    for (const [fileId, fileInfo] of uploadedFiles) {
        if (now > fileInfo.expires) {
            try { fs.unlinkSync(fileInfo.path); } catch (_) {}
            uploadedFiles.delete(fileId);
        }
    }
}, 5 * 60 * 1000);

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
