/**
 * Demonstration script showing GedIndividual and GedFamily in action
 * Reads a real GEDCOM file and converts it to model objects
 */

const fs = require('fs');
const GedReader = require('./GedReader');
const GedModel = require('./GedModel');

console.log('GEDCOM to Model Conversion Demonstration\n');

try {
    // Read and parse the test GEDCOM file
    console.log('Reading and parsing test.ged file...');
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    console.log('GEDCOM file parsed successfully!\n');
    
    // Display summary
    const summary = gedModel.getSummary();
    console.log('=== GEDCOM SUMMARY ===');
    console.log(`Individuals: ${summary.individuals}`);
    console.log(`Families: ${summary.families}`);
    console.log(`Sources: ${summary.sources}`);
    console.log(`Notes: ${summary.notes}`);
    console.log(`Submitters: ${summary.submitters}`);
    console.log(`Repositories: ${summary.repositories}`);
    console.log('');
    
    // Display individuals as models
    console.log('=== INDIVIDUALS (as GedIndividual objects) ===');
    const individuals = gedModel.getIndividuals();
    Object.entries(individuals).forEach(([id, individual]) => {
        console.log(`ID: ${id}`);
        console.log(`  Type: ${individual.constructor.name}`);
        console.log(`  Name: ${individual.getName().getFormattedName()}`);
        console.log(`  Gender: ${individual.getGender() || 'Unknown'}`);
        
        const birth = individual.getBirth();
        if (!birth.isEmpty()) {
            console.log(`  Birth: ${birth.getDate()} ${birth.getPlace() ? 'at ' + birth.getPlace() : ''}`);
        }
        
        const death = individual.getDeath();
        if (!death.isEmpty()) {
            console.log(`  Death: ${death.getDate()} ${death.getPlace() ? 'at ' + death.getPlace() : ''}`);
        }
        
        const christening = individual.getChristening();
        if (!christening.isEmpty()) {
            console.log(`  Christening: ${christening.getDate()} ${christening.getPlace() ? 'at ' + christening.getPlace() : ''}`);
        }
        
        const burial = individual.getBurial();
        if (!burial.isEmpty()) {
            console.log(`  Burial: ${burial.getDate()} ${burial.getPlace() ? 'at ' + burial.getPlace() : ''}`);
        }
        
        if (individual.getSource()) {
            console.log(`  Source: ${individual.getSource()}`);
        }
        
        const references = individual.getReferences();
        if (references.length > 0) {
            console.log(`  References: ${references.join(', ')}`);
        }
        
        console.log(`  Summary: ${individual.toString()}`);
        console.log('');
    });
    
    // Display families as models
    console.log('=== FAMILIES (as GedFamily objects) ===');
    const families = gedModel.getFamilies();
    Object.entries(families).forEach(([id, family]) => {
        console.log(`ID: ${id}`);
        console.log(`  Type: ${family.constructor.name}`);
        console.log(`  Father ID: ${family.getFather() || 'None'}`);
        console.log(`  Mother ID: ${family.getMother() || 'None'}`);
        
        const children = family.getChildren();
        if (children.length > 0) {
            console.log(`  Children IDs: [${children.join(', ')}]`);
        } else {
            console.log(`  Children: None`);
        }
        
        const marriage = family.getMarriage();
        if (!marriage.isEmpty()) {
            console.log(`  Marriage: ${marriage.getDate()} ${marriage.getPlace() ? 'at ' + marriage.getPlace() : ''}`);
        }
        
        console.log(`  Summary: ${family.toString()}`);
        console.log('');
    });
    
    // Test numeric ID access
    console.log('=== NUMERIC ID ACCESS ===');
    const individual1 = gedModel.getIndividualByNumericId(1);
    if (individual1) {
        console.log(`Individual with numeric ID 1: ${individual1.getName().getFormattedName()}`);
    } else {
        console.log('No individual found with numeric ID 1');
    }
    
    const family1 = gedModel.getFamilyByNumericId(1);
    if (family1) {
        console.log(`Family with numeric ID 1: ${family1.toString()}`);
    } else {
        console.log('No family found with numeric ID 1');
    }
    
    console.log('\nDemonstration completed successfully!');
    
} catch (error) {
    console.error('Error during demonstration:', error.message);
    console.error('Make sure test.ged exists and is properly formatted.');
}
