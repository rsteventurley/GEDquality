/**
 * Test the isEmpty method
 */

const DateModel = require('./DateModel');

console.log('=== isEmpty Method Tests ===\n');

// Test 1: Completely empty DateModel
console.log('1. Empty DateModel:');
const emptyDate = new DateModel();
console.log(`   isEmpty(): ${emptyDate.isEmpty()}`);
console.log(`   toString(): "${emptyDate.toString()}"`);

// Test 2: DateModel with parsed date
console.log('\n2. DateModel with parsed date:');
const normalDate = new DateModel();
normalDate.parseDateString('1995-12-25');
console.log(`   isEmpty(): ${normalDate.isEmpty()}`);
console.log(`   toString(): "${normalDate.toString()}"`);

// Test 3: DateModel with range
console.log('\n3. DateModel with range:');
const rangeDate = new DateModel();
rangeDate.parseDateString('BET 1850-01-01 AND 1860-12-31');
console.log(`   isEmpty(): ${rangeDate.isEmpty()}`);
console.log(`   toString(): "${rangeDate.toString()}"`);

// Test 4: DateModel with only some properties set manually
console.log('\n4. DateModel with only year set:');
const partialDate = new DateModel();
partialDate.year = 1995;
console.log(`   isEmpty(): ${partialDate.isEmpty()}`);
console.log(`   toString(): "${partialDate.toString()}"`);

// Test 5: DateModel with modified boolean property
console.log('\n5. DateModel with isAbout set to true:');
const aboutDate = new DateModel();
aboutDate.isAbout = true;
console.log(`   isEmpty(): ${aboutDate.isEmpty()}`);
console.log(`   toString(): "${aboutDate.toString()}"`);

// Test 6: DateModel with different calendar
console.log('\n6. DateModel with different calendar:');
const julianDate = new DateModel();
julianDate.calendar = 'JULIAN';
console.log(`   isEmpty(): ${julianDate.isEmpty()}`);
console.log(`   toString(): "${julianDate.toString()}"`);

console.log('\n=== Tests Complete ===');
