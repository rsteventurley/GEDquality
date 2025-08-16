/**
 * Test file for refined relationship string comparison in CompareModels
 */

// Import required classes
const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const CompareModels = require('./DataModel/CompareModels');

console.log('=== Testing Refined Relationship String Comparison ===\n');

// Test the _extractRelationshipLetters method directly
const comparer = new CompareModels(new PageModel(), new PageModel());

console.log('Testing _extractRelationshipLetters method:');
console.log('  "1" -> "' + comparer._extractRelationshipLetters('1') + '"');
console.log('  "2a" -> "' + comparer._extractRelationshipLetters('2a') + '"');
console.log('  "3abc" -> "' + comparer._extractRelationshipLetters('3abc') + '"');
console.log('  "0" -> "' + comparer._extractRelationshipLetters('0') + '"');
console.log('  "4XYZ" -> "' + comparer._extractRelationshipLetters('4XYZ') + '"');
console.log('  "" -> "' + comparer._extractRelationshipLetters('') + '"');
console.log('  "abc" -> "' + comparer._extractRelationshipLetters('abc') + '"');
console.log('  null -> "' + comparer._extractRelationshipLetters(null) + '"');

console.log('\n=== Testing Agreement Cases ===');

// Test cases that should agree (no relationship recall errors)
const testCases = [
    { rel1: '1', rel2: '2', shouldAgree: true, description: 'Both have no letters' },
    { rel1: '3a', rel2: '7a', shouldAgree: true, description: 'Same letters (a)' },
    { rel1: '1abc', rel2: '9abc', shouldAgree: true, description: 'Same letters (abc)' },
    { rel1: '0', rel2: '5', shouldAgree: true, description: 'Both empty letters' },
    { rel1: '2a', rel2: '3b', shouldAgree: false, description: 'Different letters (a vs b)' },
    { rel1: '1', rel2: '2a', shouldAgree: false, description: 'One has letters, other does not' },
    { rel1: '3abc', rel2: '4ab', shouldAgree: false, description: 'Different letter lengths' }
];

testCases.forEach((testCase, index) => {
    const letters1 = comparer._extractRelationshipLetters(testCase.rel1);
    const letters2 = comparer._extractRelationshipLetters(testCase.rel2);
    const actuallyAgree = letters1 === letters2;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  "${testCase.rel1}" (letters: "${letters1}") vs "${testCase.rel2}" (letters: "${letters2}")`);
    console.log(`  Expected to agree: ${testCase.shouldAgree}, Actually agree: ${actuallyAgree}`);
    console.log(`  Result: ${testCase.shouldAgree === actuallyAgree ? '✓ PASS' : '✗ FAIL'}`);
    console.log('');
});

console.log('=== Testing Full Comparison Workflow ===');

// Create test PageModels with people having different relationship formats
const pageModel1 = new PageModel();
pageModel1.location = 'Test Location 1';

const entry1 = new EntryModel('E001', 'Test Entry 1');
const person1_1 = new PersonModel(new NameModel('John', 'Smith'));
const person1_2 = new PersonModel(new NameModel('Mary', 'Johnson'));

entry1.addPerson(1, 'I1', person1_1);
entry1.addPerson(2, 'I2', person1_2);

// Set up relationships with different digits but same letters
entry1.relationships = { 1: '1a', 2: '2b' };

pageModel1.entries['E001'] = entry1;

// Create second PageModel
const pageModel2 = new PageModel();
pageModel2.location = 'Test Location 2';

const entry2 = new EntryModel('E001', 'Test Entry 2');
const person2_1 = new PersonModel(new NameModel('John', 'Smith'));
const person2_2 = new PersonModel(new NameModel('Mary', 'Johnson'));

entry2.addPerson(1, 'I1', person2_1);
entry2.addPerson(2, 'I2', person2_2);

// Set up relationships with different digits but same letters (should agree)
// and one with different letters (should not agree)
entry2.relationships = { 1: '5a', 2: '7c' };

pageModel2.entries['E001'] = entry2;

// Test the refined comparison
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
                console.log(`      Person: ${error.person1Name} <-> ${error.person2Name}`);
                console.log(`      Relationship 1: "${error.relationship1}" (letters: "${error.letters1}")`);
                console.log(`      Relationship 2: "${error.relationship2}" (letters: "${error.letters2}")`);
                console.log(`      Match type: ${error.matchType}`);
            });
        }
        
        if (detail.matches.length > 0) {
            console.log(`  Matches found:`);
            detail.matches.forEach((match, index) => {
                console.log(`    Match ${index + 1}: ${match.person1Name} <-> ${match.person2Name} (${match.matchType})`);
            });
        }
    });
}

console.log('\nTest completed successfully!');
