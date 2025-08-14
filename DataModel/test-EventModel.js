/**
 * Test file for EventModel
 * Demonstrates various EventModel functionality
 * 
 * Run with: node DataModel/test-EventModel.js
 */

const EventModel = require('./EventModel');

console.log('=== EventModel Test Suite ===\n');

// Test 1: Empty EventModel
console.log('1. Empty EventModel Tests:');
const emptyEvent = new EventModel();
console.log(`   isEmpty(): ${emptyEvent.isEmpty()}`);
console.log(`   isValid(): ${emptyEvent.isValid()}`);
console.log(`   toString(): "${emptyEvent.toString()}"`);
console.log(`   Date isEmpty(): ${emptyEvent.getDate().isEmpty()}`);
console.log(`   Place: "${emptyEvent.getPlace()}"`);
console.log('');

// Test 2: Event with date only
console.log('2. Event with Date Only:');
try {
    const dateOnlyEvent = new EventModel();
    dateOnlyEvent.setDate('1995-12-25');
    console.log(`   isEmpty(): ${dateOnlyEvent.isEmpty()}`);
    console.log(`   isValid(): ${dateOnlyEvent.isValid()}`);
    console.log(`   toString(): "${dateOnlyEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${dateOnlyEvent.getDateGEDCOM()}"`);
    console.log(`   Date ISO: "${dateOnlyEvent.getDateISO()}"`);
    console.log(`   Has exact date: ${dateOnlyEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 3: Event with place only
console.log('3. Event with Place Only:');
const placeOnlyEvent = new EventModel();
placeOnlyEvent.setPlace('New York, NY, USA');
console.log(`   isEmpty(): ${placeOnlyEvent.isEmpty()}`);
console.log(`   isValid(): ${placeOnlyEvent.isValid()}`);
console.log(`   toString(): "${placeOnlyEvent.toString()}"`);
console.log(`   Place: "${placeOnlyEvent.getPlace()}"`);
console.log('');

// Test 4: Event with both date and place
console.log('4. Event with Date and Place:');
try {
    const fullEvent = new EventModel();
    fullEvent.setDate('1850-06-15');
    fullEvent.setPlace('Boston, MA, USA');
    console.log(`   isEmpty(): ${fullEvent.isEmpty()}`);
    console.log(`   isValid(): ${fullEvent.isValid()}`);
    console.log(`   toString(): "${fullEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${fullEvent.getDateGEDCOM()}"`);
    console.log(`   Place: "${fullEvent.getPlace()}"`);
    console.log(`   Has exact date: ${fullEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 5: Event with approximate date
console.log('5. Event with Approximate Date:');
try {
    const approxEvent = new EventModel();
    approxEvent.setDate('ABT 1850-06-15');
    approxEvent.setPlace('Philadelphia, PA, USA');
    console.log(`   isEmpty(): ${approxEvent.isEmpty()}`);
    console.log(`   isValid(): ${approxEvent.isValid()}`);
    console.log(`   toString(): "${approxEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${approxEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${approxEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 6: Event with before date
console.log('6. Event with Before Date:');
try {
    const beforeEvent = new EventModel();
    beforeEvent.setDate('BEF 1900-12-31');
    beforeEvent.setPlace('Chicago, IL, USA');
    console.log(`   toString(): "${beforeEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${beforeEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${beforeEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 7: Event with date range
console.log('7. Event with Date Range:');
try {
    const rangeEvent = new EventModel();
    rangeEvent.setDate('BET 1850-01-01 AND 1860-12-31');
    rangeEvent.setPlace('San Francisco, CA, USA');
    console.log(`   toString(): "${rangeEvent.toString()}"`);
    console.log(`   Date GEDCOM: "${rangeEvent.getDateGEDCOM()}"`);
    console.log(`   Has exact date: ${rangeEvent.hasExactDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 8: Clone test
console.log('8. Clone Test:');
try {
    const originalEvent = new EventModel();
    originalEvent.setDate('1995-12-25');
    originalEvent.setPlace('Seattle, WA, USA');
    
    const clonedEvent = originalEvent.clone();
    
    console.log(`   Original: "${originalEvent.toString()}"`);
    console.log(`   Cloned: "${clonedEvent.toString()}"`);
    console.log(`   Are they the same object? ${originalEvent === clonedEvent}`);
    console.log(`   Are dates the same object? ${originalEvent.getDate() === clonedEvent.getDate()}`);
    
    // Modify clone to test independence
    clonedEvent.setPlace('Portland, OR, USA');
    console.log(`   After modifying clone place:`);
    console.log(`   Original: "${originalEvent.toString()}"`);
    console.log(`   Cloned: "${clonedEvent.toString()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 9: Error handling
console.log('9. Error Handling:');
try {
    const errorEvent = new EventModel();
    errorEvent.setDate('1300-12-25'); // Invalid year
    console.log(`   Should not reach here`);
} catch (error) {
    console.log(`   Expected error: ${error.message}`);
}
console.log('');

// Test 10: Setting null/empty place
console.log('10. Setting Null/Empty Place:');
const nullPlaceEvent = new EventModel();
nullPlaceEvent.setPlace(null);
console.log(`   Place after setting null: "${nullPlaceEvent.getPlace()}"`);
nullPlaceEvent.setPlace(undefined);
console.log(`   Place after setting undefined: "${nullPlaceEvent.getPlace()}"`);
nullPlaceEvent.setPlace('');
console.log(`   Place after setting empty string: "${nullPlaceEvent.getPlace()}"`);

// Test 11: Place translation
console.log('11. Place Translation:');
const germanEvent = new EventModel();
germanEvent.setPlace('Munich, Deutschland');
console.log(`   Original place: "${germanEvent.getPlace()}"`);
console.log(`   Translated place: "${germanEvent.translatePlace()}"`);

console.log('\n=== Test Suite Complete ===');
