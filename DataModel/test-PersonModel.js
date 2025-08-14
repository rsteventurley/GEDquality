/**
 * Test file for PersonModel
 * Demonstrates various PersonModel functionality
 * 
 * Run with: node DataModel/test-PersonModel.js
 */

const PersonModel = require('./PersonModel');
const NameModel = require('./NameModel');
const EventModel = require('./EventModel');
const DateModel = require('./DateModel');

console.log('=== PersonModel Test Suite ===\n');

// Test 1: Empty PersonModel
console.log('1. Empty PersonModel Tests:');
const emptyPerson = new PersonModel();
console.log(`   isEmpty(): ${emptyPerson.isEmpty()}`);
console.log(`   isValid(): ${emptyPerson.isValid()}`);
console.log(`   toString(): "${emptyPerson.toString()}"`);
console.log(`   Name isEmpty(): ${emptyPerson.getName().isEmpty()}`);
console.log(`   Birth isEmpty(): ${emptyPerson.getBirth().isEmpty()}`);
console.log('');

// Test 2: Person with name only
console.log('2. Person with Name Only:');
const nameOnly = new NameModel('John', 'Smith');
const personNameOnly = new PersonModel(nameOnly);
console.log(`   isEmpty(): ${personNameOnly.isEmpty()}`);
console.log(`   isValid(): ${personNameOnly.isValid()}`);
console.log(`   toString(): "${personNameOnly.toString()}"`);
console.log(`   Genealogical Name: "${personNameOnly.getGenealogicalName()}"`);
console.log(`   Initials: "${personNameOnly.getInitials()}"`);
console.log('');

// Test 3: Person with birth only
console.log('3. Person with Birth Only:');
try {
    const birthDate = new DateModel();
    birthDate.parseDateString('1850-06-15');
    const birthEvent = new EventModel(birthDate, 'Boston, MA, USA');
    const personBirthOnly = new PersonModel(undefined, birthEvent);
    console.log(`   isEmpty(): ${personBirthOnly.isEmpty()}`);
    console.log(`   isValid(): ${personBirthOnly.isValid()}`);
    console.log(`   toString(): "${personBirthOnly.toString()}"`);
    console.log(`   Birth Date GEDCOM: "${personBirthOnly.getBirthDateGEDCOM()}"`);
    console.log(`   Birth Place: "${personBirthOnly.getBirthPlace()}"`);
    console.log(`   Has Exact Birth Date: ${personBirthOnly.hasExactBirthDate()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 4: Complete person with name and birth
console.log('4. Complete Person with Name and Birth:');
try {
    const fullName = new NameModel('Mary', 'Johnson');
    const birthDate = new DateModel();
    birthDate.parseDateString('ABT 1825-12-25');
    const birthEvent = new EventModel(birthDate, 'Philadelphia, PA, USA');
    const completePerson = new PersonModel(fullName, birthEvent);
    
    console.log(`   isEmpty(): ${completePerson.isEmpty()}`);
    console.log(`   isValid(): ${completePerson.isValid()}`);
    console.log(`   toString(): "${completePerson.toString()}"`);
    console.log(`   Genealogical Name: "${completePerson.getGenealogicalName()}"`);
    console.log(`   Birth Date GEDCOM: "${completePerson.getBirthDateGEDCOM()}"`);
    console.log(`   Birth Place: "${completePerson.getBirthPlace()}"`);
    console.log(`   Has Exact Birth Date: ${completePerson.hasExactBirthDate()}`);
    console.log(`   Initials: "${completePerson.getInitials()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 5: Person with German birth place
console.log('5. Person with German Birth Place:');
try {
    const germanName = new NameModel('Hans', 'Mueller');
    const germanBirthDate = new DateModel();
    germanBirthDate.parseDateString('1800-03-15');
    const germanBirth = new EventModel(germanBirthDate, 'Munich, Deutschland');
    const germanPerson = new PersonModel(germanName, germanBirth);
    
    console.log(`   toString(): "${germanPerson.toString()}"`);
    console.log(`   Birth Place: "${germanPerson.getBirthPlace()}"`);
    console.log(`   Birth Place Translated: "${germanPerson.getBirthPlaceTranslated()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 6: Setting attributes using setter methods
console.log('6. Using Setter Methods:');
try {
    const setterPerson = new PersonModel();
    
    // Set name
    const newName = new NameModel('Elizabeth', 'Brown');
    setterPerson.setName(newName);
    
    // Set birth
    const newBirthDate = new DateModel();
    newBirthDate.parseDateString('BET 1840-01-01 AND 1850-12-31');
    const newBirth = new EventModel(newBirthDate, 'London, England');
    setterPerson.setBirth(newBirth);
    
    console.log(`   After setting attributes: "${setterPerson.toString()}"`);
    console.log(`   Birth Date GEDCOM: "${setterPerson.getBirthDateGEDCOM()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 7: Clone functionality and independence
console.log('7. Clone Tests:');
try {
    const originalName = new NameModel('Robert', 'Wilson');
    const originalBirthDate = new DateModel();
    originalBirthDate.parseDateString('1875-07-04');
    const originalBirth = new EventModel(originalBirthDate, 'New York, NY, USA');
    const originalPerson = new PersonModel(originalName, originalBirth);
    
    const clonedPerson = originalPerson.clone();
    
    console.log(`   Original: "${originalPerson.toString()}"`);
    console.log(`   Cloned: "${clonedPerson.toString()}"`);
    console.log(`   Are they the same object? ${originalPerson === clonedPerson}`);
    console.log(`   Are names the same object? ${originalPerson.getName() === clonedPerson.getName()}`);
    console.log(`   Are births the same object? ${originalPerson.getBirth() === clonedPerson.getBirth()}`);
    
    // Modify clone to test independence
    const newCloneName = new NameModel('Bob', 'Wilson');
    clonedPerson.setName(newCloneName);
    
    console.log(`   After modifying clone name:`);
    console.log(`   Original: "${originalPerson.toString()}"`);
    console.log(`   Cloned: "${clonedPerson.toString()}"`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 8: Null and undefined handling in constructor
console.log('8. Null/Undefined Constructor Handling:');
const nullPerson = new PersonModel(null, null);
console.log(`   Null constructor: "${nullPerson.toString()}"`);
console.log(`   isEmpty(): ${nullPerson.isEmpty()}`);

const undefinedPerson = new PersonModel(undefined, undefined);
console.log(`   Undefined constructor: "${undefinedPerson.toString()}"`);
console.log(`   isEmpty(): ${undefinedPerson.isEmpty()}`);
console.log('');

// Test 9: Setting null values with setters
console.log('9. Setting Null with Setters:');
try {
    const setterNullPerson = new PersonModel();
    const testName = new NameModel('Test', 'Person');
    const testBirthDate = new DateModel();
    testBirthDate.parseDateString('1900-01-01');
    const testBirth = new EventModel(testBirthDate, 'Test Place');
    
    setterNullPerson.setName(testName);
    setterNullPerson.setBirth(testBirth);
    console.log(`   Before nulling: "${setterNullPerson.toString()}"`);
    
    setterNullPerson.setName(null);
    console.log(`   After setting name to null: "${setterNullPerson.toString()}"`);
    
    setterNullPerson.setBirth(null);
    console.log(`   After setting birth to null: "${setterNullPerson.toString()}"`);
    console.log(`   isEmpty(): ${setterNullPerson.isEmpty()}`);
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

// Test 10: Complex genealogical scenario
console.log('10. Complex Genealogical Scenario:');
try {
    // Create multiple people with various data completeness
    const people = [];
    
    // Person 1: Full data with approximate birth
    const person1Name = new NameModel('Johann', 'Schmidt');
    const person1BirthDate = new DateModel();
    person1BirthDate.parseDateString('ABT 1820-05-15');
    const person1Birth = new EventModel(person1BirthDate, 'Stuttgart, Deutschland');
    people.push(new PersonModel(person1Name, person1Birth));
    
    // Person 2: Name only
    const person2Name = new NameModel('Anna', 'Mueller');
    people.push(new PersonModel(person2Name));
    
    // Person 3: Birth date range with place
    const person3BirthDate = new DateModel();
    person3BirthDate.parseDateString('BET 1825-01-01 AND 1830-12-31');
    const person3Birth = new EventModel(person3BirthDate, 'Vienna, Österreich');
    people.push(new PersonModel(undefined, person3Birth));
    
    // Person 4: Surname only with exact birth
    const person4Name = new NameModel(undefined, 'Weber');
    const person4BirthDate = new DateModel();
    person4BirthDate.parseDateString('1835-09-22');
    const person4Birth = new EventModel(person4BirthDate, 'Bern, Schweiz');
    people.push(new PersonModel(person4Name, person4Birth));
    
    people.forEach((person, index) => {
        console.log(`   Person ${index + 1}: "${person.toString()}"`);
        console.log(`      Genealogical: "${person.getGenealogicalName()}"`);
        console.log(`      Birth GEDCOM: "${person.getBirthDateGEDCOM()}"`);
        console.log(`      Birth Place: "${person.getBirthPlace()}" -> "${person.getBirthPlaceTranslated()}"`);
        console.log(`      Exact Birth: ${person.hasExactBirthDate()}`);
        console.log(`      Initials: "${person.getInitials()}"`);
    });
    console.log('');
} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log('');
}

console.log('=== PersonModel Test Suite Complete ===');
