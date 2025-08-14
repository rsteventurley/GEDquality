/**
 * GEDCOM to PageModel Summary Script
 * 
 * Reads the Tannenkirch.000.ged file using GedReader and converts it to a PageModel.
 * Provides a summary including people count, family count, entry IDs, 
 * and detailed list of people with their references.
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const GedReader = require('./GEDCOM/GedReader');

console.log('=== GEDCOM to PageModel Summary ===\n');

try {
    // Read and convert GEDCOM file
    const reader = new GedReader();
    const gedModel = reader.read('./data/Tannenkirch.000.ged');
    const pageModel = gedModel.toPageModel();
    
    // === SUMMARY STATISTICS ===
    console.log('📊 SUMMARY STATISTICS:');
    console.log(`   Number of people: ${Object.keys(pageModel.people).length}`);
    console.log(`   Number of families: ${Object.keys(pageModel.families).length}`);
    console.log(`   Number of entries: ${Object.keys(pageModel.entries).length}`);
    
    // === ENTRY IDs ===
    const entryIds = Object.keys(pageModel.entries);
    console.log(`\n📋 ENTRY IDs: [${entryIds.sort().join(', ')}]`);
    
    // === PEOPLE WITH REFERENCES ===
    console.log('\n👥 ALL PEOPLE WITH THEIR REFERENCES:');
    
    const sortedPeopleIds = Object.keys(pageModel.people).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const personId of sortedPeopleIds) {
        const person = pageModel.people[personId];
        const referencesDisplay = person.references.length > 0 ? 
            `[${person.references.join(', ')}]` : 
            '[No references]';
        
        console.log(`   ID ${personId}: ${person.name.toString()}`);
        console.log(`      Source: "${person.source}"`);
        console.log(`      References: ${referencesDisplay}`);
        
        // Add birth/death info if available
        if (!person.birth.isEmpty()) {
            console.log(`      Birth: ${person.birth.toString()}`);
        }
        if (!person.death.isEmpty()) {
            console.log(`      Death: ${person.death.toString()}`);
        }
        console.log(''); // Empty line for readability
    }
    
    // === REFERENCE STATISTICS ===
    let peopleWithReferences = 0;
    let totalReferences = 0;
    
    for (const person of Object.values(pageModel.people)) {
        if (person.references.length > 0) {
            peopleWithReferences++;
            totalReferences += person.references.length;
        }
    }
    
    console.log('📈 REFERENCE STATISTICS:');
    console.log(`   People with references: ${peopleWithReferences} of ${Object.keys(pageModel.people).length}`);
    console.log(`   Total references: ${totalReferences}`);
    console.log(`   People with no references: ${Object.keys(pageModel.people).length - peopleWithReferences}`);
    
    console.log('\n✅ Processing complete!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
