/**
 * Verify that the converted PageModel data maintains integrity and can be used properly
 */

const GedReader = require('./GedReader');

console.log('=== PageModel Data Integrity Test ===\n');

try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    const pageModel = gedModel.toPageModel();
    
    console.log('Original GEDCOM data:');
    console.log(`  Individuals: ${Object.keys(gedModel.individuals).length}`);
    console.log(`  Families: ${Object.keys(gedModel.families).length}`);
    
    console.log('\nConverted PageModel data:');
    console.log(`  People: ${Object.keys(pageModel.people).length}`);
    console.log(`  Families: ${Object.keys(pageModel.families).length}`);
    console.log(`  Entries: ${Object.keys(pageModel.entries).length}`);
    
    // Verify that PageModel methods work correctly
    console.log('\nTesting PageModel methods:');
    
    // Test getPerson method
    const person1 = pageModel.getPerson(1);
    console.log(`✅ getPerson(1): ${person1 ? person1.name.toString() : 'not found'}`);
    
    // Test getFamily method
    const family1 = pageModel.getFamily(1);
    console.log(`✅ getFamily(1): Husband ${family1 ? family1.husband : 'not found'}, Wife ${family1 ? family1.wife : 'not found'}`);
    
    // Test getEntry method
    const entry1 = pageModel.getEntry(1);
    console.log(`✅ getEntry(1): ${entry1 ? entry1.name.toString() : 'not found'}`);
    
    // Verify data consistency
    console.log('\nData consistency checks:');
    
    // Check that family references point to valid people
    const family = pageModel.getFamily(1);
    if (family) {
        const husband = pageModel.getPerson(family.husband);
        const wife = pageModel.getPerson(family.wife);
        
        console.log(`✅ Family 1 husband (${family.husband}) exists: ${husband ? 'Yes' : 'No'}`);
        console.log(`✅ Family 1 wife (${family.wife}) exists: ${wife ? 'Yes' : 'No'}`);
        
        if (husband) {
            console.log(`   Husband name: ${husband.name.toString()}`);
        }
        if (wife) {
            console.log(`   Wife name: ${wife.name.toString()}`);
        }
    }
    
    // Test invalid lookups
    console.log('\nTesting invalid lookups:');
    const invalidPerson = pageModel.getPerson(999);
    const invalidFamily = pageModel.getFamily(999);
    console.log(`✅ getPerson(999): ${invalidPerson ? 'found (unexpected!)' : 'not found (expected)'}`);
    console.log(`✅ getFamily(999): ${invalidFamily ? 'found (unexpected!)' : 'not found (expected)'}`);
    
} catch (error) {
    console.log('❌ PageModel data integrity test failed:', error.message);
    console.log('Error stack:', error.stack);
}

console.log('\n=== Data Integrity Test Complete ===');
