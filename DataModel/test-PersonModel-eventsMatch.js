/**
 * Test file for PersonModel eventsMatch method
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
    console.log('=== PersonModel eventsMatch Method Tests ===\n');
    
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
        // Test 1: Two empty PersonModel instances
        console.log('\n--- Test 1: Two empty PersonModel instances ---');
        const emptyPerson1 = new PersonModel();
        const emptyPerson2 = new PersonModel();
        test('Empty persons should match', true, emptyPerson1.eventsMatch(emptyPerson2));
        
        // Test 2: Person with itself
        console.log('\n--- Test 2: Person with itself ---');
        const johnDate = new DateModel();
        johnDate.parseDateString('1850-03-15');
        const johnDoe = new PersonModel(
            new NameModel('John', 'Doe'),
            new EventModel(johnDate, 'Boston, Massachusetts')
        );
        test('Person should match with itself', true, johnDoe.eventsMatch(johnDoe));
        
        // Test 3: Two identical persons
        console.log('\n--- Test 3: Two identical persons ---');
        const johnDate2 = new DateModel();
        johnDate2.parseDateString('1850-03-15');
        const johnDoe2 = new PersonModel(
            new NameModel('John', 'Doe'),
            new EventModel(johnDate2, 'Boston, Massachusetts')
        );
        test('Identical persons should match', true, johnDoe.eventsMatch(johnDoe2));
        
        // Test 4: One person has event, other doesn't
        console.log('\n--- Test 4: One person has event, other doesn\'t ---');
        const partialPerson = new PersonModel(new NameModel('Jane', 'Smith'));
        test('One with birth, one without should not match', false, johnDoe.eventsMatch(partialPerson));
        
        // Test 5: Different birth dates
        console.log('\n--- Test 5: Different birth dates ---');
        const differentDate = new DateModel();
        differentDate.parseDateString('1851-03-15');
        const differentBirth = new PersonModel(
            new NameModel('John', 'Doe'),
            new EventModel(differentDate, 'Boston, Massachusetts')
        );
        test('Different birth dates should not match', false, johnDoe.eventsMatch(differentBirth));
        
        // Test 6: Different birth places
        console.log('\n--- Test 6: Different birth places ---');
        const sameDate = new DateModel();
        sameDate.parseDateString('1850-03-15');
        const differentPlace = new PersonModel(
            new NameModel('John', 'Doe'),
            new EventModel(sameDate, 'New York, New York')
        );
        test('Different birth places should not match', false, johnDoe.eventsMatch(differentPlace));
        
        // Test 7: Multiple events - all matching
        console.log('\n--- Test 7: Multiple events - all matching ---');
        const birthDate1 = new DateModel();
        birthDate1.parseDateString('1830-06-20');
        const deathDate1 = new DateModel();
        deathDate1.parseDateString('1920-12-05');
        const christeningDate1 = new DateModel();
        christeningDate1.parseDateString('1830-07-15');
        const burialDate1 = new DateModel();
        burialDate1.parseDateString('1920-12-08');
        
        const multiEvent1 = new PersonModel(
            new NameModel('Mary', 'Johnson'),
            new EventModel(birthDate1, 'Philadelphia, Pennsylvania'),
            new EventModel(deathDate1, 'Philadelphia, Pennsylvania'),
            new EventModel(christeningDate1, 'St. Mary\'s Church, Philadelphia'),
            new EventModel(burialDate1, 'Laurel Hill Cemetery, Philadelphia')
        );
        
        const birthDate2 = new DateModel();
        birthDate2.parseDateString('1830-06-20');
        const deathDate2 = new DateModel();
        deathDate2.parseDateString('1920-12-05');
        const christeningDate2 = new DateModel();
        christeningDate2.parseDateString('1830-07-15');
        const burialDate2 = new DateModel();
        burialDate2.parseDateString('1920-12-08');
        
        const multiEvent2 = new PersonModel(
            new NameModel('Mary', 'Johnson'),
            new EventModel(birthDate2, 'Philadelphia, Pennsylvania'),
            new EventModel(deathDate2, 'Philadelphia, Pennsylvania'),
            new EventModel(christeningDate2, 'St. Mary\'s Church, Philadelphia'),
            new EventModel(burialDate2, 'Laurel Hill Cemetery, Philadelphia')
        );
        test('All matching events should return true', true, multiEvent1.eventsMatch(multiEvent2));
        
        // Test 8: Multiple events - one different
        console.log('\n--- Test 8: Multiple events - one different ---');
        const birthDate3 = new DateModel();
        birthDate3.parseDateString('1830-06-20');
        const deathDate3 = new DateModel();
        deathDate3.parseDateString('1920-12-05');
        const christeningDate3 = new DateModel();
        christeningDate3.parseDateString('1830-07-15');
        const burialDate3 = new DateModel();
        burialDate3.parseDateString('1920-12-09');  // Different burial date
        
        const multiEvent3 = new PersonModel(
            new NameModel('Mary', 'Johnson'),
            new EventModel(birthDate3, 'Philadelphia, Pennsylvania'),
            new EventModel(deathDate3, 'Philadelphia, Pennsylvania'),
            new EventModel(christeningDate3, 'St. Mary\'s Church, Philadelphia'),
            new EventModel(burialDate3, 'Laurel Hill Cemetery, Philadelphia')
        );
        test('One different event should return false', false, multiEvent1.eventsMatch(multiEvent3));
        
        // Test 9: Partial overlap - some events missing
        console.log('\n--- Test 9: Partial overlap - some events missing ---');
        const partialBirthDate = new DateModel();
        partialBirthDate.parseDateString('1830-06-20');
        const partialChristeningDate = new DateModel();
        partialChristeningDate.parseDateString('1830-07-15');
        
        const partialOverlap = new PersonModel(
            new NameModel('Mary', 'Johnson'),
            new EventModel(partialBirthDate, 'Philadelphia, Pennsylvania'),
            new EventModel(), // Empty death
            new EventModel(partialChristeningDate, 'St. Mary\'s Church, Philadelphia'),
            new EventModel() // Empty burial
        );
        test('Some events missing should return false', false, multiEvent1.eventsMatch(partialOverlap));
        
        // Test 10: Invalid argument - null
        console.log('\n--- Test 10: Invalid argument - null ---');
        test('Null argument should return false', false, johnDoe.eventsMatch(null));
        
        // Test 11: Invalid argument - wrong type
        console.log('\n--- Test 11: Invalid argument - wrong type ---');
        test('Wrong type argument should return false', false, johnDoe.eventsMatch("not a person"));
        
        // Test 12: Both persons have only some events
        console.log('\n--- Test 12: Both persons have only some events (matching) ---');
        const someBirthDate1 = new DateModel();
        someBirthDate1.parseDateString('1875-05-10');
        const someChristeningDate1 = new DateModel();
        someChristeningDate1.parseDateString('1875-06-01');
        
        const someEvents1 = new PersonModel(
            new NameModel('Robert', 'Smith'),
            new EventModel(someBirthDate1, 'Chicago, Illinois'),
            new EventModel(), // Empty death
            new EventModel(someChristeningDate1, 'Holy Trinity Church, Chicago'),
            new EventModel() // Empty burial
        );
        
        const someBirthDate2 = new DateModel();
        someBirthDate2.parseDateString('1875-05-10');
        const someChristeningDate2 = new DateModel();
        someChristeningDate2.parseDateString('1875-06-01');
        
        const someEvents2 = new PersonModel(
            new NameModel('Robert', 'Smith'),
            new EventModel(someBirthDate2, 'Chicago, Illinois'),
            new EventModel(), // Empty death
            new EventModel(someChristeningDate2, 'Holy Trinity Church, Chicago'),
            new EventModel() // Empty burial
        );
        test('Matching subset of events should return true', true, someEvents1.eventsMatch(someEvents2));
        
        // Test 13: Approximate dates
        console.log('\n--- Test 13: Approximate dates ---');
        const approxDate1 = new DateModel();
        approxDate1.parseDateString('ABT 1840-08-12');
        const approxPerson1 = new PersonModel(
            new NameModel('Thomas', 'Wilson'),
            new EventModel(approxDate1, 'London, England')
        );
        
        const approxDate2 = new DateModel();
        approxDate2.parseDateString('ABT 1840-08-12');
        const approxPerson2 = new PersonModel(
            new NameModel('Thomas', 'Wilson'),
            new EventModel(approxDate2, 'London, England')
        );
        test('Matching approximate dates should return true', true, approxPerson1.eventsMatch(approxPerson2));
        
        // Summary
        console.log('\n=== Test Summary ===');
        console.log(`Total tests: ${testCount}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${testCount - passedTests}`);
        console.log(`Success rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
        
        if (passedTests === testCount) {
            console.log('\n🎉 All tests passed! The eventsMatch method is working correctly.');
        } else {
            console.log('\n❌ Some tests failed. Please check the implementation.');
        }
        
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Run the tests
runTests();
