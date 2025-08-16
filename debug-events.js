/**
 * Debug the _eventsMatch method specifically
 */

const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

const anna1 = new PersonModel(new NameModel('Anna', 'Müller'));
const anna2 = new PersonModel(new NameModel('Anna', 'Müller'));

console.log('=== Debug _eventsMatch ===');
console.log('Anna1 birth:', anna1.birth);
console.log('Anna2 birth:', anna2.birth);
console.log('Anna1 birth isEmpty:', anna1.birth.isEmpty());
console.log('Anna2 birth isEmpty:', anna2.birth.isEmpty());
console.log('Anna1 birth toString:', anna1.birth.toString());
console.log('Anna2 birth toString:', anna2.birth.toString());

// Access the _eventsMatch method through a CompareModels instance
const comparer = new CompareModels();
const result = comparer._eventsMatch(anna1.birth, anna2.birth);
console.log('_eventsMatch result:', result);

// Manual check of the logic
const date1Str = anna1.birth.date ? anna1.birth.date.toString() : '';
const date2Str = anna2.birth.date ? anna2.birth.date.toString() : '';
const place1 = anna1.birth.place || '';
const place2 = anna2.birth.place || '';

console.log('date1Str:', `"${date1Str}"`);
console.log('date2Str:', `"${date2Str}"`);
console.log('place1:', `"${place1}"`);
console.log('place2:', `"${place2}"`);

const condition1 = (date1Str !== '' && date1Str === date2Str);
const condition2 = (place1 !== '' && place1 === place2);

console.log('Condition 1 (dates):', condition1);
console.log('Condition 2 (places):', condition2);
console.log('Overall result:', condition1 || condition2);
