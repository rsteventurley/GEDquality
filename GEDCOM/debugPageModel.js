const GedReader = require('./GedReader');

const reader = new GedReader();
const gedModel = reader.read('./test.ged');

console.log('=== Debugging toPageModel ===');

console.log('\nIndividuals in gedModel.individuals:');
for (const [gedcomId, individual] of Object.entries(gedModel.individuals)) {
    console.log(`  ${gedcomId}: ${individual.constructor.name} - ${individual.name ? individual.name.toString() : 'No name'}`);
    
    // Check if it's a GedIndividual instance
    const GedIndividual = require('./GedIndividual');
    const isInstance = individual instanceof GedIndividual;
    console.log(`    instanceof GedIndividual: ${isInstance}`);
    
    // Check ID extraction
    const match = gedcomId.match(/@I(\d+)@/);
    if (match) {
        const personId = parseInt(match[1]);
        console.log(`    Extracted ID: ${personId}`);
        
        if (isInstance) {
            try {
                const personModel = individual.toPersonModel();
                console.log(`    PersonModel created: ${personModel.name.toString()}`);
            } catch (error) {
                console.log(`    PersonModel creation failed: ${error.message}`);
            }
        }
    } else {
        console.log(`    ID extraction failed for: ${gedcomId}`);
    }
}

console.log('\n=== Running toPageModel with verbose output ===');

// Create PageModel with some manual debugging
const PageModel = require('../DataModel/PageModel');
const pageModel = new PageModel();
const GedIndividual = require('./GedIndividual');

let addedCount = 0;
for (const [gedcomId, individual] of Object.entries(gedModel.individuals)) {
    console.log(`\nProcessing ${gedcomId}...`);
    
    if (individual instanceof GedIndividual) {
        console.log(`  ✓ Is GedIndividual instance`);
        
        const match = gedcomId.match(/@I(\d+)@/);
        if (match) {
            const personId = parseInt(match[1]);
            console.log(`  ✓ Extracted ID: ${personId}`);
            
            try {
                const personModel = individual.toPersonModel();
                console.log(`  ✓ Created PersonModel: ${personModel.name.toString()}`);
                
                pageModel.addPerson(personModel, personId);
                console.log(`  ✓ Added to PageModel successfully`);
                addedCount++;
                
            } catch (error) {
                console.log(`  ✗ Failed to add: ${error.message}`);
                console.log(`  Stack: ${error.stack}`);
            }
        } else {
            console.log(`  ✗ ID extraction failed`);
        }
    } else {
        console.log(`  ✗ Not a GedIndividual instance (${individual.constructor.name})`);
    }
}

console.log(`\nTotal added: ${addedCount}`);
console.log(`PageModel people: ${Object.keys(pageModel.people).length}`);
