/**
 * Debug accuracy calculation for Hans Schneider matches
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

// Create simple test case with Hans Schneider
const page1 = new PageModel();
const page2 = new PageModel();

const entry1 = new EntryModel('test-entry');
const entry2 = new EntryModel('test-entry');

const hans1_ged = new PersonModel(new NameModel('Hans', 'Schneider'));
hans1_ged.birth = new EventModel(new DateModel(1850, 5, 12, false, true), 'Heidelberg');

const hans1_xml = new PersonModel(new NameModel('Hans', 'Schneider'));
hans1_xml.birth = new EventModel(new DateModel(1850, 5, 12, false, true), 'Heidelberg');

entry1.addPerson(110, 'hans1', hans1_ged);
entry2.addPerson(120, 'hans1', hans1_xml);

page1.addEntry(entry1);
page2.addEntry(entry2);

// IMPORTANT: Add to people dictionary
page1.people[110] = hans1_ged.clone();
page2.people[120] = hans1_xml.clone();

const comparer = new CompareModels(page1, page2);
const result = comparer.comparePeople();

console.log('=== Debug Hans Schneider Accuracy ===');
console.log('Total matches:', result.totalMatches);
console.log('Accurate matches:', result.accurateMatches);
console.log('Inaccurate matches:', result.inaccurateMatches);

if (result.details.length > 0) {
    result.details[0].matches.forEach(match => {
        const person1 = page1.people[match.person1Id];
        const person2 = page2.people[match.person2Id];
        
        console.log(`\nMatch: ${match.person1Name} <-> ${match.person2Name}`);
        console.log('Person1 exists in people dict:', !!person1);
        console.log('Person2 exists in people dict:', !!person2);
        
        if (person1 && person2) {
            console.log('Person1 name:', person1.name.toString());
            console.log('Person2 name:', person2.name.toString());
            console.log('Exact match:', person1.name.exactMatch(person2.name));
        }
    });
}
