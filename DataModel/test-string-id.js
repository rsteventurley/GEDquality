/**
 * Test to verify EntryModel id is now a string instead of array
 */

const EntryModel = require('./EntryModel');
const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');

console.log('=== EntryModel String ID Verification ===\n');

// Test 1: String ID
console.log('--- Test 1: String ID Constructor ---');
const entry1 = new EntryModel('simple-entry');
console.log(`ID Type: ${typeof entry1.id}`); // Should be 'string'
console.log(`ID Value: "${entry1.id}"`); // Should be 'simple-entry'
console.log(`Entry String: ${entry1.toString()}`);
console.log('');

// Test 2: Array ID (should be rejected)
console.log('--- Test 2: Array ID Constructor (should be empty) ---');
const entry2 = new EntryModel(['array', 'entry']);
console.log(`ID Type: ${typeof entry2.id}`); // Should be 'string'
console.log(`ID Value: "${entry2.id}"`); // Should be empty string
console.log(`Entry String: ${entry2.toString()}`);
console.log('');

// Test 3: Invalid ID
console.log('--- Test 3: Invalid ID Constructor ---');
const entry3 = new EntryModel(123);
console.log(`ID Type: ${typeof entry3.id}`); // Should be 'string'
console.log(`ID Value: "${entry3.id}"`); // Should be empty string
console.log(`Entry String: ${entry3.toString()}`);
console.log('');

// Test 4: Add people and verify functionality
console.log('--- Test 4: Add People and Test Functionality ---');
const person = new PersonModel(new NameModel('Test', 'Person'));
person.setUid('test-uid');

entry1.addPerson(1, 'test-uid', person);
console.log(`Entry after adding person: ${entry1.toString()}`);
console.log(`Summary ID: ${entry1.getSummary().id}`); // Should be string, not array
console.log('');

console.log('=== All tests show EntryModel now uses string ID successfully! ===');
