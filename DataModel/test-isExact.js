/**
 * Test the isExact method
 */

const DateModel = require('./DateModel');

console.log('=== isExact Method Tests ===\n');

// Test 1: Empty DateModel
console.log('1. Empty DateModel:');
const emptyDate = new DateModel();
console.log(`   isEmpty(): ${emptyDate.isEmpty()}`);
console.log(`   isExact(): ${emptyDate.isExact()}`);
console.log(`   isValid(): ${emptyDate.isValid()}`);

// Test 2: Complete exact date
console.log('\n2. Complete exact date (1995-12-25):');
const exactDate = new DateModel();
exactDate.parseDateString('1995-12-25');
console.log(`   isEmpty(): ${exactDate.isEmpty()}`);
console.log(`   isExact(): ${exactDate.isExact()}`);
console.log(`   isValid(): ${exactDate.isValid()}`);
console.log(`   toString(): "${exactDate.toString()}"`);

// Test 3: About date (not exact)
console.log('\n3. About date (ABT 1850-06-15):');
const aboutDate = new DateModel();
aboutDate.parseDateString('ABT 1850-06-15');
console.log(`   isEmpty(): ${aboutDate.isEmpty()}`);
console.log(`   isExact(): ${aboutDate.isExact()}`);
console.log(`   isValid(): ${aboutDate.isValid()}`);
console.log(`   toString(): "${aboutDate.toString()}"`);

// Test 4: Date range (not exact)
console.log('\n4. Date range (BET 1850-01-01 AND 1860-12-31):');
const rangeDate = new DateModel();
rangeDate.parseDateString('BET 1850-01-01 AND 1860-12-31');
console.log(`   isEmpty(): ${rangeDate.isEmpty()}`);
console.log(`   isExact(): ${rangeDate.isExact()}`);
console.log(`   isValid(): ${rangeDate.isValid()}`);
console.log(`   toString(): "${rangeDate.toString()}"`);

// Test 5: Partial date (year only - not exact)
console.log('\n5. Partial date (year only):');
const partialDate = new DateModel();
partialDate.year = 1995;
console.log(`   isEmpty(): ${partialDate.isEmpty()}`);
console.log(`   isExact(): ${partialDate.isExact()}`);
console.log(`   isValid(): ${partialDate.isValid()}`);
console.log(`   toString(): "${partialDate.toString()}"`);

// Test 6: Partial date (year and month only - not exact)
console.log('\n6. Partial date (year and month only):');
const partialDate2 = new DateModel();
partialDate2.year = 1995;
partialDate2.month = 12;
console.log(`   isEmpty(): ${partialDate2.isEmpty()}`);
console.log(`   isExact(): ${partialDate2.isExact()}`);
console.log(`   isValid(): ${partialDate2.isValid()}`);
console.log(`   toString(): "${partialDate2.toString()}"`);

// Test 7: Complete date with isAbout manually set (not exact)
console.log('\n7. Complete date with isAbout manually set:');
const manualAbout = new DateModel();
manualAbout.year = 1995;
manualAbout.month = 12;
manualAbout.day = 25;
manualAbout.isAbout = true;
manualAbout.isApproximate = true;
console.log(`   isEmpty(): ${manualAbout.isEmpty()}`);
console.log(`   isExact(): ${manualAbout.isExact()}`);
console.log(`   isValid(): ${manualAbout.isValid()}`);
console.log(`   toString(): "${manualAbout.toString()}"`);

console.log('\n=== Tests Complete ===');
