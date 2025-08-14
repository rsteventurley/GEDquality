/**
 * Test file for EventModel translatePlace method
 * Tests the German to English place name translation functionality
 * 
 * Run with: node DataModel/test-EventModel-translate.js
 */

const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

console.log('=== EventModel translatePlace Test Suite ===\n');

// Test 1: Basic translations
console.log('1. Basic Country Translations:');

const testCases = [
    'Berlin, Deutschland',
    'Zürich, Schweiz',
    'Paris, Frankreich',
    'Vienna, Österreich',
    'München, Deutschland',
    'Geneva, Schweiz',
    'Lyon, Frankreich',
    'Salzburg, Österreich'
];

testCases.forEach((place, index) => {
    const event = new EventModel(undefined, place);
    console.log(`   ${index + 1}. "${place}" -> "${event.translatePlace()}"`);
});
console.log('');

// Test 2: Multiple countries in one place string
console.log('2. Multiple Countries in One Place:');
const multiCountryEvent = new EventModel(undefined, 'Born in Deutschland, moved to Schweiz, visited Frankreich');
console.log(`   Original: "${multiCountryEvent.getPlace()}"`);
console.log(`   Translated: "${multiCountryEvent.translatePlace()}"`);
console.log('');

// Test 3: No translation needed
console.log('3. Places with No Translation Needed:');
const noTranslationCases = [
    'London, England',
    'New York, USA',
    'Rome, Italy',
    'Stockholm, Sweden',
    ''
];

noTranslationCases.forEach((place, index) => {
    const event = new EventModel(undefined, place);
    console.log(`   ${index + 1}. "${place}" -> "${event.translatePlace()}"`);
});
console.log('');

// Test 4: Mixed case and partial matches
console.log('4. Case Sensitivity and Partial Matches:');
const mixedCases = [
    'deutschland',  // lowercase
    'SCHWEIZ',      // uppercase
    'Deutschlandstraße',  // partial match
    'New Deutschland',    // partial match
    'Schweizer Käse'      // partial match
];

mixedCases.forEach((place, index) => {
    const event = new EventModel(undefined, place);
    console.log(`   ${index + 1}. "${place}" -> "${event.translatePlace()}"`);
});
console.log('');

// Test 5: Full event with date and translated place
console.log('5. Full Event with Translation:');
try {
    const date = new DateModel();
    date.parseDateString('1850-06-15');
    const fullEvent = new EventModel(date, 'Munich, Deutschland');
    
    console.log(`   Original event: "${fullEvent.toString()}"`);
    console.log(`   Original place: "${fullEvent.getPlace()}"`);
    console.log(`   Translated place: "${fullEvent.translatePlace()}"`);
    console.log(`   Date remains: "${fullEvent.getDateGEDCOM()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 6: Complex place strings with multiple elements
console.log('6. Complex Place Strings:');
const complexPlaces = [
    'Stuttgart, Baden-Württemberg, Deutschland',
    'Bern, Canton Bern, Schweiz',
    'Strasbourg, Alsace, Frankreich',
    'Innsbruck, Tirol, Österreich',
    'Hamburg, Deutschland; Paris, Frankreich'
];

complexPlaces.forEach((place, index) => {
    const event = new EventModel(undefined, place);
    console.log(`   ${index + 1}. Original: "${place}"`);
    console.log(`      Translated: "${event.translatePlace()}"`);
});
console.log('');

// Test 7: Empty and null place handling
console.log('7. Empty and Null Place Handling:');
const emptyEvent = new EventModel();
console.log(`   Empty event place: "${emptyEvent.translatePlace()}"`);

const nullPlaceEvent = new EventModel(undefined, null);
console.log(`   Null place: "${nullPlaceEvent.translatePlace()}"`);
console.log('');

// Test 8: Repeated country names
console.log('8. Repeated Country Names:');
const repeatedEvent = new EventModel(undefined, 'Deutschland, Deutschland, Deutschland');
console.log(`   Original: "${repeatedEvent.getPlace()}"`);
console.log(`   Translated: "${repeatedEvent.translatePlace()}"`);
console.log('');

// Test 9: All countries in one string
console.log('9. All Countries in One String:');
const allCountriesEvent = new EventModel(undefined, 'Traveled from Deutschland to Schweiz, then Frankreich, and finally Österreich');
console.log(`   Original: "${allCountriesEvent.getPlace()}"`);
console.log(`   Translated: "${allCountriesEvent.translatePlace()}"`);
console.log('');

// Test 10: Verify original place is unchanged
console.log('10. Original Place Unchanged:');
const unchangedEvent = new EventModel(undefined, 'Berlin, Deutschland');
const originalPlace = unchangedEvent.getPlace();
const translatedPlace = unchangedEvent.translatePlace();
const afterPlace = unchangedEvent.getPlace();

console.log(`   Before translation: "${originalPlace}"`);
console.log(`   Translated result: "${translatedPlace}"`);
console.log(`   After translation: "${afterPlace}"`);
console.log(`   Original unchanged: ${originalPlace === afterPlace}`);
console.log('');

console.log('=== translatePlace Test Suite Complete ===');
