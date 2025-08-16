/**
 * Test the location extraction and detailed people comparison functionality
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');
const CompareModels = require('./DataModel/CompareModels');

console.log('=== Testing Location and Detailed People Comparison ===\n');

// Test location extraction function
function extractLocationFromFilename(originalName) {
    if (!originalName) return '';
    
    // Remove the extension first
    const nameWithoutExt = originalName.replace(/\.[^.]+$/, '');
    
    // Remove page number pattern (.###) from the end
    const nameWithoutPage = nameWithoutExt.replace(/\.\d{3}$/, '');
    
    return nameWithoutPage || '';
}

console.log('=== Testing Location Extraction ===');
const testFilenames = [
    'Chicago_Illinois.001.ged',
    'Boston_Massachusetts.002.xml',
    'New_York_City.123.ged'
];

testFilenames.forEach(filename => {
    const location = extractLocationFromFilename(filename);
    console.log(`"${filename}" → Location: "${location}"`);
});

console.log('\n=== Testing Detailed People Comparison Report ===');

// Create test PageModels
const gedPageModel = new PageModel();
const xmlPageModel = new PageModel();

// Set locations
gedPageModel.location = 'Chicago_Illinois';
xmlPageModel.location = 'Chicago_Illinois';

// Create entries with people
const entry1_ged = new EntryModel('family-001');
const entry1_xml = new EntryModel('family-001');

// Add people to GEDCOM entry
const john_ged = new PersonModel(new NameModel('John', 'Smith'));
const mary_ged = new PersonModel(new NameModel('Mary', 'Johnson'));
const robert_ged = new PersonModel(new NameModel('Robert', 'Smith'));

entry1_ged.addPerson(1, 'john', john_ged);
entry1_ged.addPerson(2, 'mary', mary_ged);
entry1_ged.addPerson(3, 'robert', robert_ged);

// Add people to XML entry (some matching, some different)
const john_xml = new PersonModel(new NameModel('John', 'Smith')); // Exact match
const marie_xml = new PersonModel(new NameModel('Marie', 'Johnson')); // Similar to Mary
const alice_xml = new PersonModel(new NameModel('Alice', 'Brown')); // Only in XML

entry1_xml.addPerson(10, 'john', john_xml);
entry1_xml.addPerson(11, 'marie', marie_xml);
entry1_xml.addPerson(12, 'alice', alice_xml);

// Add entries to PageModels
gedPageModel.addEntry(entry1_ged);
xmlPageModel.addEntry(entry1_xml);

// Create CompareModels and test
const comparer = new CompareModels(gedPageModel, xmlPageModel);
const peopleComparison = comparer.comparePeople();

console.log('People Comparison Details:');
peopleComparison.details.forEach(detail => {
    console.log(`\nEntry: ${detail.entryId}`);
    console.log(`  People in GEDCOM: ${detail.people1Count}, in XML: ${detail.people2Count}`);
    
    if (detail.unmatchedInFirst.length > 0) {
        console.log('  Unmatched in GEDCOM:');
        detail.unmatchedInFirst.forEach(person => {
            console.log(`    • ${person.name} (ID: ${person.id})`);
        });
    }
    
    if (detail.unmatchedInSecond.length > 0) {
        console.log('  Unmatched in XML:');
        detail.unmatchedInSecond.forEach(person => {
            console.log(`    • ${person.name} (ID: ${person.id})`);
        });
    }
});

console.log('\n✅ Location and people comparison tests completed!');
