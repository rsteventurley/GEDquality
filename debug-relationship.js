/**
 * Debug the relationship matching
 */

const PageModel = require('./DataModel/PageModel');
const EntryModel = require('./DataModel/EntryModel');
const PersonModel = require('./DataModel/PersonModel');
const NameModel = require('./DataModel/NameModel');

// Create simple test case
const entry1 = new EntryModel('test-entry');
const entry2 = new EntryModel('test-entry');

const anna1_ged = new PersonModel(new NameModel('Anna', 'Müller'));
const anna2_ged = new PersonModel(new NameModel('Anna', 'Müller'));
const anna1_xml = new PersonModel(new NameModel('Anna', 'Müller'));
const anna2_xml = new PersonModel(new NameModel('Anna', 'Müller'));

entry1.addPerson(1, 'anna1', anna1_ged);
entry1.addPerson(2, 'anna2', anna2_ged);
entry2.addPerson(10, 'anna1', anna1_xml);
entry2.addPerson(11, 'anna2', anna2_xml);

console.log('=== Debug Relationships ===');
console.log('Anna1 GEDCOM relationship:', `"${entry1.getRelationship(1)}"`);
console.log('Anna2 GEDCOM relationship:', `"${entry1.getRelationship(2)}"`);
console.log('Anna1 XML relationship:', `"${entry2.getRelationship(10)}"`);
console.log('Anna2 XML relationship:', `"${entry2.getRelationship(11)}"`);

console.log('\n=== Name Matching ===');
console.log('Anna1 GEDCOM name:', anna1_ged.name.toString());
console.log('Anna1 XML name:', anna1_xml.name.toString());
console.log('Similar match:', anna1_ged.name.similarMatch(anna1_xml.name));
console.log('Exact match:', anna1_ged.name.exactMatch(anna1_xml.name));

const rel1 = entry1.getRelationship(1);
const rel2 = entry2.getRelationship(10);
console.log(`\nRelationship comparison: "${rel1}" === "${rel2}" && "${rel1}" !== ""`);
console.log('Result:', rel1 === rel2 && rel1 !== '');
