const GedReader = require('./GedReader');

const reader = new GedReader();
const gedModel = reader.read('./test.ged');

console.log('=== Checking Person Sources ===');

for (const [gedcomId, individual] of Object.entries(gedModel.individuals)) {
    console.log(`\n${gedcomId}: ${individual.name.toString()}`);
    console.log(`  source attribute: "${individual.source}"`);
    
    const personModel = individual.toPersonModel();
    console.log(`  PersonModel source: "${personModel.source}"`);
    console.log(`  PersonModel getSource(): "${personModel.getSource()}"`);
    
    // Check if getSource() returns a valid entry ID
    const entryId = personModel.getSource();
    console.log(`  Valid entry ID: ${entryId && entryId !== ''}`);
}
