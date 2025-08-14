/**
 * Test file for NameModel
 * Demonstrates various NameModel functionality
 * 
 * Run with: node DataModel/test-NameModel.js
 */

const NameModel = require('./NameModel');

console.log('=== NameModel Test Suite ===\n');

// Test 1: Empty NameModel
console.log('1. Empty NameModel Tests:');
const emptyName = new NameModel();
console.log(`   isEmpty(): ${emptyName.isEmpty()}`);
console.log(`   isValid(): ${emptyName.isValid()}`);
console.log(`   toString(): "${emptyName.toString()}"`);
console.log(`   Given Name: "${emptyName.getGivenName()}"`);
console.log(`   Surname: "${emptyName.getSurname()}"`);
console.log(`   Initials: "${emptyName.getInitials()}"`);
console.log('');

// Test 2: Name with both given name and surname
console.log('2. Full Name Tests:');
const fullName = new NameModel('John', 'Smith');
console.log(`   isEmpty(): ${fullName.isEmpty()}`);
console.log(`   isValid(): ${fullName.isValid()}`);
console.log(`   toString(): "${fullName.toString()}"`);
console.log(`   Given Name: "${fullName.getGivenName()}"`);
console.log(`   Surname: "${fullName.getSurname()}"`);
console.log(`   Initials: "${fullName.getInitials()}"`);
console.log(`   Genealogical Format: "${fullName.toGenealogicalFormat()}"`);
console.log('');

// Test 3: Name with given name only
console.log('3. Given Name Only Tests:');
const givenNameOnly = new NameModel('Mary');
console.log(`   isEmpty(): ${givenNameOnly.isEmpty()}`);
console.log(`   isValid(): ${givenNameOnly.isValid()}`);
console.log(`   toString(): "${givenNameOnly.toString()}"`);
console.log(`   Given Name: "${givenNameOnly.getGivenName()}"`);
console.log(`   Surname: "${givenNameOnly.getSurname()}"`);
console.log(`   Initials: "${givenNameOnly.getInitials()}"`);
console.log(`   Genealogical Format: "${givenNameOnly.toGenealogicalFormat()}"`);
console.log('');

// Test 4: Name with surname only
console.log('4. Surname Only Tests:');
const surnameOnly = new NameModel(undefined, 'Johnson');
console.log(`   isEmpty(): ${surnameOnly.isEmpty()}`);
console.log(`   isValid(): ${surnameOnly.isValid()}`);
console.log(`   toString(): "${surnameOnly.toString()}"`);
console.log(`   Given Name: "${surnameOnly.getGivenName()}"`);
console.log(`   Surname: "${surnameOnly.getSurname()}"`);
console.log(`   Initials: "${surnameOnly.getInitials()}"`);
console.log(`   Genealogical Format: "${surnameOnly.toGenealogicalFormat()}"`);
console.log('');

// Test 5: Setting names using setter methods
console.log('5. Setter Methods Tests:');
const setterName = new NameModel();
setterName.setGivenName('Robert');
setterName.setSurname('Wilson');
console.log(`   After setting names: "${setterName.toString()}"`);
console.log(`   Given Name: "${setterName.getGivenName()}"`);
console.log(`   Surname: "${setterName.getSurname()}"`);
console.log('');

// Test 6: Null and undefined handling
console.log('6. Null/Undefined Handling Tests:');
const nullName = new NameModel(null, null);
console.log(`   Null constructor: "${nullName.toString()}"`);
console.log(`   isEmpty(): ${nullName.isEmpty()}`);

const undefinedName = new NameModel(undefined, undefined);
console.log(`   Undefined constructor: "${undefinedName.toString()}"`);
console.log(`   isEmpty(): ${undefinedName.isEmpty()}`);

const mixedName = new NameModel('Alice', null);
console.log(`   Mixed (Alice, null): "${mixedName.toString()}"`);
console.log('');

// Test 7: Empty string handling
console.log('7. Empty String Handling Tests:');
const emptyStringName = new NameModel('', '');
console.log(`   Empty strings: "${emptyStringName.toString()}"`);
console.log(`   isEmpty(): ${emptyStringName.isEmpty()}`);

const partialEmptyName = new NameModel('Bob', '');
console.log(`   Partial empty (Bob, ''): "${partialEmptyName.toString()}"`);
console.log('');

// Test 8: Clone functionality
console.log('8. Clone Tests:');
const original = new NameModel('Elizabeth', 'Brown');
const cloned = original.clone();
console.log(`   Original: "${original.toString()}"`);
console.log(`   Cloned: "${cloned.toString()}"`);
console.log(`   Are they the same object? ${original === cloned}`);

// Modify clone to test independence
cloned.setGivenName('Lisa');
console.log(`   After modifying clone:`);
console.log(`   Original: "${original.toString()}"`);
console.log(`   Cloned: "${cloned.toString()}"`);
console.log('');

// Test 9: Complex names with multiple parts
console.log('9. Complex Names Tests:');
const complexNames = [
    new NameModel('Mary Elizabeth', 'Smith-Jones'),
    new NameModel('Jean-Pierre', 'Dubois'),
    new NameModel('Maria del Carmen', 'Rodriguez'),
    new NameModel('O\'Malley', 'Patrick')
];

complexNames.forEach((name, index) => {
    console.log(`   ${index + 1}. "${name.toString()}" -> Genealogical: "${name.toGenealogicalFormat()}" -> Initials: "${name.getInitials()}"`);
});
console.log('');

// Test 10: Setting null values with setters
console.log('10. Setting Null with Setters:');
const setterNullTest = new NameModel('John', 'Doe');
console.log(`   Before: "${setterNullTest.toString()}"`);
setterNullTest.setGivenName(null);
console.log(`   After setting givenName to null: "${setterNullTest.toString()}"`);
setterNullTest.setSurname(null);
console.log(`   After setting surname to null: "${setterNullTest.toString()}"`);
console.log(`   isEmpty(): ${setterNullTest.isEmpty()}`);
console.log('');

// Test 11: Initials with lowercase names
console.log('11. Initials with Various Cases:');
const caseTestNames = [
    new NameModel('john', 'smith'),
    new NameModel('MARY', 'JOHNSON'),
    new NameModel('mIxEd', 'CaSe'),
    new NameModel('a', 'b')
];

caseTestNames.forEach((name, index) => {
    console.log(`   ${index + 1}. "${name.toString()}" -> Initials: "${name.getInitials()}"`);
});
console.log('');

// Test 12: Comparison test
console.log('12. Comparison Tests:');
const name1 = new NameModel('John', 'Smith');
const name2 = new NameModel('John', 'Smith');
const name3 = new NameModel('Jane', 'Smith');

console.log(`   Name1: "${name1.toString()}"`);
console.log(`   Name2: "${name2.toString()}"`);
console.log(`   Name3: "${name3.toString()}"`);
console.log(`   Name1 toString === Name2 toString: ${name1.toString() === name2.toString()}`);
console.log(`   Name1 toString === Name3 toString: ${name1.toString() === name3.toString()}`);
console.log('');

console.log('=== NameModel Test Suite Complete ===');
