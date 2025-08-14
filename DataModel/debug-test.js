/**
 * Debug test to check what's happening with the toString output
 */

const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

// Create test persons to debug
const date1 = new DateModel();
date1.parseDateString('1850-03-15');

const date2 = new DateModel();
date2.parseDateString('1851-03-15');

const johnDoe = new PersonModel(
    new NameModel('John', 'Doe'),
    new EventModel(date1, 'Boston, Massachusetts')
);

const differentBirth = new PersonModel(
    new NameModel('John', 'Doe'),
    new EventModel(date2, 'Boston, Massachusetts')
);

console.log('John Doe birth event toString():', johnDoe.birth.toString());
console.log('Different birth event toString():', differentBirth.birth.toString());
console.log('Are they equal?', johnDoe.birth.toString() === differentBirth.birth.toString());
console.log('eventsMatch result:', johnDoe.eventsMatch(differentBirth));
