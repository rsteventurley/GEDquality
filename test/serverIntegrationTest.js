/**
 * Integration tests for the GEDquality server endpoints
 * Tests the file upload and GEDCOM processing functionality
 *
 * @author Steve Turley
 * @version 1.0.0
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('GEDquality Server Integration Tests', function() {
    describe('Application File Validation', function() {
        it('should have GEDquality.js main application file', function() {
            const appPath = path.join(__dirname, '../GEDquality.js');
            assert(fs.existsSync(appPath), 'GEDquality.js should exist');
        });

        it('should have valid GEDCOM reader module', function() {
            const readerPath = path.join(__dirname, '../GEDCOM/GedReader.js');
            assert(fs.existsSync(readerPath), 'GedReader.js should exist');
        });

        it('should have integrity checker module', function() {
            const checkerPath = path.join(__dirname, '../utils/GedcomIntegrityChecker.js');
            assert(fs.existsSync(checkerPath), 'GedcomIntegrityChecker.js should exist');
        });
    });

    describe('Method Name Verification', function() {
        it('should confirm server uses correct reader methods', function() {
            // This test verifies the correct method names are used
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const serverContent = fs.readFileSync(serverPath, 'utf8');

            // Ensure the old incorrect method calls are not present
            assert(!serverContent.includes('gedReader.readFile('),
                   'Server should not contain gedReader.readFile calls');

            // Ensure the correct method calls are present
            assert(serverContent.includes('gedReader.read('),
                   'Server should contain gedReader.read calls');
        });
    });

    describe('Code Structure Validation', function() {
        it('should have required dependencies in package.json', function() {
            const packagePath = path.join(__dirname, '../package.json');
            const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            assert(packageContent.dependencies.express, 'Should have express dependency');
            assert(packageContent.dependencies.multer, 'Should have multer dependency');
            assert(packageContent.devDependencies.mocha, 'Should have mocha dev dependency');
        });
    });

    describe('Token-Based Upload Tracking', function() {
        it('should not use global uploadedFile singleton', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(!content.includes('let uploadedFile'),
                'Server must not use a global uploadedFile variable');
        });

        it('should declare an uploadedFiles Map', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('const uploadedFiles = new Map()'),
                'Server must declare uploadedFiles as a Map');
        });

        it('should use crypto.randomUUID in upload handler', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('crypto.randomUUID()'),
                'Upload handler must generate a UUID per upload');
        });

        it('should return fileId from upload endpoint', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('fileId,') || content.includes('fileId\n') || content.includes('fileId }'),
                'Upload endpoint must return a fileId in the response JSON');
        });

        it('should read fileId from check request body', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('req.body.fileId') || content.includes('const { fileId }'),
                'Check endpoint must read fileId from request body');
        });

        it('should set up TTL sweeper with setInterval', function() {
            const serverPath = path.join(__dirname, '../GEDquality.js');
            const content = fs.readFileSync(serverPath, 'utf8');
            assert(content.includes('setInterval') && content.includes('uploadedFiles.delete'),
                'Server must set up a TTL sweeper that deletes expired entries from uploadedFiles');
        });
    });
});
