/**
 * Test file for extended PersonModel with additional attributes
 * Tests death, christening, burial, families, references, and source
 * 
 * Run with: node DataModel/test-PersonModel-extended.js
 */

const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

console.log('=== Extended PersonModel Test Suite ===\n');

// Test 1: Empty PersonModel with new attributes
console.log('1. Empty PersonModel Tests:');
const emptyPerson = new PersonModel();
console.log(`   isEmpty(): ${emptyPerson.isEmpty()}`);
console.log(`   isValid(): ${emptyPerson.isValid()}`);
console.log(`   toString(): "${emptyPerson.toString()}"`);
console.log(`   Families: [${emptyPerson.getFamilies()}]`);
console.log(`   References: [${emptyPerson.getReferences()}]`);
console.log(`   Source: "${emptyPerson.getSource()}"`);
console.log(`   Is Deceased: ${emptyPerson.isDeceased()}`);
console.log('');

// Test 2: Complete person with all attributes
console.log('2. Complete Person with All Attributes:');
try {
    // Create name
    const name = new NameModel('Johann', 'Schmidt');
    
    // Create birth event
    const birthDate = new DateModel();
    birthDate.parseDateString('1820-05-15');
    const birth = new EventModel(birthDate, 'Stuttgart, Deutschland');
    
    // Create death event
    const deathDate = new DateModel();
    deathDate.parseDateString('ABT 1885-12-10');
    const death = new EventModel(deathDate, 'Munich, Deutschland');
    
    // Create christening event
    const christeningDate = new DateModel();
    christeningDate.parseDateString('1820-06-01');
    const christening = new EventModel(christeningDate, 'Stuttgart Parish, Deutschland');
    
    // Create burial event
    const burialDate = new DateModel();
    burialDate.parseDateString('1885-12-15');
    const burial = new EventModel(burialDate, 'Munich Cemetery, Deutschland');
    
    const families = [1, 2, 5];
    const references = ['REF001', 'Church Record 1820', 'Census 1850'];
    const source = 'Stuttgart Parish Records, Volume 3';
    
    const completePerson = new PersonModel(name, birth, death, christening, burial, families, references, source);
    
    console.log(`   isEmpty(): ${completePerson.isEmpty()}`);
    console.log(`   isValid(): ${completePerson.isValid()}`);
    console.log(`   toString(): "${completePerson.toString()}"`);
    console.log(`   Life Summary: "${completePerson.getLifeSummary()}"`);
    console.log(`   Birth GEDCOM: "${completePerson.getBirthDateGEDCOM()}"`);
    console.log(`   Death GEDCOM: "${completePerson.getDeathDateGEDCOM()}"`);
    console.log(`   Christening GEDCOM: "${completePerson.getChristeningDateGEDCOM()}"`);
    console.log(`   Burial GEDCOM: "${completePerson.getBurialDateGEDCOM()}"`);
    console.log(`   Birth Place Translated: "${completePerson.getBirthPlaceTranslated()}"`);
    console.log(`   Death Place Translated: "${completePerson.getDeathPlaceTranslated()}"`);
    console.log(`   Families: [${completePerson.getFamilies()}]`);
    console.log(`   References: [${completePerson.getReferences().map(r => `"${r}"`).join(', ')}]`);
    console.log(`   Source: "${completePerson.getSource()}"`);
    console.log(`   Is Deceased: ${completePerson.isDeceased()}`);
    console.log(`   Has Exact Birth Date: ${completePerson.hasExactBirthDate()}`);
    console.log(`   Has Exact Death Date: ${completePerson.hasExactDeathDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 3: Person with partial data
console.log('3. Person with Partial Data:');
try {
    const partialName = new NameModel('Mary', 'Johnson');
    const partialBirth = new EventModel();
    partialBirth.setPlace('Unknown Location');
    const partialFamilies = [3, 7];
    const partialSource = 'Family Bible';
    
    const partialPerson = new PersonModel(partialName, partialBirth, undefined, undefined, undefined, partialFamilies, undefined, partialSource);
    
    console.log(`   toString(): "${partialPerson.toString()}"`);
    console.log(`   Life Summary: "${partialPerson.getLifeSummary()}"`);
    console.log(`   Families: [${partialPerson.getFamilies()}]`);
    console.log(`   Source: "${partialPerson.getSource()}"`);
    console.log(`   Is Deceased: ${partialPerson.isDeceased()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 4: Using setter methods for new attributes
console.log('4. Using Setter Methods:');
try {
    const setPerson = new PersonModel();
    
    // Set name
    const setName = new NameModel('Elizabeth', 'Brown');
    setPerson.setName(setName);
    
    // Set death
    const setDeathDate = new DateModel();
    setDeathDate.parseDateString('BEF 1900-01-01');
    const setDeath = new EventModel(setDeathDate, 'London, England');
    setPerson.setDeath(setDeath);
    
    // Set families, references, and source
    setPerson.setFamilies([10, 20, 30]);
    setPerson.setReferences(['London Records', 'Family Tree', 'Death Certificate']);
    setPerson.setSource('London Parish Archives');
    
    console.log(`   After setting attributes: "${setPerson.toString()}"`);
    console.log(`   Death GEDCOM: "${setPerson.getDeathDateGEDCOM()}"`);
    console.log(`   Families: [${setPerson.getFamilies()}]`);
    console.log(`   References: [${setPerson.getReferences().map(r => `"${r}"`).join(', ')}]`);
    console.log(`   Source: "${setPerson.getSource()}"`);
    console.log(`   Is Deceased: ${setPerson.isDeceased()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 5: Add/Remove methods for families and references
console.log('5. Add/Remove Methods:');
const addRemovePerson = new PersonModel();
console.log(`   Initial families: [${addRemovePerson.getFamilies()}]`);
console.log(`   Initial references: [${addRemovePerson.getReferences()}]`);

// Add families
addRemovePerson.addFamily(1);
addRemovePerson.addFamily(2);
addRemovePerson.addFamily(1); // Duplicate should be ignored
console.log(`   After adding families: [${addRemovePerson.getFamilies()}]`);

// Add references
addRemovePerson.addReference('First Reference');
addRemovePerson.addReference('Second Reference');
addRemovePerson.addReference('First Reference'); // Duplicate should be ignored
console.log(`   After adding references: [${addRemovePerson.getReferences().map(r => `"${r}"`).join(', ')}]`);

// Remove items
addRemovePerson.removeFamily(1);
addRemovePerson.removeReference('First Reference');
console.log(`   After removing items: families=[${addRemovePerson.getFamilies()}], references=[${addRemovePerson.getReferences().map(r => `"${r}"`).join(', ')}]`);
console.log('');

// Test 6: Clone functionality with new attributes
console.log('6. Clone Tests with New Attributes:');
try {
    // Create original with all data
    const originalName = new NameModel('Hans', 'Mueller');
    const originalBirthDate = new DateModel();
    originalBirthDate.parseDateString('1850-01-01');
    const originalBirth = new EventModel(originalBirthDate, 'Berlin, Deutschland');
    
    const originalDeathDate = new DateModel();
    originalDeathDate.parseDateString('1920-12-31');
    const originalDeath = new EventModel(originalDeathDate, 'Hamburg, Deutschland');
    
    const originalFamilies = [1, 2, 3];
    const originalReferences = ['Ref1', 'Ref2'];
    const originalSource = 'Original Source';
    
    const originalPerson = new PersonModel(originalName, originalBirth, originalDeath, undefined, undefined, originalFamilies, originalReferences, originalSource);
    
    const clonedPerson = originalPerson.clone();
    
    console.log(`   Original: "${originalPerson.toString()}"`);
    console.log(`   Cloned: "${clonedPerson.toString()}"`);
    console.log(`   Are they the same object? ${originalPerson === clonedPerson}`);
    
    // Test independence by modifying clone
    clonedPerson.addFamily(99);
    clonedPerson.addReference('New Ref');
    clonedPerson.setSource('Modified Source');
    
    console.log(`   After modifying clone:`);
    console.log(`   Original families: [${originalPerson.getFamilies()}]`);
    console.log(`   Cloned families: [${clonedPerson.getFamilies()}]`);
    console.log(`   Original source: "${originalPerson.getSource()}"`);
    console.log(`   Cloned source: "${clonedPerson.getSource()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 7: Null/undefined handling for new attributes
console.log('7. Null/Undefined Handling:');
const nullPerson = new PersonModel(undefined, undefined, null, null, null, null, null, null);
console.log(`   Null constructor: "${nullPerson.toString()}"`);
console.log(`   isEmpty(): ${nullPerson.isEmpty()}`);
console.log(`   Families: [${nullPerson.getFamilies()}]`);
console.log(`   References: [${nullPerson.getReferences()}]`);
console.log(`   Source: "${nullPerson.getSource()}"`);
console.log('');

// Test 8: Life events with different combinations
console.log('8. Various Life Event Combinations:');
const testCases = [
    { name: 'Born only', events: ['birth'] },
    { name: 'Born and died', events: ['birth', 'death'] },
    { name: 'Born, christened, died', events: ['birth', 'christening', 'death'] },
    { name: 'Full life cycle', events: ['birth', 'christening', 'death', 'burial'] },
    { name: 'Death and burial only', events: ['death', 'burial'] }
];

testCases.forEach((testCase, index) => {
    try {
        const testName = new NameModel('Test', `Person${index + 1}`);
        let testBirth, testDeath, testChristening, testBurial;
        
        if (testCase.events.includes('birth')) {
            const birthDate = new DateModel();
            birthDate.parseDateString('1850-01-01');
            testBirth = new EventModel(birthDate, 'Birth Place');
        }
        
        if (testCase.events.includes('christening')) {
            const christeningDate = new DateModel();
            christeningDate.parseDateString('1850-01-15');
            testChristening = new EventModel(christeningDate, 'Church');
        }
        
        if (testCase.events.includes('death')) {
            const deathDate = new DateModel();
            deathDate.parseDateString('1920-12-31');
            testDeath = new EventModel(deathDate, 'Death Place');
        }
        
        if (testCase.events.includes('burial')) {
            const burialDate = new DateModel();
            burialDate.parseDateString('1921-01-05');
            testBurial = new EventModel(burialDate, 'Cemetery');
        }
        
        const testPerson = new PersonModel(testName, testBirth, testDeath, testChristening, testBurial);
        
        console.log(`   ${testCase.name}: "${testPerson.getLifeSummary()}"`);
    } catch (error) {
        console.log(`   ${testCase.name}: Error - ${error.message}`);
    }
});
console.log('');

console.log('=== Extended PersonModel Test Suite Complete ===');
