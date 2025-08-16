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
hans_mueller_ged.references = ['F001', 'C123']; // Test references
const anna_schmidt_ged = new PersonModel(new NameModel('Anna', 'Schmidt'));
anna_schmidt_ged.references = ['F001', 'F002']; // Test references
const johann_weber_ged = new PersonModel(new NameModel('Johann', 'Weber'));
johann_weber_ged.references = ['F003']; // Test reference

entry1_ged.addPerson(1, 'hans', hans_mueller_ged);
entry1_ged.addPerson(2, 'anna', anna_schmidt_ged);
entry1_ged.addPerson(3, 'johann', johann_weber_ged);

// XML Entry 1 People - Some exact matches, some variations
const hans_mueller_xml = new PersonModel(new NameModel('Hans', 'Müller')); // Exact match
hans_mueller_xml.references = ['F001', 'C123']; // Same references (perfect match)
const anne_schmidt_xml = new PersonModel(new NameModel('Anne', 'Schmidt')); // Similar to Anna
anne_schmidt_xml.references = ['F001']; // Missing F002 (recall error)
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
margarete_bauer_ged.references = ['@REF123@', '@REF456@']; // Two references

const thomas_zimmermann_ged = new PersonModel(new NameModel('Thomas', 'Zimmermann'));
thomas_zimmermann_ged.death = new EventModel(new DateModel(1950, 12, 25, false, true), 'Hamburg');
thomas_zimmermann_ged.references = ['@FAMILY001@', '@FAMILY002@']; // Test precision error

entry2_ged.addPerson(4, 'margarete', margarete_bauer_ged);
entry2_ged.addPerson(5, 'thomas', thomas_zimmermann_ged);

// XML Entry 2 People with matching events/references but different names
const greta_bauer_xml = new PersonModel(new NameModel('Greta', 'Bauer')); // Different name
greta_bauer_xml.birth = new EventModel(new DateModel(1875, 6, 15, false, true), 'München'); // Same birth event
greta_bauer_xml.references = ['@REF123@']; // Missing @REF456@ (recall error)

const tom_zimmermann_xml = new PersonModel(new NameModel('Tom', 'Zimmermann')); // Similar name
tom_zimmermann_xml.death = new EventModel(new DateModel(1950, 12, 25, false, true), 'Hamburg'); // Same death event
tom_zimmermann_xml.references = ['@FAMILY001@', '@FAMILY999@']; // Same count but different value (precision error)

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

// ============================================
// Test Case 7: Resolved Ambiguity Test
// ============================================
console.log('\n--- Test Case 7: Resolved Ambiguity Test ---');
const entry7_ged = new EntryModel('family-007');
const entry7_xml = new EntryModel('family-007');

// Scenario: Three people named "Hans Schneider" in GEDCOM, three in XML
// Two of them will match via events, leaving one exact name match that should be resolved
const hans1_ged = new NameModel('Hans', 'Schneider');
const hans2_ged = new NameModel('Hans', 'Schneider');
const hans3_ged = new NameModel('Hans', 'Schneider');

const hans1_xml = new NameModel('Hans', 'Schneider');
const hans2_xml = new NameModel('Hans', 'Schneider');
const hans3_xml = new NameModel('Hans', 'Schneider');

// Create PersonModels
const hans_person1_ged = new PersonModel(hans1_ged);
const hans_person2_ged = new PersonModel(hans2_ged);
const hans_person3_ged = new PersonModel(hans3_ged);

const hans_person1_xml = new PersonModel(hans1_xml);
const hans_person2_xml = new PersonModel(hans2_xml);
const hans_person3_xml = new PersonModel(hans3_xml);

// Give Hans #1 a unique birth event that will match
hans_person1_ged.birth = new EventModel(new DateModel(1850, 5, 12, false, true), 'Heidelberg');
hans_person1_xml.birth = new EventModel(new DateModel(1850, 5, 12, false, true), 'Heidelberg');

// Give Hans #2 a unique death event that will match
hans_person2_ged.death = new EventModel(new DateModel(1920, 11, 3, false, true), 'Stuttgart');
hans_person2_xml.death = new EventModel(new DateModel(1920, 11, 3, false, true), 'Stuttgart');

// Hans #3 has no events - should match by exact name after others are resolved

entry7_ged.addPerson(110, 'hans1', hans_person1_ged);
entry7_ged.addPerson(111, 'hans2', hans_person2_ged);
entry7_ged.addPerson(112, 'hans3', hans_person3_ged);

entry7_xml.addPerson(120, 'hans1', hans_person1_xml);
entry7_xml.addPerson(121, 'hans2', hans_person2_xml);
entry7_xml.addPerson(122, 'hans3', hans_person3_xml);

// Add all entries to PageModels
gedPageModelPeople.addEntry(entry1_ged);
gedPageModelPeople.addEntry(entry2_ged);
gedPageModelPeople.addEntry(entry3_ged);
gedPageModelPeople.addEntry(entry4_ged);
gedPageModelPeople.addEntry(entry5_ged);
gedPageModelPeople.addEntry(entry6_ged);
gedPageModelPeople.addEntry(entry7_ged);

xmlPageModelPeople.addEntry(entry1_xml);
xmlPageModelPeople.addEntry(entry2_xml);
xmlPageModelPeople.addEntry(entry3_xml);
xmlPageModelPeople.addEntry(entry4_xml);
xmlPageModelPeople.addEntry(entry5_xml);
xmlPageModelPeople.addEntry(entry6_xml);
xmlPageModelPeople.addEntry(entry7_xml);

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
gedPageModelPeople.people[110] = hans_person1_ged.clone();
gedPageModelPeople.people[111] = hans_person2_ged.clone();
gedPageModelPeople.people[112] = hans_person3_ged.clone();

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
xmlPageModelPeople.people[120] = hans_person1_xml.clone();
xmlPageModelPeople.people[121] = hans_person2_xml.clone();
xmlPageModelPeople.people[122] = hans_person3_xml.clone();

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

console.log('\n=== Precision Analysis ===');
console.log(`Precise matches (exact names): ${peopleComparison.preciseMatches}`);
console.log(`Imprecise matches (different names): ${peopleComparison.impreciseMatches}`);
console.log(`Precision rate: ${peopleComparison.precisionRate.toFixed(1)}%`);

console.log('\n=== Expected Non-Matching Scenarios ===');
console.log('Test Cases 5 & 6 demonstrate scenarios where people should NOT match:');
console.log('• Identical names with no distinguishing data (ambiguous)');
console.log('• Same first names but different surnames with no matching events');
console.log('• Extra people in one file with no counterpart in the other');
console.log('• Completely different names with different events');
console.log('• Names that appear similar but are significantly different');

console.log('\n=== Resolved Ambiguity Test ===');
console.log('Test Case 7 demonstrates resolved ambiguity matching:');
console.log('• Multiple people with identical names initially ambiguous');
console.log('• Some matched via events/references, resolving ambiguity');
console.log('• Remaining exact name matches should now be matched in final pass');

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
    console.log(`Overall precision rate: ${peopleComparison.precisionRate.toFixed(1)}% (${peopleComparison.preciseMatches}/${peopleComparison.totalMatches} exact name matches)`);
    
    if (peopleComparison.impreciseMatches > 0) {
        console.log(`\n⚠️  Warning: ${peopleComparison.impreciseMatches} imprecise matches found!`);
        console.log('These represent people matched with different names - review recommended.');
    }
}

console.log('\n=== Testing compareReferences method ===');

// Test cross-references comparison
const referencesComparison = comparer.compareReferences();
console.log(`\nCross-References Comparison Results:`);
console.log(`Entries compared: ${referencesComparison.entriesCompared}`);
console.log(`People matches analyzed: ${referencesComparison.totalMatches}`);
console.log(`Cross-reference recall errors: ${referencesComparison.crossReferenceRecallErrors}`);
console.log(`Cross-reference precision errors: ${referencesComparison.crossReferencePrecisionErrors}`);
console.log(`Recall error rate: ${referencesComparison.recallErrorRate.toFixed(1)}%`);
console.log(`Precision error rate: ${referencesComparison.precisionErrorRate.toFixed(1)}%`);

// Show detailed results
referencesComparison.details.forEach(detail => {
    if (detail.recallErrors.length > 0 || detail.precisionErrors.length > 0) {
        console.log(`\nEntry ${detail.entryId} cross-reference issues:`);
        
        detail.recallErrors.forEach(error => {
            console.log(`  Recall Error: ${error.person1Name} ↔ ${error.person2Name}`);
            console.log(`    Expected ${error.expectedCount} refs, found ${error.actualCount} refs`);
            console.log(`    Missing references: [${error.missingReferences.join(', ')}]`);
        });
        
        detail.precisionErrors.forEach(error => {
            console.log(`  Precision Error: ${error.person1Name} ↔ ${error.person2Name}`);
            console.log(`    GEDCOM refs: [${error.person1References.join(', ')}]`);
            console.log(`    XML refs: [${error.person2References.join(', ')}]`);
        });
    }
});

if (referencesComparison.crossReferenceRecallErrors === 0 && referencesComparison.crossReferencePrecisionErrors === 0) {
    console.log('\n✅ All cross-references match perfectly!');
}

console.log('\n✅ CompareModels tests completed!');
