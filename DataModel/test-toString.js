/**
 * Test the new toString method formatting
 */

const DateModel = require('./DateModel');

console.log('=== toString Method Tests ===\n');

// Test 1: Empty DateModel
console.log('1. Empty DateModel:');
const emptyDate = new DateModel();
console.log(`   toString(): "${emptyDate.toString()}"`);

// Test 2: Normal date
console.log('\n2. Normal Date:');
const normalDate = new DateModel();
normalDate.parseDateString('1995-12-25');
console.log(`   Input: "1995-12-25"`);
console.log(`   toString(): "${normalDate.toString()}"`);

// Test 3: About date
console.log('\n3. About Date:');
const aboutDate = new DateModel();
aboutDate.parseDateString('ABT 1850-06-15');
console.log(`   Input: "ABT 1850-06-15"`);
console.log(`   toString(): "${aboutDate.toString()}"`);

// Test 4: Date range
console.log('\n4. Date Range:');
const rangeDate = new DateModel();
rangeDate.parseDateString('BET 1850-01-01 AND 1860-12-31');
console.log(`   Input: "BET 1850-01-01 AND 1860-12-31"`);
console.log(`   toString(): "${rangeDate.toString()}"`);

// Test 5: Date with missing components (using manual construction)
console.log('\n5. Date with Missing Components:');
const partialDate = new DateModel();
partialDate.year = 1995;
partialDate.month = null;
partialDate.day = null;
console.log(`   Year only (1995):`);
console.log(`   toString(): "${partialDate.toString()}"`);

const partialDate2 = new DateModel();
partialDate2.year = 1995;
partialDate2.month = 12;
partialDate2.day = null;
console.log(`   Year and month (1995-12):`);
console.log(`   toString(): "${partialDate2.toString()}"`);

console.log('\n=== Tests Complete ===');
