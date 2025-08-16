/**
 * Simple debug script to test CompareModels matching behavior
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

// Create simple test case with identical names (should not match due to ambiguity)
const page1 = new PageModel();
const page2 = new PageModel();

const entry1 = new EntryModel('test-entry');
const entry2 = new EntryModel('test-entry');

// Two people with identical names in GEDCOM
const anna1_ged = new PersonModel(new NameModel('Anna', 'Müller'));
const anna2_ged = new PersonModel(new NameModel('Anna', 'Müller'));

// Two people with identical names in XML
const anna1_xml = new PersonModel(new NameModel('Anna', 'Müller'));
const anna2_xml = new PersonModel(new NameModel('Anna', 'Müller'));

entry1.addPerson(1, 'anna1', anna1_ged);
entry1.addPerson(2, 'anna2', anna2_ged);

entry2.addPerson(10, 'anna1', anna1_xml);
entry2.addPerson(11, 'anna2', anna2_xml);

page1.addEntry(entry1);
page2.addEntry(entry2);

page1.people[1] = anna1_ged.clone();
page1.people[2] = anna2_ged.clone();
page2.people[10] = anna1_xml.clone();
page2.people[11] = anna2_xml.clone();

const comparer = new CompareModels(page1, page2);

console.log('=== Debug Test: Identical Names ===');
console.log('GEDCOM has 2 people both named "Anna Müller"');
console.log('XML has 2 people both named "Anna Müller"');
console.log('Expected: These should NOT match due to ambiguity');

const result = comparer.comparePeople();

console.log('\nResults:');
console.log('Total matches:', result.totalMatches);
console.log('Exact name matches:', result.exactNameMatches);
console.log('Event/Reference matches:', result.eventReferenceMatches);
console.log('Unmatched in GEDCOM:', result.unmatchedInFirst);
console.log('Unmatched in XML:', result.unmatchedInSecond);

if (result.details.length > 0) {
    console.log('\nDetailed matches:');
    result.details[0].matches.forEach(match => {
        console.log(`${match.person1Name} (${match.person1Id}) <-> ${match.person2Name} (${match.person2Id}) [${match.matchType}]`);
    });
    
    console.log('\nUnmatched in GEDCOM:');
    result.details[0].unmatchedInFirst.forEach(person => {
        console.log(`${person.name} (ID: ${person.id})`);
    });
    
    console.log('\nUnmatched in XML:');
    result.details[0].unmatchedInSecond.forEach(person => {
        console.log(`${person.name} (ID: ${person.id})`);
    });
}

// Test the _hasMatchingEventsOrReferences method directly
console.log('\n=== Direct Method Test ===');
const hasMatchingEvents = comparer._hasMatchingEventsOrReferences(anna1_ged, anna1_xml);
console.log('Anna1 GEDCOM and Anna1 XML have matching events/references:', hasMatchingEvents);

console.log('Anna1 GEDCOM references:', anna1_ged.getReferences());
console.log('Anna1 XML references:', anna1_xml.getReferences());
console.log('Anna1 GEDCOM birth empty?', anna1_ged.birth.isEmpty());
console.log('Anna1 XML birth empty?', anna1_xml.birth.isEmpty());
