# LLMquality
Compare a GEDCOM file from RootsMagic and an XML file from Claude for data
extracted from German Ortssippenbücher. The RootsMagic GEDCOM file is designed
to be a Ground Truth file and the XML file an attempt by the LLM to ingest
the data from the book.

## Author
Steve Turley, rsturley@churchofjesuschrist.org, rsteventurley@gmail.com

## Modules

### DataModel Library

A comprehensive library for handling genealogical data models, including date parsing and event modeling for GEDCOM and XML files.

#### Features

- **DateModel**: ISO 8601 date parsing with genealogical qualifiers
- **EventModel**: Genealogical event modeling with dates and places
- **NameModel**: Personal name handling with given name and surname
- **PersonModel**: Complete person modeling with name and birth information
- **Place Translation**: German country names translated to English (Deutschland→Germany, Schweiz→Switzerland, etc.)
- Validation for dates between 1400-2000
- Support for approximate dates (ABT), before/after dates (BEF/AFT), and date ranges (BET...AND)
- Multiple output formats: GEDCOM, ISO 8601, and custom DD.MM.YYYY format
- Comprehensive error handling and validation

#### Usage

```javascript
const { DateModel, EventModel, NameModel, PersonModel, FamilyModel, EntryModel } = require('./DataModel');

// DateModel examples
const date = new DateModel();
date.setDate('1995-12-25');
console.log(date.toString()); // "Normal 25.12.1995"
console.log(date.toGEDCOM()); // "25 DEC 1995"

// EventModel examples - various constructor options
const emptyEvent = new EventModel(); // Empty event

// Create DateModel first, then pass to EventModel
const dateModel = new DateModel();
dateModel.parseDateString('1995-12-25');
const dateEvent = new EventModel(dateModel); // DateModel only

const placeEvent = new EventModel(undefined, 'Boston, MA'); // Place only

// Both DateModel and place
const approxDate = new DateModel();
approxDate.parseDateString('ABT 1850-06-15');
const fullEvent = new EventModel(approxDate, 'Boston, MA, USA');
console.log(fullEvent.toString()); // "About 15.06.1850 Boston, MA, USA"

// NameModel examples
const emptyName = new NameModel(); // Empty name
const fullName = new NameModel('John', 'Smith'); // Both names
const givenOnly = new NameModel('Mary'); // Given name only
const surnameOnly = new NameModel(undefined, 'Johnson'); // Surname only

console.log(fullName.toString()); // "John Smith"
console.log(fullName.toGenealogicalFormat()); // "Smith, John"
console.log(fullName.getInitials()); // "JS"

// PersonModel examples
const emptyPerson = new PersonModel(); // Empty person
const personName = new NameModel('Hans', 'Mueller');
const personBirthDate = new DateModel();
personBirthDate.parseDateString('ABT 1820-05-15');
const personBirth = new EventModel(personBirthDate, 'Stuttgart, Deutschland');

// Create death event
const personDeathDate = new DateModel();
personDeathDate.parseDateString('1885-12-10');
const personDeath = new EventModel(personDeathDate, 'Munich, Deutschland');

const families = [1, 2, 5];
const references = ['Church Record 1820', 'Census 1850'];
const source = 'Stuttgart Parish Records';

const completePerson = new PersonModel(personName, personBirth, personDeath, undefined, undefined, families, references, source);

console.log(completePerson.toString()); // "Hans Mueller born About 15.05.1820 Stuttgart, Deutschland died Normal 10.12.1885 Munich, Deutschland"
console.log(completePerson.getLifeSummary()); // Full life summary with all events
console.log(completePerson.getBirthPlaceTranslated()); // "Stuttgart, Germany"
console.log(completePerson.isDeceased()); // true

// Event matching between persons
const person1 = new PersonModel(new NameModel('John', 'Smith'), personBirth);
const person2 = new PersonModel(new NameModel('Jane', 'Doe'), personBirth); // Same birth event
console.log(person1.eventMatch(person2)); // true - birth events match

// Check if ALL events match or are empty
const person3 = new PersonModel(new NameModel('John', 'Smith'), personBirth, personDeath);
const person4 = new PersonModel(new NameModel('Jane', 'Doe'), personBirth, personDeath); // Same birth and death events
console.log(person3.eventsMatch(person4)); // true - all events match

const person5 = new PersonModel(new NameModel('Empty', 'Person')); // No events
const person6 = new PersonModel(new NameModel('Also Empty', 'Person')); // No events  
console.log(person5.eventsMatch(person6)); // true - both empty

const person7 = new PersonModel(new NameModel('Different', 'Death'), personBirth);
// person7 has birth but no death, person3 has both birth and death
console.log(person3.eventsMatch(person7)); // false - events don't all match

// FamilyModel examples
const emptyFamily = new FamilyModel(); // Empty family
const marriageDate = new DateModel();
marriageDate.parseDateString('1875-06-15');
const marriageEvent = new EventModel(marriageDate, 'St. Mary\'s Church, Boston');
const children = [3, 4, 5]; // Person IDs for children

const completeFamily = new FamilyModel(1, 2, children, marriageEvent); // husband, wife, children, marriage
console.log(completeFamily.toString()); // "Husband: 1, Wife: 2, Children: 3 (3, 4, 5), Married: Normal 15.06.1875 St. Mary's Church, Boston"
console.log(completeFamily.getMarriagePlace()); // "St. Mary's Church, Boston"
console.log(completeFamily.hasExactMarriageDate()); // true

// Fill missing marriage place for exact dates
const marriageDateOnly = new DateModel();
marriageDateOnly.parseDateString('1880-09-10');
const marriageWithoutPlace = new EventModel(marriageDateOnly, ''); // No place
const familyToFill = new FamilyModel(10, 11, [12], marriageWithoutPlace);

console.log('Before fillMarriage:', familyToFill.getMarriage().toString()); // "Normal 10.09.1880"
familyToFill.fillMarriage('Trinity Church, New York');
console.log('After fillMarriage:', familyToFill.getMarriage().toString()); // "Normal 10.09.1880 Trinity Church, New York"

// EntryModel examples - genealogical entries with people, families, and relationships
const entry = new EntryModel('entry-001');

// Add people to the entry
const father = new PersonModel(new NameModel('John', 'Smith'));
const mother = new PersonModel(new NameModel('Mary', 'Smith'));
const child = new PersonModel(new NameModel('Tom', 'Smith'));

entry.addPerson(1, 'john-smith-001', father);
entry.addPerson(2, 'mary-smith-002', mother);
entry.addPerson(3, 'tom-smith-003', child);

// Add family relationships
const family = new FamilyModel(1, 2, [3]); // John, Mary, Tom
entry.addFamily(1, family);

console.log(entry.toString()); // "<Entry: entry-001 - 3 people, 1 families>"

// Cross-reference people by UID
console.log(entry.crossReference('john-smith-001')); // 1
console.log(entry.crossReference('not-found')); // -1

// Get relationship strings
console.log(entry.getRelationship(1)); // "0" (trunk person)
console.log(entry.getRelationship(2)); // "0W" (wife of trunk)
console.log(entry.getRelationship(3)); // "0C" (child of trunk)

// Add unrelated family (separate tree)
const uncle = new PersonModel(new NameModel('Bob', 'Jones'));
const aunt = new PersonModel(new NameModel('Sue', 'Jones'));
entry.addPerson(4, 'bob-jones-004', uncle);
entry.addPerson(5, 'sue-jones-005', aunt);

const unrelatedFamily = new FamilyModel(4, 5, []);
entry.addFamily(2, unrelatedFamily);

console.log(entry.getRelationship(4)); // "1" (trunk of second tree)
console.log(entry.getRelationship(5)); // "1W" (wife in second tree)

// Using setter methods (still available)
const event = new EventModel();
event.setDate('ABT 1850-06-15'); // This uses parseDateString internally
event.setPlace('Boston, MA, USA');

// Place translation for German genealogical records
const germanEvent = new EventModel();
germanEvent.setPlace('Munich, Deutschland');
console.log(germanEvent.getPlace()); // "Munich, Deutschland"
console.log(germanEvent.translatePlace()); // "Munich, Germany"

// Fill missing places for events with exact dates
const dateWithoutPlace = new DateModel();
dateWithoutPlace.parseDateString('1875-05-10');
const eventWithoutPlace = new EventModel(dateWithoutPlace, ''); // No place
const personToFill = new PersonModel(new NameModel('John', 'Smith'), eventWithoutPlace);

console.log('Before fillEvents:', personToFill.birth.toString()); // "Normal 10.05.1875"
personToFill.fillEvents('Chicago, Illinois');
console.log('After fillEvents:', personToFill.birth.toString()); // "Normal 10.05.1875 Chicago, Illinois"
```

#### Available Classes

- **DateModel**: Core date handling with validation and multiple format support
- **EventModel**: Event modeling combining DateModel with place information
- **NameModel**: Personal name handling with given name and surname components
- **PersonModel**: Complete person modeling with name, birth, death, christening, burial, families, references, and source information
  - `eventMatch(otherPerson)`: Returns true if at least one non-empty event matches between two PersonModel instances
  - `eventsMatch(otherPerson)`: Returns true if all events are either empty or match exactly between two PersonModel instances
  - `fillEvents(place)`: Sets the place for events that have exact dates but no place information
- **FamilyModel**: Family modeling with husband, wife, children, and marriage information
  - `fillMarriage(place)`: Sets the place for marriage event if it has an exact date but no place information
- **EntryModel**: Complete genealogical entry management with people, families, and relationship calculations
  - `addPerson(personId, uid, person)`: Adds a person with unique ID and UID checking
  - `addFamily(familyId, family)`: Adds a family and updates related people's family lists
  - `crossReference(uid)`: Returns person ID for a given UID, or -1 if not found
  - `getRelationship(personId)`: Returns relationship string with automatic tree calculation
- Future classes may include: PlaceModel, SourceModel

#### Testing

Run the test files to verify functionality:

```bash
node DataModel/test-DateModel.js
node DataModel/test-EventModel.js
node DataModel/test-NameModel.js
node DataModel/test-PersonModel.js
node DataModel/test-PersonModel-eventMatch.js
node DataModel/test-PersonModel-eventsMatch.js
node DataModel/test-PersonModel-fillEvents.js
node DataModel/test-FamilyModel.js
node DataModel/test-EntryModel.js
```
