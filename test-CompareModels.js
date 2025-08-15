/**
 * Test file for CompareModels functionality
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const FamilyModel = require('./DataModel/FamilyModel');
const NameModel = require('./DataModel/NameModel');
const EventModel = require('./DataModel/EventModel');
const DateModel = require('./DataModel/DateModel');
const CompareModels = require('./DataModel/CompareModels');

console.log('=== Testing CompareModels Functionality ===\n');

// Create first PageModel (GEDCOM simulation)
const gedPageModel = new PageModel();
gedPageModel.location = 'Chicago_Illinois';

// Add some entries to first PageModel
const entry1 = new EntryModel('entry-001');
const entry2 = new EntryModel('entry-002');
const entry3 = new EntryModel('entry-003');

gedPageModel.addEntry(entry1);
gedPageModel.addEntry(entry2);
gedPageModel.addEntry(entry3);

// Add some people
const person1 = new PersonModel(new NameModel('John', 'Smith'));
const person2 = new PersonModel(new NameModel('Mary', 'Johnson'));
gedPageModel.people[1] = person1;
gedPageModel.people[2] = person2;

// Create second PageModel (XML simulation)
const xmlPageModel = new PageModel();
xmlPageModel.location = 'Chicago_Illinois';

// Add some entries to second PageModel (some overlap, some unique)
const entry2_xml_basic = new EntryModel('entry-002'); // Same as GEDCOM
const entry3_xml_basic = new EntryModel('entry-003'); // Same as GEDCOM
const entry4_xml_basic = new EntryModel('entry-004'); // Only in XML
const entry5_xml_basic = new EntryModel('entry-005'); // Only in XML

xmlPageModel.addEntry(entry2_xml_basic);
xmlPageModel.addEntry(entry3_xml_basic);
xmlPageModel.addEntry(entry4_xml_basic);
xmlPageModel.addEntry(entry5_xml_basic);

// Add some people
const person3 = new PersonModel(new NameModel('Robert', 'Wilson'));
xmlPageModel.people[3] = person3;

// Create CompareModels object
console.log('Creating CompareModels object...');
const comparer = new CompareModels(gedPageModel, xmlPageModel);

// Test compareEntries method
console.log('\n=== Testing compareEntries method ===');
const entryComparison = comparer.compareEntries();

console.log('Entries only in first PageModel (GEDCOM):');
entryComparison.onlyInFirst.forEach(entryId => {
    console.log(`  • ${entryId}`);
});

console.log('\nEntries only in second PageModel (XML):');
entryComparison.onlyInSecond.forEach(entryId => {
    console.log(`  • ${entryId}`);
});

// Test getSummary method
console.log('\n=== Testing getSummary method ===');
const summary = comparer.getSummary();
console.log('Summary:', JSON.stringify(summary, null, 2));

// Test generateReport method
console.log('\n=== Testing generateReport method ===');
const report = comparer.generateReport();
console.log(report);

console.log('\n=== Testing comparePeople method ===');

// Clear previous data and create comprehensive test data for people comparison
const gedPageModelPeople = new PageModel();
const xmlPageModelPeople = new PageModel();

gedPageModelPeople.location = 'Berlin_Deutschland';
xmlPageModelPeople.location = 'Berlin_Deutschland';

// ============================================
// Test Case 1: Exact Name Matches (Unique)
// ============================================
console.log('\n--- Test Case 1: Exact Name Matches ---');
const entry1_ged = new EntryModel('family-001');
const entry1_xml = new EntryModel('family-001');

// GEDCOM Entry 1 People
const hans_mueller_ged = new PersonModel(new NameModel('Hans', 'Müller'));
const anna_schmidt_ged = new PersonModel(new NameModel('Anna', 'Schmidt'));
const johann_weber_ged = new PersonModel(new NameModel('Johann', 'Weber'));

entry1_ged.addPerson(1, 'hans', hans_mueller_ged);
entry1_ged.addPerson(2, 'anna', anna_schmidt_ged);
entry1_ged.addPerson(3, 'johann', johann_weber_ged);

// XML Entry 1 People - Some exact matches, some variations
const hans_mueller_xml = new PersonModel(new NameModel('Hans', 'Müller')); // Exact match
const anne_schmidt_xml = new PersonModel(new NameModel('Anne', 'Schmidt')); // Similar to Anna
const wilhelm_fischer_xml = new PersonModel(new NameModel('Wilhelm', 'Fischer')); // Only in XML

entry1_xml.addPerson(10, 'hans', hans_mueller_xml);
entry1_xml.addPerson(11, 'anne', anne_schmidt_xml);
entry1_xml.addPerson(12, 'wilhelm', wilhelm_fischer_xml);

// ============================================
// Test Case 2: Event/Reference Matches
// ============================================
console.log('\n--- Test Case 2: Event/Reference Matches ---');
const entry2_ged = new EntryModel('family-002');
const entry2_xml = new EntryModel('family-002');

// GEDCOM Entry 2 People with events and references
const margarete_bauer_ged = new PersonModel(new NameModel('Margarete', 'Bauer'));
margarete_bauer_ged.birth = new EventModel(new DateModel(1875, 6, 15, false, true), 'München');
margarete_bauer_ged.references = ['@REF123@', '@REF456@'];

const thomas_zimmermann_ged = new PersonModel(new NameModel('Thomas', 'Zimmermann'));
thomas_zimmermann_ged.death = new EventModel(new DateModel(1950, 12, 25, false, true), 'Hamburg');

entry2_ged.addPerson(4, 'margarete', margarete_bauer_ged);
entry2_ged.addPerson(5, 'thomas', thomas_zimmermann_ged);

// XML Entry 2 People with matching events/references but different names
const greta_bauer_xml = new PersonModel(new NameModel('Greta', 'Bauer')); // Different name
greta_bauer_xml.birth = new EventModel(new DateModel(1875, 6, 15, false, true), 'München'); // Same birth event
greta_bauer_xml.references = ['@REF123@']; // Matching reference

const tom_zimmermann_xml = new PersonModel(new NameModel('Tom', 'Zimmermann')); // Similar name
tom_zimmermann_xml.death = new EventModel(new DateModel(1950, 12, 25, false, true), 'Hamburg'); // Same death event

entry2_xml.addPerson(20, 'greta', greta_bauer_xml);
entry2_xml.addPerson(21, 'tom', tom_zimmermann_xml);

// ============================================
// Test Case 3: Relationship Similar Matches
// ============================================
console.log('\n--- Test Case 3: Relationship Similar Matches ---');
const entry3_ged = new EntryModel('family-003');
const entry3_xml = new EntryModel('family-003');

// GEDCOM Entry 3 with family relationships
const vater_ged = new PersonModel(new NameModel('Friedrich', 'Hoffmann'));
const mutter_ged = new PersonModel(new NameModel('Elisabeth', 'Hoffmann'));
const kind_ged = new PersonModel(new NameModel('Michael', 'Hoffmann'));

entry3_ged.addPerson(30, 'vater', vater_ged);
entry3_ged.addPerson(31, 'mutter', mutter_ged);
entry3_ged.addPerson(32, 'kind', kind_ged);

// Create family relationships in GEDCOM
const family_ged = new FamilyModel();
family_ged.setHusband(30);
family_ged.setWife(31);
family_ged.addChild(32);
entry3_ged.addFamily(1, family_ged);

// XML Entry 3 with similar names and same relationships
const vater_xml = new PersonModel(new NameModel('Fritz', 'Hoffmann')); // Similar to Friedrich
const mutter_xml = new PersonModel(new NameModel('Lisbeth', 'Hoffmann')); // Similar to Elisabeth
const kind_xml = new PersonModel(new NameModel('Michi', 'Hoffmann')); // Similar to Michael

entry3_xml.addPerson(40, 'vater', vater_xml);
entry3_xml.addPerson(41, 'mutter', mutter_xml);
entry3_xml.addPerson(42, 'kind', kind_xml);

// Create same family relationships in XML
const family_xml = new FamilyModel();
family_xml.setHusband(40);
family_xml.setWife(41);
family_xml.addChild(42);
entry3_xml.addFamily(1, family_xml);

// ============================================
// Test Case 4: Similar Name Matches (Fallback)
// ============================================
console.log('\n--- Test Case 4: Similar Name Matches ---');
const entry4_ged = new EntryModel('family-004');
const entry4_xml = new EntryModel('family-004');

// GEDCOM Entry 4
const katharina_ged = new PersonModel(new NameModel('Katharina', 'Neumann'));
const johannes_ged = new PersonModel(new NameModel('Johannes', 'Klein'));

entry4_ged.addPerson(50, 'katharina', katharina_ged);
entry4_ged.addPerson(51, 'johannes', johannes_ged);

// XML Entry 4 with phonetically similar names
const katarina_xml = new PersonModel(new NameModel('Katarina', 'Neumann')); // Katharina/Katarina variation
const hans_xml = new PersonModel(new NameModel('Hans', 'Klein')); // Johannes/Hans similar

entry4_xml.addPerson(60, 'katarina', katarina_xml);
entry4_xml.addPerson(61, 'hans', hans_xml);

// ============================================
// Test Case 5: Non-Matching Scenarios
// ============================================
console.log('\n--- Test Case 5: Non-Matching Scenarios ---');
const entry5_ged = new EntryModel('family-005');
const entry5_xml = new EntryModel('family-005');

// Scenario A: Identical names but multiple people with same name (ambiguous matches)
const anna_ged1 = new PersonModel(new NameModel('Anna', 'Müller'));
const anna_ged2 = new PersonModel(new NameModel('Anna', 'Müller')); // Same name, no distinguishing data

const anna_xml1 = new PersonModel(new NameModel('Anna', 'Müller')); 
const anna_xml2 = new PersonModel(new NameModel('Anna', 'Müller')); // Same name, no distinguishing data

entry5_ged.addPerson(70, 'anna1', anna_ged1);
entry5_ged.addPerson(71, 'anna2', anna_ged2);
entry5_xml.addPerson(80, 'anna1', anna_xml1);
entry5_xml.addPerson(81, 'anna2', anna_xml2);

// Scenario B: Completely different surnames with no matching events
const kurt_schulz_ged = new PersonModel(new NameModel('Kurt', 'Schulz'));
const kurt_wagner_xml = new PersonModel(new NameModel('Kurt', 'Wagner')); // Same first name, different surname

entry5_ged.addPerson(72, 'kurt', kurt_schulz_ged);
entry5_xml.addPerson(82, 'kurt', kurt_wagner_xml);

// Scenario C: Extra person in GEDCOM with no match in XML
const extra_person_ged = new PersonModel(new NameModel('Gisela', 'Richter'));
entry5_ged.addPerson(73, 'gisela', extra_person_ged);

// Scenario D: Extra person in XML with no match in GEDCOM  
const extra_person_xml = new PersonModel(new NameModel('Helmut', 'Braun'));
entry5_xml.addPerson(83, 'helmut', extra_person_xml);

// Scenario E: Names that are phonetically different and have different events
const werner_koch_ged = new PersonModel(new NameModel('Werner', 'Koch'));
werner_koch_ged.birth = new EventModel(new DateModel(1920, 3, 10, false, true), 'Dresden');

const pavel_novak_xml = new PersonModel(new NameModel('Pavel', 'Novák')); // Completely different name
pavel_novak_xml.birth = new EventModel(new DateModel(1925, 8, 20, false, true), 'Praha'); // Different event

entry5_ged.addPerson(74, 'werner', werner_koch_ged);
entry5_xml.addPerson(84, 'pavel', pavel_novak_xml);

// ============================================
// Test Case 6: Edge Cases with Similar But Non-Matching Names
// ============================================
console.log('\n--- Test Case 6: Edge Cases with Similar But Non-Matching Names ---');
const entry6_ged = new EntryModel('family-006');
const entry6_xml = new EntryModel('family-006');

// Names that might seem similar but shouldn't match due to significant differences
const maximilian_ged = new PersonModel(new NameModel('Maximilian', 'Huber'));
const emil_xml = new PersonModel(new NameModel('Emil', 'Huber')); // Same surname but very different first names

const ingrid_ged = new PersonModel(new NameModel('Ingrid', 'Lorenz'));
const astrid_xml = new PersonModel(new NameModel('Astrid', 'Lorenz')); // Similar endings but different names

entry6_ged.addPerson(90, 'maximilian', maximilian_ged);
entry6_ged.addPerson(91, 'ingrid', ingrid_ged);
entry6_xml.addPerson(100, 'emil', emil_xml);
entry6_xml.addPerson(101, 'astrid', astrid_xml);

// Add all entries to PageModels
gedPageModelPeople.addEntry(entry1_ged);
gedPageModelPeople.addEntry(entry2_ged);
gedPageModelPeople.addEntry(entry3_ged);
gedPageModelPeople.addEntry(entry4_ged);
gedPageModelPeople.addEntry(entry5_ged);
gedPageModelPeople.addEntry(entry6_ged);

xmlPageModelPeople.addEntry(entry1_xml);
xmlPageModelPeople.addEntry(entry2_xml);
xmlPageModelPeople.addEntry(entry3_xml);
xmlPageModelPeople.addEntry(entry4_xml);
xmlPageModelPeople.addEntry(entry5_xml);
xmlPageModelPeople.addEntry(entry6_xml);

// Also add people to PageModel's people dictionary for consistency
gedPageModelPeople.people[1] = hans_mueller_ged.clone();
gedPageModelPeople.people[2] = anna_schmidt_ged.clone();
gedPageModelPeople.people[3] = johann_weber_ged.clone();
gedPageModelPeople.people[4] = margarete_bauer_ged.clone();
gedPageModelPeople.people[5] = thomas_zimmermann_ged.clone();
gedPageModelPeople.people[30] = vater_ged.clone();
gedPageModelPeople.people[31] = mutter_ged.clone();
gedPageModelPeople.people[32] = kind_ged.clone();
gedPageModelPeople.people[50] = katharina_ged.clone();
gedPageModelPeople.people[51] = johannes_ged.clone();
gedPageModelPeople.people[70] = anna_ged1.clone();
gedPageModelPeople.people[71] = anna_ged2.clone();
gedPageModelPeople.people[72] = kurt_schulz_ged.clone();
gedPageModelPeople.people[73] = extra_person_ged.clone();
gedPageModelPeople.people[74] = werner_koch_ged.clone();
gedPageModelPeople.people[90] = maximilian_ged.clone();
gedPageModelPeople.people[91] = ingrid_ged.clone();

xmlPageModelPeople.people[10] = hans_mueller_xml.clone();
xmlPageModelPeople.people[11] = anne_schmidt_xml.clone();
xmlPageModelPeople.people[12] = wilhelm_fischer_xml.clone();
xmlPageModelPeople.people[20] = greta_bauer_xml.clone();
xmlPageModelPeople.people[21] = tom_zimmermann_xml.clone();
xmlPageModelPeople.people[40] = vater_xml.clone();
xmlPageModelPeople.people[41] = mutter_xml.clone();
xmlPageModelPeople.people[42] = kind_xml.clone();
xmlPageModelPeople.people[60] = katarina_xml.clone();
xmlPageModelPeople.people[61] = hans_xml.clone();
xmlPageModelPeople.people[80] = anna_xml1.clone();
xmlPageModelPeople.people[81] = anna_xml2.clone();
xmlPageModelPeople.people[82] = kurt_wagner_xml.clone();
xmlPageModelPeople.people[83] = extra_person_xml.clone();
xmlPageModelPeople.people[84] = pavel_novak_xml.clone();
xmlPageModelPeople.people[100] = emil_xml.clone();
xmlPageModelPeople.people[101] = astrid_xml.clone();

// Create CompareModels object for people testing
const peopleComparer = new CompareModels(gedPageModelPeople, xmlPageModelPeople);

// Test comparePeople method
const peopleComparison = peopleComparer.comparePeople();

console.log('\n=== People Comparison Results ===');
console.log(`Entries compared: ${peopleComparison.entriesCompared}`);
console.log(`Total matches: ${peopleComparison.totalMatches}`);
console.log(`Exact name matches: ${peopleComparison.exactNameMatches}`);
console.log(`Event/Reference matches: ${peopleComparison.eventReferenceMatches}`);
console.log(`Relationship similar matches: ${peopleComparison.relationshipSimilarMatches}`);
console.log(`Similar name matches: ${peopleComparison.similarNameMatches}`);
console.log(`Unmatched in GEDCOM: ${peopleComparison.unmatchedInFirst}`);
console.log(`Unmatched in XML: ${peopleComparison.unmatchedInSecond}`);

console.log('\n=== Expected Non-Matching Scenarios ===');
console.log('Test Case 5 & 6 demonstrate scenarios where people should NOT match:');
console.log('• Identical names with no distinguishing data (ambiguous)');
console.log('• Same first names but different surnames with no matching events');
console.log('• Extra people in one file with no counterpart in the other');
console.log('• Completely different names with different events');
console.log('• Names that appear similar but are significantly different');

console.log('\n=== Detailed Entry-by-Entry Results ===');
peopleComparison.details.forEach((detail, index) => {
    console.log(`\nEntry ${detail.entryId}:`);
    console.log(`  People in GEDCOM: ${detail.people1Count}, in XML: ${detail.people2Count}`);
    console.log(`  Matches found: ${detail.matches.length}`);
    
    detail.matches.forEach(match => {
        console.log(`    ${match.person1Name} (${match.person1Id}) <-> ${match.person2Name} (${match.person2Id}) [${match.matchType}]`);
        if (match.relationship) {
            console.log(`      Relationship: ${match.relationship}`);
        }
    });
    
    if (detail.unmatchedInFirst.length > 0) {
        console.log(`  Unmatched in GEDCOM:`);
        detail.unmatchedInFirst.forEach(person => {
            console.log(`    ${person.name} (ID: ${person.id})`);
        });
    }
    
    if (detail.unmatchedInSecond.length > 0) {
        console.log(`  Unmatched in XML:`);
        detail.unmatchedInSecond.forEach(person => {
            console.log(`    ${person.name} (ID: ${person.id})`);
        });
    }
});

console.log('\n=== Match Type Analysis ===');
console.log(`Exact name matches: ${peopleComparison.exactNameMatches} (highest confidence)`);
console.log(`Event/Reference matches: ${peopleComparison.eventReferenceMatches} (high confidence)`);
console.log(`Relationship similar matches: ${peopleComparison.relationshipSimilarMatches} (medium confidence)`);
console.log(`Similar name matches: ${peopleComparison.similarNameMatches} (lower confidence)`);

if (peopleComparison.totalMatches > 0) {
    const highConfidenceMatches = peopleComparison.exactNameMatches + peopleComparison.eventReferenceMatches;
    const confidenceRate = (highConfidenceMatches / peopleComparison.totalMatches * 100).toFixed(1);
    console.log(`\nOverall confidence rate: ${confidenceRate}% (${highConfidenceMatches}/${peopleComparison.totalMatches} high-confidence matches)`);
}

console.log('\n✅ CompareModels tests completed!');
