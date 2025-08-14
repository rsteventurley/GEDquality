/**
 * Test the new parsing with a GEDCOM file that includes Cref events
 */

const GedReader = require('./GedReader');

console.log('Testing GEDCOM parsing with Cref events...\n');

try {
    const reader = new GedReader();
    const gedModel = reader.read('./test-cref.ged');
    
    console.log('=== INDIVIDUALS WITH CREF EVENTS ===');
    const individuals = gedModel.getIndividuals();
    Object.entries(individuals).forEach(([id, individual]) => {
        console.log(`ID: ${id}`);
        console.log(`  Name: ${individual.getName().getFormattedName()}`);
        console.log(`  Gender: ${individual.getGender()}`);
        console.log(`  Source (PAGE): ${individual.getSource() || 'None'}`);
        console.log(`  References (Cref events): [${individual.getReferences().join(', ')}]`);
        console.log(`  Birth: ${individual.getBirth().getDate()}`);
        console.log('');
    });
    
    console.log('Test completed successfully!');
    
} catch (error) {
    console.error('Error:', error.message);
}
