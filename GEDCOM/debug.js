const GedReader = require('./GedReader');

const reader = new GedReader();
const gedModel = reader.read('./test.ged');

console.log('All individuals in GEDCOM:');
for (const [id, individual] of Object.entries(gedModel.individuals)) {
    console.log(`  ${id}:`, individual.name ? individual.name.toString() : 'No name');
}

console.log('\nChecking conversion for each individual:');
for (const [id, individual] of Object.entries(gedModel.individuals)) {
    try {
        const personModel = individual.toPersonModel();
        const numericId = parseInt(id.slice(2, -2)); // @I1@ -> 1
        console.log(`  ${id} -> ${numericId}: ${personModel.name.toString()}`);
    } catch (error) {
        console.log(`  ${id}: Conversion failed -`, error.message);
    }
}

console.log('\nFull toPageModel conversion:');
try {
    const pageModel = gedModel.toPageModel();
    console.log('People in PageModel:', Object.keys(pageModel.people));
    console.log('Families in PageModel:', Object.keys(pageModel.families));
} catch (error) {
    console.log('toPageModel failed:', error.message);
}
