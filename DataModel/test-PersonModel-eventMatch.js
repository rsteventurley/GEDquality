/**
 * Test file for PersonModel eventMatch method
 * Tests the event matching functionality between two PersonModel instances
 * 
 * Run with: node DataModel/test-PersonModel-eventMatch.js
 */

const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

console.log('=== PersonModel eventMatch Test Suite ===\n');

// Helper function to create a person with specific events
function createPersonWithEvents(name, birthInfo, deathInfo, christeningInfo, burialInfo) {
    const personName = name ? new NameModel(name.given, name.surname) : undefined;
    
    let birth, death, christening, burial;
    
    if (birthInfo) {
        const birthDate = new DateModel();
        birthDate.parseDateString(birthInfo.date);
        birth = new EventModel(birthDate, birthInfo.place);
    }
    
    if (deathInfo) {
        const deathDate = new DateModel();
        deathDate.parseDateString(deathInfo.date);
        death = new EventModel(deathDate, deathInfo.place);
    }
    
    if (christeningInfo) {
        const christeningDate = new DateModel();
        christeningDate.parseDateString(christeningInfo.date);
        christening = new EventModel(christeningDate, christeningInfo.place);
    }
    
    if (burialInfo) {
        const burialDate = new DateModel();
        burialDate.parseDateString(burialInfo.date);
        burial = new EventModel(burialDate, burialInfo.place);
    }
    
    return new PersonModel(personName, birth, death, christening, burial);
}

// Test 1: Empty persons - no matches
console.log('1. Empty Persons Test:');
const emptyPerson1 = new PersonModel();
const emptyPerson2 = new PersonModel();
console.log(`   Empty vs Empty: ${emptyPerson1.eventMatch(emptyPerson2)}`);
console.log('');

// Test 2: Identical birth events
console.log('2. Identical Birth Events:');
try {
    const person1 = createPersonWithEvents(
        { given: 'John', surname: 'Smith' },
        { date: '1850-06-15', place: 'Boston, MA, USA' }
    );
    
    const person2 = createPersonWithEvents(
        { given: 'John', surname: 'Doe' }, // Different name
        { date: '1850-06-15', place: 'Boston, MA, USA' } // Same birth
    );
    
    console.log(`   Person 1 birth: "${person1.getBirth().toString()}"`);
    console.log(`   Person 2 birth: "${person2.getBirth().toString()}"`);
    console.log(`   Birth events match: ${person1.eventMatch(person2)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 3: Different birth events
console.log('3. Different Birth Events:');
try {
    const person3 = createPersonWithEvents(
        { given: 'Mary', surname: 'Johnson' },
        { date: '1850-06-15', place: 'Boston, MA, USA' }
    );
    
    const person4 = createPersonWithEvents(
        { given: 'Mary', surname: 'Johnson' },
        { date: '1851-06-15', place: 'Boston, MA, USA' } // Different date
    );
    
    console.log(`   Person 3 birth: "${person3.getBirth().toString()}"`);
    console.log(`   Person 4 birth: "${person4.getBirth().toString()}"`);
    console.log(`   Birth events match: ${person3.eventMatch(person4)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 4: Matching death events
console.log('4. Matching Death Events:');
try {
    const person5 = createPersonWithEvents(
        { given: 'Hans', surname: 'Mueller' },
        { date: '1820-01-01', place: 'Berlin, Deutschland' },
        { date: '1885-12-31', place: 'Munich, Deutschland' }
    );
    
    const person6 = createPersonWithEvents(
        { given: 'Johann', surname: 'Schmidt' }, // Different name
        { date: '1821-01-01', place: 'Hamburg, Deutschland' }, // Different birth
        { date: '1885-12-31', place: 'Munich, Deutschland' } // Same death
    );
    
    console.log(`   Person 5 death: "${person5.getDeath().toString()}"`);
    console.log(`   Person 6 death: "${person6.getDeath().toString()}"`);
    console.log(`   Death events match: ${person5.eventMatch(person6)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 5: Matching christening events
console.log('5. Matching Christening Events:');
try {
    const person7 = createPersonWithEvents(
        { given: 'Anna', surname: 'Weber' },
        { date: '1830-05-01', place: 'Vienna, Österreich' },
        null, // No death
        { date: '1830-05-15', place: 'St. Stephen Cathedral, Vienna' }
    );
    
    const person8 = createPersonWithEvents(
        { given: 'Maria', surname: 'Fischer' },
        { date: '1831-05-01', place: 'Salzburg, Österreich' }, // Different birth
        null, // No death
        { date: '1830-05-15', place: 'St. Stephen Cathedral, Vienna' } // Same christening
    );
    
    console.log(`   Person 7 christening: "${person7.getChristening().toString()}"`);
    console.log(`   Person 8 christening: "${person8.getChristening().toString()}"`);
    console.log(`   Christening events match: ${person7.eventMatch(person8)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 6: Matching burial events
console.log('6. Matching Burial Events:');
try {
    const person9 = createPersonWithEvents(
        { given: 'Wilhelm', surname: 'Bauer' },
        null, // No birth
        { date: '1900-01-01', place: 'Frankfurt, Deutschland' },
        null, // No christening
        { date: '1900-01-05', place: 'Frankfurt Cemetery, Deutschland' }
    );
    
    const person10 = createPersonWithEvents(
        { given: 'Friedrich', surname: 'Klein' },
        { date: '1820-01-01', place: 'Berlin, Deutschland' }, // Different birth
        { date: '1899-12-31', place: 'Berlin, Deutschland' }, // Different death
        null, // No christening
        { date: '1900-01-05', place: 'Frankfurt Cemetery, Deutschland' } // Same burial
    );
    
    console.log(`   Person 9 burial: "${person9.getBurial().toString()}"`);
    console.log(`   Person 10 burial: "${person10.getBurial().toString()}"`);
    console.log(`   Burial events match: ${person9.eventMatch(person10)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 7: Multiple matching events
console.log('7. Multiple Matching Events:');
try {
    const person11 = createPersonWithEvents(
        { given: 'Elisabeth', surname: 'Zimmermann' },
        { date: '1840-03-15', place: 'Bern, Schweiz' },
        { date: '1920-09-22', place: 'Zurich, Schweiz' },
        { date: '1840-04-01', place: 'Bern Church, Schweiz' },
        { date: '1920-09-25', place: 'Zurich Cemetery, Schweiz' }
    );
    
    const person12 = createPersonWithEvents(
        { given: 'Elisabeth', surname: 'Zimmermann' },
        { date: '1840-03-15', place: 'Bern, Schweiz' }, // Same birth
        { date: '1920-09-22', place: 'Zurich, Schweiz' }, // Same death
        { date: '1840-04-01', place: 'Bern Church, Schweiz' }, // Same christening
        { date: '1920-09-25', place: 'Zurich Cemetery, Schweiz' } // Same burial
    );
    
    console.log(`   Person 11: "${person11.getLifeSummary()}"`);
    console.log(`   Person 12: "${person12.getLifeSummary()}"`);
    console.log(`   Events match: ${person11.eventMatch(person12)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 8: No matching events
console.log('8. No Matching Events:');
try {
    const person13 = createPersonWithEvents(
        { given: 'Robert', surname: 'Wilson' },
        { date: '1850-01-01', place: 'London, England' },
        { date: '1920-01-01', place: 'London, England' }
    );
    
    const person14 = createPersonWithEvents(
        { given: 'Robert', surname: 'Wilson' },
        { date: '1851-01-01', place: 'Manchester, England' }, // Different birth
        { date: '1921-01-01', place: 'Manchester, England' } // Different death
    );
    
    console.log(`   Person 13 birth: "${person13.getBirth().toString()}"`);
    console.log(`   Person 13 death: "${person13.getDeath().toString()}"`);
    console.log(`   Person 14 birth: "${person14.getBirth().toString()}"`);
    console.log(`   Person 14 death: "${person14.getDeath().toString()}"`);
    console.log(`   Events match: ${person13.eventMatch(person14)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 9: One person with events, other empty
console.log('9. One Person with Events, Other Empty:');
try {
    const person15 = createPersonWithEvents(
        { given: 'Alice', surname: 'Brown' },
        { date: '1860-05-20', place: 'Paris, Frankreich' }
    );
    
    const person16 = new PersonModel();
    
    console.log(`   Person 15: "${person15.toString()}"`);
    console.log(`   Person 16: "${person16.toString()}"`);
    console.log(`   Events match: ${person15.eventMatch(person16)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 10: Error handling - invalid arguments
console.log('10. Error Handling:');
const person17 = createPersonWithEvents(
    { given: 'Test', surname: 'Person' },
    { date: '1850-01-01', place: 'Test Place' }
);

console.log(`   Match with null: ${person17.eventMatch(null)}`);
console.log(`   Match with undefined: ${person17.eventMatch(undefined)}`);
console.log(`   Match with string: ${person17.eventMatch('not a person')}`);
console.log(`   Match with number: ${person17.eventMatch(123)}`);
console.log('');

// Test 11: Approximate dates matching
console.log('11. Approximate Dates:');
try {
    const person18 = createPersonWithEvents(
        { given: 'Johann', surname: 'Bach' },
        { date: 'ABT 1685-03-31', place: 'Eisenach, Deutschland' }
    );
    
    const person19 = createPersonWithEvents(
        { given: 'Sebastian', surname: 'Bach' },
        { date: 'ABT 1685-03-31', place: 'Eisenach, Deutschland' } // Same approximate birth
    );
    
    console.log(`   Person 18 birth: "${person18.getBirth().toString()}"`);
    console.log(`   Person 19 birth: "${person19.getBirth().toString()}"`);
    console.log(`   Approximate births match: ${person18.eventMatch(person19)}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

console.log('=== PersonModel eventMatch Test Suite Complete ===');
