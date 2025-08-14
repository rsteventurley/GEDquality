/**
 * Test file for EventModel constructor arguments
 * Tests the new constructor with optional date and place parameters
 * 
 * Run with: node DataModel/test-EventModel-constructor.js
 */

const EventModel = require('./EventModel');

console.log('=== EventModel Constructor Test Suite ===\n');

// Test 1: Default constructor (no arguments)
console.log('1. Default Constructor (no arguments):');
const emptyEvent = new EventModel();
console.log(`   isEmpty(): ${emptyEvent.isEmpty()}`);
console.log(`   toString(): "${emptyEvent.toString()}"`);
console.log(`   Place: "${emptyEvent.getPlace()}"`);
console.log(`   Date isEmpty(): ${emptyEvent.getDate().isEmpty()}`);
console.log('');

// Test 2: Constructor with date only
console.log('2. Constructor with Date Only:');
try {
    const dateOnlyEvent = new EventModel('1995-12-25');
    console.log(`   isEmpty(): ${dateOnlyEvent.isEmpty()}`);
    console.log(`   toString(): "${dateOnlyEvent.toString()}"`);
    console.log(`   Place: "${dateOnlyEvent.getPlace()}"`);
    console.log(`   Date GEDCOM: "${dateOnlyEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${dateOnlyEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 3: Constructor with place only (undefined date, place string)
console.log('3. Constructor with Place Only:');
const placeOnlyEvent = new EventModel(undefined, 'New York, NY, USA');
console.log(`   isEmpty(): ${placeOnlyEvent.isEmpty()}`);
console.log(`   toString(): "${placeOnlyEvent.toString()}"`);
console.log(`   Place: "${placeOnlyEvent.getPlace()}"`);
console.log(`   Date isEmpty(): ${placeOnlyEvent.getDate().isEmpty()}`);
console.log('');

// Test 4: Constructor with both date and place
console.log('4. Constructor with Date and Place:');
try {
    const fullEvent = new EventModel('1850-06-15', 'Boston, MA, USA');
    console.log(`   isEmpty(): ${fullEvent.isEmpty()}`);
    console.log(`   toString(): "${fullEvent.toString()}"`);
    console.log(`   Place: "${fullEvent.getPlace()}"`);
    console.log(`   Date GEDCOM: "${fullEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${fullEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 5: Constructor with approximate date and place
console.log('5. Constructor with Approximate Date and Place:');
try {
    const approxEvent = new EventModel('ABT 1850-06-15', 'Philadelphia, PA, USA');
    console.log(`   toString(): "${approxEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${approxEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${approxEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 6: Constructor with date range and place
console.log('6. Constructor with Date Range and Place:');
try {
    const rangeEvent = new EventModel('BET 1850-01-01 AND 1860-12-31', 'San Francisco, CA, USA');
    console.log(`   toString(): "${rangeEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${rangeEvent.getDateGEDCOM()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 7: Constructor with null/empty values
console.log('7. Constructor with Null/Empty Values:');
const nullEvent = new EventModel(null, null);
console.log(`   isEmpty(): ${nullEvent.isEmpty()}`);
console.log(`   toString(): "${nullEvent.toString()}"`);
console.log(`   Place: "${nullEvent.getPlace()}"`);
console.log('');

const emptyStringEvent = new EventModel('', '');
console.log(`   Empty strings - isEmpty(): ${emptyStringEvent.isEmpty()}`);
console.log(`   Empty strings - toString(): "${emptyStringEvent.toString()}"`);
console.log('');

// Test 8: Constructor error handling
console.log('8. Constructor Error Handling:');
try {
    const errorEvent = new EventModel('1300-12-25', 'Invalid Date Location'); // Invalid year
    console.log(`   Should not reach here`);
} catch (error) {
    console.log(`   Expected error: ${error.message}`);
}
console.log('');

// Test 9: Comparison with setter methods
console.log('9. Constructor vs Setter Methods:');
const constructorEvent = new EventModel('1995-12-25', 'Seattle, WA, USA');
const setterEvent = new EventModel();
setterEvent.setDate('1995-12-25');
setterEvent.setPlace('Seattle, WA, USA');

console.log(`   Constructor: "${constructorEvent.toString()}"`);
console.log(`   Setter:      "${setterEvent.toString()}"`);
console.log(`   Are equal: ${constructorEvent.toString() === setterEvent.toString()}`);
console.log('');

console.log('=== Constructor Test Suite Complete ===');
