/**
 * Test for PageModel addFamily method
 */

const PageModel = require('./PageModel');
const FamilyModel = require('./FamilyModel');

console.log('=== PageModel addFamily Method Tests ===\n');

// Test 1: Basic addFamily functionality
console.log('--- Test 1: Add family successfully ---');
const page = new PageModel();
const family1 = new FamilyModel();
family1.setHusband(1);
family1.setWife(2);
family1.setChildren([3, 4]);

try {
    const success = page.addFamily(family1, 100);
    console.log(`Add family success: ${success}`); // Should be true
    console.log(`Family count: ${page.getFamilyCount()}`); // Should be 1
    
    const retrievedFamily = page.getFamily(100);
    console.log(`Retrieved family husband: ${retrievedFamily ? retrievedFamily.getHusband() : 'null'}`); // Should be 1
    console.log(`Retrieved family wife: ${retrievedFamily ? retrievedFamily.getWife() : 'null'}`); // Should be 2
    console.log(`Retrieved family children count: ${retrievedFamily ? retrievedFamily.getChildren().length : 0}`); // Should be 2
} catch (error) {
    console.log(`Error: ${error.message}`);
}
console.log('');

// Test 2: Try to add family with duplicate ID
console.log('--- Test 2: Try to add family with duplicate ID ---');
const family2 = new FamilyModel();
family2.setHusband(5);
family2.setWife(6);

try {
    const success = page.addFamily(family2, 100); // Should throw error
    console.log(`Add duplicate family success: ${success}`);
} catch (error) {
    console.log(`Expected error: ${error.message}`);
}
console.log('');

// Test 3: Add family with unique ID
console.log('--- Test 3: Add family with unique ID ---');
try {
    const success = page.addFamily(family2, 200);
    console.log(`Add second family success: ${success}`); // Should be true
    console.log(`Family count: ${page.getFamilyCount()}`); // Should be 2
} catch (error) {
    console.log(`Error: ${error.message}`);
}
console.log('');

// Test 4: Invalid parameters
console.log('--- Test 4: Invalid parameters ---');
try {
    console.log(`Add null family: ${page.addFamily(null, 300)}`); // Should be false
    console.log(`Add with string ID: ${page.addFamily(family1, "string-id")}`); // Should be false
    console.log(`Add with non-FamilyModel: ${page.addFamily({}, 400)}`); // Should be false
    console.log(`Final family count: ${page.getFamilyCount()}`); // Should still be 2
} catch (error) {
    console.log(`Error: ${error.message}`);
}
console.log('');

console.log(`Final page summary: ${page.toString()}`);
console.log('\n=== addFamily Tests Complete ===');
