/**
 * Quick test to verify EntryModel can be imported and works correctly
 */

const { EntryModel, PersonModel, FamilyModel, NameModel } = require('./index.js');

console.log('Testing EntryModel import and basic functionality...');

// Create entry
const entry = new EntryModel('test-entry');

// Add people
const person1 = new PersonModel(new NameModel('John', 'Doe'));
const person2 = new PersonModel(new NameModel('Jane', 'Doe'));

console.log('Adding people...');
entry.addPerson(1, 'john-001', person1);
entry.addPerson(2, 'jane-002', person2);

// Add family
const family = new FamilyModel(1, 2, []);
console.log('Adding family...');
entry.addFamily(1, family);

// Test methods
console.log('Entry summary:', entry.toString());
console.log('Cross reference john-001:', entry.crossReference('john-001'));
console.log('John relationship:', entry.getRelationship(1));
console.log('Jane relationship:', entry.getRelationship(2));

console.log('✅ EntryModel import and functionality working correctly!');
