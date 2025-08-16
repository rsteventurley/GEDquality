/**
 * Test file for CompareModels.compareRelationships method
 */

// Import required classes
const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const CompareModels = require('./DataModel/CompareModels');

// Create test data
console.log('Creating test PageModels...');

// Create first PageModel with some test data
const pageModel1 = new PageModel();
pageModel1.location = 'Test Location 1';

// Add a test entry with people
const entry1 = new EntryModel('E001', 'Test Entry 1');
const person1_1 = new PersonModel(new NameModel('John', 'Smith'));
const person1_2 = new PersonModel(new NameModel('Mary', 'Smith'));

entry1.addPerson(1, 'I1', person1_1);
entry1.addPerson(2, 'I2', person1_2);
pageModel1.entries['E001'] = entry1;

// Create second PageModel with similar data but different relationships
const pageModel2 = new PageModel();
pageModel2.location = 'Test Location 2';

// Add the same test entry with people
const entry2 = new EntryModel('E001', 'Test Entry 2');
const person2_1 = new PersonModel(new NameModel('John', 'Smith'));
const person2_2 = new PersonModel(new NameModel('Mary', 'Smith'));

entry2.addPerson(1, 'I1', person2_1);
entry2.addPerson(2, 'I2', person2_2);
pageModel2.entries['E001'] = entry2;

// Test compareRelationships
console.log('Testing compareRelationships method...');

const compareModels = new CompareModels(pageModel1, pageModel2);
const relationshipResults = compareModels.compareRelationships();

console.log('Relationship comparison results:');
console.log('Entries compared:', relationshipResults.entriesCompared);
console.log('Total matches:', relationshipResults.totalMatches);
console.log('Relationship recall errors:', relationshipResults.relationshipRecallErrors);
console.log('Relationship recall error rate:', relationshipResults.relationshipRecallErrorRate.toFixed(2) + '%');

// Display details
if (relationshipResults.details.length > 0) {
    console.log('\nDetailed results:');
    relationshipResults.details.forEach(detail => {
        console.log(`Entry ${detail.entryId}:`);
        console.log(`  Matches: ${detail.matches.length}`);
        console.log(`  Recall errors: ${detail.recallErrors.length}`);
        
        if (detail.recallErrors.length > 0) {
            detail.recallErrors.forEach((error, index) => {
                console.log(`    Error ${index + 1}:`);
                console.log(`      Person: ${error.person1Name} (${error.person1Id}) <-> ${error.person2Name} (${error.person2Id})`);
                console.log(`      Relationship 1: "${error.relationship1}"`);
                console.log(`      Relationship 2: "${error.relationship2}"`);
                console.log(`      Match type: ${error.matchType}`);
            });
        }
    });
}

console.log('\nTest completed successfully!');
