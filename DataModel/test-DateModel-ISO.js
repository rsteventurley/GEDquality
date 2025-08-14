/**
 * Test file for the updated DateModel with ISO 8601 format
 * Demonstrates the new parseDateString functionality
 * 
 * Run with: node DataModel/test-DateModel-ISO.js
 */

const DateModel = require('./DateModel');

console.log('=== DateModel ISO 8601 Test Suite ===\n');

// Test valid single dates
console.log('1. Valid Single Date Tests:');
const validDates = [
    '1995-12-25',
    '2000-01-01',
    '1850-06-15',
    'ABT 1750-03-20'
];

validDates.forEach(dateStr => {
    try {
        const date = new DateModel();
        date.parseDateString(dateStr);
        console.log(`  Input: "${dateStr}"`);
        console.log(`    Parsed: Year=${date.year}, Month=${date.month}, Day=${date.day}`);
        console.log(`    About: ${date.isAbout}`);
        console.log(`    GEDCOM: "${date.toGEDCOM()}"`);
        console.log(`    ISO: "${date.toISO()}"`);
        console.log(`    Valid: ${date.isValid()}`);
        console.log('');
    } catch (error) {
        console.log(`  Input: "${dateStr}" - ERROR: ${error.message}`);
        console.log('');
    }
});

// Test valid date ranges
console.log('2. Valid Date Range Tests:');
const validRanges = [
    'BET 1850-01-01 AND 1860-12-31',
    'BET 1900-06-15 AND 1910-06-15'
];

validRanges.forEach(dateStr => {
    try {
        const date = new DateModel();
        date.parseDateString(dateStr);
        console.log(`  Input: "${dateStr}"`);
        console.log(`    Is Range: ${date.isRange}`);
        if (date.isRange) {
            console.log(`    Start: ${date.startDate.toGEDCOM()}`);
            console.log(`    End: ${date.endDate.toGEDCOM()}`);
        }
        console.log(`    GEDCOM: "${date.toGEDCOM()}"`);
        console.log('');
    } catch (error) {
        console.log(`  Input: "${dateStr}" - ERROR: ${error.message}`);
        console.log('');
    }
});

// Test invalid dates (should throw errors)
console.log('3. Invalid Date Tests (should throw errors):');
const invalidDates = [
    '1300-12-25',  // Year too early
    '2100-12-25',  // Year too late
    '1995-13-25',  // Invalid month
    '1995-00-25',  // Invalid month
    '1995-02-30',  // Invalid day for February
    '1995-04-31',  // Invalid day for April
    '1995/12/25',  // Wrong format
    'invalid-date', // Completely invalid
    '',            // Empty string
    'BET 1850-01-01', // Incomplete range
    'BET 1850-01-01 AND invalid' // Invalid end date in range
];

invalidDates.forEach(dateStr => {
    try {
        const date = new DateModel();
        date.parseDateString(dateStr);
        console.log(`  Input: "${dateStr}" - UNEXPECTED SUCCESS (should have failed)`);
    } catch (error) {
        console.log(`  Input: "${dateStr}" - Expected error: ${error.message}`);
    }
});

// Test leap year handling
console.log('\n4. Leap Year Tests:');
const leapYearTests = [
    '1600-02-29', // Leap year (divisible by 400)
    '1700-02-29', // Not a leap year (divisible by 100 but not 400)
    '1996-02-29', // Leap year (divisible by 4, not by 100)
    '1997-02-29', // Not a leap year
];

leapYearTests.forEach(dateStr => {
    try {
        const date = new DateModel();
        date.parseDateString(dateStr);
        console.log(`  Input: "${dateStr}" - Valid`);
    } catch (error) {
        console.log(`  Input: "${dateStr}" - Error: ${error.message}`);
    }
});

// Test date comparison
console.log('\n5. Date Comparison Tests:');
try {
    const date1 = new DateModel();
    date1.parseDateString('1995-12-25');
    
    const date2 = new DateModel();
    date2.parseDateString('2000-01-01');
    
    const date3 = new DateModel();
    date3.parseDateString('1995-12-25');

    console.log(`  Date 1: ${date1.toGEDCOM()}`);
    console.log(`  Date 2: ${date2.toGEDCOM()}`);
    console.log(`  Date 3: ${date3.toGEDCOM()}`);
    console.log(`  Date1 vs Date2: ${date1.compare(date2)} (should be -1)`);
    console.log(`  Date2 vs Date1: ${date2.compare(date1)} (should be 1)`);
    console.log(`  Date1 vs Date3: ${date1.compare(date3)} (should be 0)`);
} catch (error) {
    console.log(`  Comparison test error: ${error.message}`);
}

console.log('\n=== Test Suite Complete ===');
