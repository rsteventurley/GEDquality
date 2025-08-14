/**
 * Example usage of GedReader and GedModel
 * Demonstrates how to read and parse GEDCOM files
 */

const { GedReader, GedModel } = require('./index.js');
const path = require('path');

console.log('=== GEDCOM Reader Usage Example ===\n');

// Create a new reader
const reader = new GedReader();

try {
    // Read and parse a GEDCOM file
    const gedModel = reader.read('./test.ged');
    
    console.log('Successfully parsed GEDCOM file!');
    console.log(`Result: ${gedModel.toString()}\n`);
    
    // Get statistics
    const stats = reader.getStatistics();
    console.log('File Statistics:');
    Object.entries(stats).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
    console.log('');
    
    // Example: Find all individuals with sources
    console.log('Individuals with sources:');
    const individuals = gedModel.getIndividuals();
    for (const [id, individual] of Object.entries(individuals)) {
        const sources = individual.children.filter(child => child.tag === 'SOUR');
        if (sources.length > 0) {
            const nameRecord = individual.children.find(child => child.tag === 'NAME');
            const name = nameRecord ? nameRecord.value : 'Unknown';
            
            console.log(`  ${id}: ${name}`);
            sources.forEach(source => {
                console.log(`    Source: ${source.value}`);
                if (source.page) console.log(`    Page: ${source.page}`);
                if (source.quality) console.log(`    Quality: ${source.quality}`);
            });
        }
    }
    
} catch (error) {
    console.error(`Error: ${error.message}`);
}

console.log('\n=== Example Complete ===');
