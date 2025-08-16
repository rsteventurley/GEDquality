/**
 * Debug Kurt Schulz vs Kurt Wagner surname matching
 */

const NameModel = require('./DataModel/NameModel');

const kurt_schulz = new NameModel('Kurt', 'Schulz');
const kurt_wagner = new NameModel('Kurt', 'Wagner');

console.log('=== Debug Kurt Surname Matching ===');
console.log('Kurt Schulz full name similar to Kurt Wagner:', kurt_schulz.similarMatch(kurt_wagner));
console.log('Kurt Schulz exact match Kurt Wagner:', kurt_schulz.exactMatch(kurt_wagner));

// Test just surnames
const surname_test1 = new NameModel('Test', 'Schulz');
const surname_test2 = new NameModel('Test', 'Wagner');

console.log('Schulz surname similar to Wagner surname:', surname_test1.similarMatch(surname_test2));

// Check Soundex values
console.log('Schulz Soundex:', surname_test1.getSoundex());
console.log('Wagner Soundex:', surname_test2.getSoundex());

// Test given names
const given_test1 = new NameModel('Kurt', 'Test');
const given_test2 = new NameModel('Kurt', 'Test');

console.log('Kurt given name similar to Kurt given name:', given_test1.similarMatch(given_test2));
