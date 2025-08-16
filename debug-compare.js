/**
 * Debug script to understand CompareModels matching behavior
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

// Create simple test case
const page1 = new PageModel();
const page2 = new PageModel();

const entry1 = new EntryModel('test-entry');
const entry2 = new EntryModel('test-entry');

// Person with no events/references
const mary_ged = new PersonModel(new NameModel('Mary', 'Smith'));
const marie_xml = new PersonModel(new NameModel('Marie', 'Smith'));

// Person with events
const john_ged = new PersonModel(new NameModel('John', 'Doe'));
john_ged.birth = new EventModel(new DateModel(1850, 1, 1, false, true), 'Boston');

const jon_xml = new PersonModel(new NameModel('Jon', 'Doe'));
jon_xml.birth = new EventModel(new DateModel(1850, 1, 1, false, true), 'Boston');

entry1.addPerson(1, 'mary', mary_ged);
entry1.addPerson(2, 'john', john_ged);

entry2.addPerson(10, 'marie', marie_xml);
entry2.addPerson(20, 'jon', jon_xml);

page1.addEntry(entry1);
page2.addEntry(entry2);

const comparer = new CompareModels(page1, page2);

console.log('=== Debug CompareModels ===');

// Check if Mary/Marie have events or references
console.log('Mary GEDCOM references:', mary_ged.getReferences());
console.log('Marie XML references:', marie_xml.getReferences());
console.log('Mary GEDCOM birth:', mary_ged.birth.isEmpty() ? 'empty' : mary_ged.birth.toString());
console.log('Marie XML birth:', marie_xml.birth.isEmpty() ? 'empty' : marie_xml.birth.toString());

// Test the matching function directly
const hasMatchingEvents = comparer._hasMatchingEventsOrReferences(mary_ged, marie_xml);
console.log('Mary/Marie have matching events/references:', hasMatchingEvents);

const hasMatchingEventsJohn = comparer._hasMatchingEventsOrReferences(john_ged, jon_xml);
console.log('John/Jon have matching events/references:', hasMatchingEventsJohn);

// Test name matching
console.log('Mary/Marie exact match:', mary_ged.name.exactMatch(marie_xml.name));
console.log('Mary/Marie similar match:', mary_ged.name.similarMatch(marie_xml.name));
console.log('John/Jon exact match:', john_ged.name.exactMatch(jon_xml.name));
console.log('John/Jon similar match:', john_ged.name.similarMatch(jon_xml.name));

// Run comparison
const result = comparer.comparePeople();
console.log('\n=== Results ===');
console.log('Total matches:', result.totalMatches);
console.log('Exact name matches:', result.exactNameMatches);
console.log('Event/Reference matches:', result.eventReferenceMatches);
console.log('Similar name matches:', result.similarNameMatches);

result.details[0].matches.forEach(match => {
    console.log(`${match.person1Name} <-> ${match.person2Name} [${match.matchType}]`);
});
