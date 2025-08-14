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
const { DateModel, EventModel, NameModel, PersonModel } = require('./DataModel');

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
- Future classes may include: PlaceModel, SourceModel, FamilyModel

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
```
