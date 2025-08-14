/**
 * Basic test for PageModel functionality
 */

const PageModel = require('./PageModel');
const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');
const EntryModel = require('./EntryModel');
const FamilyModel = require('./FamilyModel');

console.log('=== PageModel Basic Tests ===\n');

// Test 1: Constructor
console.log('--- Test 1: Constructor ---');
const page = new PageModel();
console.log(`Empty page: ${page.isEmpty()}`); // Should be true
console.log(`String representation: ${page.toString()}`);
console.log('');

// Test 2: Add person with addPerson method
console.log('--- Test 2: Add person with addPerson method ---');
const name1 = new NameModel('John', 'Doe');
const person1 = new PersonModel(name1);
person1.setSource('entry-001');
person1.setUid('john-001');

try {
    const success = page.addPerson(person1, 1);
    console.log(`Add person success: ${success}`); // Should be true
    console.log(`People count: ${page.getPeopleCount()}`); // Should be 1
    console.log(`Entry count: ${page.getEntryCount()}`); // Should be 1
    console.log(`Page is empty: ${page.isEmpty()}`); // Should be false
} catch (error) {
    console.log(`Error: ${error.message}`);
}
console.log('');

// Test 3: Try to add person with duplicate ID
console.log('--- Test 3: Try to add person with duplicate ID ---');
const name2 = new NameModel('Jane', 'Smith');
const person2 = new PersonModel(name2);
person2.setSource('entry-002');

try {
    const success = page.addPerson(person2, 1); // Should throw error
    console.log(`Add duplicate person success: ${success}`);
} catch (error) {
    console.log(`Expected error: ${error.message}`);
}
console.log('');

// Test 4: Add person with unique ID
console.log('--- Test 4: Add person with unique ID ---');
try {
    const success = page.addPerson(person2, 2);
    console.log(`Add second person success: ${success}`); // Should be true
    console.log(`People count: ${page.getPeopleCount()}`); // Should be 2
    console.log(`Entry count: ${page.getEntryCount()}`); // Should be 2
} catch (error) {
    console.log(`Error: ${error.message}`);
}
console.log('');

// Test 5: Test getter methods
console.log('--- Test 5: Test getter methods ---');
const retrievedPerson = page.getPerson(1);
console.log(`Retrieved person name: ${retrievedPerson ? retrievedPerson.getName().toString() : 'null'}`);

const retrievedEntry = page.getEntry('entry-001');
console.log(`Retrieved entry: ${retrievedEntry ? retrievedEntry.toString() : 'null'}`);
console.log('');

// Test 6: Create and add an entry with people and families
console.log('--- Test 6: Create and add entry with family ---');
const entry = new EntryModel('family-entry');

// Create family members
const fatherName = new NameModel('Robert', 'Johnson');
const father = new PersonModel(fatherName);
father.setUid('father-001');

const motherName = new NameModel('Mary', 'Johnson');
const mother = new PersonModel(motherName);
mother.setUid('mother-001');

const childName = new NameModel('Tommy', 'Johnson');
const child = new PersonModel(childName);
child.setUid('child-001');

// Add people to entry
entry.addPerson(10, 'father-001', father);
entry.addPerson(11, 'mother-001', mother);
entry.addPerson(12, 'child-001', child);

// Create family
const family = new FamilyModel();
family.setHusband(10);
family.setWife(11);
family.setChildren([12]);

// Add family to entry
entry.addFamily(1, family);

// Add entry to page
const entrySuccess = page.addEntry(entry);
console.log(`Add entry success: ${entrySuccess}`);
console.log(`Final people count: ${page.getPeopleCount()}`);
console.log(`Final family count: ${page.getFamilyCount()}`);
console.log(`Final entry count: ${page.getEntryCount()}`);
console.log(`Page summary: ${page.toString()}`);

// Test 7: Test addFamily method
console.log('\n--- Test 7: Test addFamily method ---');
const standalonePage = new PageModel();
const standaloneFamily = new FamilyModel();
standaloneFamily.setHusband(100);
standaloneFamily.setWife(101);
standaloneFamily.setChildren([102, 103]);

try {
    const familySuccess = standalonePage.addFamily(standaloneFamily, 500);
    console.log(`Add standalone family success: ${familySuccess}`);
    console.log(`Standalone page family count: ${standalonePage.getFamilyCount()}`);
    
    // Try to add duplicate family ID
    try {
        standalonePage.addFamily(standaloneFamily, 500);
        console.log(`Duplicate family ID should have thrown error`);
    } catch (error) {
        console.log(`Expected duplicate family error: ${error.message}`);
    }
    
    // Test invalid parameters
    console.log(`Add null family: ${standalonePage.addFamily(null, 600)}`);
    console.log(`Add with string ID: ${standalonePage.addFamily(standaloneFamily, "invalid")}`);
    
} catch (error) {
    console.log(`Unexpected error: ${error.message}`);
}

console.log('\n=== Tests Complete ===');
