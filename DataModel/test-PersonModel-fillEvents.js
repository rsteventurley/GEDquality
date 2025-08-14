/**
 * Test file for PersonModel fillEvents method
 * Tests various scenarios to ensure proper functionality
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

function runTests() {
    console.log('=== PersonModel fillEvents Method Tests ===\n');
    
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
        // Test 1: Fill birth event with exact date but no place
        console.log('\n--- Test 1: Fill birth event with exact date but no place ---');
        const exactBirthDate = new DateModel();
        exactBirthDate.parseDateString('1850-03-15');
        const birthEvent = new EventModel(exactBirthDate, ''); // No place
        const person1 = new PersonModel(new NameModel('John', 'Doe'), birthEvent);
        
        console.log('Before fillEvents:', person1.birth.toString());
        person1.fillEvents('Boston, Massachusetts');
        console.log('After fillEvents:', person1.birth.toString());
        test('Birth place should be filled', 'Boston, Massachusetts', person1.getBirthPlace());
        
        // Test 2: Don't fill birth event that already has a place
        console.log('\n--- Test 2: Don\'t fill birth event that already has a place ---');
        const birthEventWithPlace = new EventModel(exactBirthDate, 'New York, New York');
        const person2 = new PersonModel(new NameModel('Jane', 'Smith'), birthEventWithPlace);
        
        console.log('Before fillEvents:', person2.birth.toString());
        person2.fillEvents('Boston, Massachusetts');
        console.log('After fillEvents:', person2.birth.toString());
        test('Birth place should remain unchanged', 'New York, New York', person2.getBirthPlace());
        
        // Test 3: Don't fill birth event with approximate date
        console.log('\n--- Test 3: Don\'t fill birth event with approximate date ---');
        const approxBirthDate = new DateModel();
        approxBirthDate.parseDateString('ABT 1850-03-15');
        const approxBirthEvent = new EventModel(approxBirthDate, '');
        const person3 = new PersonModel(new NameModel('Mary', 'Johnson'), approxBirthEvent);
        
        console.log('Before fillEvents:', person3.birth.toString());
        console.log('Birth has exact date:', person3.birth.hasExactDate());
        person3.fillEvents('Boston, Massachusetts');
        console.log('After fillEvents:', person3.birth.toString());
        test('Approximate birth place should remain empty', '', person3.getBirthPlace());
        
        // Test 4: Fill multiple events with exact dates
        console.log('\n--- Test 4: Fill multiple events with exact dates ---');
        const exactDate1 = new DateModel();
        exactDate1.parseDateString('1830-06-20');
        const exactDate2 = new DateModel();
        exactDate2.parseDateString('1920-12-05');
        const exactDate3 = new DateModel();
        exactDate3.parseDateString('1830-07-15');
        const exactDate4 = new DateModel();
        exactDate4.parseDateString('1920-12-08');
        
        const multiPerson = new PersonModel(
            new NameModel('Robert', 'Wilson'),
            new EventModel(exactDate1, ''), // Birth - no place
            new EventModel(exactDate2, ''), // Death - no place
            new EventModel(exactDate3, ''), // Christening - no place
            new EventModel(exactDate4, '')  // Burial - no place
        );
        
        console.log('Before fillEvents:');
        console.log('  Birth:', multiPerson.birth.toString());
        console.log('  Death:', multiPerson.death.toString());
        console.log('  Christening:', multiPerson.christening.toString());
        console.log('  Burial:', multiPerson.burial.toString());
        
        multiPerson.fillEvents('Philadelphia, Pennsylvania');
        
        console.log('After fillEvents:');
        console.log('  Birth:', multiPerson.birth.toString());
        console.log('  Death:', multiPerson.death.toString());
        console.log('  Christening:', multiPerson.christening.toString());
        console.log('  Burial:', multiPerson.burial.toString());
        
        test('Birth place should be filled', 'Philadelphia, Pennsylvania', multiPerson.getBirthPlace());
        test('Death place should be filled', 'Philadelphia, Pennsylvania', multiPerson.getDeathPlace());
        test('Christening place should be filled', 'Philadelphia, Pennsylvania', multiPerson.christening.getPlace());
        test('Burial place should be filled', 'Philadelphia, Pennsylvania', multiPerson.burial.getPlace());
        
        // Test 5: Mixed events - some with places, some without
        console.log('\n--- Test 5: Mixed events - some with places, some without ---');
        const mixedPerson = new PersonModel(
            new NameModel('Elizabeth', 'Brown'),
            new EventModel(exactDate1, 'Boston, Massachusetts'), // Birth - has place
            new EventModel(exactDate2, ''), // Death - no place
            new EventModel(), // Christening - empty
            new EventModel(exactDate4, 'Green-Wood Cemetery, Brooklyn') // Burial - has place
        );
        
        console.log('Before fillEvents:');
        console.log('  Birth:', mixedPerson.birth.toString());
        console.log('  Death:', mixedPerson.death.toString());
        console.log('  Christening:', mixedPerson.christening.toString());
        console.log('  Burial:', mixedPerson.burial.toString());
        
        mixedPerson.fillEvents('New York, New York');
        
        console.log('After fillEvents:');
        console.log('  Birth:', mixedPerson.birth.toString());
        console.log('  Death:', mixedPerson.death.toString());
        console.log('  Christening:', mixedPerson.christening.toString());
        console.log('  Burial:', mixedPerson.burial.toString());
        
        test('Birth place should remain Boston', 'Boston, Massachusetts', mixedPerson.getBirthPlace());
        test('Death place should be filled with New York', 'New York, New York', mixedPerson.getDeathPlace());
        test('Christening should remain empty', '', mixedPerson.christening.getPlace());
        test('Burial place should remain Brooklyn', 'Green-Wood Cemetery, Brooklyn', mixedPerson.burial.getPlace());
        
        // Test 6: Invalid arguments
        console.log('\n--- Test 6: Invalid arguments ---');
        const testPerson = new PersonModel(
            new NameModel('Test', 'Person'),
            new EventModel(exactDate1, '')
        );
        
        const originalPlace = testPerson.getBirthPlace();
        testPerson.fillEvents(null);
        test('Null argument should not change places', originalPlace, testPerson.getBirthPlace());
        
        testPerson.fillEvents('');
        test('Empty string should not change places', originalPlace, testPerson.getBirthPlace());
        
        testPerson.fillEvents(123);
        test('Number argument should not change places', originalPlace, testPerson.getBirthPlace());
        
        // Test 7: Empty person (no events)
        console.log('\n--- Test 7: Empty person (no events) ---');
        const emptyPerson = new PersonModel();
        emptyPerson.fillEvents('Some Place');
        test('Empty person should remain empty', true, emptyPerson.isEmpty());
        
        // Test 8: Events with dates but not exact (BEF, AFT)
        console.log('\n--- Test 8: Events with non-exact dates (BEF, AFT) ---');
        const beforeDate = new DateModel();
        beforeDate.parseDateString('BEF 1850-03-15');
        const afterDate = new DateModel();
        afterDate.parseDateString('AFT 1920-12-05');
        
        const nonExactPerson = new PersonModel(
            new NameModel('Non', 'Exact'),
            new EventModel(beforeDate, ''), // Before date - no place
            new EventModel(afterDate, ''), // After date - no place
        );
        
        console.log('Before fillEvents:');
        console.log('  Birth has exact date:', nonExactPerson.birth.hasExactDate());
        console.log('  Death has exact date:', nonExactPerson.death.hasExactDate());
        
        nonExactPerson.fillEvents('Test Place');
        
        test('Before date should not be filled', '', nonExactPerson.getBirthPlace());
        test('After date should not be filled', '', nonExactPerson.getDeathPlace());
        
        // Summary
        console.log('\n=== Test Summary ===');
        console.log(`Total tests: ${testCount}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${testCount - passedTests}`);
        console.log(`Success rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
        
        if (passedTests === testCount) {
            console.log('\n🎉 All tests passed! The fillEvents method is working correctly.');
        } else {
            console.log('\n❌ Some tests failed. Please check the implementation.');
        }
        
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Run the tests
runTests();
