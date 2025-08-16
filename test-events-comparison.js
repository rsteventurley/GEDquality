/**
 * Test file for compareEvents method in CompareModels
 */

// Import required classes
const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const FamilyModel = require('./DataModel/FamilyModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

console.log('=== Testing CompareEvents Functionality ===\n');

// Create first PageModel with detailed event data
const pageModel1 = new PageModel();
pageModel1.location = 'Test Location 1';

// Create people with various events
const person1_1 = new PersonModel(new NameModel('John', 'Smith'));
person1_1.birth = new EventModel(new DateModel('1850', '01', '15'), 'New York');
person1_1.death = new EventModel(new DateModel('1920', '12', '25'), 'Chicago');

const person1_2 = new PersonModel(new NameModel('Mary', 'Johnson'));
person1_2.birth = new EventModel(new DateModel('1855', '06', '10'), 'Boston');
person1_2.christening = new EventModel(new DateModel('1855', '07', '01'), 'St. Mary Church, Boston');

// Create a family with marriage event
const family1 = new FamilyModel();
family1.husband = 1;
family1.wife = 2;
family1.marriage = new EventModel(new DateModel('1875', '09', '20'), 'Chicago');

// Link people to family
person1_1.families = [1];
person1_2.families = [1];

// Add to PageModel
pageModel1.people[1] = person1_1;
pageModel1.people[2] = person1_2;
pageModel1.families[1] = family1;

// Create entry and add people
const entry1 = new EntryModel('E001', 'Test Entry 1');
entry1.addPerson(1, 'I1', person1_1);
entry1.addPerson(2, 'I2', person1_2);
pageModel1.entries['E001'] = entry1;

// Create second PageModel with some differences
const pageModel2 = new PageModel();
pageModel2.location = 'Test Location 2';

// Create people with different event data (some missing, some different)
const person2_1 = new PersonModel(new NameModel('John', 'Smith'));
person2_1.birth = new EventModel(new DateModel('1850', '01', '16'), 'New York'); // Different day
person2_1.death = new EventModel(new DateModel('1920', '12', '25'), 'Boston'); // Different place
// Missing christening event

const person2_2 = new PersonModel(new NameModel('Mary', 'Johnson'));
person2_2.birth = new EventModel(new DateModel('1855', '06', '10'), 'Boston'); // Same
// Missing christening event (recall error)
person2_2.burial = new EventModel(new DateModel('1930', '03', '15'), 'Oak Hill Cemetery'); // Extra event

// Create family with different marriage event
const family2 = new FamilyModel();
family2.husband = 1;
family2.wife = 2;
family2.marriage = new EventModel(new DateModel('1875', '09', '21'), 'Chicago'); // Different day

// Link people to family
person2_1.families = [1];
person2_2.families = [1];

// Add to PageModel
pageModel2.people[1] = person2_1;
pageModel2.people[2] = person2_2;
pageModel2.families[1] = family2;

// Create entry and add people
const entry2 = new EntryModel('E001', 'Test Entry 2');
entry2.addPerson(1, 'I1', person2_1);
entry2.addPerson(2, 'I2', person2_2);
pageModel2.entries['E001'] = entry2;

// Test the events comparison
const compareModels = new CompareModels(pageModel1, pageModel2);
const eventsResults = compareModels.compareEvents();

console.log('Events comparison results:');
console.log('Entries compared:', eventsResults.entriesCompared);
console.log('Total matches:', eventsResults.totalMatches);
console.log('Event recall errors:', eventsResults.eventRecallErrors);
console.log('Event precision errors:', eventsResults.eventPrecisionErrors);
console.log('Event recall error rate:', eventsResults.recallErrorRate.toFixed(2) + '%');
console.log('Event precision error rate:', eventsResults.precisionErrorRate.toFixed(2) + '%');

// Display detailed results
if (eventsResults.details.length > 0) {
    console.log('\nDetailed results:');
    eventsResults.details.forEach(detail => {
        console.log(`Entry ${detail.entryId}:`);
        console.log(`  Matches: ${detail.matches.length}`);
        console.log(`  Recall errors: ${detail.recallErrors.length}`);
        console.log(`  Precision errors: ${detail.precisionErrors.length}`);
        
        if (detail.recallErrors.length > 0) {
            console.log(`  Event recall errors:`);
            detail.recallErrors.forEach((error, index) => {
                console.log(`    Error ${index + 1}:`);
                console.log(`      Person: ${error.person1Name} <-> ${error.person2Name}`);
                console.log(`      Event type: ${error.eventType}`);
                if (error.eventType === 'marriage') {
                    console.log(`      Families: ${error.families1Count} vs ${error.families2Count}`);
                    console.log(`      Missing in: ${error.missingIn}`);
                } else {
                    console.log(`      Event 1: ${error.event1 || 'None'}`);
                    console.log(`      Event 2: ${error.event2 || 'None'}`);
                    console.log(`      Missing in: ${error.missingIn}`);
                }
            });
        }
        
        if (detail.precisionErrors.length > 0) {
            console.log(`  Event precision errors:`);
            detail.precisionErrors.forEach((error, index) => {
                console.log(`    Error ${index + 1}:`);
                console.log(`      Person: ${error.person1Name} <-> ${error.person2Name}`);
                console.log(`      Event type: ${error.eventType}`);
                console.log(`      Event 1: ${error.event1}`);
                console.log(`      Event 2: ${error.event2}`);
                if (error.datesDiffer) console.log(`      Dates differ`);
                if (error.placesDiffer) console.log(`      Places differ`);
                if (error.familyIndex !== undefined) console.log(`      Family index: ${error.familyIndex}`);
            });
        }
    });
}

console.log('\nTest completed successfully!');
