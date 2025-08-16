/**
 * Test file for NameModel comparison methods
 */

const NameModel = require('./DataModel/NameModel');

console.log('=== Testing NameModel Comparison Methods ===\n');

// Create test names
const name1 = new NameModel('John', 'Smith');
const name2 = new NameModel('John', 'Smith');
const name3 = new NameModel('JOHN', 'SMITH');
const name4 = new NameModel('Jon', 'Smith');
const name5 = new NameModel('John', 'Smyth');
const name6 = new NameModel('Mary', 'Johnson');
const name7 = new NameModel('Catherine', 'Williams');
const name8 = new NameModel('Katherine', 'Williams');

console.log('=== Testing exactMatch method ===');
console.log(`"${name1.toString()}" exactMatch "${name2.toString()}":`, name1.exactMatch(name2)); // Should be true
console.log(`"${name1.toString()}" exactMatch "${name3.toString()}":`, name1.exactMatch(name3)); // Should be true (case insensitive)
console.log(`"${name1.toString()}" exactMatch "${name4.toString()}":`, name1.exactMatch(name4)); // Should be false
console.log(`"${name1.toString()}" exactMatch "${name6.toString()}":`, name1.exactMatch(name6)); // Should be false

console.log('\n=== Testing similarMatch method ===');
console.log(`"${name1.toString()}" similarMatch "${name2.toString()}":`, name1.similarMatch(name2)); // Should be true (exact match)
console.log(`"${name1.toString()}" similarMatch "${name4.toString()}":`, name1.similarMatch(name4)); // Should be true (Jon/John sound similar)
console.log(`"${name1.toString()}" similarMatch "${name5.toString()}":`, name1.similarMatch(name5)); // Should be true (Smith/Smyth sound similar)
console.log(`"${name7.toString()}" similarMatch "${name8.toString()}":`, name7.similarMatch(name8)); // Should be true (Catherine/Katherine)
console.log(`"${name1.toString()}" similarMatch "${name6.toString()}":`, name1.similarMatch(name6)); // Should be false (completely different)

console.log('\n=== Testing Soundex algorithm ===');
// Test some known Soundex examples
const testNames = [
    'Smith', 'Smyth', 'Schmidt',
    'Johnson', 'Johnston', 'Johnstone',
    'Catherine', 'Katherine', 'Kathryn',
    'Robert', 'Rupert', 'Rubert'
];

testNames.forEach(name => {
    const nameModel = new NameModel(name, '');
    const soundex = nameModel._getSoundex(name);
    console.log(`"${name}" -> Soundex: ${soundex}`);
});

console.log('\n✅ NameModel comparison tests completed!');
