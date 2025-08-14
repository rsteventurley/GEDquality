/**
 * Test file for EntryModel class
 * Tests various scenarios to ensure proper functionality
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const EntryModel = require('./EntryModel');
const PersonModel = require('./PersonModel');
const FamilyModel = require('./FamilyModel');
const NameModel = require('./NameModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

function runTests() {
    console.log('=== EntryModel Class Tests ===\n');
    
    let testCount = 0;
    let passedTests = 0;
    
    function test(description, expected, actual) {
        testCount++;
        const passed = expected === actual;
        if (passed) passedTests++;
        console.log(`Test ${testCount}: ${description}`);
        console.log(`  Expected: ${expected}, Got: ${actual} - ${passed ? 'PASS' : 'FAIL'}`);
        return passed;
    }
    
    try {
        // Test 1: Constructor with string ID
        console.log('\n--- Test 1: Constructor with string ID ---');
        const entry1 = new EntryModel('entry-001');
        test('Entry ID should be string', 'string', typeof entry1.id);
        test('Entry ID should contain correct value', 'entry-001', entry1.id);
        test('Empty entry should be empty', true, entry1.isEmpty());
        console.log('Entry toString:', entry1.toString());
        
        // Test 2: Constructor with array ID (should convert to string)
        console.log('\n--- Test 2: Constructor with array ID ---');
        const entry2 = new EntryModel(['entry-002', 'secondary-id']);
        test('Entry ID should be empty string for array input', '', entry2.id);
        test('Entry ID type should be string', 'string', typeof entry2.id);
        test('Entry should be empty with invalid array ID', true, entry2.isEmpty());
        
        // Test 3: Constructor with invalid ID
        console.log('\n--- Test 3: Constructor with invalid ID ---');
        const entry3 = new EntryModel(123);
        test('Invalid ID should result in empty string', '', entry3.id);
        
        // Test 4: Add person
        console.log('\n--- Test 4: Add person ---');
        const person1 = new PersonModel(new NameModel('John', 'Doe'));
        const person2 = new PersonModel(new NameModel('Jane', 'Smith'));
        
        test('Add first person should succeed', true, entry1.addPerson(1, 'john-001', person1));
        test('Add second person should succeed', true, entry1.addPerson(2, 'jane-002', person2));
        test('Entry should not be empty after adding people', false, entry1.isEmpty());
        
        const summary1 = entry1.getSummary();
        test('People count should be 2', 2, summary1.peopleCount);
        test('Families count should be 0', 0, summary1.familiesCount);
        
        // Test 5: Add person with duplicate ID
        console.log('\n--- Test 5: Add person with duplicate ID ---');
        const person3 = new PersonModel(new NameModel('Bob', 'Wilson'));
        test('Add person with duplicate ID should fail', false, entry1.addPerson(1, 'bob-003', person3));
        test('People count should remain 2', 2, entry1.getSummary().peopleCount);
        
        // Test 6: Add person with duplicate UID
        console.log('\n--- Test 6: Add person with duplicate UID ---');
        test('Add person with duplicate UID should fail', false, entry1.addPerson(3, 'john-001', person3));
        test('People count should remain 2', 2, entry1.getSummary().peopleCount);
        
        // Test 7: Add person with invalid parameters
        console.log('\n--- Test 7: Add person with invalid parameters ---');
        test('Add person with string ID should fail', false, entry1.addPerson('invalid', 'test-uid', person3));
        test('Add person with null person should fail', false, entry1.addPerson(4, 'test-uid', null));
        test('Add person with non-PersonModel should fail', false, entry1.addPerson(4, 'test-uid', 'not a person'));
        
        // Test 8: Cross reference
        console.log('\n--- Test 8: Cross reference ---');
        test('Cross reference existing UID should return person ID', 1, entry1.crossReference('john-001'));
        test('Cross reference existing UID should return person ID', 2, entry1.crossReference('jane-002'));
        test('Cross reference non-existing UID should return -1', -1, entry1.crossReference('not-found'));
        test('Cross reference with invalid type should return -1', -1, entry1.crossReference(123));
        
        // Test 9: Get person methods
        console.log('\n--- Test 9: Get person methods ---');
        const retrievedPerson1 = entry1.getPerson(1);
        const retrievedPerson2 = entry1.getPersonByUID('jane-002');
        
        test('Get person by ID should return PersonModel', true, retrievedPerson1 instanceof PersonModel);
        test('Get person by UID should return PersonModel', true, retrievedPerson2 instanceof PersonModel);
        test('Get person by ID should have correct name', 'John', retrievedPerson1.getName().getGivenName());
        test('Get person by UID should have correct name', 'Jane', retrievedPerson2.getName().getGivenName());
        
        test('Get non-existing person by ID should return null', null, entry1.getPerson(999));
        test('Get non-existing person by UID should return null', null, entry1.getPersonByUID('not-found'));
        
        // Test 10: Add families
        console.log('\n--- Test 10: Add families ---');
        const family1 = new FamilyModel(1, 2, []); // John and Jane married
        const family2 = new FamilyModel(1, 2, [3, 4]); // John and Jane with children (IDs 3,4 don't exist yet)
        
        test('Add first family should succeed', true, entry1.addFamily(1, family1));
        test('Add second family should succeed', true, entry1.addFamily(2, family2));
        
        const summary2 = entry1.getSummary();
        test('Families count should be 2', 2, summary2.familiesCount);
        
        // Check that family IDs were added to people
        const johnAfterFamily = entry1.getPerson(1);
        const janeAfterFamily = entry1.getPerson(2);
        test('John should have family IDs', true, johnAfterFamily.getFamilies().length > 0);
        test('Jane should have family IDs', true, janeAfterFamily.getFamilies().length > 0);
        
        // Test 11: Add family with duplicate ID
        console.log('\n--- Test 11: Add family with duplicate ID ---');
        const family3 = new FamilyModel(3, 4, []);
        test('Add family with duplicate ID should fail', false, entry1.addFamily(1, family3));
        test('Families count should remain 2', 2, entry1.getSummary().familiesCount);
        
        // Test 12: Add family with invalid parameters
        console.log('\n--- Test 12: Add family with invalid parameters ---');
        test('Add family with string ID should fail', false, entry1.addFamily('invalid', family3));
        test('Add family with null family should fail', false, entry1.addFamily(3, null));
        test('Add family with non-FamilyModel should fail', false, entry1.addFamily(3, 'not a family'));
        
        // Test 13: Relationship calculation for simple family
        console.log('\n--- Test 13: Relationship calculation for simple family ---');
        
        // Create a new entry for relationship testing
        const relationEntry = new EntryModel('relation-test');
        
        // Add people
        const father = new PersonModel(new NameModel('Father', 'Smith'));
        const mother = new PersonModel(new NameModel('Mother', 'Smith'));
        const child1 = new PersonModel(new NameModel('Child1', 'Smith'));
        const child2 = new PersonModel(new NameModel('Child2', 'Smith'));
        
        relationEntry.addPerson(1, 'father', father);
        relationEntry.addPerson(2, 'mother', mother);
        relationEntry.addPerson(3, 'child1', child1);
        relationEntry.addPerson(4, 'child2', child2);
        
        // Add family
        const parentFamily = new FamilyModel(1, 2, [3, 4]); // Father, Mother, Child1, Child2
        relationEntry.addFamily(1, parentFamily);
        
        // Test relationships
        test('Father relationship should be 0 (trunk)', '0', relationEntry.getRelationship(1));
        test('Mother relationship should be 0W (wife)', '0W', relationEntry.getRelationship(2));
        test('Child1 relationship should be 0C (child)', '0C', relationEntry.getRelationship(3));
        test('Child2 relationship should be 0C (child)', '0C', relationEntry.getRelationship(4));
        
        console.log('Relationships:');
        console.log('  Father (1):', relationEntry.getRelationship(1));
        console.log('  Mother (2):', relationEntry.getRelationship(2));
        console.log('  Child1 (3):', relationEntry.getRelationship(3));
        console.log('  Child2 (4):', relationEntry.getRelationship(4));
        
        // Test 14: Multi-generation relationships
        console.log('\n--- Test 14: Multi-generation relationships ---');
        
        // Add grandparents
        const grandfather = new PersonModel(new NameModel('Grandfather', 'Smith'));
        const grandmother = new PersonModel(new NameModel('Grandmother', 'Smith'));
        
        relationEntry.addPerson(5, 'grandfather', grandfather);
        relationEntry.addPerson(6, 'grandmother', grandmother);
        
        // Add grandparent family with father as child
        const grandparentFamily = new FamilyModel(5, 6, [1]); // Grandfather, Grandmother, Father
        relationEntry.addFamily(2, grandparentFamily);
        
        // Add parents of the wife (mother)
        const wifesFather = new PersonModel(new NameModel('WifesFather', 'Johnson'));
        const wifesMother = new PersonModel(new NameModel('WifesMother', 'Johnson'));
        
        relationEntry.addPerson(7, 'wifesfather', wifesFather);
        relationEntry.addPerson(8, 'wifesmother', wifesMother);
        
        // Add wife's parents family with mother as child
        const wifesParentsFamily = new FamilyModel(7, 8, [2]); // WifesFather, WifesMother, Mother
        relationEntry.addFamily(3, wifesParentsFamily);
        
        // Recalculate relationships by accessing them again
        test('Grandfather relationship should be 0F (father of trunk)', '0F', relationEntry.getRelationship(5));
        test('Grandmother relationship should be 0M (mother of trunk)', '0M', relationEntry.getRelationship(6));
        test('Wifes father relationship should be 0WF (wife\'s father)', '0WF', relationEntry.getRelationship(7));
        test('Wifes mother relationship should be 0WM (wife\'s mother)', '0WM', relationEntry.getRelationship(8));
        
        console.log('Extended relationships:');
        console.log('  Grandfather (5):', relationEntry.getRelationship(5));
        console.log('  Grandmother (6):', relationEntry.getRelationship(6));
        console.log('  Wife\'s Father (7):', relationEntry.getRelationship(7));
        console.log('  Wife\'s Mother (8):', relationEntry.getRelationship(8));
        
        // Test 15: Separate family tree
        console.log('\n--- Test 15: Separate family tree ---');
        
        // Add unrelated people (using IDs 9 and 10 since 7 and 8 are now used)
        const unrelated1 = new PersonModel(new NameModel('Unrelated1', 'Jones'));
        const unrelated2 = new PersonModel(new NameModel('Unrelated2', 'Jones'));
        
        relationEntry.addPerson(9, 'unrelated1', unrelated1);
        relationEntry.addPerson(10, 'unrelated2', unrelated2);
        
        // Add unrelated family
        const unrelatedFamily = new FamilyModel(9, 10, []);
        relationEntry.addFamily(4, unrelatedFamily);
        
        test('Unrelated1 should be trunk of tree 1', '1', relationEntry.getRelationship(9));
        test('Unrelated2 should be wife in tree 1', '1W', relationEntry.getRelationship(10));
        
        console.log('Unrelated family relationships:');
        console.log('  Unrelated1 (9):', relationEntry.getRelationship(9));
        console.log('  Unrelated2 (10):', relationEntry.getRelationship(10));
        
        // Test 16: Invalid relationship queries
        console.log('\n--- Test 16: Invalid relationship queries ---');
        test('Relationship for non-existing person should be empty', '', relationEntry.getRelationship(999));
        test('Relationship for invalid type should be empty', '', relationEntry.getRelationship('invalid'));
        
        // Test 17: Clone method
        console.log('\n--- Test 17: Clone method ---');
        const clonedEntry = entry1.clone();
        test('Cloned entry should have same people count', entry1.getSummary().peopleCount, clonedEntry.getSummary().peopleCount);
        test('Cloned entry should have same families count', entry1.getSummary().familiesCount, clonedEntry.getSummary().familiesCount);
        
        // Modify original and ensure clone is unaffected
        const newPerson = new PersonModel(new NameModel('New', 'Person'));
        entry1.addPerson(10, 'new-person', newPerson);
        test('Clone should be independent of original', 2, clonedEntry.getSummary().peopleCount);
        
        // Test 18: Get methods
        console.log('\n--- Test 18: Get methods ---');
        const allPeople = entry1.getPeople();
        const allFamilies = entry1.getFamilies();
        
        test('Get people should return object', 'object', typeof allPeople);
        test('Get families should return object', 'object', typeof allFamilies);
        test('Get people should have correct count', 3, Object.keys(allPeople).length); // Added one more person
        test('Get families should have correct count', 2, Object.keys(allFamilies).length);
        
        const retrievedFamily = entry1.getFamily(1);
        test('Get family should return FamilyModel', true, retrievedFamily instanceof FamilyModel);
        test('Get non-existing family should return null', null, entry1.getFamily(999));
        
        // Summary
        console.log('\n=== Test Summary ===');
        console.log(`Total tests: ${testCount}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${testCount - passedTests}`);
        console.log(`Success rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
        
        if (passedTests === testCount) {
            console.log('\n🎉 All tests passed! The EntryModel class is working correctly.');
        } else {
            console.log('\n❌ Some tests failed. Please check the implementation.');
        }
        
    } catch (error) {
        console.error('Error during testing:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the tests
runTests();
