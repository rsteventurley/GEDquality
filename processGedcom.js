/**
 * GEDCOM to PageModel Processor
 * 
 * This script reads a GEDCOM file using the GedReader class,
 * converts it to a PageModel object, and prints a detailed summary
 * of the contents including people, families, entries, and references.
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const path = require('path');
const GedReader = require('./GEDCOM/GedReader');

// Path to the GEDCOM file
const gedcomFilePath = './data/Tannenkirch.000.ged';

console.log('=== GEDCOM to PageModel Processor ===\n');

try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(gedcomFilePath)) {
        console.error(`❌ GEDCOM file not found: ${gedcomFilePath}`);
        process.exit(1);
    }

    console.log(`📖 Reading GEDCOM file: ${gedcomFilePath}`);
    
    // Read the GEDCOM file
    const reader = new GedReader();
    const gedModel = reader.read(gedcomFilePath);
    
    console.log(`✅ GEDCOM file parsed successfully`);
    console.log(`   Raw individuals: ${Object.keys(gedModel.individuals).length}`);
    console.log(`   Raw families: ${Object.keys(gedModel.families).length}`);
    
    // Convert to PageModel
    console.log('\n🔄 Converting to PageModel...');
    const pageModel = gedModel.toPageModel();
    console.log('✅ PageModel created successfully\n');
    
    // === SUMMARY REPORT ===
    console.log('=== PageModel Summary Report ===\n');
    
    // 1. Count of people
    const peopleCount = Object.keys(pageModel.people).length;
    console.log(`👥 Number of people: ${peopleCount}`);
    
    // 2. Count of families
    const familiesCount = Object.keys(pageModel.families).length;
    console.log(`👨‍👩‍👧‍👦 Number of families: ${familiesCount}`);
    
    // 3. List of entry IDs
    const entryIds = Object.keys(pageModel.entries);
    console.log(`📋 Number of entries: ${entryIds.length}`);
    console.log(`📋 Entry IDs: [${entryIds.join(', ')}]`);
    
    // 4. Detailed people information with references
    console.log('\n=== People Details ===');
    
    if (peopleCount === 0) {
        console.log('No people found in PageModel (no individuals with source citations)');
    } else {
        const sortedPeopleIds = Object.keys(pageModel.people).sort((a, b) => parseInt(a) - parseInt(b));
        
        for (const personId of sortedPeopleIds) {
            const person = pageModel.people[personId];
            
            console.log(`\n👤 Person ID ${personId}:`);
            console.log(`   Name: ${person.name.toString()}`);
            console.log(`   Birth: ${person.birth.toString()}`);
            console.log(`   Death: ${person.death.toString()}`);
            console.log(`   Source: "${person.source}"`);
            console.log(`   References: [${person.references.join(', ')}]`);
            console.log(`   Family IDs: [${person.families.join(', ')}]`);
            console.log(`   Gender: ${person.gender}`);
            
            // Additional event details
            if (!person.christening.isEmpty()) {
                console.log(`   Christening: ${person.christening.toString()}`);
            }
            if (!person.burial.isEmpty()) {
                console.log(`   Burial: ${person.burial.toString()}`);
            }
        }
    }
    
    // 5. Family details
    console.log('\n=== Family Details ===');
    
    if (familiesCount === 0) {
        console.log('No families found in PageModel');
    } else {
        const sortedFamilyIds = Object.keys(pageModel.families).sort((a, b) => parseInt(a) - parseInt(b));
        
        for (const familyId of sortedFamilyIds) {
            const family = pageModel.families[familyId];
            
            console.log(`\n👨‍👩‍👧‍👦 Family ID ${familyId}:`);
            console.log(`   Husband: ${family.husband !== null ? family.husband : 'None'}`);
            console.log(`   Wife: ${family.wife !== null ? family.wife : 'None'}`);
            console.log(`   Children: [${family.children.join(', ')}]`);
            console.log(`   Marriage: ${family.marriage.toString()}`);
            
            // Cross-reference with people
            if (family.husband && pageModel.people[family.husband]) {
                console.log(`   Husband name: ${pageModel.people[family.husband].name.toString()}`);
            }
            if (family.wife && pageModel.people[family.wife]) {
                console.log(`   Wife name: ${pageModel.people[family.wife].name.toString()}`);
            }
        }
    }
    
    // 6. Entry details
    console.log('\n=== Entry Details ===');
    
    if (entryIds.length === 0) {
        console.log('No entries found in PageModel');
    } else {
        for (const entryId of entryIds.sort()) {
            const entry = pageModel.entries[entryId];
            
            console.log(`\n📄 Entry ID "${entryId}":`);
            console.log(`   Number of people in this entry: ${Object.keys(entry.people).length}`);
            
            // List people in this entry - the structure is direct PersonModel objects, not wrapped
            for (const [personId, personModel] of Object.entries(entry.people)) {
                if (personModel && personModel.name) {
                    console.log(`   Person ${personId}: ${personModel.name.toString()}`);
                    console.log(`     Source: ${personModel.source}`);
                    console.log(`     References: [${personModel.references.join(', ')}]`);
                } else {
                    console.log(`   Person ${personId}: <Invalid person data>`);
                }
            }
        }
    }
    
    // 7. Statistics and validation
    console.log('\n=== Statistics and Validation ===');
    
    // Count people with references
    let peopleWithReferences = 0;
    let totalReferences = 0;
    
    for (const person of Object.values(pageModel.people)) {
        if (person.references.length > 0) {
            peopleWithReferences++;
            totalReferences += person.references.length;
        }
    }
    
    console.log(`📊 People with references: ${peopleWithReferences} of ${peopleCount}`);
    console.log(`📊 Total references: ${totalReferences}`);
    console.log(`📊 Average references per person: ${peopleCount > 0 ? (totalReferences / peopleCount).toFixed(2) : 0}`);
    
    // Count families with children
    let familiesWithChildren = 0;
    let totalChildren = 0;
    
    for (const family of Object.values(pageModel.families)) {
        if (family.children.length > 0) {
            familiesWithChildren++;
            totalChildren += family.children.length;
        }
    }
    
    console.log(`📊 Families with children: ${familiesWithChildren} of ${familiesCount}`);
    console.log(`📊 Total children: ${totalChildren}`);
    console.log(`📊 Average children per family: ${familiesCount > 0 ? (totalChildren / familiesCount).toFixed(2) : 0}`);
    
    console.log('\n=== Processing Complete ===');
    
} catch (error) {
    console.error('❌ Error processing GEDCOM file:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
