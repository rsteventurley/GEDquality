/**
 * Debug Soundex codes for Schulz and Wagner
 */

const NameModel = require('./DataModel/NameModel');

const name1 = new NameModel('Test', 'Schulz');
const name2 = new NameModel('Test', 'Wagner');

// Access the private _getSoundex method
console.log('=== Debug Soundex ===');

// Create a test instance to access the method
const testName = new NameModel('Test', 'Test');

// Try to access the method - it might be private
try {
    const soundex1 = testName._getSoundex('Schulz');
    const soundex2 = testName._getSoundex('Wagner');
    console.log('Schulz Soundex:', soundex1);
    console.log('Wagner Soundex:', soundex2);
    console.log('Soundex match:', soundex1 === soundex2);
} catch (error) {
    console.log('Cannot access _getSoundex method:', error.message);
}

// Check name variations
try {
    const variations = testName._areNameVariations('Schulz', 'Wagner');
    console.log('Schulz/Wagner are name variations:', variations);
} catch (error) {
    console.log('Cannot access _areNameVariations method:', error.message);
}

// Test the overall similar match
console.log('Overall similar match:', name1.similarMatch(name2));
