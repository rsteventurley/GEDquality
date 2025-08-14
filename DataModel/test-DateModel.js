/**
 * Test file for DateModel
 * Demonstrates various date parsing and formatting capabilities
 * 
 * Run with: node DataModel/test-DateModel.js
 */

const DateModel = require('./DateModel');

console.log('=== DateModel Test Suite ===\n');

// Test single dates
console.log('1. Single Date Tests:');
const testDates = [
    '25 DEC 1995',
    'JAN 2000',
    '2020',
    '12/25/1995',
    '1995-12-25',
    'ABT 1850',
    'BEF 1900',
    'AFT 1800',
    'EST 1875',
    'CAL 1823'
];

testDates.forEach(dateStr => {
    const date = new DateModel(dateStr);
    console.log(`  Input: "${dateStr}"`);
    console.log(`    Parsed: Year=${date.year}, Month=${date.month}, Day=${date.day}`);
    console.log(`    GEDCOM: "${date.toGEDCOM()}"`);
    console.log(`    ISO: "${date.toISO()}"`);
    console.log(`    Valid: ${date.isValid()}`);
    console.log('');
});

// Test date ranges
console.log('2. Date Range Tests:');
const rangeDates = [
    'BET 1850 AND 1860',
    '1900 TO 1910',
    '1850-1860'
];

rangeDates.forEach(dateStr => {
    const date = new DateModel(dateStr);
    console.log(`  Input: "${dateStr}"`);
    console.log(`    Is Range: ${date.isRange}`);
    if (date.isRange) {
        console.log(`    Start: ${date.startDate ? date.startDate.toGEDCOM() : 'null'}`);
        console.log(`    End: ${date.endDate ? date.endDate.toGEDCOM() : 'null'}`);
    }
    console.log(`    GEDCOM: "${date.toGEDCOM()}"`);
    console.log('');
});

// Test date comparison
console.log('3. Date Comparison Tests:');
const date1 = new DateModel('25 DEC 1995');
const date2 = new DateModel('1 JAN 2000');
const date3 = new DateModel('25 DEC 1995');

console.log(`  Date 1: ${date1.toGEDCOM()}`);
console.log(`  Date 2: ${date2.toGEDCOM()}`);
console.log(`  Date 3: ${date3.toGEDCOM()}`);
console.log(`  Date1 vs Date2: ${date1.compare(date2)} (should be -1)`);
console.log(`  Date2 vs Date1: ${date2.compare(date1)} (should be 1)`);
console.log(`  Date1 vs Date3: ${date1.compare(date3)} (should be 0)`);
console.log('');

// Test edge cases
console.log('4. Edge Case Tests:');
const edgeCases = [
    '',
    null,
    'INVALID DATE',
    '32 JAN 2000', // Invalid day
    'FEB 30 2000', // Invalid date
    '13/45/2000'   // Invalid format
];

edgeCases.forEach(dateStr => {
    const date = new DateModel(dateStr);
    console.log(`  Input: "${dateStr}"`);
    console.log(`    Valid: ${date.isValid()}`);
    console.log(`    GEDCOM: "${date.toGEDCOM()}"`);
    console.log('');
});

// Test JavaScript Date conversion
console.log('5. JavaScript Date Conversion Tests:');
const convertDates = [
    '25 DEC 1995',
    'DEC 1995',
    '1995',
    'ABT 1850'
];

convertDates.forEach(dateStr => {
    const date = new DateModel(dateStr);
    const jsDate = date.toDate();
    console.log(`  Input: "${dateStr}"`);
    console.log(`    JS Date: ${jsDate ? jsDate.toISOString().split('T')[0] : 'null'}`);
    console.log('');
});

console.log('=== Test Suite Complete ===');
