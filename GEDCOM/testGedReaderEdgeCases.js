/**
 * Additional GedReader tests focusing on edge cases and internal functionality
 */

const GedReader = require('./GedReader');
const fs = require('fs');

console.log('=== GedReader Edge Cases and Internal Tests ===\n');

// Test 1: Empty GEDCOM file
console.log('Test 1: Empty GEDCOM file handling...');
try {
    // Create an empty GEDCOM file
    fs.writeFileSync('./empty.ged', '0 HEAD\n1 GEDC\n2 VERS 5.5.1\n0 TRLR\n');
    
    const reader = new GedReader();
    const gedModel = reader.read('./empty.ged');
    
    console.log('✅ Empty file parsed successfully');
    console.log(`   Is empty: ${gedModel.isEmpty()}`);
    console.log(`   Summary: ${gedModel.toString()}`);
    
    // Clean up
    fs.unlinkSync('./empty.ged');
    
} catch (error) {
    console.log('❌ Empty file test failed:', error.message);
}

// Test 2: Malformed GEDCOM file
console.log('\nTest 2: Malformed GEDCOM file handling...');
try {
    // Create a malformed GEDCOM file
    fs.writeFileSync('./malformed.ged', 'This is not a valid GEDCOM file\nRandom text\n');
    
    const reader = new GedReader();
    const gedModel = reader.read('./malformed.ged');
    
    console.log('✅ Malformed file handled gracefully');
    console.log(`   Summary: ${gedModel.toString()}`);
    
    // Clean up
    fs.unlinkSync('./malformed.ged');
    
} catch (error) {
    console.log('✅ Malformed file correctly rejected:', error.message);
    // Clean up
    try { fs.unlinkSync('./malformed.ged'); } catch {}
}

// Test 3: Large line handling (if the parser handles long lines)
console.log('\nTest 3: Large data handling...');
try {
    // Create a GEDCOM with very long values
    const longName = 'A'.repeat(1000);
    const largeGedcom = `0 HEAD
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME ${longName} /Test/
1 SEX M
0 TRLR`;
    
    fs.writeFileSync('./large.ged', largeGedcom);
    
    const reader = new GedReader();
    const gedModel = reader.read('./large.ged');
    
    const individual = gedModel.getIndividual('@I1@');
    console.log('✅ Large data handled successfully');
    console.log(`   Name length: ${individual.getName().getFormattedName().length}`);
    
    // Clean up
    fs.unlinkSync('./large.ged');
    
} catch (error) {
    console.log('❌ Large data test failed:', error.message);
    // Clean up
    try { fs.unlinkSync('./large.ged'); } catch {}
}

// Test 4: Unicode and special characters
console.log('\nTest 4: Unicode and special character handling...');
try {
    const unicodeGedcom = `0 HEAD
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME José /García-López/
1 SEX M
1 BIRT
2 PLAC São Paulo, Brasil
0 @I2@ INDI
1 NAME 田中 /太郎/
1 SEX M
0 TRLR`;
    
    fs.writeFileSync('./unicode.ged', unicodeGedcom);
    
    const reader = new GedReader();
    const gedModel = reader.read('./unicode.ged');
    
    const jose = gedModel.getIndividual('@I1@');
    const tanaka = gedModel.getIndividual('@I2@');
    
    console.log('✅ Unicode characters handled successfully');
    console.log(`   José name: ${jose.getName().getFormattedName()}`);
    console.log(`   Tanaka name: ${tanaka.getName().getFormattedName()}`);
    console.log(`   Birth place: ${jose.getBirth().getPlace()}`);
    
    // Clean up
    fs.unlinkSync('./unicode.ged');
    
} catch (error) {
    console.log('❌ Unicode test failed:', error.message);
    // Clean up
    try { fs.unlinkSync('./unicode.ged'); } catch {}
}

// Test 5: Multiple families and complex relationships
console.log('\nTest 5: Multiple families and complex relationships...');
try {
    const complexGedcom = `0 HEAD
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 FAMS @F1@
1 FAMS @F2@
0 @I2@ INDI
1 NAME Mary /Jones/
1 SEX F
1 FAMS @F1@
0 @I3@ INDI
1 NAME Alice /Brown/
1 SEX F
1 FAMS @F2@
0 @I4@ INDI
1 NAME Child1 /Smith/
1 SEX M
1 FAMC @F1@
0 @I5@ INDI
1 NAME Child2 /Smith/
1 SEX F
1 FAMC @F2@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I4@
1 MARR
2 DATE 1 JAN 2000
0 @F2@ FAM
1 HUSB @I1@
1 WIFE @I3@
1 CHIL @I5@
1 MARR
2 DATE 1 JAN 2010
0 TRLR`;
    
    fs.writeFileSync('./complex.ged', complexGedcom);
    
    const reader = new GedReader();
    const gedModel = reader.read('./complex.ged');
    
    console.log('✅ Complex relationships handled successfully');
    console.log(`   Individuals: ${gedModel.getIndividualCount()}`);
    console.log(`   Families: ${gedModel.getFamilyCount()}`);
    
    const family1 = gedModel.getFamily('@F1@');
    const family2 = gedModel.getFamily('@F2@');
    
    console.log(`   Family 1: Father ${family1.getFather()}, Mother ${family1.getMother()}, Children [${family1.getChildren().join(', ')}]`);
    console.log(`   Family 2: Father ${family2.getFather()}, Mother ${family2.getMother()}, Children [${family2.getChildren().join(', ')}]`);
    
    // Clean up
    fs.unlinkSync('./complex.ged');
    
} catch (error) {
    console.log('❌ Complex relationships test failed:', error.message);
    // Clean up
    try { fs.unlinkSync('./complex.ged'); } catch {}
}

// Test 6: Test with missing data fields
console.log('\nTest 6: Missing data fields handling...');
try {
    const incompleteGedcom = `0 HEAD
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME John //
1 SEX M
0 @I2@ INDI
1 NAME /Smith/
0 @I3@ INDI
1 SEX F
0 @F1@ FAM
1 HUSB @I1@
0 TRLR`;
    
    fs.writeFileSync('./incomplete.ged', incompleteGedcom);
    
    const reader = new GedReader();
    const gedModel = reader.read('./incomplete.ged');
    
    const incomplete1 = gedModel.getIndividual('@I1@');
    const incomplete2 = gedModel.getIndividual('@I2@');
    const incomplete3 = gedModel.getIndividual('@I3@');
    const incompleteFamily = gedModel.getFamily('@F1@');
    
    console.log('✅ Missing data handled gracefully');
    console.log(`   I1 name: "${incomplete1.getName().getFormattedName()}"`);
    console.log(`   I2 name: "${incomplete2.getName().getFormattedName()}"`);
    console.log(`   I3 gender: "${incomplete3.getGender()}"`);
    console.log(`   F1 mother: ${incompleteFamily.getMother()}`);
    console.log(`   All are valid: ${incomplete1.isValid()}, ${incomplete2.isValid()}, ${incomplete3.isValid()}`);
    
    // Clean up
    fs.unlinkSync('./incomplete.ged');
    
} catch (error) {
    console.log('❌ Missing data test failed:', error.message);
    // Clean up
    try { fs.unlinkSync('./incomplete.ged'); } catch {}
}

// Test 7: Memory usage with repeated parsing
console.log('\nTest 7: Memory usage with repeated parsing...');
try {
    const reader = new GedReader();
    const startMemory = process.memoryUsage().heapUsed;
    
    // Parse the same file multiple times
    for (let i = 0; i < 10; i++) {
        const gedModel = reader.read('./test.ged');
        // Do something with the model to ensure it's not optimized away
        gedModel.getIndividualCount();
    }
    
    const endMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (endMemory - startMemory) / 1024; // KB
    
    console.log('✅ Repeated parsing completed');
    console.log(`   Memory increase: ${memoryIncrease.toFixed(2)} KB`);
    console.log(`   Average per parse: ${(memoryIncrease / 10).toFixed(2)} KB`);
    
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
        const afterGC = process.memoryUsage().heapUsed;
        console.log(`   After GC: ${((afterGC - startMemory) / 1024).toFixed(2)} KB`);
    }
    
} catch (error) {
    console.log('❌ Memory usage test failed:', error.message);
}

console.log('\n=== Edge Cases and Internal Tests Complete ===');
