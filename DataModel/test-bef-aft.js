/**
 * Test the new BEF and AFT qualifiers
 */

const DateModel = require('./DateModel');

console.log('=== BEF and AFT Qualifier Tests ===\n');

// Test 1: BEF (before) date
console.log('1. BEF (before) date:');
try {
    const beforeDate = new DateModel();
    beforeDate.parseDateString('BEF 1900-12-31');
    console.log(`   Input: "BEF 1900-12-31"`);
    console.log(`   isBefore: ${beforeDate.isBefore}`);
    console.log(`   isAfter: ${beforeDate.isAfter}`);
    console.log(`   isAbout: ${beforeDate.isAbout}`);
    console.log(`   isExact: ${beforeDate.isExact()}`);
    console.log(`   isValid: ${beforeDate.isValid()}`);
    console.log(`   GEDCOM: "${beforeDate.toGEDCOM()}"`);
    console.log(`   toString: "${beforeDate.toString()}"`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Test 2: AFT (after) date
console.log('\n2. AFT (after) date:');
try {
    const afterDate = new DateModel();
    afterDate.parseDateString('AFT 1850-01-01');
    console.log(`   Input: "AFT 1850-01-01"`);
    console.log(`   isBefore: ${afterDate.isBefore}`);
    console.log(`   isAfter: ${afterDate.isAfter}`);
    console.log(`   isAbout: ${afterDate.isAbout}`);
    console.log(`   isExact: ${afterDate.isExact()}`);
    console.log(`   isValid: ${afterDate.isValid()}`);
    console.log(`   GEDCOM: "${afterDate.toGEDCOM()}"`);
    console.log(`   toString: "${afterDate.toString()}"`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Test 3: Normal date (for comparison)
console.log('\n3. Normal date (for comparison):');
try {
    const normalDate = new DateModel();
    normalDate.parseDateString('1875-06-15');
    console.log(`   Input: "1875-06-15"`);
    console.log(`   isBefore: ${normalDate.isBefore}`);
    console.log(`   isAfter: ${normalDate.isAfter}`);
    console.log(`   isAbout: ${normalDate.isAbout}`);
    console.log(`   isExact: ${normalDate.isExact()}`);
    console.log(`   isValid: ${normalDate.isValid()}`);
    console.log(`   GEDCOM: "${normalDate.toGEDCOM()}"`);
    console.log(`   toString: "${normalDate.toString()}"`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Test 4: ABT date (for comparison)
console.log('\n4. ABT date (for comparison):');
try {
    const aboutDate = new DateModel();
    aboutDate.parseDateString('ABT 1850-06-15');
    console.log(`   Input: "ABT 1850-06-15"`);
    console.log(`   isBefore: ${aboutDate.isBefore}`);
    console.log(`   isAfter: ${aboutDate.isAfter}`);
    console.log(`   isAbout: ${aboutDate.isAbout}`);
    console.log(`   isExact: ${aboutDate.isExact()}`);
    console.log(`   isValid: ${aboutDate.isValid()}`);
    console.log(`   GEDCOM: "${aboutDate.toGEDCOM()}"`);
    console.log(`   toString: "${aboutDate.toString()}"`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Test 5: Clone test with BEF date
console.log('\n5. Clone test with BEF date:');
try {
    const originalDate = new DateModel();
    originalDate.parseDateString('BEF 1900-12-31');
    const clonedDate = originalDate.clone();
    
    console.log(`   Original: "${originalDate.toString()}"`);
    console.log(`   Cloned: "${clonedDate.toString()}"`);
    console.log(`   Clone isBefore: ${clonedDate.isBefore}`);
    console.log(`   Clone isAfter: ${clonedDate.isAfter}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Test 6: Invalid BEF/AFT dates (should still validate the date)
console.log('\n6. Invalid BEF date (year out of range):');
try {
    const invalidDate = new DateModel();
    invalidDate.parseDateString('BEF 1300-12-31');
    console.log(`   Should not reach here`);
} catch (error) {
    console.log(`   Expected error: ${error.message}`);
}

console.log('\n=== Tests Complete ===');
