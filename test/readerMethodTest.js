/**
 * Unit tests for GedReader method names and functionality
 * These tests ensure the correct method names are used and prevent TypeError issues
 *
 * @author Steve Turley
 * @version 1.0.0
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const GedReader = require('../GEDCOM/GedReader');

describe('Reader Method Tests', function() {
    describe('GedReader', function() {
        it('should have a read method', function() {
            const gedReader = new GedReader();
            assert.strictEqual(typeof gedReader.read, 'function', 'GedReader should have a read method');
        });

        it('should not have a readFile method', function() {
            const gedReader = new GedReader();
            assert.strictEqual(typeof gedReader.readFile, 'undefined', 'GedReader should not have a readFile method');
        });

        it('should throw error for non-existent file', function() {
            const gedReader = new GedReader();
            const nonExistentPath = path.join(__dirname, 'non-existent-file.ged');
            
            assert.throws(() => {
                gedReader.read(nonExistentPath);
            }, /GEDCOM file not found/, 'Should throw error for non-existent file');
        });

        it('should create sample GEDCOM file and read it successfully', function() {
            const gedReader = new GedReader();
            const testFilePath = path.join(__dirname, 'test-sample.ged');
            
            // Create a minimal valid GEDCOM file
            const sampleGedcom = `0 HEAD
1 SOUR RootsMagic
2 VERS 9.0.0
1 GEDC
2 VERS 5.5.1
2 FORM LINEAGE-LINKED
1 CHAR UTF-8
0 @I1@ INDI
1 NAME John /Doe/
2 GIVN John
2 SURN Doe
1 SEX M
1 BIRT
2 DATE 1 JAN 1900
2 PLAC Test Place
0 TRLR`;

            try {
                // Write test file
                fs.writeFileSync(testFilePath, sampleGedcom, 'utf8');
                
                // Test reading the file
                const result = gedReader.read(testFilePath);
                assert(result, 'Should return a result object');
                assert.strictEqual(typeof result, 'object', 'Result should be an object');
                
            } finally {
                // Clean up test file
                if (fs.existsSync(testFilePath)) {
                    fs.unlinkSync(testFilePath);
                }
            }
        });
    });

    describe('Method Name Consistency', function() {
        it('should verify correct method names are used in server code', function() {
            // This test reads the server file and checks for incorrect method calls
            const serverPath = path.join(__dirname, '../GEDquality.js');

            // Check that the server file exists
            assert(fs.existsSync(serverPath), 'GEDquality.js should exist');

            const serverContent = fs.readFileSync(serverPath, 'utf8');

            // Check for incorrect gedReader.readFile calls
            assert(!serverContent.includes('gedReader.readFile'),
                   'Server should not call gedReader.readFile - use gedReader.read instead');

            // Verify correct method calls exist
            assert(serverContent.includes('gedReader.read'),
                   'Server should call gedReader.read');
        });
    });
});
