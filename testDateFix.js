const GedReader = require('./GEDCOM/GedReader');

console.log('=== Testing Date Parsing Fix ===\n');

try {
    const reader = new GedReader();
    const gedModel = reader.read('./data/Tannenkirch.000.ged');
    const pageModel = gedModel.toPageModel();

    // Check a few specific people
    const person1 = pageModel.people[1];
    console.log('Person 1:', person1.name.toString());
    console.log('  Birth:', person1.birth.toString());
    console.log('  Death:', person1.death.toString());

    const person2 = pageModel.people[2];
    console.log('\nPerson 2:', person2.name.toString());
    console.log('  Birth:', person2.birth.toString());
    console.log('  Death:', person2.death.toString());

    // Check a family marriage date
    const family1 = pageModel.families[1];
    console.log('\nFamily 1:');
    console.log('  Marriage:', family1.marriage.toString());

    console.log('\n✅ Date parsing test complete!');

} catch (error) {
    console.error('❌ Error:', error.message);
}
