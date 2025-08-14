#!/usr/bin/env node

const GedReader = require('./GedReader');
const path = require('path');

function testEnhancedGedcom() {
    console.log('Testing Enhanced GEDCOM Processing');
    console.log('===================================\n');

    try {
        const gedReader = new GedReader();
        const testFile = path.join(__dirname, 'enhanced-test.ged');
        
        console.log(`Reading GEDCOM file: ${testFile}`);
        gedReader.read(testFile);
        
        console.log('File parsed successfully!\n');
        
        // Get statistics
        const stats = gedReader.getStatistics();
        console.log('File Statistics:');
        console.log(`- Individuals: ${stats.individuals}`);
        console.log(`- Families: ${stats.families}`);
        console.log(`- Sources: ${stats.sources}\n`);
        
        // Test individual processing
        console.log('Individual Processing Test:');
        console.log('=========================');
        
        const individuals = gedReader.gedModel.getIndividuals();
        for (const [id, individual] of Object.entries(individuals)) {
            console.log(`\nIndividual: ${id}`);
            
            // Show names
            if (individual.names && individual.names.length > 0) {
                console.log('Names:');
                individual.names.forEach((name, index) => {
                    console.log(`  ${index + 1}. ${name.getFormattedName()}`);
                    console.log(`     Given: ${name.getGivenName()}`);
                    console.log(`     Surname: ${name.getSurname()}`);
                    const prefix = name.getNamePrefix();
                    const suffix = name.getNameSuffix();
                    if (prefix && prefix.trim()) console.log(`     Prefix: ${prefix}`);
                    if (suffix && suffix.trim()) console.log(`     Suffix: ${suffix}`);
                });
            }
            
            // Show events
            if (individual.events && individual.events.length > 0) {
                console.log('Events:');
                individual.events.forEach((event, index) => {
                    console.log(`  ${index + 1}. ${event.getType()}`);
                    if (event.hasDate()) console.log(`     Date: ${event.getDate()}`);
                    if (event.hasPlace()) console.log(`     Place: ${event.getPlace()}`);
                    if (event.getSources().length > 0) {
                        console.log(`     Sources: ${event.getSources().length}`);
                    }
                    if (event.getNotes().length > 0) {
                        console.log(`     Notes: ${event.getNotes().length}`);
                    }
                });
            }
            
            // Show cref events
            if (individual.crefs && individual.crefs.length > 0) {
                console.log('Cref Events:');
                individual.crefs.forEach((cref, index) => {
                    console.log(`  ${index + 1}. ${cref}`);
                });
            }
            
            // Only show first individual for brevity
            break;
        }
        
        // Test family processing
        console.log('\n\nFamily Processing Test:');
        console.log('======================');
        
        const families = gedReader.gedModel.getFamilies();
        for (const [id, family] of Object.entries(families)) {
            console.log(`\nFamily: ${id}`);
            
            // Show marriage events
            if (family.events && family.events.length > 0) {
                console.log('Marriage Events:');
                family.events.forEach((event, index) => {
                    console.log(`  ${index + 1}. ${event.getType()}`);
                    if (event.hasDate()) console.log(`     Date: ${event.getDate()}`);
                    if (event.hasPlace()) console.log(`     Place: ${event.getPlace()}`);
                    if (event.getSources().length > 0) {
                        console.log(`     Sources: ${event.getSources().length}`);
                    }
                });
            }
            
            // Only show first family for brevity
            break;
        }
        
        console.log('\n✅ Enhanced GEDCOM processing test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during enhanced GEDCOM test:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the test
testEnhancedGedcom();
