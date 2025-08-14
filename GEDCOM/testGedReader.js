/**
 * Comprehensive test script for the GedReader class
 * Tests GEDCOM file parsing and model conversion functionality
 */

const fs = require('fs');
const GedReader = require('./GedReader');
const GedIndividual = require('./GedIndividual');
const GedFamily = require('./GedFamily');

console.log('=== GedReader Class Comprehensive Test ===\n');

// Test 1: Basic file reading and parsing
console.log('Test 1: Basic GEDCOM file reading...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    console.log('✅ File read successfully');
    console.log('✅ GedModel created');
    console.log(`   Summary: ${gedModel.toString()}`);
    
    const summary = gedModel.getSummary();
    console.log(`   Individuals: ${summary.individuals}`);
    console.log(`   Families: ${summary.families}`);
    console.log(`   Sources: ${summary.sources}`);
    console.log(`   Notes: ${summary.notes}`);
    console.log(`   Submitters: ${summary.submitters}`);
    console.log(`   Repositories: ${summary.repositories}`);
    console.log('');
    
} catch (error) {
    console.log('❌ Basic file reading failed:', error.message);
    console.log('');
}

// Test 2: Individual model conversion verification
console.log('Test 2: Individual model conversion...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const individuals = gedModel.getIndividuals();
    console.log(`Found ${Object.keys(individuals).length} individuals`);
    
    Object.entries(individuals).forEach(([id, individual]) => {
        console.log(`\n--- Individual ${id} ---`);
        console.log(`Type: ${individual.constructor.name}`);
        console.log(`Is GedIndividual: ${individual instanceof GedIndividual}`);
        
        if (individual instanceof GedIndividual) {
            console.log(`✅ Converted to GedIndividual`);
            console.log(`   Name: "${individual.getName().getFormattedName()}"`);
            console.log(`   Gender: "${individual.getGender()}"`);
            console.log(`   Source (PAGE): "${individual.getSource()}"`);
            console.log(`   References: [${individual.getReferences().join(', ')}]`);
            
            const birth = individual.getBirth();
            if (!birth.isEmpty()) {
                console.log(`   Birth: ${birth.getDate()} at ${birth.getPlace()}`);
            }
            
            const death = individual.getDeath();
            if (!death.isEmpty()) {
                console.log(`   Death: ${death.getDate()} at ${death.getPlace()}`);
            }
            
            console.log(`   IsValid: ${individual.isValid()}`);
            console.log(`   IsEmpty: ${individual.isEmpty()}`);
        } else {
            console.log(`❌ Not converted to GedIndividual`);
        }
    });
    
} catch (error) {
    console.log('❌ Individual model conversion test failed:', error.message);
}

// Test 3: Family model conversion verification
console.log('\n\nTest 3: Family model conversion...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const families = gedModel.getFamilies();
    console.log(`Found ${Object.keys(families).length} families`);
    
    Object.entries(families).forEach(([id, family]) => {
        console.log(`\n--- Family ${id} ---`);
        console.log(`Type: ${family.constructor.name}`);
        console.log(`Is GedFamily: ${family instanceof GedFamily}`);
        
        if (family instanceof GedFamily) {
            console.log(`✅ Converted to GedFamily`);
            console.log(`   Father ID: ${family.getFather()}`);
            console.log(`   Mother ID: ${family.getMother()}`);
            console.log(`   Children IDs: [${family.getChildren().join(', ')}]`);
            console.log(`   Has Parents: ${family.hasParents()}`);
            console.log(`   Has Children: ${family.hasChildren()}`);
            console.log(`   Child Count: ${family.getChildCount()}`);
            
            const marriage = family.getMarriage();
            if (!marriage.isEmpty()) {
                console.log(`   Marriage: ${marriage.getDate()} at ${marriage.getPlace()}`);
            }
            
            console.log(`   IsValid: ${family.isValid()}`);
            console.log(`   IsEmpty: ${family.isEmpty()}`);
        } else {
            console.log(`❌ Not converted to GedFamily`);
        }
    });
    
} catch (error) {
    console.log('❌ Family model conversion test failed:', error.message);
}

// Test 4: Source and repository parsing
console.log('\n\nTest 4: Source and repository parsing...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const sources = gedModel.getSources();
    console.log(`Found ${Object.keys(sources).length} sources`);
    Object.entries(sources).forEach(([id, source]) => {
        console.log(`   ${id}: ${JSON.stringify(source, null, 2).substring(0, 100)}...`);
    });
    
    // Check if submitters and repositories were parsed
    console.log(`Submitters count: ${Object.keys(gedModel.submitters).length}`);
    console.log(`Repositories count: ${Object.keys(gedModel.repositories).length}`);
    
} catch (error) {
    console.log('❌ Source and repository parsing test failed:', error.message);
}

// Test 5: Numeric ID access methods
console.log('\n\nTest 5: Numeric ID access methods...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    // Test individual numeric access
    for (let i = 1; i <= 3; i++) {
        const individual = gedModel.getIndividualByNumericId(i);
        if (individual) {
            console.log(`✅ Individual ${i}: ${individual.getName().getFormattedName()}`);
        } else {
            console.log(`❌ Individual ${i}: Not found`);
        }
    }
    
    // Test family numeric access
    const family1 = gedModel.getFamilyByNumericId(1);
    if (family1) {
        console.log(`✅ Family 1: Father ${family1.getFather()}, Mother ${family1.getMother()}`);
    } else {
        console.log(`❌ Family 1: Not found`);
    }
    
} catch (error) {
    console.log('❌ Numeric ID access test failed:', error.message);
}

// Test 6: Error handling
console.log('\n\nTest 6: Error handling...');
try {
    const reader = new GedReader();
    
    // Test with non-existent file
    try {
        reader.read('./nonexistent.ged');
        console.log('❌ Should have thrown error for non-existent file');
    } catch (error) {
        console.log('✅ Correctly threw error for non-existent file:', error.message);
    }
    
    // Test file validation if method exists
    if (typeof reader.isValidGedcomFile === 'function') {
        const isValid = reader.isValidGedcomFile('./test.ged');
        console.log(`✅ File validation result: ${isValid}`);
    } else {
        console.log('ℹ️  File validation method not available');
    }
    
} catch (error) {
    console.log('❌ Error handling test failed:', error.message);
}

// Test 7: Performance and memory usage
console.log('\n\nTest 7: Performance test...');
try {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;
    
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;
    
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryUsed = (endMemory - startMemory) / 1024; // Convert to KB
    
    console.log(`✅ Parse time: ${duration.toFixed(2)} ms`);
    console.log(`✅ Memory used: ${memoryUsed.toFixed(2)} KB`);
    console.log(`✅ Records processed: ${gedModel.getIndividualCount() + gedModel.getFamilyCount()}`);
    
} catch (error) {
    console.log('❌ Performance test failed:', error.message);
}

// Test 8: Data integrity verification
console.log('\n\nTest 8: Data integrity verification...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    // Verify specific data from test.ged
    const john = gedModel.getIndividual('@I1@');
    const jane = gedModel.getIndividual('@I2@');
    const robert = gedModel.getIndividual('@I3@');
    const family = gedModel.getFamily('@F1@');
    
    console.log('=== Verifying specific test.ged data ===');
    
    // John Doe verification
    if (john && john.getName().getFormattedName() === 'Doe, John' && john.getGender() === 'M') {
        console.log('✅ John Doe data correct');
        console.log(`   Source page: ${john.getSource()}`);
        console.log(`   Birth: ${john.getBirth().getDate()}`);
    } else {
        console.log('❌ John Doe data incorrect');
    }
    
    // Jane Smith verification
    if (jane && jane.getName().getFormattedName() === 'Smith, Jane' && jane.getGender() === 'F') {
        console.log('✅ Jane Smith data correct');
        console.log(`   Source page: ${jane.getSource()}`);
        console.log(`   Birth: ${jane.getBirth().getDate()}`);
    } else {
        console.log('❌ Jane Smith data incorrect');
    }
    
    // Robert Doe verification
    if (robert && robert.getName().getFormattedName() === 'Doe, Robert' && robert.getGender() === 'M') {
        console.log('✅ Robert Doe data correct');
        console.log(`   Birth: ${robert.getBirth().getDate()}`);
    } else {
        console.log('❌ Robert Doe data incorrect');
    }
    
    // Family verification
    if (family && family.getFather() === 1 && family.getMother() === 2 && family.getChildren().includes(3)) {
        console.log('✅ Family F1 data correct');
        console.log(`   Marriage: ${family.getMarriage().getDate()}`);
    } else {
        console.log('❌ Family F1 data incorrect');
    }
    
} catch (error) {
    console.log('❌ Data integrity verification failed:', error.message);
}

console.log('\n=== GedReader Test Complete ===');
