/**
 * Test file for EventModel constructor with DateModel argument
 * Tests the updated constructor that accepts DateModel instead of string
 * 
 * Run with: node DataModel/test-EventModel-datemodel.js
 */

const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

console.log('=== EventModel DateModel Constructor Test Suite ===\n');

// Test 1: Default constructor (no arguments)
console.log('1. Default Constructor (no arguments):');
const emptyEvent = new EventModel();
console.log(`   isEmpty(): ${emptyEvent.isEmpty()}`);
console.log(`   toString(): "${emptyEvent.toString()}"`);
console.log(`   Place: "${emptyEvent.getPlace()}"`);
console.log(`   Date isEmpty(): ${emptyEvent.getDate().isEmpty()}`);
console.log('');

// Test 2: Constructor with DateModel only
console.log('2. Constructor with DateModel Only:');
try {
    const date = new DateModel();
    date.parseDateString('1995-12-25');
    const dateOnlyEvent = new EventModel(date);
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

// Test 3: Constructor with place only (undefined DateModel, place string)
console.log('3. Constructor with Place Only:');
const placeOnlyEvent = new EventModel(undefined, 'New York, NY, USA');
console.log(`   isEmpty(): ${placeOnlyEvent.isEmpty()}`);
console.log(`   toString(): "${placeOnlyEvent.toString()}"`);
console.log(`   Place: "${placeOnlyEvent.getPlace()}"`);
console.log(`   Date isEmpty(): ${placeOnlyEvent.getDate().isEmpty()}`);
console.log('');

// Test 4: Constructor with both DateModel and place
console.log('4. Constructor with DateModel and Place:');
try {
    const date = new DateModel();
    date.parseDateString('1850-06-15');
    const fullEvent = new EventModel(date, 'Boston, MA, USA');
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

// Test 5: Constructor with approximate DateModel and place
console.log('5. Constructor with Approximate DateModel and Place:');
try {
    const approxDate = new DateModel();
    approxDate.parseDateString('ABT 1850-06-15');
    const approxEvent = new EventModel(approxDate, 'Philadelphia, PA, USA');
    console.log(`   toString(): "${approxEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${approxEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${approxEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 6: Constructor with date range DateModel and place
console.log('6. Constructor with Date Range DateModel and Place:');
try {
    const rangeDate = new DateModel();
    rangeDate.parseDateString('BET 1850-01-01 AND 1860-12-31');
    const rangeEvent = new EventModel(rangeDate, 'San Francisco, CA, USA');
    console.log(`   toString(): "${rangeEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${rangeEvent.getDateGEDCOM()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 7: Test DateModel cloning (independence)
console.log('7. DateModel Cloning Test:');
try {
    const originalDate = new DateModel();
    originalDate.parseDateString('1995-12-25');
    const event = new EventModel(originalDate, 'Seattle, WA, USA');
    
    console.log(`   Original Date: "${originalDate.toString()}"`);
    console.log(`   Event Date: "${event.getDate().toString()}"`);
    console.log(`   Are they the same object? ${originalDate === event.getDate()}`);
    
    // Modify original date to test independence
    originalDate.parseDateString('2000-01-01');
    console.log(`   After modifying original date:`);
    console.log(`   Original Date: "${originalDate.toString()}"`);
    console.log(`   Event Date: "${event.getDate().toString()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 8: Constructor with null/empty DateModel
console.log('8. Constructor with Null DateModel:');
const nullEvent = new EventModel(null, 'Some Place');
console.log(`   isEmpty(): ${nullEvent.isEmpty()}`);
console.log(`   toString(): "${nullEvent.toString()}"`);
console.log(`   Place: "${nullEvent.getPlace()}"`);
console.log(`   Date isEmpty(): ${nullEvent.getDate().isEmpty()}`);
console.log('');

// Test 9: Comparison with original string-based approach
console.log('9. Comparison with Setter Methods:');
try {
    // Create using DateModel constructor
    const constructorDate = new DateModel();
    constructorDate.parseDateString('1995-12-25');
    const constructorEvent = new EventModel(constructorDate, 'Seattle, WA, USA');
    
    // Create using setter methods
    const setterEvent = new EventModel();
    setterEvent.setDate('1995-12-25');
    setterEvent.setPlace('Seattle, WA, USA');

    console.log(`   Constructor: "${constructorEvent.toString()}"`);
    console.log(`   Setter:      "${setterEvent.toString()}"`);
    console.log(`   Are equal: ${constructorEvent.toString() === setterEvent.toString()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 10: Clone method compatibility
console.log('10. Clone Method Test:');
try {
    const originalDate = new DateModel();
    originalDate.parseDateString('1850-06-15');
    const originalEvent = new EventModel(originalDate, 'Boston, MA, USA');
    const clonedEvent = originalEvent.clone();
    
    console.log(`   Original: "${originalEvent.toString()}"`);
    console.log(`   Cloned: "${clonedEvent.toString()}"`);
    console.log(`   Are they equal? ${originalEvent.toString() === clonedEvent.toString()}`);
    console.log(`   Are they same object? ${originalEvent === clonedEvent}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

console.log('=== DateModel Constructor Test Suite Complete ===');
