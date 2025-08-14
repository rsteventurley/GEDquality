/**
 * Test script to verify the corrected source and references parsing
 * Tests the PAGE extraction from SOUR and Cref event parsing
 */

const GedIndividual = require('./GedIndividual');

console.log('Testing corrected source and references parsing...\n');

// Test 1: Individual with SOUR containing PAGE
console.log('Test 1: SOUR with PAGE extraction...');
const mockIndividualWithPage = {
    tag: 'INDI',
    children: [
        { tag: 'NAME', value: 'John /Smith/' },
        { tag: 'SEX', value: 'M' },
        { 
            tag: 'SOUR',
            value: '@S1@',
            children: [
                { tag: 'PAGE', value: '45' },
                { tag: 'QUAY', value: '3' },
                {
                    tag: 'DATA',
                    children: [
                        { tag: 'DATE', value: '15 JAN 1950' },
                        { tag: 'TEXT', value: 'Birth certificate' }
                    ]
                }
            ]
        }
    ]
};

const individual1 = GedIndividual.fromGedcomRecord(mockIndividualWithPage);
console.log('Source extracted:', individual1.getSource());
console.log('Expected: 45');
console.log('Correct:', individual1.getSource() === '45');
console.log('');

// Test 2: Individual with Cref events
console.log('Test 2: EVEN with TYPE Cref parsing...');
const mockIndividualWithCref = {
    tag: 'INDI',
    children: [
        { tag: 'NAME', value: 'Jane /Doe/' },
        { tag: 'SEX', value: 'F' },
        {
            tag: 'EVEN',
            value: '66',
            children: [
                { tag: 'TYPE', value: 'Cref' }
            ]
        },
        {
            tag: 'EVEN',
            value: '123',
            children: [
                { tag: 'TYPE', value: 'Cref' }
            ]
        },
        {
            tag: 'EVEN',
            value: '999',
            children: [
                { tag: 'TYPE', value: 'OtherEvent' } // This should NOT be added
            ]
        }
    ]
};

const individual2 = GedIndividual.fromGedcomRecord(mockIndividualWithCref);
console.log('References extracted:', individual2.getReferences());
console.log('Expected: ["66", "123"]');
console.log('Correct:', JSON.stringify(individual2.getReferences()) === JSON.stringify(['66', '123']));
console.log('');

// Test 3: Individual from the actual test.ged format (like @I1@)
console.log('Test 3: Real GEDCOM format like @I1@ from test.ged...');
const mockI1Individual = {
    tag: 'INDI',
    children: [
        { tag: 'NAME', value: 'John /Doe/' },
        { tag: 'SEX', value: 'M' },
        { 
            tag: 'BIRT', 
            children: [
                { tag: 'DATE', value: '15 JAN 1950' },
                { tag: 'PLAC', value: 'New York, NY' }
            ]
        },
        {
            tag: 'SOUR',
            value: '@S1@',
            children: [
                { tag: 'PAGE', value: '45' },
                { tag: 'QUAY', value: '3' },
                {
                    tag: 'DATA',
                    children: [
                        { tag: 'DATE', value: '15 JAN 1950' },
                        { tag: 'TEXT', value: 'Birth certificate' }
                    ]
                }
            ]
        },
        { tag: 'FAMS', value: '@F1@' } // This should NOT be in references anymore
    ]
};

const individual3 = GedIndividual.fromGedcomRecord(mockI1Individual);
console.log('Name:', individual3.getName().getFormattedName());
console.log('Source (PAGE):', individual3.getSource());
console.log('References (should be empty now):', individual3.getReferences());
console.log('Birth date:', individual3.getBirth().getDate());
console.log('Birth place:', individual3.getBirth().getPlace());
console.log('');

// Test 4: Individual with both PAGE and Cref events
console.log('Test 4: Individual with both PAGE source and Cref events...');
const mockCompleteIndividual = {
    tag: 'INDI',
    children: [
        { tag: 'NAME', value: 'Mary /Johnson/' },
        { tag: 'SEX', value: 'F' },
        {
            tag: 'SOUR',
            value: '@S2@',
            children: [
                { tag: 'PAGE', value: '123' },
                { tag: 'QUAY', value: '2' }
            ]
        },
        {
            tag: 'EVEN',
            value: '777',
            children: [
                { tag: 'TYPE', value: 'Cref' }
            ]
        },
        {
            tag: 'EVEN',
            value: '888',
            children: [
                { tag: 'TYPE', value: 'Cref' }
            ]
        }
    ]
};

const individual4 = GedIndividual.fromGedcomRecord(mockCompleteIndividual);
console.log('Name:', individual4.getName().getFormattedName());
console.log('Source (PAGE):', individual4.getSource());
console.log('References (Cref events):', individual4.getReferences());
console.log('');

console.log('All source and references parsing tests completed!');
