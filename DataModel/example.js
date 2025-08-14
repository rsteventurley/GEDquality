/**
 * Simple usage example for the DateModel class
 * Demonstrates basic functionality// Example 7: Da// Example 7: Date comparison
console.log('\n7. Date Comparison Example:'); comparison
console.log('\n7. Date Comparison Example:');
try {
    const date1 = new DateModel();
    date1.parseDateString('1995-12-25');
    
    const date2 = new DateModel();
    date2.parseDateString('2000-01-01');
    
    const result = date1.compare(date2);
    console.log(`   ${date1.toString()} compared to ${date2.toString()}: ${result}`);
    console.log(`   (${result < 0 ? 'earlier' : result > 0 ? 'later' : 'same'})`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 8: Error handlingrmat
 */

const DateModel = require('./DateModel');

console.log('=== DateModel Usage Example ===\n');

// Example 1: Create and parse a single date
console.log('1. Single Date Example:');
try {
    const birthDate = new DateModel();
    birthDate.parseDateString('1995-12-25');
    
    console.log(`   Birth date: ${birthDate.toGEDCOM()}`);
    console.log(`   ISO format: ${birthDate.toISO()}`);
    console.log(`   toString(): ${birthDate.toString()}`);
    console.log(`   JavaScript Date: ${birthDate.toDate()}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 2: Create an "about" date
console.log('\n2. "About" Date Example:');
try {
    const approximateDate = new DateModel();
    approximateDate.parseDateString('ABT 1850-06-15');
    
    console.log(`   Approximate date: ${approximateDate.toGEDCOM()}`);
    console.log(`   toString(): ${approximateDate.toString()}`);
    console.log(`   Is about: ${approximateDate.isAbout}`);
    console.log(`   Is exact: ${approximateDate.isExact()}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 3: Create a "before" date
console.log('\n3. "Before" Date Example:');
try {
    const beforeDate = new DateModel();
    beforeDate.parseDateString('BEF 1900-12-31');
    
    console.log(`   Before date: ${beforeDate.toGEDCOM()}`);
    console.log(`   toString(): ${beforeDate.toString()}`);
    console.log(`   Is before: ${beforeDate.isBefore}`);
    console.log(`   Is exact: ${beforeDate.isExact()}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 4: Create an "after" date
console.log('\n4. "After" Date Example:');
try {
    const afterDate = new DateModel();
    afterDate.parseDateString('AFT 1850-01-01');
    
    console.log(`   After date: ${afterDate.toGEDCOM()}`);
    console.log(`   toString(): ${afterDate.toString()}`);
    console.log(`   Is after: ${afterDate.isAfter}`);
    console.log(`   Is exact: ${afterDate.isExact()}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 5: Create a date range
console.log('\n5. Date Range Example:');
try {
    const lifespan = new DateModel();
    lifespan.parseDateString('BET 1850-01-01 AND 1920-12-31');
    
    console.log(`   Lifespan: ${lifespan.toGEDCOM()}`);
    console.log(`   toString(): ${lifespan.toString()}`);
    console.log(`   Is range: ${lifespan.isRange}`);
    console.log(`   Start date: ${lifespan.startDate.toGEDCOM()}`);
    console.log(`   End date: ${lifespan.endDate.toGEDCOM()}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 6: Empty DateModel
console.log('\n6. Empty DateModel Example:');
const emptyDate = new DateModel();
console.log(`   Empty DateModel toString(): ${emptyDate.toString()}`);
console.log(`   Empty DateModel isEmpty(): ${emptyDate.isEmpty()}`);
console.log(`   Empty DateModel isValid(): ${emptyDate.isValid()}`);

// Example 7: Date comparison
console.log('\n5. Date Comparison Example:');
try {
    const date1 = new DateModel();
    date1.parseDateString('1995-12-25');
    
    const date2 = new DateModel();
    date2.parseDateString('2000-01-01');
    
    const result = date1.compare(date2);
    console.log(`   ${date1.toString()} compared to ${date2.toString()}: ${result}`);
    console.log(`   (${result < 0 ? 'earlier' : result > 0 ? 'later' : 'same'})`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 6: Error handling
console.log('\n8. Error Handling Example:');
const invalidDates = ['1300-12-25', '1995-13-25', '1995-02-30'];

invalidDates.forEach(dateStr => {
    try {
        const date = new DateModel();
        date.parseDateString(dateStr);
        console.log(`   ${dateStr}: Valid (unexpected!)`);
    } catch (error) {
        console.log(`   ${dateStr}: ${error.message}`);
    }
});

console.log('\n=== Example Complete ===');
