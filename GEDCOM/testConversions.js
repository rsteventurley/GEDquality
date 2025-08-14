/**
 * Test script to verify the conversion methods from GEDCOM models to DataModel classes
 * Tests toPersonModel, toFamilyModel, and toPageModel methods
 */

const GedReader = require('./GedReader');
const GedIndividual = require('./GedIndividual');
const GedFamily = require('./GedFamily');

console.log('=== Testing GEDCOM to DataModel Conversion ===\n');

// Test 1: Test GedIndividual.toPersonModel()
console.log('Test 1: GedIndividual to PersonModel conversion...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const individual = gedModel.getIndividual('@I1@');
    if (individual instanceof GedIndividual) {
        const personModel = individual.toPersonModel();
        
        console.log('✅ PersonModel created successfully');
        console.log(`   Name: ${personModel.name.toString()}`);
        console.log(`   Birth: ${personModel.birth.toString()}`);
        console.log(`   Death: ${personModel.death.toString()}`);
        console.log(`   Source: ${personModel.source}`);
        console.log(`   References: [${personModel.references.join(', ')}]`);
        console.log(`   Family IDs: [${personModel.families.join(', ')}]`);
        console.log(`   Is Empty: ${personModel.isEmpty()}`);
        console.log(`   Is Valid: ${personModel.isValid()}`);
    } else {
        console.log('❌ Individual is not a GedIndividual instance');
    }
} catch (error) {
    console.log('❌ GedIndividual to PersonModel test failed:', error.message);
}

console.log('');

// Test 2: Test GedFamily.toFamilyModel()
console.log('Test 2: GedFamily to FamilyModel conversion...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const family = gedModel.getFamily('@F1@');
    if (family instanceof GedFamily) {
        const familyModel = family.toFamilyModel();
        
        console.log('✅ FamilyModel created successfully');
        console.log(`   Husband: ${familyModel.husband}`);
        console.log(`   Wife: ${familyModel.wife}`);
        console.log(`   Children: [${familyModel.children.join(', ')}]`);
        console.log(`   Marriage: ${familyModel.marriage.toString()}`);
        console.log(`   Is Empty: ${familyModel.isEmpty()}`);
        console.log(`   Is Valid: ${familyModel.isValid()}`);
    } else {
        console.log('❌ Family is not a GedFamily instance');
    }
} catch (error) {
    console.log('❌ GedFamily to FamilyModel test failed:', error.message);
}

console.log('');

// Test 3: Test GedModel.toPageModel()
console.log('Test 3: GedModel to PageModel conversion...');
try {
    const reader = new GedReader();
    const gedModel = reader.read('./test.ged');
    
    const pageModel = gedModel.toPageModel();
    
    console.log('✅ PageModel created successfully');
    console.log(`   People count: ${Object.keys(pageModel.people).length}`);
    console.log(`   Families count: ${Object.keys(pageModel.families).length}`);
    console.log(`   Entries count: ${Object.keys(pageModel.entries).length}`);
    
    // Check specific people
    console.log('\n   People details:');
    for (const [personId, person] of Object.entries(pageModel.people)) {
        console.log(`     ID ${personId}: ${person.name.toString()}`);
        console.log(`       Birth: ${person.birth.toString()}`);
        console.log(`       Source: ${person.source}`);
    }
    
    // Check specific families
    console.log('\n   Families details:');
    for (const [familyId, family] of Object.entries(pageModel.families)) {
        console.log(`     ID ${familyId}: Husband ${family.husband}, Wife ${family.wife}, Children [${family.children.join(', ')}]`);
        console.log(`       Marriage: ${family.marriage.toString()}`);
    }
    
} catch (error) {
    console.log('❌ GedModel to PageModel test failed:', error.message);
    console.log('Error stack:', error.stack);
}

console.log('');

// Test 4: Test edge cases
console.log('Test 4: Edge cases and empty data...');
try {
    const emptyIndividual = new GedIndividual();
    const emptyPersonModel = emptyIndividual.toPersonModel();
    
    console.log('✅ Empty GedIndividual conversion works');
    console.log(`   Empty PersonModel is empty: ${emptyPersonModel.isEmpty()}`);
    
    const emptyFamily = new GedFamily();
    const emptyFamilyModel = emptyFamily.toFamilyModel();
    
    console.log('✅ Empty GedFamily conversion works');
    console.log(`   Empty FamilyModel is empty: ${emptyFamilyModel.isEmpty()}`);
    
} catch (error) {
    console.log('❌ Edge cases test failed:', error.message);
}

console.log('\n=== Conversion Tests Complete ===');
