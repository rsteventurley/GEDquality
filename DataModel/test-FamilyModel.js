/**
 * Test file for FamilyModel class
 * Tests various scenarios to ensure proper functionality
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const FamilyModel = require('./FamilyModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

function runTests() {
    console.log('=== FamilyModel Class Tests ===\n');
    
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
        // Test 1: Empty FamilyModel constructor
        console.log('\n--- Test 1: Empty FamilyModel constructor ---');
        const emptyFamily = new FamilyModel();
        test('Empty family should be empty', true, emptyFamily.isEmpty());
        test('Empty family should not be valid', false, emptyFamily.isValid());
        test('Empty family toString', '<Empty Family>', emptyFamily.toString());
        
        // Test 2: FamilyModel with all parameters
        console.log('\n--- Test 2: FamilyModel with all parameters ---');
        const marriageDate = new DateModel();
        marriageDate.parseDateString('1875-06-15');
        const marriageEvent = new EventModel(marriageDate, 'St. Mary\'s Church, Boston');
        const children = [3, 4, 5];
        
        const completeFamily = new FamilyModel(1, 2, children, marriageEvent);
        test('Complete family should not be empty', false, completeFamily.isEmpty());
        test('Complete family should be valid', true, completeFamily.isValid());
        test('Husband ID should be correct', 1, completeFamily.getHusband());
        test('Wife ID should be correct', 2, completeFamily.getWife());
        test('Children count should be correct', 3, completeFamily.getChildren().length);
        test('Marriage should be valid', true, completeFamily.getMarriage().isValid());
        
        console.log('Complete family toString:', completeFamily.toString());
        
        // Test 3: FamilyModel with partial parameters
        console.log('\n--- Test 3: FamilyModel with partial parameters ---');
        const partialFamily = new FamilyModel(10, undefined, [20, 21]);
        test('Partial family husband should be correct', 10, partialFamily.getHusband());
        test('Partial family wife should be null', null, partialFamily.getWife());
        test('Partial family children count', 2, partialFamily.getChildren().length);
        test('Partial family should be valid', true, partialFamily.isValid());
        
        console.log('Partial family toString:', partialFamily.toString());
        
        // Test 4: Invalid parameter types
        console.log('\n--- Test 4: Invalid parameter types ---');
        const invalidFamily = new FamilyModel('not a number', 'also not a number', 'not an array', 'not an event');
        test('Invalid husband should be null', null, invalidFamily.getHusband());
        test('Invalid wife should be null', null, invalidFamily.getWife());
        test('Invalid children should be empty array', 0, invalidFamily.getChildren().length);
        test('Invalid marriage should be empty', true, invalidFamily.getMarriage().isEmpty());
        
        // Test 5: Setter methods
        console.log('\n--- Test 5: Setter methods ---');
        const testFamily = new FamilyModel();
        testFamily.setHusband(100);
        testFamily.setWife(101);
        testFamily.setChildren([102, 103, 104]);
        
        const newMarriageDate = new DateModel();
        newMarriageDate.parseDateString('1880-09-20');
        const newMarriageEvent = new EventModel(newMarriageDate, 'Trinity Church, New York');
        testFamily.setMarriage(newMarriageEvent);
        
        test('Set husband should work', 100, testFamily.getHusband());
        test('Set wife should work', 101, testFamily.getWife());
        test('Set children should work', 3, testFamily.getChildren().length);
        test('Set marriage should work', true, testFamily.getMarriage().isValid());
        
        // Test 6: Add and remove children
        console.log('\n--- Test 6: Add and remove children ---');
        const familyWithChildren = new FamilyModel(1, 2, [10, 11]);
        
        familyWithChildren.addChild(12);
        test('Add child should increase count', 3, familyWithChildren.getChildren().length);
        test('Added child should be in array', true, familyWithChildren.getChildren().includes(12));
        
        familyWithChildren.addChild(12); // Try to add duplicate
        test('Duplicate child should not be added', 3, familyWithChildren.getChildren().length);
        
        familyWithChildren.removeChild(11);
        test('Remove child should decrease count', 2, familyWithChildren.getChildren().length);
        test('Removed child should not be in array', false, familyWithChildren.getChildren().includes(11));
        
        familyWithChildren.addChild('invalid'); // Try to add invalid type
        test('Invalid child type should not be added', 2, familyWithChildren.getChildren().length);
        
        // Test 7: Clone method
        console.log('\n--- Test 7: Clone method ---');
        const originalFamily = new FamilyModel(50, 51, [52, 53], marriageEvent);
        const clonedFamily = originalFamily.clone();
        
        test('Cloned husband should match', originalFamily.getHusband(), clonedFamily.getHusband());
        test('Cloned wife should match', originalFamily.getWife(), clonedFamily.getWife());
        test('Cloned children count should match', originalFamily.getChildren().length, clonedFamily.getChildren().length);
        
        // Modify original and ensure clone is unaffected
        originalFamily.setHusband(60);
        originalFamily.addChild(54);
        test('Clone should be independent of original', 50, clonedFamily.getHusband());
        test('Clone children should be independent', 2, clonedFamily.getChildren().length);
        
        // Test 8: Marriage-related methods
        console.log('\n--- Test 8: Marriage-related methods ---');
        const marriageFamily = new FamilyModel(1, 2, [], marriageEvent);
        test('Marriage place should be correct', 'St. Mary\'s Church, Boston', marriageFamily.getMarriagePlace());
        test('Has exact marriage date should be true', true, marriageFamily.hasExactMarriageDate());
        console.log('Marriage GEDCOM date:', marriageFamily.getMarriageDateGEDCOM());
        console.log('Marriage place translated:', marriageFamily.getMarriagePlaceTranslated());
        
        // Test 9: fillMarriage method - should fill
        console.log('\n--- Test 9: fillMarriage method - should fill ---');
        const fillDate = new DateModel();
        fillDate.parseDateString('1870-04-10');
        const fillEvent = new EventModel(fillDate, ''); // No place
        const fillFamily = new FamilyModel(1, 2, [], fillEvent);
        
        console.log('Before fillMarriage:', fillFamily.getMarriage().toString());
        fillFamily.fillMarriage('Philadelphia, Pennsylvania');
        console.log('After fillMarriage:', fillFamily.getMarriage().toString());
        test('Fill marriage should set place', 'Philadelphia, Pennsylvania', fillFamily.getMarriagePlace());
        
        // Test 10: fillMarriage method - should not fill (already has place)
        console.log('\n--- Test 10: fillMarriage method - should not fill (already has place) ---');
        const noFillFamily = new FamilyModel(1, 2, [], marriageEvent); // Already has place
        const originalPlace = noFillFamily.getMarriagePlace();
        noFillFamily.fillMarriage('Different Place');
        test('Fill marriage should not change existing place', originalPlace, noFillFamily.getMarriagePlace());
        
        // Test 11: fillMarriage method - should not fill (approximate date)
        console.log('\n--- Test 11: fillMarriage method - should not fill (approximate date) ---');
        const approxDate = new DateModel();
        approxDate.parseDateString('ABT 1870-04-10');
        const approxEvent = new EventModel(approxDate, '');
        const approxFamily = new FamilyModel(1, 2, [], approxEvent);
        
        console.log('Before fillMarriage (approx):', approxFamily.getMarriage().toString());
        console.log('Has exact marriage date:', approxFamily.hasExactMarriageDate());
        approxFamily.fillMarriage('Some Place');
        console.log('After fillMarriage (approx):', approxFamily.getMarriage().toString());
        test('Fill marriage should not fill approximate date', '', approxFamily.getMarriagePlace());
        
        // Test 12: fillMarriage method - invalid arguments
        console.log('\n--- Test 12: fillMarriage method - invalid arguments ---');
        const testFillFamily = new FamilyModel(1, 2, [], fillEvent.clone());
        const originalTestPlace = testFillFamily.getMarriagePlace();
        
        testFillFamily.fillMarriage(null);
        test('Null argument should not change place', originalTestPlace, testFillFamily.getMarriagePlace());
        
        testFillFamily.fillMarriage('');
        test('Empty string should not change place', originalTestPlace, testFillFamily.getMarriagePlace());
        
        testFillFamily.fillMarriage(123);
        test('Number argument should not change place', originalTestPlace, testFillFamily.getMarriagePlace());
        
        // Test 13: Array independence
        console.log('\n--- Test 13: Array independence ---');
        const originalChildren = [1, 2, 3];
        const arrayFamily = new FamilyModel(1, 2, originalChildren);
        originalChildren.push(4); // Modify original array
        test('Internal children array should be independent', 3, arrayFamily.getChildren().length);
        
        const returnedChildren = arrayFamily.getChildren();
        returnedChildren.push(5); // Modify returned array
        test('Returned children array should be independent', 3, arrayFamily.getChildren().length);
        
        // Summary
        console.log('\n=== Test Summary ===');
        console.log(`Total tests: ${testCount}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${testCount - passedTests}`);
        console.log(`Success rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
        
        if (passedTests === testCount) {
            console.log('\n🎉 All tests passed! The FamilyModel class is working correctly.');
        } else {
            console.log('\n❌ Some tests failed. Please check the implementation.');
        }
        
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Run the tests
runTests();
