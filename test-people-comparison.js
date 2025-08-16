/**
 * Test file for CompareModels people comparison functionality
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const FamilyModel = require('./DataModel/FamilyModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

console.log('=== Testing CompareModels People Comparison ===\n');

// Create first PageModel (GEDCOM simulation)
const gedPageModel = new PageModel();
gedPageModel.location = 'Chicago_Illinois';

// Create an entry with people
const entry1_ged = new EntryModel('entry-001');

// Add people to first entry
const person1_ged = new PersonModel(new NameModel('John', 'Smith'));
person1_ged.birth = new EventModel(new DateModel(1850, 3, 15, false, true), 'New York');
person1_ged.references = ['@REF1@'];

const person2_ged = new PersonModel(new NameModel('Mary', 'Johnson'));
person2_ged.birth = new EventModel(new DateModel(1855, 7, 20, false, true), 'Boston');

const person3_ged = new PersonModel(new NameModel('Robert', 'Smith'));

entry1_ged.addPerson(1, 'person1', person1_ged);
entry1_ged.addPerson(2, 'person2', person2_ged);
entry1_ged.addPerson(3, 'person3', person3_ged);

// Add family relationships
const family1_ged = new FamilyModel();
family1_ged.setHusband(1); // John Smith
family1_ged.setWife(2);    // Mary Johnson
family1_ged.addChild(3);   // Robert Smith

entry1_ged.addFamily(1, family1_ged);

gedPageModel.addEntry(entry1_ged);
gedPageModel.people[1] = person1_ged.clone();
gedPageModel.people[2] = person2_ged.clone();
gedPageModel.people[3] = person3_ged.clone();

// Create second PageModel (XML simulation)
const xmlPageModel = new PageModel();
xmlPageModel.location = 'Chicago_Illinois';

// Create corresponding entry with some variations
const entry1_xml = new EntryModel('entry-001');

// Same person with exact name match
const person1_xml = new PersonModel(new NameModel('John', 'Smith'));
person1_xml.birth = new EventModel(new DateModel(1850, 3, 15, false, true), 'New York'); // Same birth event

// Similar name (Mary vs Marie) 
const person2_xml = new PersonModel(new NameModel('Marie', 'Johnson'));
person2_xml.birth = new EventModel(new DateModel(1855, 7, 20, false, true), 'Boston'); // Same birth event

// Similar name with phonetic matching (Robert vs Roberto)
const person3_xml = new PersonModel(new NameModel('Roberto', 'Smith'));

// Person with same reference
const person4_xml = new PersonModel(new NameModel('William', 'Brown'));
person4_xml.references = ['@REF1@']; // Same reference as person1_ged

entry1_xml.addPerson(10, 'person10', person1_xml);
entry1_xml.addPerson(11, 'person11', person2_xml);
entry1_xml.addPerson(12, 'person12', person3_xml);
entry1_xml.addPerson(13, 'person13', person4_xml);

// Add family relationships
const family1_xml = new FamilyModel();
family1_xml.setHusband(10); // John Smith
family1_xml.setWife(11);    // Marie Johnson  
family1_xml.addChild(12);   // Roberto Smith

entry1_xml.addFamily(1, family1_xml);

xmlPageModel.addEntry(entry1_xml);
xmlPageModel.people[10] = person1_xml.clone();
xmlPageModel.people[11] = person2_xml.clone();
xmlPageModel.people[12] = person3_xml.clone();
xmlPageModel.people[13] = person4_xml.clone();

// Create CompareModels object and test people comparison
console.log('Creating CompareModels object...');
const comparer = new CompareModels(gedPageModel, xmlPageModel);

console.log('\n=== Testing comparePeople method ===');
const peopleComparison = comparer.comparePeople();

console.log('People Comparison Results:');
console.log(`Entries compared: ${peopleComparison.entriesCompared}`);
console.log(`Total matches: ${peopleComparison.totalMatches}`);
console.log(`Exact name matches: ${peopleComparison.exactNameMatches}`);
console.log(`Event/Reference matches: ${peopleComparison.eventReferenceMatches}`);
console.log(`Relationship similar matches: ${peopleComparison.relationshipSimilarMatches}`);
console.log(`Similar name matches: ${peopleComparison.similarNameMatches}`);
console.log(`Unmatched in first: ${peopleComparison.unmatchedInFirst}`);
console.log(`Unmatched in second: ${peopleComparison.unmatchedInSecond}`);

console.log('\n=== Detailed Entry Results ===');
peopleComparison.details.forEach(detail => {
    console.log(`\nEntry: ${detail.entryId}`);
    console.log(`  People in first: ${detail.people1Count}, in second: ${detail.people2Count}`);
    console.log('  Matches:');
    detail.matches.forEach(match => {
        console.log(`    ${match.person1Name} (${match.person1Id}) <-> ${match.person2Name} (${match.person2Id}) [${match.matchType}]`);
    });
    
    if (detail.unmatchedInFirst.length > 0) {
        console.log('  Unmatched in first:');
        detail.unmatchedInFirst.forEach(person => {
            console.log(`    ${person.name} (${person.id})`);
        });
    }
    
    if (detail.unmatchedInSecond.length > 0) {
        console.log('  Unmatched in second:');
        detail.unmatchedInSecond.forEach(person => {
            console.log(`    ${person.name} (${person.id})`);
        });
    }
});

console.log('\n✅ CompareModels people comparison tests completed!');
