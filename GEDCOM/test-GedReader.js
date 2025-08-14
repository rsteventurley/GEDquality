/**
 * Test file for GedReader and GedModel classes
 * Tests GEDCOM file parsing functionality
 */

const { GedReader, GedModel } = require('./index.js');
const path = require('path');

console.log('=== GEDCOM Reader Tests ===\n');

// Test 1: Create GedReader and validate file
console.log('--- Test 1: File validation ---');
const reader = new GedReader();
const testFile = path.join(__dirname, 'test.ged');

try {
    const isValid = reader.validateGedcomFile(testFile);
    console.log(`GEDCOM file validation: ${isValid}`); // Should be true
} catch (error) {
    console.log(`Validation error: ${error.message}`);
}
console.log('');

// Test 2: Parse the GEDCOM file
console.log('--- Test 2: Parse GEDCOM file ---');
try {
    const gedModel = reader.read(testFile);
    console.log(`Parsing successful: ${gedModel !== null}`);
    console.log(`Model summary: ${gedModel.toString()}`);
    
    const stats = gedModel.getSummary();
    console.log('Statistics:');
    console.log(`  Individuals: ${stats.individuals}`);
    console.log(`  Families: ${stats.families}`);
    console.log(`  Sources: ${stats.sources}`);
    console.log(`  Notes: ${stats.notes}`);
    console.log(`  Submitters: ${stats.submitters}`);
    console.log(`  Repositories: ${stats.repositories}`);
    console.log(`  Unknown records: ${stats.unknownRecords}`);
} catch (error) {
    console.log(`Parsing error: ${error.message}`);
}
console.log('');

// Test 3: Examine specific records
console.log('--- Test 3: Examine parsed records ---');
const gedModel = reader.getGedModel();
if (gedModel) {
    // Check individuals
    const individual1 = gedModel.getIndividual('@I1@');
    if (individual1) {
        console.log(`Individual @I1@ found: ${individual1.tag}`);
        
        // Find NAME child
        const nameRecord = individual1.children.find(child => child.tag === 'NAME');
        if (nameRecord) {
            console.log(`  Name: ${nameRecord.value}`);
        }
        
        // Check for SOUR entries (special treatment)
        const sourceEntries = individual1.children.filter(child => child.tag === 'SOUR');
        console.log(`  Source entries: ${sourceEntries.length}`);
        console.log(`  Total children: ${individual1.children.length}`);
        console.log('  All children:');
        individual1.children.forEach((child, i) => {
            console.log(`    ${i}: ${child.tag} = '${child.value}'`);
        });
        
        for (const source of sourceEntries) {
            console.log(`    Source: ${source.value}`);
            if (source.page) {
                console.log(`    Page: ${source.page}`);
            }
            if (source.quality) {
                console.log(`    Quality: ${source.quality}`);
            }
            console.log(`    Parent type: ${source.parentType}, Parent ID: ${source.parentId}`);
        }
    }
    
    // Check families
    const family1 = gedModel.getFamily('@F1@');
    if (family1) {
        console.log(`Family @F1@ found: ${family1.tag}`);
        
        const husbandRecord = family1.children.find(child => child.tag === 'HUSB');
        const wifeRecord = family1.children.find(child => child.tag === 'WIFE');
        const childRecord = family1.children.find(child => child.tag === 'CHIL');
        
        if (husbandRecord) console.log(`  Husband: ${husbandRecord.value}`);
        if (wifeRecord) console.log(`  Wife: ${wifeRecord.value}`);
        if (childRecord) console.log(`  Child: ${childRecord.value}`);
    }
    
    // Check sources
    const source1 = gedModel.getSource('@S1@');
    if (source1) {
        console.log(`Source @S1@ found: ${source1.tag}`);
        const titleRecord = source1.children.find(child => child.tag === 'TITL');
        if (titleRecord) {
            console.log(`  Title: ${titleRecord.value}`);
        }
    }
}
console.log('');

// Test 4: Test error handling
console.log('--- Test 4: Error handling ---');
try {
    reader.read('nonexistent-file.ged');
} catch (error) {
    console.log(`Expected error for nonexistent file: ${error.message}`);
}

try {
    reader.validateGedcomFile('nonexistent-file.ged');
} catch (error) {
    console.log(`Expected error for validation: ${error.message}`);
}

console.log('\n=== GEDCOM Reader Tests Complete ===');
